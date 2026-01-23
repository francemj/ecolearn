"use client"

import { calculateImpact, formatImpact } from "@/app/lib/impact"

interface ImpactCounterProps {
  totalTokens: number
}

export default function ImpactCounter({ totalTokens }: ImpactCounterProps) {
  if (totalTokens === 0) {
    return null
  }

  const metrics = calculateImpact(totalTokens)
  const formatted = formatImpact(metrics)

  return (
    <div className="mt-6 pt-4 border-t border-sage-green/30 dark:border-sage-green/50 fade-in">
      <p className="text-xs text-sage-green dark:text-sage-light text-center">
        This conversation has used about {formatted.energy} Wh (~{formatted.co2}{" "}
        g CO₂)
      </p>
    </div>
  )
}
