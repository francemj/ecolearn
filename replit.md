# EcoLearn Daily

A vibrant, AI-powered Next.js 14 web application that synthesizes sustainability research from multiple papers into accessible daily summaries.

## Overview

EcoLearn Daily transforms environmental research consumption by using AI to create comprehensive summaries from multiple academic papers. Instead of reading individual papers, users receive GPT-4 Turbo-generated insights that synthesize findings from 5-7 recent studies on a single sustainability topic each day.

## Recent Changes

- **2025-10-23**: Added tone switcher for AI summaries
  - Created ToneToggle component allowing users to switch between academic and casual tones
  - Updated topic API to support tone parameter (academic/casual)
  - Modified GPT-4 prompts to generate different writing styles based on tone
  - Updated chat API to match the selected tone
  - Casual tone uses warmer, conversational language while maintaining scientific accuracy
  - Tone preference persists in localStorage
  - Both tones cached separately for 24 hours

- **2025-10-23**: Major update to AI-powered multi-paper summaries
  - Modified topic API to fetch 5-7 papers instead of 1
  - Added GPT-4 Turbo integration to generate comprehensive summaries
  - Redesigned TopicCard to show AI summary with references section
  - Updated color scheme to calm green/teal palette (#161d23, #0f444c, #114538, #5e8d83, #d2e1cc)
  - Updated chat system to work with topic context and multiple papers
  - Enhanced error handling with graceful fallbacks throughout
  - Configured to use OpenAI API key from Replit Secrets
  
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
    /topic/route.ts      - Fetches 5-7 papers and generates AI summaries (supports tone parameter)
    /chat/route.ts       - Handles AI chat with streaming responses (tone-aware)
  /components
    TopicCard.tsx        - Displays AI summary with references section
    Chat.tsx             - Chat interface with message streaming
    ImpactCounter.tsx    - Shows environmental cost of conversations
    DarkModeToggle.tsx   - Theme switcher with green gradient
    ToneToggle.tsx       - Academic/casual tone switcher
  globals.css            - TailwindCSS styles with custom green/teal palette
  layout.tsx             - Root layout with metadata
  page.tsx               - Main page component with tone state management
```

### Key Features

1. **Tone Switcher**: Toggle between academic and casual writing styles for AI summaries
2. **AI-Powered Summaries**: Uses GPT-4 Turbo to synthesize findings from multiple papers into accessible summaries
3. **Multi-Paper Fetching**: Retrieves 5-7 highly-cited papers on the same topic from OpenAlex
4. **References Section**: Displays all source papers with authors, year, and links
5. **Daily Topic Selection**: Uses date-based hashing to ensure all users see the same topic
6. **24-Hour Caching**: Prevents API rate limits and ensures consistent daily content (caches both tones separately)
7. **Interactive Chat**: Ask questions about the synthesized research with full context (tone-aware)
8. **Impact Counter**: Estimates energy (Wh) and CO₂ emissions (0.25 Wh per 1000 tokens, 0.4g CO₂ per Wh)
9. **Calm Design**: Green and teal color palette with natural, soothing aesthetics
10. **Dark Mode**: Beautiful dark theme with seamless transitions

### Tone Options

**Academic Tone** (default):
- Clear, factual, and engaging
- Accessible language for non-experts
- Professional but approachable
- Temperature: 0.7

**Casual Tone**:
- Warm, conversational, down-to-earth
- Like chatting with a knowledgeable friend
- Uses everyday language and relatable examples
- Still accurate and respects the science
- Temperature: 0.8

### Environment Variables

- `OPENAI_API_KEY`: Required for AI summary generation and chat functionality (configured via Replit Secrets)

## Setup Instructions

1. Add your OpenAI API key to Replit Secrets:
   - Open the "Secrets" tab in Replit
   - Add a new secret with key `OPENAI_API_KEY`
   - Paste your OpenAI API key as the value

2. Run the development server:
   ```bash
   npm run dev
   ```

3. Open the app at the displayed URL

## Design Philosophy

- **AI-Enhanced Learning**: Use AI to make research more accessible and digestible
- **Natural Aesthetics**: Calm green/teal palette inspired by nature
- **User Choice**: Let users choose their preferred communication style
- **No ads, gamification, or notifications**
- **Calm, factual, mindful experience**
- **Focused on learning, not engagement metrics**
- **Transparent about environmental impact**

## Color Palette

- **Dark Slate** (#161d23): Primary dark accent
- **Dark Teal** (#0f444c): Deep teal tones
- **Dark Green** (#114538): Forest green accents
- **Sage Green** (#5e8d83): Medium natural green
- **Sage Light** (#d2e1cc): Soft natural background

## API Usage

- **OpenAlex API**: Primary data source for research papers (no API key required)
- **OpenAI API**: Powers AI summary generation and chat interface (requires API key via Replit Secrets)

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
- Custom tone preferences (technical, ELI5, etc.)
