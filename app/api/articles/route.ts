import { NextResponse } from "next/server"
import { desc, ne } from "drizzle-orm"

import { db } from "@/app/db/client"
import { dailyArticles } from "@/app/db/schema"
import { getTodayDateString } from "@/app/lib/redis"

// Node, not edge: the Postgres driver needs a TCP socket, which the edge
// runtime does not provide.
export const runtime = "nodejs"

export async function GET() {
  if (!db) {
    return NextResponse.json(
      { error: "Database not configured" },
      { status: 503 }
    )
  }

  try {
    // Today is excluded because it is still being written; the homepage serves
    // it from Redis instead.
    const articles = await db
      .select({
        id: dailyArticles.id,
        date: dailyArticles.date,
        topic: dailyArticles.topic,
        created_at: dailyArticles.createdAt,
      })
      .from(dailyArticles)
      .where(ne(dailyArticles.date, getTodayDateString()))
      .orderBy(desc(dailyArticles.date))

    return NextResponse.json({ articles })
  } catch (error) {
    console.error("Articles API error:", error)
    return NextResponse.json(
      { error: "Failed to fetch articles" },
      { status: 500 }
    )
  }
}
