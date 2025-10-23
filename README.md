# EcoLearn Daily

A vibrant, AI-powered web application for exploring sustainability research through daily synthesized insights.

## Overview

EcoLearn Daily transforms how you engage with environmental research. Instead of reading individual papers, you receive AI-generated summaries that synthesize findings from multiple recent studies on a single sustainability topic. Each day, all users explore the same topic together, fostering a shared learning experience.

**Design Philosophy**: Built to learn, not to keep you hooked. No ads, gamification, notifications, or tracking.

## Features

- **AI-Powered Summaries**: Fetches 5-7 recent research papers and uses GPT-4 Turbo to create comprehensive, accessible summaries
- **Daily Topics**: Automatically selects from 10 sustainability themes using date-based hashing
- **References Section**: Every summary includes links to all source papers with author information
- **Interactive Chat**: Ask follow-up questions about the research using AI assistance
- **Environmental Impact Tracking**: See the energy usage and CO₂ emissions of your conversations
- **Vibrant Design**: Purple and pink gradients (#0d0b33, #4c2f6f, #52489f, #c266a7, #e7c8e7) with calm serif typography
- **Dark Mode**: Beautiful dark theme with smooth transitions
- **24-Hour Caching**: Ensures consistent daily content and respects API limits
- **Responsive**: Works seamlessly on desktop and mobile

## Setup Instructions

### 1. Add Your OpenAI API Key

The app requires an OpenAI API key for both summary generation and chat functionality.

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Get your OpenAI API key:
   - Visit https://platform.openai.com/api-keys
   - Create a new API key
   - Copy the key

3. Add your key to the `.env` file:
   ```
   OPENAI_API_KEY=your-actual-openai-key-here
   ```

**Important**: Without an API key, the app will show placeholder content. The AI summary generation and chat features require a valid key.

### 2. Run the Development Server

```bash
npm run dev
```

The app will be available at http://localhost:5000

### 3. Explore Today's Research

Visit the homepage to see:
- Today's sustainability topic
- An AI-generated summary of recent findings
- References to all source papers
- An interactive chat to explore the research

## How It Works

### Daily Topic Selection

1. The app hashes today's date to consistently select one of 10 sustainability topics
2. Topics include: climate change, renewable energy, sustainable agriculture, ocean conservation, biodiversity, circular economy, carbon sequestration, pollution, urban planning, and water conservation
3. All users worldwide see the same topic each day

### AI Summary Generation

1. **Paper Retrieval**: Queries OpenAlex API for 5-7 highly-cited papers on the selected topic (published 2020+)
2. **AI Synthesis**: Sends paper abstracts to GPT-4 Turbo with instructions to create an accessible, comprehensive summary
3. **Quality Focus**: Highlights key findings, consensus, disagreements, and knowledge gaps
4. **Caching**: Result is cached for 24 hours to ensure consistency and efficiency

### Interactive Chat

1. Users can ask questions about the research topic
2. The AI assistant has full context of the summary and all source papers
3. Responses are factual, grounded in the research, and avoid speculation
4. Token usage is tracked and converted to environmental metrics

### Environmental Impact

The impact counter estimates:
- **Energy**: 0.25 Wh per 1,000 tokens
- **CO₂**: 0.4 g per Wh

This transparency helps users understand the environmental cost of AI interactions.

## Project Structure

```
/app
  /api
    /topic/route.ts         - Fetches papers and generates AI summaries
    /chat/route.ts          - Handles interactive chat with streaming
  /components
    TopicCard.tsx           - Displays AI summary with references
    Chat.tsx                - Chat interface with message streaming
    ImpactCounter.tsx       - Shows environmental cost
    DarkModeToggle.tsx      - Theme switcher
  globals.css               - TailwindCSS styles with custom colors
  layout.tsx                - Root layout
  page.tsx                  - Main page component
```

## Technologies Used

- **Next.js 14** (App Router, Edge Runtime)
- **TypeScript**
- **TailwindCSS** with custom purple/pink palette
- **React**
- **OpenAI API** (GPT-4 Turbo for summaries and chat)
- **OpenAlex API** (academic paper database)

## Color Palette

- **Deep Purple**: #0d0b33 - Primary dark accent
- **Dark Purple**: #4c2f6f - Secondary dark tone
- **Medium Purple**: #52489f - Interactive elements
- **Pink Accent**: #c266a7 - Highlights and gradients
- **Lavender Light**: #e7c8e7 - Soft backgrounds

## Available Scripts

- `npm run dev` - Start development server on port 5000
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## API Reference

### GET /api/topic

Fetches today's AI-generated research summary.

**Response:**
```json
{
  "topic": "sustainable agriculture",
  "summary": "AI-generated synthesis of findings...",
  "references": [
    {
      "title": "Paper title",
      "authors": ["Author 1", "Author 2"],
      "year": 2024,
      "url": "https://doi.org/..."
    }
  ]
}
```

### POST /api/chat

Interactive chat about the research topic.

**Request:**
```json
{
  "messages": [
    { "role": "user", "content": "What are the key findings?" }
  ],
  "topicContext": {
    "topic": "...",
    "summary": "...",
    "references": [...]
  }
}
```

**Response:** Server-sent events stream with GPT-4 Turbo responses

## Design Principles

- **AI-Powered Learning**: Leverage AI to make research more accessible
- **Visual Appeal**: Vibrant colors that inspire engagement without distraction
- **Transparency**: Show environmental costs of AI usage
- **Mindfulness**: Calm pace, no pressure to engage constantly
- **Accessibility**: Clear typography, high contrast, keyboard navigation
- **No Dark Patterns**: No notifications, streaks, or engagement tricks

## Future Enhancements

- Topic categories with user preferences
- Archive view for browsing previous summaries
- Bookmark and save favorite summaries
- Enhanced citations with specific paper sections
- Multi-language support
- Export summaries as PDF

## License

ISC

## Acknowledgments

- Research papers provided by [OpenAlex](https://openalex.org/)
- AI summaries and chat powered by [OpenAI](https://openai.com/) GPT-4 Turbo
- Fonts: Merriweather by Sorkin Type
