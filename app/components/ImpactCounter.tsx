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
    <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700 fade-in">
      <p className="text-xs text-gray-400 dark:text-gray-500 text-center">
        This conversation has used about {energyUsed.toFixed(2)} Wh (~{co2Emissions.toFixed(2)} g CO₂)
      </p>
    </div>
  );
}
