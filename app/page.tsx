'use client';

import { useEffect, useState } from 'react';
import TopicCard from './components/TopicCard';
import Chat from './components/Chat';
import DarkModeToggle from './components/DarkModeToggle';

interface Reference {
  title: string;
  authors: string[];
  year: number;
  url: string | null;
}

interface Topic {
  topic: string;
  summary: string;
  references: Reference[];
}

export default function Home() {
  const [topic, setTopic] = useState<Topic | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopic = async () => {
      try {
        const response = await fetch('/api/topic');
        const data = await response.json();
        setTopic(data);
      } catch (error) {
        console.error('Error fetching topic:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTopic();
  }, []);

  return (
    <main className="min-h-screen py-12 px-4 transition-colors duration-300 bg-gradient-to-b from-white to-purple-50 dark:from-gray-900 dark:to-gray-800">
      <DarkModeToggle />
      
      <div className="max-w-4xl mx-auto">
        <header className="mb-12 text-center fade-in">
          <h1 className="text-5xl md:text-6xl font-light mb-4 bg-gradient-to-r from-purple-900 via-purple-700 to-pink-600 dark:from-purple-300 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
            EcoLearn Daily
          </h1>
          <p className="text-gray-700 dark:text-gray-300 text-base md:text-lg">
            AI-powered insights from multiple sustainability research papers, daily.
          </p>
        </header>

        <TopicCard topic={topic} loading={loading} />

        {topic && !loading && (
          <Chat topicContext={topic} />
        )}

        <footer className="mt-16 pt-8 border-t border-purple-200 dark:border-purple-800 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Built to learn, not to keep you hooked.
          </p>
        </footer>
      </div>
    </main>
  );
}
