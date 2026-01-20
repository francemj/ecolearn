import { Redis } from "@upstash/redis"
import { NextRequest, NextResponse } from "next/server"

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
    const raw = await redis.get(`ecolearn:topic:${date}:${tone}`)

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
    await redis.set(`ecolearn:topic:${date}:${tone}`, JSON.stringify(data), {
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
    .map(
      (paper, idx) =>
        `Paper ${idx + 1}: "${paper.title}" (${paper.year})
Authors: ${paper.authors.join(", ")}
Abstract: ${abstracts[idx]}`
    )
    .join("\n\n")

  const academicSystemPrompt = `You are a research synthesizer that creates clear, accessible summaries of multiple academic papers on environmental topics. Your summaries should:
- Be calm, factual, and engaging
- Highlight key findings and consensus across papers
- Note any important disagreements or gaps
- Use accessible language for non-experts
- Be 3-4 paragraphs long
- Focus on what we know and what matters`

  const casualSystemPrompt = `You are a friendly guide who helps people understand environmental research in a laid-back, conversational way. Your summaries should:
- Be warm, approachable, and down-to-earth
- Explain findings like you're chatting with a curious friend
- Use everyday language and relatable examples
- Still be accurate and respect the science
- Be 3-4 paragraphs long
- Make complex ideas feel accessible without dumbing them down
- Show genuine enthusiasm for interesting discoveries`

  const academicUserPrompt = `Create a comprehensive summary of findings from these ${papers.length} research papers on "${topic}". Focus on synthesizing the key insights, patterns, and important discoveries across all papers.

${papersContext}

Create an engaging summary that helps readers understand the current state of research on ${topic}.`

  const casualUserPrompt = `Hey! I've got ${papers.length} research papers here about "${topic}", and I'd love your help making sense of what they're saying. Can you read through them and give me a friendly rundown of the key stuff researchers are finding?

${papersContext}

Give me the highlights in a way that's easy to follow - what's the big picture on ${topic} right now?`

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
        model: "gpt-4-turbo",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        temperature: tone === "casual" ? 0.8 : 0.7,
        max_tokens: 800,
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

    const topics = [
      "climate change",
      "renewable energy",
      "sustainable agriculture",
      "ocean conservation",
      "biodiversity loss",
      "circular economy",
      "carbon sequestration",
      "environmental pollution",
      "sustainable urban planning",
      "water conservation",
    ]

    const topicIndex = hashDateToTopicIndex(today) % topics.length
    const selectedTopic = topics[topicIndex]

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
