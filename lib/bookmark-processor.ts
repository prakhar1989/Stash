import { NeonHttpDatabase } from "drizzle-orm/neon-http";
import { eq } from "drizzle-orm";
import * as schema from "@/app/schema/schema";
import { fetchAndExtractContent } from "./content-extractor";
import {
  summarizeAndTag,
  getCurrentLLMModel,
  getCurrentLLMVersion,
} from "./llm-client";
import {
  ensureTags,
  updateBookmarkTags,
  updateSearchVector,
  generateContentHash,
} from "./bookmark-utils";

export interface ProcessBookmarkOptions {
  forceReprocess?: boolean;
}

/**
 * Main function to process a bookmark:
 * 1. Fetches HTML and extracts readable content
 * 2. Calls LLM to summarize and tag
 * 3. Updates database with results
 * 4. Updates search vector
 */
export async function processBookmark(
  db: NeonHttpDatabase<typeof schema>,
  bookmarkId: string,
  userId: string,
  options: ProcessBookmarkOptions = {},
): Promise<void> {
  try {
    // Fetch bookmark
    const bookmarks = await db
      .select()
      .from(schema.bookmarks)
      .where(eq(schema.bookmarks.id, bookmarkId))
      .limit(1);

    if (bookmarks.length === 0) {
      throw new Error(`Bookmark not found: ${bookmarkId}`);
    }

    const bookmark = bookmarks[0];

    // Verify ownership
    if (bookmark.userId !== userId) {
      throw new Error("Unauthorized: bookmark does not belong to user");
    }

    // Update status to pending
    await db
      .update(schema.bookmarks)
      .set({
        status: "pending",
        errorMessage: null,
        updatedAt: new Date(),
      })
      .where(eq(schema.bookmarks.id, bookmarkId));

    // Step 1: Fetch and extract content
    const extracted = await fetchAndExtractContent(bookmark.url);

    // Step 2: Call LLM for summarization and tagging
    const llmResult = await summarizeAndTag({
      url: bookmark.url,
      title: extracted.title,
      metaDescription: extracted.metaDescription,
      contentText: extracted.textContent,
    });

    // Step 3: Generate content hash
    const contentHash = generateContentHash(extracted.textContent || "");

    // Step 4: Upsert bookmark_contents
    await db
      .insert(schema.bookmarkContents)
      .values({
        bookmarkId,
        rawContent: extracted.textContent,
        contentHash,
        summaryShort: llmResult.summary_short || null,
        summaryLong: llmResult.summary_long || null,
        language: llmResult.language,
        llmModel: getCurrentLLMModel(),
        llmVersion: getCurrentLLMVersion(),
        meta: llmResult.category ? { category: llmResult.category } : null,
      })
      .onConflictDoUpdate({
        target: schema.bookmarkContents.bookmarkId,
        set: {
          rawContent: extracted.textContent,
          contentHash,
          summaryShort: llmResult.summary_short || null,
          summaryLong: llmResult.summary_long || null,
          language: llmResult.language,
          llmModel: getCurrentLLMModel(),
          llmVersion: getCurrentLLMVersion(),
          meta: llmResult.category ? { category: llmResult.category } : null,
          updatedAt: new Date(),
        },
      });

    // Step 5: Update bookmark with extracted metadata
    const updateData: Record<string, any> = {
      status: "processed",
      lastProcessedAt: new Date(),
      updatedAt: new Date(),
    };

    // Update title if it wasn't provided or if LLM has a better one
    if (!bookmark.title || bookmark.title.length === 0) {
      updateData.title = llmResult.title || extracted.title;
    }

    // Update source type and favicon if available
    if (extracted.sourceType) {
      updateData.sourceType = extracted.sourceType;
    }
    if (extracted.faviconUrl) {
      updateData.faviconUrl = extracted.faviconUrl;
    }

    await db
      .update(schema.bookmarks)
      .set(updateData)
      .where(eq(schema.bookmarks.id, bookmarkId));

    // Step 6: Handle tags
    if (llmResult.tags && llmResult.tags.length > 0) {
      const tagIds = await ensureTags(db, userId, llmResult.tags);
      await updateBookmarkTags(db, bookmarkId, tagIds);
    }

    // Step 7: Update search vector
    await updateSearchVector(db, bookmarkId);

    console.log(`Successfully processed bookmark: ${bookmarkId}`);
  } catch (error) {
    // Update bookmark with error status
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";

    await db
      .update(schema.bookmarks)
      .set({
        status: "failed",
        errorMessage,
        lastProcessedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(schema.bookmarks.id, bookmarkId));

    console.error(`Failed to process bookmark ${bookmarkId}:`, errorMessage);
    throw error;
  }
}
