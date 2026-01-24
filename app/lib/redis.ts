import { Redis } from "@upstash/redis"

// Shared Redis client
export const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? new Redis({
        url: process.env.UPSTASH_REDIS_REST_URL,
        token: process.env.UPSTASH_REDIS_REST_TOKEN,
      })
    : null

// Cache TTLs
export const CACHE_TTL_24H = 86400 // 24 hours in seconds
export const CACHE_TTL_48H = 86400 * 2 // 48 hours in seconds

// ============================================================================
// Date utilities
// ============================================================================

export function getTodayDateString(): string {
  const now = new Date()
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}-${String(now.getUTCDate()).padStart(2, "0")}`
}

export function getYesterdayDateString(): string {
  const now = new Date()
  now.setUTCDate(now.getUTCDate() - 1)
  return `${now.getUTCFullYear()}-${String(now.getUTCMonth() + 1).padStart(2, "0")}-${String(now.getUTCDate()).padStart(2, "0")}`
}

// ============================================================================
// Topic caching
// ============================================================================

interface Reference {
  title: string
  authors: string[]
  year: number
  url: string | null
}

export interface CachedTopic {
  topic: string
  summary: string
  references: Reference[]
}

export async function getCachedTopic(
  date: string,
  tone: string
): Promise<CachedTopic | null> {
  if (!redis) return null
  try {
    const raw = await redis.get(`ecolearn:topic:${date}:${tone}`)

    return raw != null
      ? typeof raw === "string"
        ? (JSON.parse(raw) as CachedTopic)
        : typeof raw === "object"
          ? (raw as CachedTopic)
          : null
      : null
  } catch (e) {
    console.error("Redis getCachedTopic error:", e)
    return null
  }
}

export async function setCachedTopic(
  date: string,
  tone: string,
  data: CachedTopic
): Promise<void> {
  if (!redis) return
  try {
    await redis.set(`ecolearn:topic:${date}:${tone}`, JSON.stringify(data), {
      ex: CACHE_TTL_24H,
    })
  } catch (e) {
    console.error("Redis setCachedTopic error:", e)
  }
}

// ============================================================================
// Token tracking
// ============================================================================

const TOKEN_KEY_PREFIX = "ecolearn:tokens"

/**
 * Increment the article token count for a given date
 */
export async function incrementArticleTokens(
  date: string,
  tokens: number
): Promise<void> {
  if (!redis || tokens <= 0) return
  try {
    const key = `${TOKEN_KEY_PREFIX}:${date}:articles`
    await redis.incrby(key, tokens)
    await redis.expire(key, CACHE_TTL_48H)
  } catch (e) {
    console.error("Error incrementing article tokens:", e)
  }
}

/**
 * Increment the chat token count for a given date
 */
export async function incrementChatTokens(
  date: string,
  tokens: number
): Promise<void> {
  if (!redis || tokens <= 0) return
  try {
    const key = `${TOKEN_KEY_PREFIX}:${date}:chats`
    await redis.incrby(key, tokens)
    await redis.expire(key, CACHE_TTL_48H)
  } catch (e) {
    console.error("Error incrementing chat tokens:", e)
  }
}

/**
 * Get the current token counts for a given date
 */
export async function getTokenCounts(
  date: string
): Promise<{ articleTokens: number; chatTokens: number }> {
  if (!redis) {
    return { articleTokens: 0, chatTokens: 0 }
  }
  try {
    const [articleTokens, chatTokens] = await Promise.all([
      redis.get<number>(`${TOKEN_KEY_PREFIX}:${date}:articles`),
      redis.get<number>(`${TOKEN_KEY_PREFIX}:${date}:chats`),
    ])
    return {
      articleTokens: articleTokens || 0,
      chatTokens: chatTokens || 0,
    }
  } catch (e) {
    console.error("Error getting token counts:", e)
    return { articleTokens: 0, chatTokens: 0 }
  }
}
