import {
  boolean,
  doublePrecision,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  serial,
  text,
  timestamp,
  varchar
} from "drizzle-orm/pg-core"
import type { AdapterAccount } from "next-auth/adapters"

// Enum cho vai trò user
export const rolesEnum = pgEnum("roles", [
  "guest",
  "user",
  "creator",
  "author",
  "admin"
])

// User (creator) - Updated for NextAuth
export const users = pgTable("users", {
  id: text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: varchar("name", { length: 256 }),
  email: varchar("email", { length: 256 }).unique(),
  emailVerified: timestamp("email_verified", { withTimezone: true }),
  image: text("image"),
  avatar: jsonb("avatar").$type<string[]>(),
  level: integer("level"),
  exp: integer("exp"),
  objectType: varchar("object_type", { length: 32 }),
  role: rolesEnum("role").default("guest"),
  password: varchar("password", { length: 256 })
})

// NextAuth Accounts
export const accounts = pgTable(
  "accounts",
  {
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type").$type<AdapterAccount>().notNull(),
    provider: text("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state")
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId]
    })
  })
)

// NextAuth Sessions
export const sessions = pgTable("sessions", {
  sessionToken: text("session_token").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { withTimezone: true }).notNull()
})

// NextAuth Verification Tokens
export const verificationTokens = pgTable(
  "verification_tokens",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { withTimezone: true }).notNull()
  },
  (verificationToken) => ({
    compositePk: primaryKey({
      columns: [verificationToken.identifier, verificationToken.token]
    })
  })
)

// Poster (dạng jsonb)
export const poster = pgTable("poster", {
  id: serial("id").primaryKey(),
  default: varchar("default", { length: 512 }),
  img600: varchar("600", { length: 512 }),
  img300: varchar("300", { length: 512 }),
  img150: varchar("150", { length: 512 })
})

// Book
export const books = pgTable("books", {
  id: integer("id").primaryKey(),
  name: varchar("name", { length: 256 }).notNull(),
  slug: varchar("slug", { length: 256 }).notNull(),
  kind: integer("kind"),
  sex: integer("sex"),
  state: varchar("state", { length: 64 }),
  status: integer("status"),
  link: varchar("link", { length: 512 }),
  note: text("note"),
  statusName: varchar("status_name", { length: 64 }),
  firstChapter: integer("first_chapter"),
  latestChapter: integer("latest_chapter"),
  latestIndex: integer("latest_index"),
  highQuality: boolean("high_quality"),
  managerPick: boolean("manager_pick"),
  poster: jsonb("poster").$type<{
    default: string
    600: string
    300: string
    150: string
  }>(),
  synopsis: text("synopsis"),
  reviewScore: doublePrecision("review_score"),
  viewCount: integer("view_count"),
  wordCount: integer("word_count"),
  createdAt: timestamp("created_at", { withTimezone: true }),
  updatedAt: timestamp("updated_at", { withTimezone: true }),
  newChapAt: timestamp("new_chap_at", { withTimezone: true }),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  published: boolean("published"),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  objectType: varchar("object_type", { length: 32 }),
  chapterPerWeek: integer("chapter_per_week"),
  readyForSale: boolean("ready_for_sale"),
  discountPrice: integer("discount_price"),
  discount: integer("discount")
})

// Chapter
export const chapters = pgTable("chapters", {
  id: integer("id").primaryKey(),
  name: varchar("name", { length: 256 }).notNull(),
  index: integer("index"),
  slug: varchar("slug", { length: 256 }),
  bookId: integer("book_id").references(() => books.id),
  content: text("content"),
  wordCount: integer("word_count"),
  viewCount: integer("view_count"),
  createdAt: timestamp("created_at", { withTimezone: true }),
  updatedAt: timestamp("updated_at", { withTimezone: true }),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  next: jsonb("next").$type<{
    id: number
    name: string
    index: number
    created_at: string
    object_type: string
  }>(),
  previous: jsonb("previous").$type<any>(),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  unlockPrice: integer("unlock_price"),
  unlockKeyPrice: integer("unlock_key_price"),
  isLocked: boolean("is_locked"),
  objectType: varchar("object_type", { length: 32 }),
  reportOptions: jsonb("report_options").$type<
    Array<{
      title: string
      assign_to: string
      content_placeholder: string
    }>
  >()
})

// Votes
export const votes = pgTable("votes", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  bookId: integer("book_id")
    .notNull()
    .references(() => books.id, { onDelete: "cascade" }),
  value: integer("value").notNull(), // 1 for upvote, -1 for downvote
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow()
})

// Reviews
export const reviews = pgTable("reviews", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  bookId: integer("book_id")
    .notNull()
    .references(() => books.id, { onDelete: "cascade" }),
  content: text("content"),
  rating: integer("rating").notNull(), // 1-5 stars
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow()
})

// Bookmarks
export const bookmarks = pgTable("bookmarks", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  bookId: integer("book_id")
    .notNull()
    .references(() => books.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow()
})

// Comments
export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  bookId: integer("book_id")
    .notNull()
    .references(() => books.id, { onDelete: "cascade" }),
  chapterId: integer("chapter_id").references(() => chapters.id, {
    onDelete: "cascade"
  }),
  content: text("content").notNull(),
  parentId: integer("parent_id").references((): any => comments.id, {
    onDelete: "cascade"
  }), // For nested comments
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow()
})

// Chapter Views
export const chapterViews = pgTable("chapter_views", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  chapterId: integer("chapter_id")
    .notNull()
    .references(() => chapters.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow()
})

// Book Views
export const bookViews = pgTable("book_views", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  bookId: integer("book_id")
    .notNull()
    .references(() => books.id, { onDelete: "cascade" }),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow()
})

// Report Issues
export const reports = pgTable("reports", {
  id: serial("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  bookId: integer("book_id").references(() => books.id, {
    onDelete: "cascade"
  }),
  chapterId: integer("chapter_id").references(() => chapters.id, {
    onDelete: "cascade"
  }),
  title: varchar("title", { length: 256 }).notNull(),
  content: text("content").notNull(),
  status: varchar("status", { length: 32 }).default("pending"), // pending, resolved, rejected
  assignedTo: text("assigned_to").references(() => users.id),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow()
})
