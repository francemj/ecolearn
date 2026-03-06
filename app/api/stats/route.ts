import { NextRequest, NextResponse } from "next/server"
import { getTokenCounts, getTodayDateString } from "@/app/lib/redis"
import { supabase } from "@/app/lib/supabase"

export const runtime = "edge"

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/

export async function GET(request: NextRequest) {
  try {
    const today = getTodayDateString()
    const dateParam = request.nextUrl.searchParams.get("date")
    let targetDate = today
    if (dateParam) {
      if (!DATE_REGEX.test(dateParam)) {
        return NextResponse.json(
          { error: "Invalid date format; use YYYY-MM-DD" },
          { status: 400 }
        )
      }
      targetDate = dateParam
    }

    let articleTokens: number
    let chatTokens: number

    if (targetDate === today) {
      const counts = await getTokenCounts(today)
      articleTokens = counts.articleTokens
      chatTokens = counts.chatTokens
    } else {
      // Past (or future) date: read from Supabase
      if (supabase) {
        const { data, error } = await supabase
          .from("daily_stats")
          .select("article_tokens, chat_tokens")
          .eq("date", targetDate)
          .maybeSingle()
        if (error) {
          console.error("Stats API Supabase error:", error)
          articleTokens = 0
          chatTokens = 0
        } else if (data) {
          articleTokens = data.article_tokens ?? 0
          chatTokens = data.chat_tokens ?? 0
        } else {
          articleTokens = 0
          chatTokens = 0
        }
      } else {
        articleTokens = 0
        chatTokens = 0
      }
    }

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
