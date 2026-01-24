"use client"

import ToneToggle, { Tone } from "./ToneToggle"
import DailyImpactCounter from "./DailyImpactCounter"

interface Reference {
  title: string
  authors: string[]
  year: number
  url: string | null
}

interface TopicCardProps {
  topic: {
    topic: string
    summary: string
    references: Reference[]
  } | null
  tone: Tone
  loading: boolean
  generatingOnTheSpot?: boolean
  onToneChange?: (tone: Tone) => void
  /** Label shown in the badge (defaults to "Today's Topic") */
  label?: string
  /** Whether to show the daily impact counter (defaults to true) */
  showImpactCounter?: boolean
  /** Date string to display (for archived articles) */
  date?: string
}

export default function TopicCard({
  topic,
  tone,
  loading,
  generatingOnTheSpot = false,
  onToneChange,
  label = "Today's Topic",
  showImpactCounter = true,
  date,
}: TopicCardProps) {
  if (loading && generatingOnTheSpot) {
    return (
      <div className="bg-gradient-to-br from-sage-light/50 to-white dark:from-gray-800 dark:to-gray-900 rounded-lg p-8 mb-8 fade-in border border-sage-green/30 dark:border-sage-green/50">
        <p className="text-gray-700 dark:text-gray-300 mb-6">
          You&apos;re the first user of the day — we&apos;re generating
          today&apos;s research for you on the spot.
        </p>
        <div className="animate-pulse">
          <div className="h-4 bg-sage-green/20 dark:bg-gray-700 rounded w-full mb-2"></div>
          <div className="h-4 bg-sage-green/20 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-sage-green/20 dark:bg-gray-700 rounded w-2/3"></div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-sage-light/50 to-white dark:from-gray-800 dark:to-gray-900 rounded-lg p-8 mb-8 fade-in border border-sage-green/30 dark:border-sage-green/50">
        <div className="animate-pulse">
          <div className="h-6 bg-sage-green/20 dark:bg-gray-700 rounded w-48 mb-6"></div>
          <div className="h-4 bg-sage-green/20 dark:bg-gray-700 rounded w-full mb-3"></div>
          <div className="h-4 bg-sage-green/20 dark:bg-gray-700 rounded w-full mb-3"></div>
          <div className="h-4 bg-sage-green/20 dark:bg-gray-700 rounded w-3/4 mb-6"></div>
          <div className="h-4 bg-sage-green/20 dark:bg-gray-700 rounded w-2/3"></div>
        </div>
      </div>
    )
  }

  if (!topic) {
    return (
      <div className="bg-gradient-to-br from-sage-light/50 to-white dark:from-gray-800 dark:to-gray-900 rounded-lg p-8 mb-8 fade-in border border-sage-green/30 dark:border-sage-green/50">
        <p className="text-gray-600 dark:text-gray-400">
          Unable to load today&apos;s research summary. Please try again later.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-sage-light/50 to-white dark:from-gray-800 dark:to-gray-900 rounded-lg p-4 xs:p-8 mb-8 fade-in border border-sage-green/30 dark:border-sage-green/50">
      <div className="mb-6">
        <div className="flex items-center justify-between gap-4 flex-wrap mb-4">
          <div className="flex items-center gap-2">
            <div className="inline-block px-4 py-2 bg-gradient-to-r from-dark-teal to-dark-green text-white text-sm rounded-full border border-sage-green/30 dark:border-sage-green/50">
              {label}
            </div>
            {showImpactCounter && <DailyImpactCounter />}
          </div>
          {onToneChange && (
            <ToneToggle tone={tone} onToneChange={onToneChange} />
          )}
        </div>
        {date && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
            {new Date(date).toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
              timeZone: "UTC",
            })}
          </p>
        )}
        <h2 className="text-3xl md:text-4xl font-light capitalize leading-relaxed text-dark-teal dark:text-sage-light mb-6">
          {topic.topic}
        </h2>
      </div>

      <div className="prose prose-lg max-w-none mb-8">
        <div className="text-gray-800 dark:text-gray-200 leading-relaxed text-base whitespace-pre-wrap">
          {topic.summary}
        </div>
      </div>

      {topic.references && topic.references.length > 0 && (
        <div className="border-t border-sage-green/30 dark:border-sage-green/50 pt-6">
          <h3 className="text-xl font-light text-dark-green dark:text-sage-light mb-4">
            References ({topic.references.length} papers)
          </h3>
          <div className="space-y-4">
            {topic.references.map((ref, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-sage-green/30 dark:border-sage-green/50 hover:border-sage-green dark:hover:border-sage-green transition-colors"
              >
                <h4 className="font-normal text-gray-900 dark:text-gray-100 mb-2">
                  {idx + 1}. {ref.title}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {ref.authors.length > 0 ? (
                    <>
                      <span className="font-light">Authors:</span>{" "}
                      {ref.authors.join(", ")}
                      {ref.authors.length === 3 && " et al."}
                    </>
                  ) : (
                    <span className="font-light">Authors not available</span>
                  )}
                  {" • "}
                  <span className="font-light">{ref.year}</span>
                </p>
                {ref.url && (
                  <a
                    href={ref.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block text-sm text-dark-teal dark:text-sage-green hover:text-dark-green dark:hover:text-sage-light underline underline-offset-4 transition-colors"
                  >
                    Read full paper →
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
