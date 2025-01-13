import { INotificationModuleService, IUserModuleService } from '@medusajs/types'
import { Modules } from '@medusajs/utils'
import { SubscriberArgs, SubscriberConfig } from '@medusajs/framework'
import { BACKEND_URL, RESEND_FROM_EMAIL } from '../lib/constants'
import { EmailTemplate } from '../modules/resend-email/templates'

export default async function userInviteHandler({
    event: { data },
    container,
  }: SubscriberArgs<any>) {

  const notificationModuleService: INotificationModuleService = container.resolve(
    Modules.NOTIFICATION,
  )
  const userModuleService: IUserModuleService = container.resolve(Modules.USER)
  const invite = await userModuleService.retrieveInvite(data.id)

  try {
    await notificationModuleService.createNotifications({
      to: invite.email,
      channel: 'email',
      template: EmailTemplate.INVITE_USER,
      data: {
        emailOptions: {
          replyTo: RESEND_FROM_EMAIL,
          subject: "You've been invited to Medusa!"
        },
        inviteLink: `${BACKEND_URL}/app/invite?token=${invite.token}`,
        preview: 'The administration dashboard awaits...'
      }
    })
  } catch (error) {
    console.error(error)
  }
}

export const config: SubscriberConfig = {
  event: ['invite.created', 'invite.resent']
}
