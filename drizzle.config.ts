import type { Config } from "drizzle-kit"

/**
 * app/db/schema.ts is the source of truth. Generate migrations from it rather
 * than hand-editing SQL — the previous setup drifted from its checked-in schema
 * because objects were created in a dashboard and never written back.
 */
export default {
  schema: "./app/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url: process.env.DATABASE_URL! },
} satisfies Config
