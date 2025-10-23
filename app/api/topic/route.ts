import { NextResponse } from 'next/server';

export const runtime = 'edge';

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

interface Reference {
  title: string;
  authors: string[];
  year: number;
  url: string | null;
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

async function generateAISummary(topic: string, papers: Reference[], abstracts: string[]): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    return `Today's topic is ${topic}. Multiple research papers on this topic have been gathered, but AI summary generation is unavailable. Add your OpenAI key to enable AI-powered summaries.`;
  }

  const papersContext = papers.map((paper, idx) => 
    `Paper ${idx + 1}: "${paper.title}" (${paper.year})
Authors: ${paper.authors.join(', ')}
Abstract: ${abstracts[idx]}`
  ).join('\n\n');

  const systemPrompt = `You are a research synthesizer that creates clear, accessible summaries of multiple academic papers on environmental topics. Your summaries should:
- Be calm, factual, and engaging
- Highlight key findings and consensus across papers
- Note any important disagreements or gaps
- Use accessible language for non-experts
- Be 3-4 paragraphs long
- Focus on what we know and what matters`;

  const userPrompt = `Create a comprehensive summary of findings from these ${papers.length} research papers on "${topic}". Focus on synthesizing the key insights, patterns, and important discoveries across all papers.

${papersContext}

Create an engaging summary that helps readers understand the current state of research on ${topic}.`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 800,
      }),
    });

    if (!response.ok) {
      throw new Error('OpenAI API request failed');
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error generating AI summary:', error);
    return `Research on ${topic} is actively being studied across multiple dimensions. While we've gathered ${papers.length} significant papers on this topic, the AI summary is temporarily unavailable. Please check the references below to explore the research directly.`;
  }
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
    
    const searchUrl = `https://api.openalex.org/works?filter=title_and_abstract.search:${encodeURIComponent(selectedTopic)},type:article,from_publication_date:2020-01-01&sort=cited_by_count:desc&per_page=7`;
    
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
        topic: selectedTopic,
        summary: "Today's research is still being fetched. Check back soon for an AI-generated summary of recent sustainability research.",
        references: [],
      };
      
      cachedTopic = { data: fallbackData, date: today };
      return NextResponse.json(fallbackData);
    }

    const papers: Reference[] = [];
    const abstracts: string[] = [];

    for (const work of data.results.slice(0, 7)) {
      const abstract = reconstructAbstract(work.abstract_inverted_index);
      if (abstract) {
        const authors = work.authorships?.slice(0, 3).map((a: any) => a.author.display_name) || [];
        const url = work.primary_location?.landing_page_url || 
                   (work.doi ? `https://doi.org/${work.doi.replace('https://doi.org/', '')}` : null);
        
        papers.push({
          title: work.title || 'Untitled Research Paper',
          authors,
          year: work.publication_year || new Date().getFullYear(),
          url,
        });
        abstracts.push(abstract);
      }

      if (papers.length >= 5) break;
    }

    if (papers.length === 0) {
      const fallbackData = {
        topic: selectedTopic,
        summary: "Research papers on this topic are being processed. Check back soon for insights.",
        references: [],
      };
      
      cachedTopic = { data: fallbackData, date: today };
      return NextResponse.json(fallbackData);
    }

    const summary = await generateAISummary(selectedTopic, papers, abstracts);

    const topicData = {
      topic: selectedTopic,
      summary,
      references: papers,
    };

    cachedTopic = { data: topicData, date: today };
    
    return NextResponse.json(topicData);
  } catch (error) {
    console.error('Error fetching topic:', error);
    
    const fallbackData = {
      topic: 'sustainability research',
      summary: "Today's research summary is being prepared. Check back soon to explore the latest findings.",
      references: [],
    };
    
    return NextResponse.json(fallbackData);
  }
}
