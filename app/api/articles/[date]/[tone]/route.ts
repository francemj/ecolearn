import { NextRequest, NextResponse } from "next/server"
import { eq } from "drizzle-orm"

import { db } from "@/app/db/client"
import { dailyArticles } from "@/app/db/schema"

export const runtime = "nodejs"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ date: string; tone: string }> }
) {
  const { date, tone } = await params

  if (tone !== "academic" && tone !== "casual") {
    return NextResponse.json({ error: "Invalid tone" }, { status: 400 })
  }

  if (!db) {
    return NextResponse.json(
      { error: "Database not configured" },
      { status: 503 }
    )
  }

  try {
    const [article] = await db
      .select({
        date: dailyArticles.date,
        topic: dailyArticles.topic,
        summaryAcademic: dailyArticles.summaryAcademic,
        summaryCasual: dailyArticles.summaryCasual,
        sourcePapers: dailyArticles.sourcePapers,
      })
      .from(dailyArticles)
      .where(eq(dailyArticles.date, date))
      .limit(1)

    // Previously this was a PostgREST .single() and the not-found case arrived
    // as error code PGRST116. With no rows returned there is no error to
    // inspect, so absence is checked directly.
    if (!article) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 })
    }

    const summary =
      tone === "academic" ? article.summaryAcademic : article.summaryCasual

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
      references: article.sourcePapers ?? [],
    })
  } catch (error) {
    console.error("Article API error:", error)
    return NextResponse.json(
      { error: "Failed to fetch article" },
      { status: 500 }
    )
  }
}
