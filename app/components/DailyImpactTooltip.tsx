"use client"

import { useState, useEffect, useRef } from "react"

export default function DailyImpactTooltip({
  formatted,
}: {
  formatted: { energy: string; co2: string }
}) {
  const [isOpen, setIsOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside)
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [isOpen])

  return (
    <div className="fade-in block md:hidden">
      <div ref={containerRef} className="relative w-full flex justify-center">
        <button
          className="inline-flex items-center gap-2 p-2 rounded-full bg-sage-light/40 dark:bg-gray-800/70 border border-sage-green/30 dark:border-sage-green/40 shadow-sm text-dark-green dark:text-sage-light text-sm font-medium transition-colors hover:bg-sage-light/70 dark:hover:bg-gray-700/80"
          aria-label="Show Today's AI Impact"
          aria-expanded={isOpen}
          onClick={() => setIsOpen(!isOpen)}
          tabIndex={0}
        >
          <svg
            className="w-4 h-4 text-sage-green dark:text-sage-light"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="1.3"
              fill="none"
            />
            <path
              d="M12 16v-4"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinecap="round"
            />
            <circle cx="12" cy="8" r="1" fill="currentColor" />
          </svg>
        </button>
        <div
          className={`z-20 absolute top-12 left-1/2 -translate-x-1/2 transition-all duration-200 ease-out w-max max-w-xs ${
            isOpen
              ? "opacity-100 pointer-events-auto"
              : "opacity-0 pointer-events-none"
          }`}
        >
          <div className="px-4 py-3 rounded-xl bg-gradient-to-br from-sage-light/90 to-white/90 dark:from-gray-800/90 dark:to-gray-900/90 border border-sage-green/30 dark:border-sage-green/40 shadow-xl drop-shadow-lg backdrop-blur-sm min-w-[180px] text-xs space-y-2">
            <div className="flex flex-col items-center">
              <span className="font-medium text-dark-green dark:text-sage-light mb-2">
                Today&apos;s AI Impact:
              </span>
              <div className="flex flex-row gap-3 justify-center text-gray-800 dark:text-gray-200">
                <span>
                  <span className="font-light">{formatted.energy}</span>{" "}
                  <span className="text-gray-500 dark:text-gray-400">Wh</span>
                </span>
                <span className="text-gray-400 dark:text-gray-500">•</span>
                <span>
                  <span className="font-light">{formatted.co2}</span>{" "}
                  <span className="text-gray-500 dark:text-gray-400">
                    g CO₂
                  </span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
