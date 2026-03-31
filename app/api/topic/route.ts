import { after, NextRequest, NextResponse } from "next/server"

import { TOPICS } from "./topics"
import {
  getCachedTopic,
  setCachedTopic,
  getTodayDateString,
  incrementArticleTokens,
} from "@/app/lib/redis"
import { supabase } from "@/app/lib/supabase"

export const runtime = "edge"
export const maxDuration = 60

interface Reference {
  title: string
  authors: string[]
  year: number
  url: string | null
}

function hashDateToTopicIndex(dateString: string): number {
  let hash = 0
  for (let i = 0; i < dateString.length; i++) {
    hash = (hash << 5) - hash + dateString.charCodeAt(i)
    hash = hash & hash
  }
  return Math.abs(hash)
}

function reconstructAbstract(invertedIndex?: Record<string, number[]>): string {
  if (!invertedIndex) return ""

  const words: [string, number][] = []
  for (const [word, positions] of Object.entries(invertedIndex)) {
    for (const pos of positions) {
      words.push([word, pos])
    }
  }

  words.sort((a, b) => a[1] - b[1])
  return words.map((w) => w[0]).join(" ")
}

interface SummaryResult {
  summary: string
  tokensUsed: number
}

interface TopicResearchResult {
  topic: string
  papers: Reference[]
  abstracts: string[]
  source: "openalex" | "web"
  webSummary?: string
  webTokensUsed?: number
}

const MIN_ARTICLES = 5
const MAX_TOPIC_ATTEMPTS = 6

async function generateAISummary(
  topic: string,
  papers: Reference[],
  abstracts: string[],
  tone: "academic" | "casual"
): Promise<SummaryResult> {
  const apiKey = process.env.OPENAI_API_KEY

  if (!apiKey) {
    return {
      summary: `Today's topic is ${topic}. Multiple research papers on this topic have been gathered, but AI summary generation is unavailable. Add your OpenAI key to enable AI-powered summaries.`,
      tokensUsed: 0,
    }
  }

  const papersContext = papers
    .map((paper, idx) => {
      const raw = abstracts[idx]
      const focus =
        !raw || raw === "Abstract not available."
          ? "(abstract not available)"
          : raw.length > 220
            ? raw.slice(0, 220).trim() + "…"
            : raw
      return `[${idx + 1}] "${paper.title}" (${paper.year}) — ${paper.authors.join(", ")}
Focus: ${focus}
URL: ${paper.url || "N/A"}`
    })
    .join("\n\n")

  const academicSystemPrompt = `You are a researcher who writes clear, accessible research overviews on environmental topics. Your task is a research overview of the topic using your knowledge—not a summary of the provided sources.

- Do NOT simply summarize the provided sources. Use them as references to cite when they support, expand on, argue against, or complicate a point. Never exclude a source because it argues against your point; that is anti-science and anti-progress.
- Use citation markers [1], [2], … matching the source list below; direct readers to those sources to dive deeper on specific aspects.
- Be calm, factual, and engaging. Use accessible language for non-experts.
- Be 4-5 paragraphs long. Focus on what we know and what matters.`

  const casualSystemPrompt = `You're a friendly guide who writes research overviews on environmental topics in a laid-back, conversational way. Your task is a research overview using your knowledge—not a summary of the provided sources.

- Do NOT simply summarize the provided sources. Use them as references to cite when they support, expand on, argue against, or complicate a point. Never exclude a source because it argues against you; that is anti-science and anti-progress.
- Use citation markers [1], [2], … matching the source list; direct readers to those sources to dive deeper. Be warm, approachable, and accurate.
- Be 4-5 paragraphs. Make complex ideas feel accessible without dumbing them down.`

  const academicUserPrompt = `Write a research overview of "${topic}" that draws on your knowledge to explain the topic. Cite the provided sources [1], [2], … where they support, deepen, argue against, or complicate a point—never exclude a source because it argues against you. Do not summarize the sources; use them only as citations and further-reading pointers. Encourage readers to use those sources to explore further.

Sources:
${papersContext}`

  const casualUserPrompt = `Write a friendly research overview of "${topic}" using your knowledge. Cite the sources [1], [2], … where they support, deepen, argue against, or complicate a point—never exclude a source because it argues against you. Don't summarize the sources; use them as citations and pointers for further reading. Encourage readers to dive into those papers to learn more.

Sources:
${papersContext}`

  const systemPrompt =
    tone === "academic" ? academicSystemPrompt : casualSystemPrompt
  const userPrompt = tone === "academic" ? academicUserPrompt : casualUserPrompt

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: tone === "casual" ? 0.8 : 0.7,
        max_tokens: 1200,
      }),
    })

    if (!response.ok) {
      throw new Error("OpenAI API request failed")
    }

    const data = await response.json()
    const tokensUsed = data.usage?.total_tokens || 0
    return {
      summary: data.choices[0].message.content,
      tokensUsed,
    }
  } catch (error) {
    console.error("Error generating AI summary:", error)
    return {
      summary: `Research on ${topic} is actively being studied across multiple dimensions. While we've gathered ${papers.length} significant papers on this topic, the AI summary is temporarily unavailable. Please check the references below to explore the research directly.`,
      tokensUsed: 0,
    }
  }
}

