"use client"

import { useState, useCallback } from "react"
import TopicCard from "./components/TopicCard"
import Chat from "./components/Chat"
import ToneToggle, { Tone } from "./components/ToneToggle"
import DailyImpactCounter from "./components/DailyImpactCounter"

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

  return (
    <main className="min-h-screen py-12 px-4 transition-colors duration-300 bg-gradient-to-b from-white to-sage-light dark:from-gray-900 dark:to-dark-slate">
      <ToneToggle onToneChange={handleToneChange} />

      <div className="max-w-4xl mx-auto">
        <header className="mb-12 text-center fade-in">
          <h1 className="text-5xl md:text-6xl font-light mb-4 bg-gradient-to-r from-dark-teal via-dark-green to-sage-green dark:from-sage-green dark:via-sage-light dark:to-sage-green bg-clip-text text-transparent">
            EcoLearn Daily
          </h1>
          <p className="text-gray-700 dark:text-gray-300 text-base md:text-lg">
            Research overviews on sustainability topics, with papers to explore
            further.
          </p>
          <DailyImpactCounter />
        </header>

        <TopicCard
          topic={topic}
          loading={loading}
          generatingOnTheSpot={generatingOnTheSpot}
        />

        {topic && !loading && <Chat topicContext={topic} tone={tone} />}

        <footer className="mt-16 pt-8 border-t border-sage-green/30 dark:border-sage-green/50 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Built to learn, not to keep you hooked.
          </p>
        </footer>
      </div>
    </main>
  )
}
