import { 
  AbstractNotificationProviderService, 
  MedusaError
} from "@medusajs/framework/utils"
import { 
  ProviderSendNotificationDTO, 
  ProviderSendNotificationResultsDTO,
  Logger
} from "@medusajs/framework/types";
import { 
  CreateEmailOptions, 
  Resend
} from "resend";
import { EmailTemplate, generateEmailTemplate, getEmailSubject } from "./templates";

type ResendOptions = {
  api_key: string
  from: string
  html_templates?: Record<string, {
    subject?: string
    content: string
  }>
}

type InjectedDependencies = {
  logger: Logger
}

class ResendNotificationProviderService extends AbstractNotificationProviderService {
  static identifier = "notification-resend"
  private resendClient: Resend
  private options: ResendOptions
  private logger: Logger

  constructor(
    { logger }: InjectedDependencies, 
    options: ResendOptions
  ) {
    super()
    this.resendClient = new Resend(options.api_key)
    this.options = options
    this.logger = logger
  }

  static validateOptions(options: Record<any, any>) {
    if (!options.api_key) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Option `api_key` is required in the provider's options."
      )
    }
    if (!options.from) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "Option `from` is required in the provider's options."
      )
    }
  }


  getTemplate(template: EmailTemplate): string | null | ((data: Record<string, unknown> | null | undefined) => React.ReactNode) {
    if (this.options.html_templates?.[template]) {
      return this.options.html_templates[template].content
    }
    const allowedTemplates = Object.keys(EmailTemplate)

    if (!allowedTemplates.includes(template)) {
      return null
    }

    return generateEmailTemplate(template)
  }

  getTemplateSubject(template: EmailTemplate, data: Record<string, unknown> | null | undefined): string {
    if (this.options.html_templates?.[template]?.subject) {
      return this.options.html_templates[template].subject
    }
    return getEmailSubject(template, data)
  }

  async send(
    notification: ProviderSendNotificationDTO
  ): Promise<ProviderSendNotificationResultsDTO> {
    const template = this.getTemplate(notification.template as EmailTemplate)

    if (!template) {
      this.logger.error(`Couldn't find an email template for ${notification.template}. The valid options are ${Object.values(EmailTemplate)}`)
      return {}
    }

    const emailContent = typeof template === "string" ? {
      html: template
    } : {
      react: template(notification.data)
    }
    const emailOptions: CreateEmailOptions = {
      from: this.options.from,
      to: [notification.to],
      subject: this.getTemplateSubject(notification.template as EmailTemplate, notification.data),
      ...emailContent
    }

    const { data, error } = await this.resendClient.emails.send(emailOptions)

    if (error) {
      this.logger.error(`Failed to send email`, error)
      return {}
    }

    return { id: data!.id }
  }
}

export default ResendNotificationProviderService;
