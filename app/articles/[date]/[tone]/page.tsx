"use client"

import { useState, useEffect, use } from "react"
import Link from "next/link"
import TopicCard from "@/app/components/TopicCard"
import Header from "@/app/components/Header"
import Footer from "@/app/components/Footer"
import { Tone } from "@/app/components/ToneToggle"

interface Reference {
  title: string
  authors: string[]
  year: number
  url: string | null
}

interface Article {
  date: string
  topic: string
  summary: string
  references: Reference[]
}

export default function ArticlePage({
  params,
}: {
  params: Promise<{ date: string; tone: string }>
}) {
  const { date, tone } = use(params)
  const [article, setArticle] = useState<Article | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const validTone = tone === "academic" || tone === "casual" ? tone : "academic"

  useEffect(() => {
    async function fetchArticle() {
      try {
        const response = await fetch(`/api/articles/${date}/${validTone}`)
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error("Article not found")
          }
          throw new Error("Failed to fetch article")
        }
        const data = await response.json()
        setArticle(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchArticle()
  }, [date, validTone])

  const handleToneChange = (newTone: Tone) => {
    // Navigate to the same date with different tone
    window.location.href = `/articles/${date}/${newTone}`
  }

  const formatDateForLabel = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      timeZone: "UTC",
    })
  }

  return (
    <main className="min-h-screen py-12 px-4 transition-colors duration-300 bg-gradient-to-b from-white to-sage-light dark:from-gray-900 dark:to-dark-slate">
      <div className="max-w-4xl mx-auto">
        <Header subtitle={`Archive article from ${date}`} />

        {error && (
          <div className="bg-gradient-to-br from-sage-light/50 to-white dark:from-gray-800 dark:to-gray-900 rounded-lg p-8 mb-8 fade-in border border-sage-green/30 dark:border-sage-green/50 text-center">
            <p className="text-red-600 dark:text-red-400 mb-4">{error}</p>
            <Link
              href="/articles"
              className="text-dark-teal dark:text-sage-green hover:underline"
            >
              ← Back to Articles
            </Link>
          </div>
        )}

        {!error && (
          <TopicCard
            topic={
              article
                ? {
                    topic: article.topic,
                    summary: article.summary,
                    references: article.references,
                  }
                : null
            }
            tone={validTone as Tone}
            loading={loading}
            onToneChange={handleToneChange}
            label={article ? formatDateForLabel(article.date) : "Loading..."}
            showImpactCounter={true}
            date={article?.date}
          />
        )}

        <div className="flex justify-center gap-4 mt-8">
          <Link
            href="/articles"
            className="px-6 py-3 border border-sage-green/50 text-dark-green dark:text-sage-light rounded-lg hover:bg-sage-light/30 dark:hover:bg-gray-700/30 transition-all"
          >
            ← All Articles
          </Link>
          <Link
            href="/"
            className="px-6 py-3 bg-gradient-to-r from-dark-teal to-dark-green text-white rounded-lg hover:from-dark-green hover:to-sage-green transition-all shadow-md hover:shadow-lg"
          >
            Today&apos;s Article
          </Link>
        </div>

        <Footer>
          <div className="flex items-center justify-center gap-6 text-sm">
            <Link
              href="/why"
              className="text-dark-teal dark:text-sage-green hover:text-dark-green dark:hover:text-sage-light underline underline-offset-4 transition-colors"
            >
              Why I made this
            </Link>
            <Link
              href="/articles"
              className="text-dark-teal dark:text-sage-green hover:text-dark-green dark:hover:text-sage-light underline underline-offset-4 transition-colors"
            >
              Articles
            </Link>
          </div>
        </Footer>
      </div>
    </main>
  )
}
