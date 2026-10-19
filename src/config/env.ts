/**
 * Centralized Environment Configuration
 * Validates and provides strongly-typed access to environment variables.
 * Admin accounts and roles are stored exclusively in PostgreSQL.
 */

export type AppEnvironment = "development" | "production" | "test";

const rawNodeEnv = (process.env.NODE_ENV || "development") as AppEnvironment;
const rawAppEnv = (process.env.APP_ENV || rawNodeEnv) as AppEnvironment;

export const env = {
  nodeEnv: rawNodeEnv,
  appEnv: rawAppEnv,
  isDev: rawAppEnv !== "production",
  isProd: rawAppEnv === "production",

  app: {
    url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    port: parseInt(process.env.PORT || "3000", 10),
  },

  database: {
    url: process.env.DATABASE_URL || "",
  },

  auth: {
    jwtSecret:
      process.env.JWT_SECRET ||
      "ieee_smc_2027_ultra_secure_jwt_secret_key_92837482",
    sessionCookieName: process.env.SESSION_COOKIE_NAME || "admin_session",
    googleClientId: process.env.GOOGLE_CLIENT_ID || "",
    googleClientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
  },

  minio: {
    endpoint: process.env.MINIO_ENDPOINT || "localhost",
    port: parseInt(process.env.MINIO_PORT || "9000", 10),
    useSSL: process.env.MINIO_USE_SSL === "true",
    accessKey: process.env.MINIO_ACCESS_KEY || "minioadmin",
    secretKey: process.env.MINIO_SECRET_KEY || "minioadmin123",
    bucket: process.env.MINIO_BUCKET || "ieee-smc-2027",
    region: process.env.MINIO_REGION || "ap-southeast-1",
    publicUrl:
      process.env.MINIO_PUBLIC_URL || "http://localhost:9000/ieee-smc-2027",
  },

  email: {
    devMode:
      process.env.EMAIL_DEV_MODE === "true" ||
      rawAppEnv !== "production" ||
      !process.env.EMAIL_SERVER_HOST,
    host: process.env.EMAIL_SERVER_HOST || "smtp.gmail.com",
    port: parseInt(process.env.EMAIL_SERVER_PORT || "587", 10),
    user: process.env.EMAIL_SERVER_USER || "",
    password: process.env.EMAIL_SERVER_PASSWORD || "",
    from:
      process.env.EMAIL_FROM || "IEEE SMC 2027 <no-reply@ieee-smc2027.org>",
  },

  payment: {
    provider: process.env.PAYMENT_PROVIDER || "PAYOO",
    payooMerchantId: process.env.PAYOO_MERCHANT_ID || "SMC2027_HCMUTE_DEMO",
    payooSecretKey: process.env.PAYOO_SECRET_KEY || "payoo_temp_secret_key",
    bankId: process.env.VIETQR_BANK_ID || "VCB",
    bankName:
      process.env.VIETQR_BANK_NAME ||
      "Vietcombank - Thu Duc Branch, Ho Chi Minh City",
    accountNo: process.env.VIETQR_ACCOUNT_NO || "0381000385642",
    accountName:
      process.env.VIETQR_ACCOUNT_NAME || "TRUONG DH SU PHAM KY THUAT TPHCM",
    swiftBic: process.env.VIETQR_SWIFT_BIC || "BFTVVNVX",
    webhookSecret:
      process.env.PAYMENT_WEBHOOK_SECRET || "dev_payment_webhook_secret_key",
  },
} as const;

export default env;
