"use client"

import { useState, useEffect } from "react"
import { calculateImpact, formatImpact } from "@/app/lib/impact"

interface DailyStats {
  date: string
  articleTokens: number
  chatTokens: number
  totalTokens: number
}

export default function DailyImpactCounter() {
  const [stats, setStats] = useState<DailyStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/stats")
        if (response.ok) {
          const data = await response.json()
          setStats(data)
        }
      } catch (error) {
        console.error("Error fetching daily stats:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchStats()

    // Poll every 30 seconds for updates
    const interval = setInterval(fetchStats, 30000)
    return () => clearInterval(interval)
  }, [])

  if (isLoading) {
    return (
      <div className="mt-6 flex justify-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sage-light/30 dark:bg-gray-800/50 border border-sage-green/20 dark:border-sage-green/30">
          <div className="w-2 h-2 rounded-full bg-sage-green/50 animate-pulse" />
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Loading impact data...
          </span>
        </div>
      </div>
    )
  }

  if (!stats || stats.totalTokens === 0) {
    return (
      <div className="mt-6 flex justify-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sage-light/30 dark:bg-gray-800/50 border border-sage-green/20 dark:border-sage-green/30">
          <div className="w-2 h-2 rounded-full bg-sage-green" />
          <span className="text-sm text-gray-600 dark:text-gray-300">
            No AI usage recorded today yet
          </span>
        </div>
      </div>
    )
  }

  const metrics = calculateImpact(stats.totalTokens)
  const formatted = formatImpact(metrics)

  return (
    <div className="mt-6 flex justify-center fade-in">
      <div className="inline-flex flex-col items-center gap-1 px-6 py-3 rounded-2xl bg-gradient-to-br from-sage-light/40 to-white/60 dark:from-gray-800/60 dark:to-gray-900/60 border border-sage-green/30 dark:border-sage-green/40 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-sage-green animate-pulse" />
          <span className="text-sm font-medium text-dark-green dark:text-sage-light">
            Today&apos;s AI Impact
          </span>
        </div>
        <div className="flex items-baseline gap-3 text-gray-700 dark:text-gray-200">
          <span className="text-lg font-light">
            {formatted.energy}{" "}
            <span className="text-sm text-gray-500 dark:text-gray-400">Wh</span>
          </span>
          <span className="text-gray-400 dark:text-gray-500">•</span>
          <span className="text-lg font-light">
            {formatted.co2}{" "}
            <span className="text-sm text-gray-500 dark:text-gray-400">
              g CO₂
            </span>
          </span>
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          {stats.totalTokens.toLocaleString()} tokens across all users
        </p>
      </div>
    </div>
  )
}
