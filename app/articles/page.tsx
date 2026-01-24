"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Header from "@/app/components/Header"
import Footer from "@/app/components/Footer"

interface Article {
  id: string
  date: string
  topic: string
  created_at: string
}

export default function ArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchArticles() {
      try {
        const response = await fetch("/api/articles")
        if (!response.ok) {
          throw new Error("Failed to fetch articles")
        }
        const data = await response.json()
        setArticles(data.articles || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : "An error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchArticles()
  }, [])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <main className="min-h-screen py-12 px-4 transition-colors duration-300 bg-gradient-to-b from-white to-sage-light dark:from-gray-900 dark:to-dark-slate">
      <div className="max-w-4xl mx-auto">
        <Header subtitle="Browse our archive of research overviews." />

        <div className="bg-gradient-to-br from-sage-light/50 to-white dark:from-gray-800 dark:to-gray-900 rounded-lg p-4 md:p-8 mb-8 fade-in border border-sage-green/30 dark:border-sage-green/50">
          {loading && (
            <div className="animate-pulse space-y-4">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="h-16 bg-sage-green/20 dark:bg-gray-700 rounded"
                />
              ))}
            </div>
          )}

          {error && (
            <div className="text-center py-8">
              <p className="text-red-600 dark:text-red-400">{error}</p>
            </div>
          )}

          {!loading && !error && articles.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-600 dark:text-gray-400">
                No articles found. Check back after visiting the homepage to
                generate today&apos;s article.
              </p>
            </div>
          )}

          {!loading && !error && articles.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-sage-green/30 dark:border-sage-green/50">
                    <th className="text-left py-3 px-4 text-sm font-medium text-dark-green dark:text-sage-light">
                      Date
                    </th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-dark-green dark:text-sage-light">
                      Topic
                    </th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-dark-green dark:text-sage-light">
                      View
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {articles.map((article) => (
                    <tr
                      key={article.id}
                      className="border-b border-sage-green/20 dark:border-sage-green/30 hover:bg-sage-light/30 dark:hover:bg-gray-700/30 transition-colors"
                    >
                      <td className="py-4 px-4 text-sm text-gray-600 dark:text-gray-400 whitespace-nowrap">
                        {formatDate(article.date)}
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-gray-800 dark:text-gray-200 capitalize">
                          {article.topic}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <div className="flex items-center justify-center gap-2">
                          <Link
                            href={`/articles/${article.date}/academic`}
                            className="px-3 py-1 text-xs rounded-full bg-dark-teal/10 dark:bg-sage-green/20 text-dark-teal dark:text-sage-light hover:bg-dark-teal/20 dark:hover:bg-sage-green/30 transition-colors"
                          >
                            Academic
                          </Link>
                          <Link
                            href={`/articles/${article.date}/casual`}
                            className="px-3 py-1 text-xs rounded-full bg-sage-green/20 dark:bg-sage-green/20 text-dark-green dark:text-sage-light hover:bg-sage-green/30 dark:hover:bg-sage-green/30 transition-colors"
                          >
                            Casual
                          </Link>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="text-center">
          <Link
            href="/"
            className="inline-block px-6 py-3 bg-gradient-to-r from-dark-teal to-dark-green text-white rounded-lg hover:from-dark-green hover:to-sage-green transition-all shadow-md hover:shadow-lg"
          >
            ← Back to Today&apos;s Article
          </Link>
        </div>

        <Footer />
      </div>
    </main>
  )
}