function extractUrls(text: string): string[] {
  const matches = text.match(/https?:\/\/[^\s)]+/g) || []
  return [...new Set(matches.map((url) => url.replace(/[.,;]$/, "")))]
}

async function generateWebResearchSummary(
  topic: string,
  tone: "academic" | "casual"
): Promise<SummaryResult | null> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) return null

  const styleLine =
    tone === "casual"
      ? "Write in a friendly, conversational style."
      : "Write in a clear, research-grounded style for non-experts."

  const prompt = `Research "${topic}" using web search and write a 4-5 paragraph overview.

${styleLine}
- Focus on what has strong evidence, what is uncertain, and what is changing.
- Include inline links (plain URLs) to reputable sources used in the overview.
- If evidence is too thin or contradictory to write a reliable overview, answer with exactly: INSUFFICIENT_WEB_EVIDENCE`

  try {
    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4o",
        tools: [{ type: "web_search_preview" }],
        input: prompt,
        temperature: tone === "casual" ? 0.7 : 0.6,
      }),
    })

    if (!response.ok) return null
    const data = await response.json()
    const summary = (data.output_text || "").trim()
    if (!summary || summary === "INSUFFICIENT_WEB_EVIDENCE") return null

    const tokensUsed = data.usage?.total_tokens || 0
    return { summary, tokensUsed }
  } catch (error) {
    console.error("Error generating web research summary:", error)
    return null
  }
}

async function fetchOpenAlexPapers(
  topic: string
): Promise<{ papers: Reference[]; abstracts: string[] }> {
  const searchUrl = `https://api.openalex.org/works?filter=title_and_abstract.search:${encodeURIComponent(topic)},type:article,from_publication_date:2020-01-01&sort=cited_by_count:desc&per_page=10`
  const response = await fetch(searchUrl, {
    headers: {
      "User-Agent": "EcoLearn-Daily (mailto:research@example.com)",
    },
  })

  if (!response.ok) {
    throw new Error("OpenAlex API request failed")
  }

  const data = await response.json()
  const papers: Reference[] = []
  const abstracts: string[] = []
  const ABSTRACT_PLACEHOLDER = "Abstract not available."

  for (const work of data.results || []) {
    const title = work.title || "Untitled Research Paper"
    const authors =
      work.authorships
        ?.slice(0, 3)
        .map((a: { author: { display_name: string } }) => a.author.display_name) ||
      []
    const url =
      work.primary_location?.landing_page_url ||
      (work.doi
        ? `https://doi.org/${work.doi.replace("https://doi.org/", "")}`
        : null)
    const abstract = reconstructAbstract(work.abstract_inverted_index)

    papers.push({
      title,
      authors,
      year: work.publication_year || new Date().getFullYear(),
      url,
    })
    abstracts.push(abstract.trim() || ABSTRACT_PLACEHOLDER)

    if (papers.length >= 7) break
  }

  return { papers, abstracts }
}

