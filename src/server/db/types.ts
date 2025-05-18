import type { InferInsertModel, InferSelectModel } from "drizzle-orm"
import type { books, chapters, poster, users } from "./schema"

// User types
export type User = InferSelectModel<typeof users>
export type NewUser = InferInsertModel<typeof users>
export type LoginUser = {
  email: string
  password: string
}

// Book types
export type Book = InferSelectModel<typeof books>
export type NewBook = InferInsertModel<typeof books>

// Chapter types
export type Chapter = InferSelectModel<typeof chapters>
export type NewChapter = InferInsertModel<typeof chapters>

// Poster types
export type Poster = InferSelectModel<typeof poster>
export type NewPoster = InferInsertModel<typeof poster>
