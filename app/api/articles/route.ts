import { NextResponse } from "next/server"
import { supabase, DailyArticle } from "@/app/lib/supabase"
import { getTodayDateString } from "@/app/lib/redis"

export const runtime = "edge"

export async function GET() {
  if (!supabase) {
    return NextResponse.json(
      { error: "Database not configured" },
      { status: 503 }
    )
  }

  try {
    const today = getTodayDateString()
    const { data, error } = await supabase
      .from("daily_articles")
      .select("id, date, topic, created_at")
      .neq("date", today)
      .order("date", { ascending: false })

    if (error) {
      console.error("Error fetching articles:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    // Add available tones based on which summaries exist
    const articles = (data as DailyArticle[]).map((article) => ({
      id: article.id,
      date: article.date,
      topic: article.topic,
      created_at: article.created_at,
    }))

    return NextResponse.json({ articles })
  } catch (error) {
    console.error("Articles API error:", error)
    return NextResponse.json(
      { error: "Failed to fetch articles" },
      { status: 500 }
    )
  }
}