async function findTopicResearch(
  startIndex: number,
  tone: "academic" | "casual"
): Promise<TopicResearchResult | null> {
  for (let offset = 0; offset < MAX_TOPIC_ATTEMPTS; offset++) {
    const topic = TOPICS[(startIndex + offset) % TOPICS.length]
    try {
      const { papers, abstracts } = await fetchOpenAlexPapers(topic)
      if (papers.length >= MIN_ARTICLES) {
        return { topic, papers, abstracts, source: "openalex" }
      }

      const webSummary = await generateWebResearchSummary(topic, tone)
      if (webSummary) {
        const urls = extractUrls(webSummary.summary)
        const webReferences: Reference[] = urls.slice(0, 7).map((url, idx) => ({
          title: `Web source ${idx + 1}`,
          authors: [],
          year: new Date().getFullYear(),
          url,
        }))
        return {
          topic,
          papers: webReferences,
          abstracts: [],
          source: "web",
          webSummary: webSummary.summary,
          webTokensUsed: webSummary.tokensUsed,
        }
      }
    } catch (error) {
      console.error(`Error fetching research for topic "${topic}":`, error)
    }
  }

  return null
}

async function storeArticleToSupabase(
  date: string,
  topic: string,
  tone: "academic" | "casual",
  summary: string,
  references: Reference[]
): Promise<void> {
  if (!supabase) return
  try {
    const columnName =
      tone === "academic" ? "summary_academic" : "summary_casual"
    await supabase.from("daily_articles").upsert(
      {
        date,
        topic,
        [columnName]: summary,
        source_papers: references,
      },
      { onConflict: "date" }
    )
  } catch (e) {
    console.error("Error storing article to Supabase:", e)
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const tone = (searchParams.get("tone") || "academic") as
      | "academic"
      | "casual"
    const today = getTodayDateString()

    if (searchParams.get("check") === "1") {
      const cached = await getCachedTopic(today, tone)
      return NextResponse.json({ cached: cached != null })
    }

    const cached = await getCachedTopic(today, tone)
    if (cached) return NextResponse.json(cached)

    const topicIndex = hashDateToTopicIndex(today) % TOPICS.length
    const research = await findTopicResearch(topicIndex, tone)

    if (!research) {
      const fallbackData = {
        topic: TOPICS[topicIndex],
        summary:
          "Today's topic does not yet have enough reliable coverage. We'll retry soon with a better-supported topic.",
        references: [],
      }
      return NextResponse.json(fallbackData)
    }

    let summary = ""
    let tokensUsed = 0
    if (research.source === "web") {
      summary = research.webSummary || ""
      tokensUsed = research.webTokensUsed || 0
    } else {
      const aiSummary = await generateAISummary(
        research.topic,
        research.papers,
        research.abstracts,
        tone
      )
      summary = aiSummary.summary
      tokensUsed = aiSummary.tokensUsed
    }

    // Track tokens used for article generation
    await incrementArticleTokens(today, tokensUsed)

    // Store article to Supabase
    await storeArticleToSupabase(
      today,
      research.topic,
      tone,
      summary,
      research.papers
    )

    const topicData = {
      topic: research.topic,
      summary,
      references: research.papers,
    }
    await setCachedTopic(today, tone, topicData)

    const otherTone = tone === "academic" ? "casual" : "academic"
    after(async () => {
      try {
        const existing = await getCachedTopic(today, otherTone)
        if (existing) return
        let otherSummary = ""
        let otherTokens = 0
        if (research.source === "web") {
          const web = await generateWebResearchSummary(research.topic, otherTone)
          if (!web) return
          otherSummary = web.summary
          otherTokens = web.tokensUsed
        } else {
          const generated = await generateAISummary(
            research.topic,
            research.papers,
            research.abstracts,
            otherTone
          )
          otherSummary = generated.summary
          otherTokens = generated.tokensUsed
        }

        // Track tokens for the other tone
        await incrementArticleTokens(today, otherTokens)

        // Store other tone to Supabase
        await storeArticleToSupabase(
          today,
          research.topic,
          otherTone,
          otherSummary,
          research.papers
        )

        await setCachedTopic(today, otherTone, {
          topic: research.topic,
          summary: otherSummary,
          references: research.papers,
        })
      } catch (e) {
        console.error("Prewarm other tone failed:", e)
      }
    })

    return NextResponse.json(topicData)
  } catch (error) {
    console.error("Error fetching topic:", error)

    const fallbackData = {
      topic: "sustainability research",
      summary:
        "Today's research summary is being prepared. Check back soon to explore the latest findings.",
      references: [],
    }

    return NextResponse.json(fallbackData)
  }
}
