-- Daily articles table: stores each day's topic and summaries
CREATE TABLE IF NOT EXISTS daily_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE UNIQUE NOT NULL,
  topic TEXT NOT NULL,
  summary_academic TEXT,
  summary_casual TEXT,
  source_papers JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Daily stats table: stores daily token usage
CREATE TABLE IF NOT EXISTS daily_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE UNIQUE NOT NULL,
  article_tokens INTEGER DEFAULT 0,
  chat_tokens INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for efficient date lookups
CREATE INDEX IF NOT EXISTS idx_daily_articles_date ON daily_articles(date DESC);
CREATE INDEX IF NOT EXISTS idx_daily_stats_date ON daily_stats(date DESC);

-- Enable Row Level Security (optional, can be configured in Supabase dashboard)
ALTER TABLE daily_articles ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_stats ENABLE ROW LEVEL SECURITY;

-- Allow public read access (adjust based on your security needs)
CREATE POLICY "Allow public read access to daily_articles"
  ON daily_articles FOR SELECT
  USING (true);

CREATE POLICY "Allow public read access to daily_stats"
  ON daily_stats FOR SELECT
  USING (true);

-- Allow insert/update from authenticated service role
CREATE POLICY "Allow service role to insert daily_articles"
  ON daily_articles FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow service role to update daily_articles"
  ON daily_articles FOR UPDATE
  USING (true);

CREATE POLICY "Allow service role to insert daily_stats"
  ON daily_stats FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow service role to update daily_stats"
  ON daily_stats FOR UPDATE
  USING (true);
