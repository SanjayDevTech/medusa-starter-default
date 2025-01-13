import { Modules } from '@medusajs/utils'
import { INotificationModuleService, IOrderModuleService } from '@medusajs/types'
import { SubscriberArgs, SubscriberConfig } from '@medusajs/medusa'
import { EmailTemplate } from '../modules/resend-email/templates'
import { RESEND_FROM_EMAIL } from '../lib/constants'

export default async function orderPlacedHandler({
  event: { data },
  container,
}: SubscriberArgs<any>) {
  const notificationModuleService: INotificationModuleService = container.resolve(Modules.NOTIFICATION)
  const orderModuleService: IOrderModuleService = container.resolve(Modules.ORDER)
  
  const order = await orderModuleService.retrieveOrder(data.id, { relations: ['items', 'summary', 'shipping_address'] })

  try {
    await notificationModuleService.createNotifications({
      to: order.email!,
      channel: 'email',
      template: EmailTemplate.ORDER_PLACED,
      data: {
        emailOptions: {
          replyTo: RESEND_FROM_EMAIL,
          subject: 'Your order has been placed'
        },
        order,
        shippingAddress: order.shipping_address,
        preview: 'Thank you for your order!'
      }
    })
  } catch (error) {
    console.error('Error sending order confirmation notification:', error)
  }
}

export const config: SubscriberConfig = {
  event: 'order.placed'
}
