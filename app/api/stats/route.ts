import { NextResponse } from "next/server"
import { getTokenCounts, getTodayDateString } from "@/app/lib/redis"

export const runtime = "edge"

export async function GET() {
  try {
    const today = getTodayDateString()
    const { articleTokens, chatTokens } = await getTokenCounts(today)

    return NextResponse.json({
      date: today,
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
