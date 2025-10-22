# EcoLearn Daily

A calm, minimalist web application for exploring sustainability research, one paper at a time.

## Overview

EcoLearn Daily is designed to provide a quiet, mindful learning experience focused on environmental research. Each day, all users see the same sustainability-focused research paper fetched from the OpenAlex API. The app includes an AI-powered chat interface to ask questions about the daily research and displays environmental impact metrics for each conversation.

**Design Philosophy**: Built to learn, not to keep you hooked. No ads, gamification, notifications, or tracking.

## Features

- **Daily Research Paper**: Automatically fetches one sustainability paper per day using date-based hashing, ensuring all users see the same content
- **24-Hour Caching**: Prevents API rate limits while keeping content fresh daily
- **AI Chat Interface**: Ask questions about the research using OpenAI's GPT-4 Turbo with streaming responses
- **Environmental Impact Counter**: Tracks and displays the estimated energy usage (Wh) and CO₂ emissions of your conversations
- **Calm Design**: Serif typography (Merriweather), soft color palette, generous spacing, and gentle fade-in animations
- **Dark Mode**: Optional dark theme with seamless transitions
- **Responsive**: Works beautifully on desktop and mobile devices

## Setup Instructions

### 1. Add Your OpenAI API Key

The chat functionality requires an OpenAI API key. To set it up:

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

**Note**: Without an API key, the app will still display daily research papers, but the chat feature will show: "Chat unavailable — add your OpenAI key in .env to enable responses."

### 2. Run the Development Server

```bash
npm run dev
```

The app will be available at http://localhost:5000

### 3. Test the API (Optional)

You can test the topic API directly in the browser console:

```javascript
fetch('/api/topic')
  .then(res => res.json())
  .then(data => console.log(data));
```

This should return today's research paper with title, abstract, authors, year, and URL.

## Project Structure

```
/app
  /api
    /topic/route.ts         - Fetches daily sustainability papers from OpenAlex
    /chat/route.ts          - Handles AI chat with streaming responses
  /components
    TopicCard.tsx           - Displays research paper details
    Chat.tsx                - Chat interface with message streaming
    ImpactCounter.tsx       - Shows environmental cost of conversations
    DarkModeToggle.tsx      - Theme switcher
  globals.css               - TailwindCSS styles and animations
  layout.tsx                - Root layout with metadata
  page.tsx                  - Main page component
```

## How It Works

### Daily Topic Selection

1. The app hashes today's date to generate a consistent number
2. This number selects one of 10 sustainability topics (climate change, renewable energy, etc.)
3. The OpenAlex API is queried for highly-cited research papers on that topic
4. A specific paper is selected based on the day of the year
5. The result is cached for 24 hours to avoid excessive API calls

### AI Chat

1. Users can ask questions about the daily research paper
2. Messages are sent to the OpenAI API with a system prompt that ensures calm, factual responses
3. The paper's context (title, abstract, authors) is included in every request
4. Responses stream back in real-time for a smooth experience
5. Token usage is estimated and converted to environmental metrics

### Environmental Impact

The impact counter estimates:
- **Energy**: 0.25 Wh per 1,000 tokens
- **CO₂**: 0.4 g per Wh

This helps users understand the environmental cost of AI interactions in a subtle, non-judgmental way.

## Technologies Used

- **Next.js 14** (App Router)
- **TypeScript**
- **TailwindCSS**
- **React**
- **OpenAI API** (GPT-4 Turbo)
- **OpenAlex API** (research papers)

## Available Scripts

- `npm run dev` - Start development server on port 5000
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## API Reference

### GET /api/topic

Fetches today's sustainability research paper.

**Response:**
```json
{
  "title": "Paper title",
  "abstract": "Full abstract text",
  "authors": ["Author 1", "Author 2"],
  "year": 2024,
  "url": "https://doi.org/..."
}
```

### POST /api/chat

Sends a chat message and receives a streaming response.

**Request:**
```json
{
  "messages": [
    { "role": "user", "content": "How serious is this issue?" }
  ],
  "paperContext": {
    "title": "...",
    "abstract": "...",
    "authors": [...],
    "year": 2024
  }
}
```

**Response:** Server-sent events stream with OpenAI chat completion chunks

## Design Principles

- **Minimalism**: Clean, uncluttered interface with focus on content
- **Calmness**: Soft colors, generous spacing, gentle animations
- **Mindfulness**: Environmental impact displayed transparently
- **Accessibility**: High contrast, readable fonts, keyboard navigation
- **No Dark Patterns**: No notifications, streaks, or engagement tricks

## Future Enhancements

- CrossRef API as fallback when OpenAlex returns no results
- Archive view to browse previous daily papers
- Paper bookmarking and personal reading lists
- Enhanced chat with citation references to specific sections
- Topic filtering by sustainability domain

## License

ISC

## Acknowledgments

- Research papers provided by [OpenAlex](https://openalex.org/)
- AI responses powered by [OpenAI](https://openai.com/)
- Fonts: Merriweather by Sorkin Type
