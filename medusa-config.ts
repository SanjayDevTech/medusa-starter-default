import { defineConfig, Modules } from "@medusajs/framework/utils";
import {
  ADMIN_CORS,
  AUTH_CORS,
  BACKEND_URL,
  COOKIE_SECRET,
  DATABASE_URL,
  JWT_SECRET,
  MEILISEARCH_API_KEY,
  MEILISEARCH_HOST,
  MINIO_ACCESS_KEY,
  MINIO_BUCKET,
  MINIO_ENDPOINT,
  MINIO_SECRET_KEY,
  REDIS_URL,
  RESEND_API_KEY,
  RESEND_FROM_EMAIL,
  SHOULD_DISABLE_ADMIN,
  STORE_CORS,
  STRIPE_API_KEY,
  STRIPE_WEBHOOK_SECRET,
  WORKER_MODE,
} from "./src/lib/constants";

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: DATABASE_URL,
    redisUrl: REDIS_URL,
    workerMode: WORKER_MODE,
    http: {
      storeCors: STORE_CORS,
      adminCors: ADMIN_CORS,
      authCors: AUTH_CORS,
      jwtSecret: JWT_SECRET,
      cookieSecret: COOKIE_SECRET,
    },
  },
  admin: {
    backendUrl: BACKEND_URL,
    disable: SHOULD_DISABLE_ADMIN,
  },
  modules: [
    {
      key: Modules.FILE,
      resolve: '@medusajs/file',
      options: {
        providers: [
          ...(MINIO_ENDPOINT && MINIO_ACCESS_KEY && MINIO_SECRET_KEY ? [{
            resolve: '@medusajs/file-s3',
            id: 's3',
            options: {
              endPoint: MINIO_ENDPOINT,
              access_key_id: MINIO_ACCESS_KEY,
              secret_access_key: MINIO_SECRET_KEY,
              // This is required for Minio
              region: 'us-east-1',
              bucket: MINIO_BUCKET,
              additional_client_config: {
                // This is required for Minio
                forcePathStyle: true,
              },
            }
          }] : [{
            resolve: '@medusajs/file-local',
            id: 'local',
            options: {
              upload_dir: 'static',
              backend_url: `${BACKEND_URL}/static`
            }
          }])
        ]
      }
    },
    ...(REDIS_URL ? [{
      key: Modules.EVENT_BUS,
      resolve: '@medusajs/event-bus-redis',
      options: {
        redisUrl: REDIS_URL
      }
    },
    {
      key: Modules.WORKFLOW_ENGINE,
      resolve: '@medusajs/workflow-engine-redis',
      options: {
        redis: {
          url: REDIS_URL,
        }
      }
    }] : []),
    {
      key: Modules.NOTIFICATION,
      resolve: '@medusajs/notification',
      options: {
        providers: [
          ...(RESEND_API_KEY && RESEND_FROM_EMAIL ? [{
            resolve: "./src/modules/resend-email",
            id: "resend",
            options: {
              channels: ["email"],
              api_key: RESEND_API_KEY,
              from: RESEND_FROM_EMAIL,
            },
          },] : [{
            resolve: "@medusajs/medusa/notification-local",
            id: "local",
            options: {
              channels: ["email"],
            },
          }]),
        ]
      }
    },
    ...(STRIPE_API_KEY && STRIPE_WEBHOOK_SECRET ? [{
      key: Modules.PAYMENT,
      resolve: '@medusajs/payment',
      options: {
        providers: [
          {
            resolve: '@medusajs/payment-stripe',
            id: 'stripe',
            options: {
              apiKey: STRIPE_API_KEY,
              webhookSecret: STRIPE_WEBHOOK_SECRET,
            },
          },
        ],
      },
    }] : []),
    ...(MEILISEARCH_HOST && MEILISEARCH_API_KEY ? [{
      resolve: '@rokmohar/medusa-plugin-meilisearch',
      options: {
        config: {
          host: MEILISEARCH_HOST,
          apiKey: MEILISEARCH_API_KEY
        },
        settings: {
          products: {
            indexSettings: {
              searchableAttributes: ['title', 'description', 'variant_sku'],
              displayedAttributes: ['title', 'description', 'variant_sku', 'thumbnail', 'handle']
            },
            primaryKey: 'id',
            transformer: (item) => ({
              id: item.id,
              variant_sku: item.variant_sku,
              title: item.title,
              handle: item.handle,
              thumbnail: item.thumbnail,
              description: item.description,
            }),
          }
        }
      }
    }] : []),
  ],
  plugins: []
});
