import { NextRequest, NextResponse } from "next/server"
import { supabase, DailyArticle } from "@/app/lib/supabase"

export const runtime = "edge"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ date: string; tone: string }> }
) {
  const { date, tone } = await params

  if (tone !== "academic" && tone !== "casual") {
    return NextResponse.json({ error: "Invalid tone" }, { status: 400 })
  }

  if (!supabase) {
    return NextResponse.json(
      { error: "Database not configured" },
      { status: 503 }
    )
  }

  try {
    const summaryColumn =
      tone === "academic" ? "summary_academic" : "summary_casual"

    const { data, error } = await supabase
      .from("daily_articles")
      .select(`id, date, topic, ${summaryColumn}, source_papers, created_at`)
      .eq("date", date)
      .single()

    if (error) {
      if (error.code === "PGRST116") {
        return NextResponse.json(
          { error: "Article not found" },
          { status: 404 }
        )
      }
      console.error("Error fetching article:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const article = data as DailyArticle
    const summary =
      tone === "academic" ? article.summary_academic : article.summary_casual

    if (!summary) {
      return NextResponse.json(
        { error: "Summary not available for this tone" },
        { status: 404 }
      )
    }

    return NextResponse.json({
      date: article.date,
      topic: article.topic,
      summary,
      references: article.source_papers || [],
    })
  } catch (error) {
    console.error("Article API error:", error)
    return NextResponse.json(
      { error: "Failed to fetch article" },
      { status: 500 }
    )
  }
}
