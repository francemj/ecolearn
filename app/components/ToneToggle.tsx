"use client"

import { useState, useEffect } from "react"

export type Tone = "academic" | "casual"

interface ToneToggleProps {
  onToneChange: (tone: Tone) => void
}

export default function ToneToggle({ onToneChange }: ToneToggleProps) {
  const [tone, setTone] = useState<Tone>("academic")
  const [mounted, setMounted] = useState(false)

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
      onToneChange(tone)
    }
  }, [onToneChange, tone, mounted])

  const toggleTone = () => {
    const newTone: Tone = tone === "academic" ? "casual" : "academic"
    setTone(newTone)
    localStorage.setItem("tone", newTone)
    onToneChange(newTone)
  }

  return (
    <button
      onClick={toggleTone}
      className="fixed top-6 right-20 px-4 py-3 rounded-full bg-gradient-to-br from-sage-light to-sage-green/20 dark:from-dark-teal dark:to-dark-green hover:from-sage-green/30 hover:to-sage-green/40 dark:hover:from-dark-green dark:hover:to-sage-green transition-all shadow-lg hover:shadow-xl border border-sage-green/30 dark:border-sage-green/50 text-sm font-medium text-dark-teal dark:text-sage-light"
      aria-label="Toggle tone"
      title={`Switch to ${tone === "academic" ? "casual" : "academic"} tone`}
    >
      {tone === "academic" ? (
        <span className="flex items-center gap-2">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
          </svg>
          Academic
        </span>
      ) : (
        <span className="flex items-center gap-2">
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z"
              clipRule="evenodd"
            />
          </svg>
          Casual
        </span>
      )}
    </button>
  )
}
