import { Redis } from "@upstash/redis"
import { NextRequest, NextResponse } from "next/server"

import { TOPICS } from "./topics"

export const runtime = "edge"

const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL as string,
        token: process.env.UPSTASH_REDIS_REST_TOKEN as string,
      })
    : null

const CACHE_TTL = 86400 // 24h in seconds

interface Reference {
  title: string
  authors: string[]
  year: number
  url: string | null
}

async function getCached(
  date: string,
  tone: string
): Promise<{ topic: string; summary: string; references: Reference[] } | null> {
  if (!redis) return null
  try {
    const raw = await redis.get(`ecolearn:topic:v2:${date}:${tone}`)

    return raw != null
      ? typeof raw === "string"
        ? (JSON.parse(raw) as {
            topic: string
            summary: string
            references: Reference[]
          })
        : typeof raw === "object"
          ? (raw as { topic: string; summary: string; references: Reference[] })
          : null
      : null
  } catch (e) {
    console.error("Redis getCached error:", e)
    return null
  }
}

async function setCached(
  date: string,
  tone: string,
  data: { topic: string; summary: string; references: Reference[] }
): Promise<void> {
  if (!redis) return
  try {
    await redis.set(`ecolearn:topic:v2:${date}:${tone}`, JSON.stringify(data), {
      ex: CACHE_TTL,
    })
  } catch (e) {
    console.error("Redis setCached error:", e)
  }
}

function getTodayDateString(): string {
  const now = new Date()
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`
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

async function generateAISummary(
  topic: string,
  papers: Reference[],
  abstracts: string[],
  tone: "academic" | "casual"
): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY

  if (!apiKey) {
    return `Today's topic is ${topic}. Multiple research papers on this topic have been gathered, but AI summary generation is unavailable. Add your OpenAI key to enable AI-powered summaries.`
  }

  const papersContext = papers
    .map((paper, idx) => {
      const focus =
        abstracts[idx].length > 220
          ? abstracts[idx].slice(0, 220).trim() + "…"
          : abstracts[idx]
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
    return data.choices[0].message.content
  } catch (error) {
    console.error("Error generating AI summary:", error)
    return `Research on ${topic} is actively being studied across multiple dimensions. While we've gathered ${papers.length} significant papers on this topic, the AI summary is temporarily unavailable. Please check the references below to explore the research directly.`
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const tone = (searchParams.get("tone") || "academic") as
      | "academic"
      | "casual"
    const today = getTodayDateString()

    const cached = await getCached(today, tone)
    if (cached) return NextResponse.json(cached)

    const topicIndex = hashDateToTopicIndex(today) % TOPICS.length
    const selectedTopic = TOPICS[topicIndex]

    const searchUrl = `https://api.openalex.org/works?filter=title_and_abstract.search:${encodeURIComponent(selectedTopic)},type:article,from_publication_date:2020-01-01&sort=cited_by_count:desc&per_page=7`

    const response = await fetch(searchUrl, {
      headers: {
        "User-Agent": "EcoLearn-Daily (mailto:research@example.com)",
      },
    })

    if (!response.ok) {
      throw new Error("OpenAlex API request failed")
    }

    const data = await response.json()

    if (!data.results || data.results.length === 0) {
      const fallbackData = {
        topic: selectedTopic,
        summary:
          "Today's research is still being fetched. Check back soon for an AI-generated summary of recent sustainability research.",
        references: [],
      }
      await setCached(today, "academic", fallbackData)
      await setCached(today, "casual", fallbackData)
      return NextResponse.json(fallbackData)
    }

    const papers: Reference[] = []
    const abstracts: string[] = []

    for (const work of data.results.slice(0, 7)) {
      const abstract = reconstructAbstract(work.abstract_inverted_index)
      if (abstract) {
        const authors =
          work.authorships
            ?.slice(0, 3)
            .map(
              (a: { author: { display_name: string } }) => a.author.display_name
            ) || []
        const url =
          work.primary_location?.landing_page_url ||
          (work.doi
            ? `https://doi.org/${work.doi.replace("https://doi.org/", "")}`
            : null)

        papers.push({
          title: work.title || "Untitled Research Paper",
          authors,
          year: work.publication_year || new Date().getFullYear(),
          url,
        })
        abstracts.push(abstract)
      }

      if (papers.length >= 5) break
    }

    if (papers.length === 0) {
      const fallbackData = {
        topic: selectedTopic,
        summary:
          "Research papers on this topic are being processed. Check back soon for insights.",
        references: [],
      }
      await setCached(today, "academic", fallbackData)
      await setCached(today, "casual", fallbackData)
      return NextResponse.json(fallbackData)
    }

    const summary = await generateAISummary(
      selectedTopic,
      papers,
      abstracts,
      tone
    )

    const topicData = {
      topic: selectedTopic,
      summary,
      references: papers,
    }
    await setCached(today, tone, topicData)
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
