import { NextRequest } from 'next/server';

export const runtime = 'edge';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

export async function POST(req: NextRequest) {
  try {
    const { messages, paperContext } = await req.json();

    const apiKey = process.env.OPENAI_API_KEY;
    
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'Chat unavailable — add your OpenAI key in .env to enable responses.' }),
        { status: 503, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const systemPrompt = `You are an assistant that explains environmental research in calm, factual, and accessible language. Use only the facts from the provided study text. Avoid speculation, politics, or moralizing.

Research Paper Context:
Title: ${paperContext?.title || 'N/A'}
Abstract: ${paperContext?.abstract || 'N/A'}
Authors: ${paperContext?.authors?.join(', ') || 'N/A'}
Year: ${paperContext?.year || 'N/A'}

Answer questions based on this research paper. Keep responses clear, factual, and grounded in the paper's content.`;

    const chatMessages: Message[] = [
      { role: 'system', content: systemPrompt },
      ...messages,
    ];

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: 'gpt-4-turbo',
        messages: chatMessages,
        stream: true,
        temperature: 0.7,
        max_tokens: 800,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || 'OpenAI API request failed');
    }

    return new Response(response.body, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'An error occurred while processing your request.' 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
