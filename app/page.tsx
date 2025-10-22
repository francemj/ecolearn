'use client';

import { useEffect, useState } from 'react';
import TopicCard from './components/TopicCard';
import Chat from './components/Chat';
import DarkModeToggle from './components/DarkModeToggle';

interface Topic {
  title: string;
  abstract: string;
  authors: string[];
  year: number;
  url: string | null;
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
    <main className="min-h-screen py-12 px-4 transition-colors duration-300">
      <DarkModeToggle />
      
      <div className="max-w-3xl mx-auto">
        <header className="mb-12 text-center fade-in">
          <h1 className="text-4xl md:text-5xl font-light mb-3 text-gray-900 dark:text-gray-100">
            EcoLearn Daily
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm md:text-base">
            A calm space to explore sustainability research, one paper at a time.
          </p>
        </header>

        <TopicCard topic={topic} loading={loading} />

        {topic && !loading && (
          <Chat paperContext={topic} />
        )}

        <footer className="mt-16 pt-8 border-t border-gray-200 dark:border-gray-700 text-center">
          <p className="text-xs text-gray-400 dark:text-gray-500">
            Built to learn, not to keep you hooked.
          </p>
        </footer>
      </div>
    </main>
  );
}
