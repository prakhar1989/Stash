import {
  customType,
  index,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

// Custom type for PostgreSQL tsvector
const tsvector = customType<{ data: string }>({
  dataType() {
    return "tsvector";
  },
});

// ============================================================================
// ENUMS
// ============================================================================

export const bookmarkStatusEnum = pgEnum("bookmark_status", [
  "pending",
  "processed",
  "failed",
]);

// ============================================================================
// USERS
// ============================================================================

export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  email: text("email").unique().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});

// ============================================================================
// BOOKMARKS
// ============================================================================

export const bookmarks = pgTable(
  "bookmarks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    url: text("url").notNull(),
    normalizedUrl: text("normalized_url").notNull(),
    title: text("title"),
    description: text("description"), // user's note
    sourceType: text("source_type"), // 'article', 'video', 'tweet', etc
    faviconUrl: text("favicon_url"),

    status: bookmarkStatusEnum("status").notNull().default("pending"),
    errorMessage: text("error_message"),

    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    lastProcessedAt: timestamp("last_processed_at", { withTimezone: true }),
  },
  (table) => ({
    userUrlIdx: uniqueIndex("idx_bookmarks_user_url").on(
      table.userId,
      table.normalizedUrl,
    ),
    userIdIdx: index("idx_bookmarks_user_id").on(table.userId),
    statusIdx: index("idx_bookmarks_status").on(table.status),
  }),
);

// ============================================================================
// BOOKMARK CONTENTS
// ============================================================================

export const bookmarkContents = pgTable(
  "bookmark_contents",
  {
    bookmarkId: uuid("bookmark_id")
      .primaryKey()
      .references(() => bookmarks.id, { onDelete: "cascade" }),
    rawContent: text("raw_content"), // truncated content
    contentHash: text("content_hash"), // hash for idempotency

    summaryShort: text("summary_short"), // 1-2 sentence summary
    summaryLong: text("summary_long"), // multi-paragraph summary
    language: text("language"), // detected language

    llmModel: text("llm_model"), // which model was used
    llmVersion: text("llm_version"), // optional version tracking
    meta: jsonb("meta"), // arbitrary metadata from LLM

    searchVector: tsvector("search_vector"), // full-text search vector

    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    // GIN index for full-text search (created via custom migration)
  }),
);

// ============================================================================
// TAGS
// ============================================================================

export const tags = pgTable(
  "tags",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (table) => ({
    userNameIdx: uniqueIndex("idx_tags_user_name").on(
      table.userId,
      sql`lower(${table.name})`,
    ),
    userIdIdx: index("idx_tags_user_id").on(table.userId),
  }),
);

// ============================================================================
// BOOKMARK TAGS (join table)
// ============================================================================

export const bookmarkTags = pgTable(
  "bookmark_tags",
  {
    bookmarkId: uuid("bookmark_id")
      .notNull()
      .references(() => bookmarks.id, { onDelete: "cascade" }),
    tagId: uuid("tag_id")
      .notNull()
      .references(() => tags.id, { onDelete: "cascade" }),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.bookmarkId, table.tagId] }),
    bookmarkIdIdx: index("idx_bookmark_tags_bookmark").on(table.bookmarkId),
    tagIdIdx: index("idx_bookmark_tags_tag").on(table.tagId),
  }),
);
