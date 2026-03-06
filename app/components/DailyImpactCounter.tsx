"use client"

import { useState, useEffect } from "react"
import { calculateImpact, formatImpact } from "@/app/lib/impact"
import DailyImpactTooltip from "./DailyImpactTooltip"

interface DailyStats {
  date: string
  articleTokens: number
  chatTokens: number
  totalTokens: number
}

function getTodayDateString(): string {
  const now = new Date()
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}-${String(now.getUTCDate()).padStart(2, "0")}`
}

export default function DailyImpactCounter({ date }: { date?: string }) {
  const [stats, setStats] = useState<DailyStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const url = date
          ? `/api/stats?date=${encodeURIComponent(date)}`
          : "/api/stats"
        const response = await fetch(url)
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
  }, [date])

  if (isLoading) {
    return (
      <div>
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
    const isPastDay = date && date !== getTodayDateString()
    const emptyMessage = isPastDay
      ? "No AI usage recorded for this day"
      : "No AI usage recorded today yet"
    return (
      <div>
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sage-light/30 dark:bg-gray-800/50 border border-sage-green/20 dark:border-sage-green/30">
          <div className="w-2 h-2 rounded-full bg-sage-green" />
          <span className="text-sm text-gray-600 dark:text-gray-300">
            {emptyMessage}
          </span>
        </div>
      </div>
    )
  }

  const metrics = calculateImpact(stats.totalTokens)
  const formatted = formatImpact(metrics)

  return (
    <>
      {/* Hidden up from md and above: show hover button with popup/tooltip */}
      <DailyImpactTooltip formatted={formatted} />

      {/* Show full panel on md and up */}
      <div className="fade-in hidden md:block">
        <div className="inline-flex flex-wrap flex-row w-full items-center justify-around gap-3 px-3 py-1 rounded-2xl bg-gradient-to-br from-sage-light/40 to-white/60 dark:from-gray-800/60 dark:to-gray-900/60 border border-sage-green/30 dark:border-sage-green/40 shadow-sm">
          <div className="flex items-center gap-2 min-w-fit">
            <span className="text-sm font-medium text-dark-green dark:text-sage-light">
              AI Impact ≈
            </span>
          </div>
          <div className="flex items-baseline gap-1 text-gray-700 dark:text-gray-200 min-w-fit">
            <span className="text-md font-light">
              {formatted.energy}{" "}
              <span className="text-sm text-gray-500 dark:text-gray-400">
                Wh
              </span>
            </span>
            <span className="text-gray-400 dark:text-gray-500">•</span>
            <span className="text-md font-light">
              {formatted.co2}{" "}
              <span className="text-sm text-gray-500 dark:text-gray-400">
                g CO₂
              </span>
            </span>
          </div>
        </div>
      </div>
    </>
  )
}
