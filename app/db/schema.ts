import {
  date,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core"

export interface SourcePaper {
  title: string
  authors: string[]
  year: number
  url: string | null
}

/** One row per day: the topic that day and its two summaries. */
export const dailyArticles = pgTable("daily_articles", {
  id: uuid("id").primaryKey().defaultRandom(),
  // mode "string" keeps this a YYYY-MM-DD string end to end. The app derives the
  // date from the *device's* calendar day and compares it as a string; letting
  // the driver hand back a Date would reintroduce a timezone at the boundary.
  date: date("date", { mode: "string" }).notNull().unique(),
  topic: text("topic").notNull(),
  summaryAcademic: text("summary_academic"),
  summaryCasual: text("summary_casual"),
  sourcePapers: jsonb("source_papers").$type<SourcePaper[]>().default([]),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
})

/** One row per day: token spend, flushed nightly out of Redis. */
export const dailyStats = pgTable("daily_stats", {
  id: uuid("id").primaryKey().defaultRandom(),
  date: date("date", { mode: "string" }).notNull().unique(),
  articleTokens: integer("article_tokens").default(0),
  chatTokens: integer("chat_tokens").default(0),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
})

export type DailyArticle = typeof dailyArticles.$inferSelect
export type DailyStats = typeof dailyStats.$inferSelect
