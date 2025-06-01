import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import { env } from "@/env"
import * as schema from "./schema"

const conn = postgres(env.DATABASE_URL)

export const db = drizzle(conn, { schema, casing: "snake_case" })
