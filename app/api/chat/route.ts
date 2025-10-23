import { NextRequest } from "next/server"

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
            "Chat unavailable — add your OpenAI key to Replit Secrets to enable responses.",
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

    const academicSystemPrompt = `You are an assistant that explains environmental research in calm, factual, and accessible language. You have access to an AI-generated summary synthesized from multiple research papers. Use only the facts from the provided summary and references. Avoid speculation, politics, or moralizing.

Research Topic: ${topicContext?.topic || "sustainability"}

Summary of Findings:
${topicContext?.summary || "N/A"}

Source Papers:
${referencesText}

Answer questions based on this research synthesis. Keep responses clear, factual, and grounded in the summary's content. You may reference specific papers when relevant.`

    const casualSystemPrompt = `You're a friendly guide helping someone understand environmental research. You have an AI-generated summary from multiple research papers. Be conversational and approachable, but stay grounded in the facts. No speculation, politics, or preaching.

Research Topic: ${topicContext?.topic || "sustainability"}

Summary of Findings:
${topicContext?.summary || "N/A"}

Source Papers:
${referencesText}

Answer questions in a down-to-earth way, based on what the research actually says. You can mention specific papers when it helps clarify things. Keep it real and relatable.`

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
        temperature: tone === "casual" ? 0.8 : 0.7,
        max_tokens: 800,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error?.message || "OpenAI API request failed")
    }

    return new Response(response.body, {
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
