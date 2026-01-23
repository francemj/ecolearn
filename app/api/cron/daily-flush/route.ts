import { NextRequest, NextResponse } from "next/server"
import { getTokenCounts, getYesterdayDateString } from "@/app/lib/redis"
import { supabase } from "@/app/lib/supabase"

export const runtime = "edge"

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret for security
    const authHeader = request.headers.get("authorization")
    const cronSecret = process.env.CRON_SECRET

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return new Response("Unauthorized", { status: 401 })
    }

    const yesterday = getYesterdayDateString()

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

    // Store to Supabase
    if (supabase) {
      const { error } = await supabase.from("daily_stats").upsert(
        {
          date: yesterday,
          article_tokens: articleTokens,
          chat_tokens: chatTokens,
        },
        { onConflict: "date" }
      )

      if (error) {
        console.error("Error storing daily stats to Supabase:", error)
        return NextResponse.json(
          {
            success: false,
            error: error.message,
            date: yesterday,
          },
          { status: 500 }
        )
      }
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
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}
