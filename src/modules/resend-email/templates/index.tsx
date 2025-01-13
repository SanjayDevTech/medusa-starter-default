import { ReactNode } from 'react'
import { MedusaError } from '@medusajs/utils'
import { INVITE_USER_TEMPLATE, inviteUserEmail } from './invite-user'
import { ORDER_PLACED_TEMPLATE, orderPlacedEmail } from './order-placed'

export enum EmailTemplate {
  INVITE_USER = INVITE_USER_TEMPLATE,
  ORDER_PLACED = ORDER_PLACED_TEMPLATE,
};

export function generateEmailTemplate(templateKey: EmailTemplate): (data: unknown) => ReactNode {
  switch (templateKey) {
    case EmailTemplate.INVITE_USER:
      return inviteUserEmail

    case EmailTemplate.ORDER_PLACED:
      return orderPlacedEmail

    default:
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `Unknown template key: "${templateKey}"`
      )
  }
}

export function getEmailSubject(templateKey: EmailTemplate, data: any): string {
  switch (templateKey) {
    case EmailTemplate.INVITE_USER:
        return 'You have been invited to Medusa!'

    case EmailTemplate.ORDER_PLACED:
        return `Order Confirmation: ${data.order.display_id}`

    default:
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        `Unknown template key: "${templateKey}"`
      )
  }
}

export {
  inviteUserEmail,
  orderPlacedEmail,
}
