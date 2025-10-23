'use client';

interface ImpactCounterProps {
  totalTokens: number;
}

export default function ImpactCounter({ totalTokens }: ImpactCounterProps) {
  const whPerThousandTokens = 0.25;
  const co2PerWh = 0.4;
  
  const energyUsed = (totalTokens / 1000) * whPerThousandTokens;
  const co2Emissions = energyUsed * co2PerWh;

  if (totalTokens === 0) {
    return null;
  }

  return (
    <div className="mt-6 pt-4 border-t border-sage-green/30 dark:border-sage-green/50 fade-in">
      <p className="text-xs text-sage-green dark:text-sage-light text-center">
        This conversation has used about {energyUsed.toFixed(2)} Wh (~{co2Emissions.toFixed(2)} g CO₂)
      </p>
    </div>
  );
}
