import { SubscriberArgs, SubscriberConfig } from "@medusajs/framework";
import { ProductEvents } from "@medusajs/utils";
import { MeiliSearchService } from "@rokmohar/medusa-plugin-meilisearch";

export default async function productDeleteHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const productId = data.id;

  try {
    const meiliSearchService: MeiliSearchService =
      container.resolve("meilisearch");
    await meiliSearchService.deleteDocument("products", productId);
  } catch (error) {
    // No meilisearch service found
  }
}

export const config: SubscriberConfig = {
  event: ProductEvents.PRODUCT_DELETED,
};
