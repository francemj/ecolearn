import { NextRequest } from "next/server"
import { incrementChatTokens, getTodayDateString } from "@/app/lib/redis"

export const runtime = "edge"

interface Message {
  role: "user" | "assistant" | "system"
  content: string
}

export async function POST(req: NextRequest) {
  try {
    const { messages, topicContext, tone = "academic" } = await req.json()

    const apiKey = process.env.OPENAI_API_KEY

    if (!apiKey) {
      return new Response(
        JSON.stringify({
          error:
            "Chat unavailable — add your OpenAI key to environment variables to enable responses.",
        }),
        { status: 503, headers: { "Content-Type": "application/json" } }
      )
    }

    const referencesText =
      topicContext?.references
        ?.map(
          (ref: any, idx: number) =>
            `${idx + 1}. "${ref.title}" (${ref.year}) by ${ref.authors.join(", ")}`
        )
        .join("\n") || "No references available"

    const academicSystemPrompt = `You are an assistant that explains environmental research in calm, factual, and accessible language. You have access to a research overview on the topic, with references to papers for deeper reading (including those that support, challenge, or complicate a point—never exclude one because it argues against the overview). Use the facts from the overview and references. Avoid speculation, politics, or moralizing.

Research Topic: ${topicContext?.topic || "sustainability"}

Research Overview:
${topicContext?.summary || "N/A"}

Source Papers:
${referencesText}

Base answers on this overview. When appropriate, point users to specific papers (by number or title) to explore a point further—including papers that disagree or complicate it. Keep responses clear, factual, and grounded in the overview. Reference specific papers when relevant.`

    const casualSystemPrompt = `You're a friendly guide helping someone understand environmental research. You have access to a research overview on the topic, with references to papers for deeper reading (including those that support, challenge, or complicate a point—never exclude one because it argues against the overview). Be conversational and approachable, but stay grounded in the facts. No speculation, politics, or preaching.

Research Topic: ${topicContext?.topic || "sustainability"}

Research Overview:
${topicContext?.summary || "N/A"}

Source Papers:
${referencesText}

Base answers on this overview. When it helps, point users to specific papers (by number or title) to explore further—including papers that disagree or complicate things. Keep it real and relatable.`

    const systemPrompt =
      tone === "casual" ? casualSystemPrompt : academicSystemPrompt

    const chatMessages: Message[] = [
      { role: "system", content: systemPrompt },
      ...messages,
    ]

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "gpt-4-turbo",
        messages: chatMessages,
        stream: true,
        stream_options: { include_usage: true },
        temperature: tone === "casual" ? 0.8 : 0.7,
        max_tokens: 800,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error?.message || "OpenAI API request failed")
    }

    // Create a TransformStream to intercept and track token usage
    const today = getTodayDateString()
    let totalTokens = 0

    const transformStream = new TransformStream({
      transform(chunk, controller) {
        // Pass through the chunk unchanged
        controller.enqueue(chunk)

        // Try to extract usage data from the chunk
        const text = new TextDecoder().decode(chunk)
        const lines = text.split("\n")

        for (const line of lines) {
          if (line.startsWith("data: ") && !line.includes("[DONE]")) {
            try {
              const data = JSON.parse(line.slice(6))
              // Usage is included in the final chunk when stream_options.include_usage is true
              if (data.usage?.total_tokens) {
                totalTokens = data.usage.total_tokens
              }
            } catch {
              // Ignore parse errors for incomplete chunks
            }
          }
        }
      },
      async flush() {
        // Stream is complete, update token count in Upstash
        if (totalTokens > 0) {
          await incrementChatTokens(today, totalTokens)
        }
      },
    })

    return new Response(response.body?.pipeThrough(transformStream), {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    })
  } catch (error) {
    console.error("Chat API error:", error)
    return new Response(
      JSON.stringify({
        error:
          error instanceof Error
            ? error.message
            : "An error occurred while processing your request.",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
}
