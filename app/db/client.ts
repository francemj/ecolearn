import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"

import * as schema from "./schema"

const connectionString = process.env.DATABASE_URL

/**
 * The database stays optional. With no DATABASE_URL the app still serves today's
 * article straight from Redis — only the permanent archive goes away. Routes
 * must keep null-checking `db`.
 */
export const db = connectionString
  ? drizzle(
      postgres(connectionString, {
        // One connection per serverless instance. Vercel runs many concurrent
        // instances, so a pool in each one multiplies against Postgres'
        // connection limit rather than sharing anything.
        max: 1,
        idle_timeout: 20,
        connect_timeout: 10,
        // Required when connecting through PgBouncer in transaction mode: it
        // hands each transaction a different backend, so a prepared statement
        // from one is not there for the next.
        prepare: false,
      }),
      { schema }
    )
  : null
