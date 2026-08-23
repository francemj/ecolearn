import { NextRequest, NextResponse } from "next/server"
import { eq } from "drizzle-orm"

import { db } from "@/app/db/client"
import { dailyStats } from "@/app/db/schema"
import { getTokenCounts, getTodayDateString } from "@/app/lib/redis"

export const runtime = "nodejs"

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/

/**
 * Today's counts live in Redis and are only flushed to Postgres overnight, so
 * which store answers depends on which day is asked for.
 */
async function countsFor(targetDate: string, today: string) {
  if (targetDate === today) return getTokenCounts(today)
  if (!db) return { articleTokens: 0, chatTokens: 0 }

  const [row] = await db
    .select({
      articleTokens: dailyStats.articleTokens,
      chatTokens: dailyStats.chatTokens,
    })
    .from(dailyStats)
    .where(eq(dailyStats.date, targetDate))
    .limit(1)

  return {
    articleTokens: row?.articleTokens ?? 0,
    chatTokens: row?.chatTokens ?? 0,
  }
}

export async function GET(request: NextRequest) {
  try {
    const today = getTodayDateString()
    const dateParam = request.nextUrl.searchParams.get("date")

    if (dateParam && !DATE_REGEX.test(dateParam)) {
      return NextResponse.json(
        { error: "Invalid date format; use YYYY-MM-DD" },
        { status: 400 }
      )
    }

    const targetDate = dateParam ?? today
    const { articleTokens, chatTokens } = await countsFor(targetDate, today)

    return NextResponse.json({
      date: targetDate,
      articleTokens,
      chatTokens,
      totalTokens: articleTokens + chatTokens,
    })
  } catch (error) {
    console.error("Stats API error:", error)
    return NextResponse.json(
      {
        date: getTodayDateString(),
        articleTokens: 0,
        chatTokens: 0,
        totalTokens: 0,
      },
      { status: 500 }
    )
  }
}
