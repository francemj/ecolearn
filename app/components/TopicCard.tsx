'use client';

interface TopicCardProps {
  topic: {
    title: string;
    abstract: string;
    authors: string[];
    year: number;
    url: string | null;
  } | null;
  loading: boolean;
}

export default function TopicCard({ topic, loading }: TopicCardProps) {
  if (loading) {
    return (
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-8 mb-8 fade-in">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-full mb-2"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-8 mb-8 fade-in">
        <p className="text-gray-500 dark:text-gray-400">
          Unable to load today&apos;s research. Please try again later.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-8 mb-8 fade-in">
      <h2 className="text-2xl md:text-3xl font-light mb-4 leading-relaxed text-gray-900 dark:text-gray-100">
        {topic.title}
      </h2>
      
      <div className="text-sm text-gray-500 dark:text-gray-400 mb-4 space-y-1">
        {topic.authors.length > 0 && (
          <p>
            <span className="font-light">Authors:</span> {topic.authors.join(', ')}
          </p>
        )}
        <p>
          <span className="font-light">Year:</span> {topic.year}
        </p>
      </div>

      <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-6 text-base">
        {topic.abstract}
      </p>

      {topic.url && (
        <a
          href={topic.url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 underline underline-offset-4 transition-colors"
        >
          Read the full paper →
        </a>
      )}
    </div>
  );
}
