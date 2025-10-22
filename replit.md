# EcoLearn Daily

A calm, minimalist Next.js 14 web application for exploring sustainability research papers, one day at a time.

## Overview

EcoLearn Daily is designed to provide a quiet, mindful learning experience. Each day, all users see the same sustainability research paper fetched from the OpenAlex API. The app includes an AI chat interface to ask questions about the research and displays environmental impact metrics for each conversation.

## Recent Changes

- **2025-10-22**: Initial project setup
  - Next.js 14 with App Router and TypeScript
  - TailwindCSS for styling with Merriweather serif font
  - Daily topic fetcher using OpenAlex API with date-based hashing
  - AI chat interface with OpenAI streaming responses
  - Environmental impact counter (energy usage and CO₂ emissions)
  - Dark mode toggle
  - Calm, minimalist design with no tracking or gamification

## Project Architecture

### Directory Structure

```
/app
  /api
    /topic/route.ts      - Fetches daily sustainability paper from OpenAlex
    /chat/route.ts       - Handles AI chat with streaming responses
  /components
    TopicCard.tsx        - Displays research paper details
    Chat.tsx             - Chat interface with message streaming
    ImpactCounter.tsx    - Shows environmental cost of conversations
    DarkModeToggle.tsx   - Theme switcher
  globals.css            - TailwindCSS styles and custom animations
  layout.tsx             - Root layout with metadata
  page.tsx               - Main page component
```

### Key Features

1. **Daily Topic Fetcher**: Uses date-based hashing to select one sustainability topic per day, ensuring all users see the same paper
2. **24-Hour Caching**: Prevents API rate limits by caching the daily paper
3. **AI Chat Interface**: Powered by OpenAI with streaming responses
4. **Impact Counter**: Estimates energy (Wh) and CO₂ emissions (0.25 Wh per 1000 tokens, 0.4g CO₂ per Wh)
5. **Calm Design**: Serif typography, soft grays, generous spacing, fade-in transitions

### Environment Variables

- `OPENAI_API_KEY`: Required for chat functionality (user must provide their own key)

## Setup Instructions

1. Add your OpenAI API key:
   - Copy `.env.example` to `.env`
   - Add your OpenAI API key to the `OPENAI_API_KEY` variable

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Open the app at the displayed URL

## Design Philosophy

- **No ads, gamification, or notifications**
- **Calm, factual, mindful experience**
- **Focused on learning, not engagement metrics**
- **Transparent about environmental impact**

## API Usage

- **OpenAlex API**: Primary data source for research papers (no API key required)
- **OpenAI API**: Powers the chat interface (requires user's own API key)

## Future Enhancements

- CrossRef API as fallback when OpenAlex returns no results
- Archive view for browsing previous daily papers
- Paper bookmarking and reading lists
- Enhanced chat with citation references
