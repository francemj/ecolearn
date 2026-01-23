// Constants for calculating AI environmental impact
export const WH_PER_THOUSAND_TOKENS = 0.25
export const CO2_PER_WH = 0.4 // grams of CO2 per Wh

export interface ImpactMetrics {
  energyWh: number
  co2Grams: number
}

/**
 * Calculate environmental impact from token usage
 */
export function calculateImpact(totalTokens: number): ImpactMetrics {
  const energyWh = (totalTokens / 1000) * WH_PER_THOUSAND_TOKENS
  const co2Grams = energyWh * CO2_PER_WH

  return {
    energyWh,
    co2Grams,
  }
}

/**
 * Format impact metrics for display
 */
export function formatImpact(metrics: ImpactMetrics): {
  energy: string
  co2: string
} {
  return {
    energy: metrics.energyWh.toFixed(2),
    co2: metrics.co2Grams.toFixed(2),
  }
}
