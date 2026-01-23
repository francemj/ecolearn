"use client"

import { useState, useRef, useEffect } from "react"
import ImpactCounter from "./ImpactCounter"
import { Tone } from "./ToneToggle"

interface Message {
  role: "user" | "assistant" | "system"
  content: string
}

interface Reference {
  title: string
  authors: string[]
  year: number
  url: string | null
}

interface ChatProps {
  topicContext: {
    topic: string
    summary: string
    references: Reference[]
  } | null
  tone: Tone
}

export default function Chat({ topicContext, tone }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [totalTokens, setTotalTokens] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    if (messages.length > 0) scrollToBottom()
  }, [messages])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = { role: "user", content: input }
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInput("")
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: newMessages,
          topicContext,
          tone,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to get response")
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) {
        throw new Error("No response stream available")
      }

      let assistantMessage = ""
      let streamTokens = 0
      setMessages((prev) => [...prev, { role: "assistant", content: "" }])

      let buffer = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split("\n")

        // Keep the last potentially incomplete line in the buffer
        buffer = lines.pop() || ""

        for (const line of lines) {
          const trimmed = line.trim()
          if (!trimmed || !trimmed.startsWith("data: ")) continue

          const data = trimmed.slice(6)
          if (data === "[DONE]") continue

          try {
            const parsed = JSON.parse(data)

            // Extract content from delta
            const content = parsed.choices?.[0]?.delta?.content
            if (content) {
              assistantMessage += content
              setMessages((prev) => {
                const updated = [...prev]
                updated[updated.length - 1] = {
                  role: "assistant",
                  content: assistantMessage,
                }
                return updated
              })
            }

            // Extract usage from final chunk (when stream_options.include_usage is true)
            if (parsed.usage?.total_tokens) {
              streamTokens = parsed.usage.total_tokens
            }
          } catch {
            // Skip malformed JSON (shouldn't happen with proper buffering)
          }
        }
      }

      // Update token count with actual usage from stream
      if (streamTokens > 0) {
        setTotalTokens((prev) => prev + streamTokens)
      }
    } catch (err) {
      console.error("Chat error:", err)
      setError(err instanceof Error ? err.message : "An error occurred")
      setMessages((prev) => prev.slice(0, -1))
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-gradient-to-br from-sage-light/50 to-white dark:from-gray-800 dark:to-gray-900 rounded-lg p-6 fade-in border border-sage-green/30 dark:border-sage-green/50">
      <h3 className="text-xl font-light mb-4 text-dark-green dark:text-sage-light">
        Discuss this research
      </h3>

      {error && (
        <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded text-sm text-red-700 dark:text-red-300">
          {error}
        </div>
      )}

      <div className="space-y-4 mb-4 max-h-96 overflow-y-auto">
        {messages.map((msg, idx) => (
          <div
            key={idx}
            className={`p-4 rounded ${
              msg.role === "user"
                ? "bg-white dark:bg-gray-700 ml-8 border border-sage-green/30 dark:border-sage-green/50"
                : "bg-sage-light/30 dark:bg-gray-900 mr-8 border border-sage-green/30 dark:border-sage-green/50"
            }`}
          >
            <p className="text-xs text-sage-green dark:text-sage-light mb-1 font-medium">
              {msg.role === "user" ? "You" : "Assistant"}
            </p>
            <p className="text-sm text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">
              {msg.content}
            </p>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="What are the key findings on this topic?"
          disabled={isLoading}
          className="flex-1 px-4 py-3 rounded-lg border border-sage-green/30 dark:border-sage-green/50 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-sage-green dark:focus:ring-sage-light disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={isLoading || !input.trim()}
          className="px-6 py-3 bg-gradient-to-r from-dark-teal to-dark-green text-white rounded-lg hover:from-dark-green hover:to-sage-green disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md hover:shadow-lg"
        >
          {isLoading ? "Thinking..." : "Ask"}
        </button>
      </form>

      <ImpactCounter totalTokens={totalTokens} />
    </div>
  )
}
