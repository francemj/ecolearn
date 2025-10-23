# EcoLearn Daily

A vibrant, AI-powered Next.js 14 web application that synthesizes sustainability research from multiple papers into accessible daily summaries.

## Overview

EcoLearn Daily transforms environmental research consumption by using AI to create comprehensive summaries from multiple academic papers. Instead of reading individual papers, users receive GPT-4 Turbo-generated insights that synthesize findings from 5-7 recent studies on a single sustainability topic each day.

## Recent Changes

- **2025-10-23**: Major update to AI-powered multi-paper summaries
  - Modified topic API to fetch 5-7 papers instead of 1
  - Added GPT-4 Turbo integration to generate comprehensive summaries
  - Redesigned TopicCard to show AI summary with references section
  - Updated color scheme to vibrant purple/pink palette (#0d0b33, #4c2f6f, #52489f, #c266a7, #e7c8e7)
  - Updated chat system to work with topic context and multiple papers
  - Enhanced error handling with graceful fallbacks throughout
  
- **2025-10-22**: Initial project setup
  - Next.js 14 with App Router and TypeScript
  - TailwindCSS for styling with Merriweather serif font
  - Daily topic fetcher using OpenAlex API with date-based hashing
  - AI chat interface with OpenAI streaming responses
  - Environmental impact counter (energy usage and CO₂ emissions)
  - Dark mode toggle

## Project Architecture

### Directory Structure

```
/app
  /api
    /topic/route.ts      - Fetches 5-7 papers and generates AI summaries
    /chat/route.ts       - Handles AI chat with streaming responses
  /components
    TopicCard.tsx        - Displays AI summary with references section
    Chat.tsx             - Chat interface with message streaming
    ImpactCounter.tsx    - Shows environmental cost of conversations
    DarkModeToggle.tsx   - Theme switcher with purple gradient
  globals.css            - TailwindCSS styles with custom purple/pink palette
  layout.tsx             - Root layout with metadata
  page.tsx               - Main page component
```

### Key Features

1. **AI-Powered Summaries**: Uses GPT-4 Turbo to synthesize findings from multiple papers into accessible summaries
2. **Multi-Paper Fetching**: Retrieves 5-7 highly-cited papers on the same topic from OpenAlex
3. **References Section**: Displays all source papers with authors, year, and links
4. **Daily Topic Selection**: Uses date-based hashing to ensure all users see the same topic
5. **24-Hour Caching**: Prevents API rate limits and ensures consistent daily content
6. **Interactive Chat**: Ask questions about the synthesized research with full context
7. **Impact Counter**: Estimates energy (Wh) and CO₂ emissions (0.25 Wh per 1000 tokens, 0.4g CO₂ per Wh)
8. **Vibrant Design**: Purple and pink color palette with gradients and modern aesthetics
9. **Dark Mode**: Beautiful dark theme with seamless transitions

### Environment Variables

- `OPENAI_API_KEY`: Required for AI summary generation and chat functionality (user must provide their own key)

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

- **AI-Enhanced Learning**: Use AI to make research more accessible and digestible
- **Visual Appeal**: Vibrant purple/pink palette that's engaging without being distracting
- **No ads, gamification, or notifications**
- **Calm, factual, mindful experience**
- **Focused on learning, not engagement metrics**
- **Transparent about environmental impact**

## Color Palette

- **Deep Purple** (#0d0b33): Primary dark accent
- **Dark Purple** (#4c2f6f): Secondary dark tone
- **Medium Purple** (#52489f): Interactive elements
- **Pink Accent** (#c266a7): Highlights and gradients
- **Lavender Light** (#e7c8e7): Soft backgrounds

## API Usage

- **OpenAlex API**: Primary data source for research papers (no API key required)
- **OpenAI API**: Powers AI summary generation and chat interface (requires user's own API key)

## Future Enhancements

- Monitoring/alerts for OpenAI response reliability
- Analytics on fallback frequency for API reliability tuning
- Integration tests for API fallback scenarios
- Topic categories with user preferences
- Archive view for browsing previous daily summaries
- Paper bookmarking and reading lists
- Enhanced chat with specific paper citations
- Multi-language support
- Export summaries as PDF
