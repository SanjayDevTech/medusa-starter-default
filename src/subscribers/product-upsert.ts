import { SubscriberArgs, SubscriberConfig } from "@medusajs/framework";
import { Modules } from "@medusajs/framework/utils";
import { ProductEvents, SearchUtils } from "@medusajs/utils";
import { MeiliSearchService } from "@rokmohar/medusa-plugin-meilisearch";

export default async function productUpsertHandler({
  event: { data },
  container,
}: SubscriberArgs<{ id: string }>) {
  const productId = data.id;

  try {
    const productModuleService = container.resolve(Modules.PRODUCT);
    const meiliSearchService: MeiliSearchService =
      container.resolve("meilisearch");

    const product = await productModuleService.retrieveProduct(productId);
    await meiliSearchService.addDocuments(
      "products",
      [product],
      SearchUtils.indexTypes.PRODUCTS
    );
  } catch (error) {
    // No meilisearch service found
  }
}

export const config: SubscriberConfig = {
  event: [ProductEvents.PRODUCT_CREATED, ProductEvents.PRODUCT_UPDATED],
};
