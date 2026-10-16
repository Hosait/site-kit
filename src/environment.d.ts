declare global {
  namespace NodeJS {
    interface ProcessEnv {
      DATABASE_URL?: string
      PAYLOAD_SECRET?: string
      NEXT_PUBLIC_SERVER_URL?: string
      CRON_SECRET?: string
      ADMIN_CLAIM_SECRET?: string
      PREVIEW_SECRET?: string
      SITE_ORIGINS?: string
      STAGING_HOST?: string
      NEXT_PUBLIC_STAGING_HOST?: string
      HOSAIT_COMMIT_SHORT?: string
      S3_ENDPOINT?: string
      S3_REGION?: string
      S3_BUCKET?: string
      S3_ACCESS_KEY_ID?: string
      S3_SECRET_ACCESS_KEY?: string
      SMTP_HOST?: string
      SMTP_PORT?: string
      SMTP_USER?: string
      SMTP_PASS?: string
      SMTP_FROM?: string
    }
  }
}

// If this file has no import/export statements (i.e. is a script)
// convert it into a module by adding an empty export statement.
export {}
