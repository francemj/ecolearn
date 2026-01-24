"use client"

import { useState, useCallback, useEffect } from "react"
import TopicCard from "./components/TopicCard"
import Chat from "./components/Chat"
import Header from "./components/Header"
import Footer from "./components/Footer"
import { Tone } from "./components/ToneToggle"

interface Reference {
  title: string
  authors: string[]
  year: number
  url: string | null
}

interface Topic {
  topic: string
  summary: string
  references: Reference[]
}

export default function Home() {
  const [topic, setTopic] = useState<Topic | null>(null)
  const [loading, setLoading] = useState(true)
  const [generatingOnTheSpot, setGeneratingOnTheSpot] = useState(false)
  const [tone, setTone] = useState<Tone>("academic")
  const [mounted, setMounted] = useState(false)

  const fetchTopic = useCallback(async (currentTone: Tone) => {
    try {
      setLoading(true)
      setGeneratingOnTheSpot(false)

      fetch(`/api/topic?tone=${currentTone}&check=1`)
        .then((r) => r.json())
        .then((d) => setGeneratingOnTheSpot(!d.cached))
        .catch(() => {})

      const response = await fetch(`/api/topic?tone=${currentTone}`)
      const data = await response.json()
      setTopic(data)
    } catch (error) {
      console.error("Error fetching topic:", error)
    } finally {
      setLoading(false)
    }
  }, [])

  const handleToneChange = useCallback(
    (newTone: Tone) => {
      setTone(newTone)
      fetchTopic(newTone)
    },
    [fetchTopic]
  )

  // Sync from localStorage after mount to avoid hydration mismatch.
  // Defer setState to a microtask so it runs in a callback, not synchronously in the effect.
  useEffect(() => {
    let cancelled = false
    queueMicrotask(() => {
      if (cancelled) return
      const saved = localStorage.getItem("tone") as Tone | null
      if (saved === "academic" || saved === "casual") {
        setTone(saved)
      }
      setMounted(true)
    })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    if (mounted && (tone === "academic" || tone === "casual")) {
      fetchTopic(tone)
    }
  }, [fetchTopic, tone, mounted])

  return (
    <main className="min-h-screen py-12 px-4 transition-colors duration-300 bg-gradient-to-b from-white to-sage-light dark:from-gray-900 dark:to-dark-slate">
      <div className="max-w-4xl mx-auto">
        <Header
          subtitle="Research overviews on sustainability topics, with papers to explore further."
          linkToHome={false}
        />

        <TopicCard
          topic={topic}
          tone={tone}
          loading={loading}
          generatingOnTheSpot={generatingOnTheSpot}
          onToneChange={handleToneChange}
        />

        {topic && !loading && <Chat topicContext={topic} tone={tone} />}

        <Footer>
          <a
            href="/articles"
            className="inline-block text-sm text-dark-teal dark:text-sage-green hover:text-dark-green dark:hover:text-sage-light underline underline-offset-4 transition-colors"
          >
            Browse Previous Articles →
          </a>
        </Footer>
      </div>
    </main>
  )
}
