import { drizzle } from "drizzle-orm/d1"
import postgres from "postgres"
import { env } from "~/env"
import * as schema from "./schema"

const conn = postgres(env.DATABASE_URL)

export const db = drizzle(conn, { schema, casing: "snake_case" })
