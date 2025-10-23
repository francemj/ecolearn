'use client';

interface Reference {
  title: string;
  authors: string[];
  year: number;
  url: string | null;
}

interface TopicCardProps {
  topic: {
    topic: string;
    summary: string;
    references: Reference[];
  } | null;
  loading: boolean;
}

export default function TopicCard({ topic, loading }: TopicCardProps) {
  if (loading) {
    return (
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-900 rounded-lg p-8 mb-8 fade-in border border-purple-100 dark:border-purple-900">
        <div className="animate-pulse">
          <div className="h-6 bg-purple-200 dark:bg-gray-700 rounded w-48 mb-6"></div>
          <div className="h-4 bg-purple-100 dark:bg-gray-700 rounded w-full mb-3"></div>
          <div className="h-4 bg-purple-100 dark:bg-gray-700 rounded w-full mb-3"></div>
          <div className="h-4 bg-purple-100 dark:bg-gray-700 rounded w-3/4 mb-6"></div>
          <div className="h-4 bg-purple-100 dark:bg-gray-700 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (!topic) {
    return (
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-900 rounded-lg p-8 mb-8 fade-in border border-purple-100 dark:border-purple-900">
        <p className="text-gray-600 dark:text-gray-400">
          Unable to load today&apos;s research summary. Please try again later.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-gray-800 dark:to-gray-900 rounded-lg p-8 mb-8 fade-in border border-purple-100 dark:border-purple-900">
      <div className="mb-6">
        <div className="inline-block px-4 py-1 bg-purple-600 text-white text-sm rounded-full mb-4">
          Today&apos;s Topic
        </div>
        <h2 className="text-3xl md:text-4xl font-light capitalize leading-relaxed text-purple-900 dark:text-purple-100 mb-6">
          {topic.topic}
        </h2>
      </div>

      <div className="prose prose-lg max-w-none mb-8">
        <div className="text-gray-800 dark:text-gray-200 leading-relaxed text-base whitespace-pre-wrap">
          {topic.summary}
        </div>
      </div>

      {topic.references && topic.references.length > 0 && (
        <div className="border-t border-purple-200 dark:border-purple-800 pt-6">
          <h3 className="text-xl font-light text-purple-900 dark:text-purple-100 mb-4">
            References ({topic.references.length} papers)
          </h3>
          <div className="space-y-4">
            {topic.references.map((ref, idx) => (
              <div
                key={idx}
                className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-purple-100 dark:border-purple-900 hover:border-purple-300 dark:hover:border-purple-700 transition-colors"
              >
                <h4 className="font-normal text-gray-900 dark:text-gray-100 mb-2">
                  {idx + 1}. {ref.title}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  {ref.authors.length > 0 ? (
                    <>
                      <span className="font-light">Authors:</span> {ref.authors.join(', ')}
                      {ref.authors.length === 3 && ' et al.'}
                    </>
                  ) : (
                    <span className="font-light">Authors not available</span>
                  )}
                  {' • '}
                  <span className="font-light">{ref.year}</span>
                </p>
                {ref.url && (
                  <a
                    href={ref.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-block text-sm text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 underline underline-offset-4 transition-colors"
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
  );
}
