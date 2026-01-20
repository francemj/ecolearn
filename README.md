# EcoLearn Daily

A calm, AI-powered web application for exploring sustainability research through daily synthesized insights.

## Overview

EcoLearn Daily transforms how you engage with environmental research. Instead of reading individual papers, you receive AI-generated summaries that synthesize findings from multiple recent studies on a single sustainability topic. Each day, all users explore the same topic together, fostering a shared learning experience.

**Design Philosophy**: Built to learn, not to keep you hooked. No ads, gamification, notifications, or tracking.

## Features

- **Tone Switcher**: Choose between academic and casual writing styles for AI summaries and chat
- **AI-Powered Summaries**: Fetches 5-7 recent research papers and uses GPT-4 Turbo to create comprehensive, accessible summaries
- **Daily Topics**: Automatically selects from ~90 pointed sustainability subthemes using date-based hashing (many days before repetition)
- **References Section**: Every summary includes links to all source papers with author information
- **Interactive Chat**: Ask follow-up questions about the research using AI assistance (matches your tone preference)
- **Environmental Impact Tracking**: See the energy usage and CO₂ emissions of your conversations
- **Calm Design**: Natural green and teal color palette (#161d23, #0f444c, #114538, #5e8d83, #d2e1cc) with serif typography
- **Dark Mode**: Beautiful dark theme with smooth transitions
- **Shared 24-Hour Cache (Upstash Redis)**: Topic responses are cached in Redis so all visitors and instances benefit; only the first request per tone per day triggers OpenAlex + OpenAI. Optional—if Redis is not configured, the app runs without caching.
- **Responsive**: Works seamlessly on desktop and mobile

## Tone Options

### Academic Tone (Default)
The academic tone provides clear, factual summaries using accessible language suitable for non-experts. It maintains a professional yet engaging style.

### Casual Tone
The casual tone offers a warmer, conversational approach—like learning from a knowledgeable friend. It uses everyday language and relatable examples while still being accurate and respecting the science.

Switch between tones anytime using the toggle button in the top-right corner. Your preference is saved automatically.

## How It Works

### Daily Topic Selection

1. The app hashes today's date to consistently select one of ~90 pointed sustainability subthemes (see `app/api/topic/topics.ts`)
2. Topics are specific, research-dense subthemes (e.g. "Arctic permafrost thaw and methane feedbacks", "Battery recycling and the EV transition") that fit a short overview plus 5–7 papers—rather than broad themes like "climate change"
3. The list is interleaved by category so similar topics do not cluster on consecutive days
4. All users worldwide see the same topic each day

### AI Summary Generation

1. **Paper Retrieval**: Queries OpenAlex API for 5-7 highly-cited papers on the selected topic (published 2020+)
2. **Tone Selection**: User chooses between academic or casual tone
3. **AI Synthesis**: Sends paper abstracts to GPT-4 Turbo with tone-specific instructions to create an accessible, comprehensive summary
4. **Quality Focus**: Highlights key findings, consensus, disagreements, and knowledge gaps
5. **Caching**: Both tone versions are stored in Upstash Redis for 24 hours so all visitors and instances share the same cache; if Redis is not configured, the app skips caching and generates on each request

### Interactive Chat

1. Users can ask questions about the research topic
2. The AI assistant has full context of the summary and all source papers
3. Responses match your selected tone (academic or casual)
4. Responses are factual, grounded in the research, and avoid speculation
5. Token usage is tracked and converted to environmental metrics

### Environmental Impact

The impact counter estimates:
- **Energy**: 0.25 Wh per 1,000 tokens
- **CO₂**: 0.4 g per Wh

This transparency helps users understand the environmental cost of AI interactions.

## Project Structure

```
/app
  /api
    /topic/
      route.ts              - Fetches papers and generates AI summaries (tone-aware)
      topics.ts             - Pointed topic list (~90 items) for OpenAlex and display
    /chat/route.ts          - Handles interactive chat with streaming (tone-aware)
  /components
    TopicCard.tsx           - Displays AI summary with references
    Chat.tsx                - Chat interface with message streaming
    ImpactCounter.tsx       - Shows environmental cost
    DarkModeToggle.tsx      - Theme switcher
    ToneToggle.tsx          - Academic/casual tone switcher
  globals.css               - TailwindCSS styles with custom colors
  layout.tsx                - Root layout
  page.tsx                  - Main page component with tone state
```

## Technologies Used

- **Next.js 14** (App Router, Edge Runtime)
- **TypeScript**
- **TailwindCSS** with custom green/teal palette
- **React**
- **OpenAI API** (GPT-4 Turbo for summaries and chat)
- **OpenAlex API** (academic paper database)
- **Upstash Redis** (optional; shared cache for topic API when `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` are set)

## Color Palette

- **Dark Slate**: #161d23 - Primary dark accent
- **Dark Teal**: #0f444c - Deep teal tones
- **Dark Green**: #114538 - Forest green accents
- **Sage Green**: #5e8d83 - Medium natural green
- **Sage Light**: #d2e1cc - Soft natural background

## Available Scripts

- `npm run dev` - Start development server on port 5000
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## API Reference

### GET /api/topic

Fetches today's AI-generated research summary.

**Parameters:**
- `tone` (optional): `academic` (default) or `casual`

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
  },
  "tone": "academic"
}
```

**Response:** Server-sent events stream with GPT-4 Turbo responses

## Design Principles

- **AI-Powered Learning**: Leverage AI to make research more accessible
- **User Choice**: Let users choose their preferred communication style
- **Natural Aesthetics**: Calm green/teal palette inspired by nature
- **Transparency**: Show environmental costs of AI usage
- **Mindfulness**: Calm pace, no pressure to engage constantly
- **Accessibility**: Clear typography, high contrast, keyboard navigation
- **No Dark Patterns**: No notifications, streaks, or engagement tricks

## Future Enhancements

- Custom tone preferences (technical, ELI5, etc.)
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
