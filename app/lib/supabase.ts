import { createClient } from "@supabase/supabase-js"

const supabaseUrl = process.env.SUPABASE_URL
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY

export const supabase =
  supabaseUrl && supabaseAnonKey
    ? createClient(supabaseUrl, supabaseAnonKey)
    : null

export interface DailyArticle {
  id: string
  date: string
  topic: string
  summary_academic: string | null
  summary_casual: string | null
  source_papers: {
    title: string
    authors: string[]
    year: number
    url: string | null
  }[]
  created_at: string
}

export interface DailyStats {
  id: string
  date: string
  article_tokens: number
  chat_tokens: number
  created_at: string
}
