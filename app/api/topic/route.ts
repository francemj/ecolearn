import { NextResponse } from 'next/server';

interface OpenAlexWork {
  id: string;
  title: string;
  abstract_inverted_index?: Record<string, number[]>;
  authorships?: Array<{
    author: {
      display_name: string;
    };
  }>;
  publication_year?: number;
  primary_location?: {
    landing_page_url?: string;
  };
  doi?: string;
}

let cachedTopic: {
  data: any;
  date: string;
} | null = null;

function getTodayDateString(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

function hashDateToTopicIndex(dateString: string): number {
  let hash = 0;
  for (let i = 0; i < dateString.length; i++) {
    hash = ((hash << 5) - hash) + dateString.charCodeAt(i);
    hash = hash & hash;
  }
  return Math.abs(hash);
}

function reconstructAbstract(invertedIndex?: Record<string, number[]>): string {
  if (!invertedIndex) return '';
  
  const words: [string, number][] = [];
  for (const [word, positions] of Object.entries(invertedIndex)) {
    for (const pos of positions) {
      words.push([word, pos]);
    }
  }
  
  words.sort((a, b) => a[1] - b[1]);
  return words.map(w => w[0]).join(' ');
}

export async function GET() {
  try {
    const today = getTodayDateString();
    
    if (cachedTopic && cachedTopic.date === today) {
      return NextResponse.json(cachedTopic.data);
    }

    const topics = [
      'climate change',
      'renewable energy',
      'sustainable agriculture',
      'ocean conservation',
      'biodiversity loss',
      'circular economy',
      'carbon sequestration',
      'environmental pollution',
      'sustainable urban planning',
      'water conservation'
    ];
    
    const topicIndex = hashDateToTopicIndex(today) % topics.length;
    const selectedTopic = topics[topicIndex];
    
    const searchUrl = `https://api.openalex.org/works?filter=title_and_abstract.search:${encodeURIComponent(selectedTopic)},type:article,from_publication_date:2020-01-01&sort=cited_by_count:desc&per_page=10`;
    
    const response = await fetch(searchUrl, {
      headers: {
        'User-Agent': 'EcoLearn-Daily (mailto:research@example.com)',
      },
    });

    if (!response.ok) {
      throw new Error('OpenAlex API request failed');
    }

    const data = await response.json();
    
    if (!data.results || data.results.length === 0) {
      const fallbackData = {
        title: "Today's research is still being fetched",
        abstract: "Check back soon for today's sustainability research paper.",
        authors: [],
        year: new Date().getFullYear(),
        url: null,
      };
      
      cachedTopic = { data: fallbackData, date: today };
      return NextResponse.json(fallbackData);
    }

    const dayOfYear = Math.floor((new Date().getTime() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    const paperIndex = dayOfYear % Math.min(data.results.length, 10);
    const work: OpenAlexWork = data.results[paperIndex];

    const abstract = reconstructAbstract(work.abstract_inverted_index);
    const authors = work.authorships?.slice(0, 5).map(a => a.author.display_name) || [];
    const url = work.primary_location?.landing_page_url || (work.doi ? `https://doi.org/${work.doi.replace('https://doi.org/', '')}` : null);

    const topicData = {
      title: work.title || 'Untitled Research Paper',
      abstract: abstract || 'Abstract not available.',
      authors,
      year: work.publication_year || new Date().getFullYear(),
      url,
    };

    cachedTopic = { data: topicData, date: today };
    
    return NextResponse.json(topicData);
  } catch (error) {
    console.error('Error fetching topic:', error);
    
    const fallbackData = {
      title: "Today's research is still being fetched",
      abstract: "Check back soon for today's sustainability research paper.",
      authors: [],
      year: new Date().getFullYear(),
      url: null,
    };
    
    return NextResponse.json(fallbackData);
  }
}
