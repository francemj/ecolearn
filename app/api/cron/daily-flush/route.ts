import { NextRequest, NextResponse } from "next/server"

import { db } from "@/app/db/client"
import { dailyStats } from "@/app/db/schema"
import { getTokenCounts, getYesterdayDateString } from "@/app/lib/redis"

export const runtime = "nodejs"

export async function GET(request: NextRequest) {
  const yesterday = getYesterdayDateString()

  try {
    // Verify cron secret for security
    const authHeader = request.headers.get("authorization")
    const cronSecret = process.env.CRON_SECRET

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return new Response("Unauthorized", { status: 401 })
    }

    // Get token counts from Upstash
    const { articleTokens, chatTokens } = await getTokenCounts(yesterday)

    // Skip if no tokens recorded (nothing to flush)
    if (articleTokens === 0 && chatTokens === 0) {
      return NextResponse.json({
        success: true,
        message: "No tokens to flush for " + yesterday,
        date: yesterday,
        articleTokens: 0,
        chatTokens: 0,
      })
    }

    if (db) {
      await db
        .insert(dailyStats)
        .values({ date: yesterday, articleTokens, chatTokens })
        .onConflictDoUpdate({
          target: dailyStats.date,
          set: { articleTokens, chatTokens },
        })
    }

    return NextResponse.json({
      success: true,
      date: yesterday,
      articleTokens,
      chatTokens,
      totalTokens: articleTokens + chatTokens,
    })
  } catch (error) {
    console.error("Cron daily-flush error:", error)
    return NextResponse.json(
      {
        success: false,
        date: yesterday,
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
