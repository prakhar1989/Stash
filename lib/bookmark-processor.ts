import { NeonHttpDatabase } from "drizzle-orm/neon-http";
import { eq } from "drizzle-orm";
import * as schema from "@/app/schema/schema";
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
 * 1. Calls LLM with URL Context + Grounding to analyze the URL
 * 2. Updates database with results
 * 3. Updates search vector
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

    // Step 1: Call LLM with URL Context + Grounding to analyze the URL
    const llmResult = await summarizeAndTag({
      url: bookmark.url,
    });

    // Step 2: Generate content hash based on the LLM summary
    // Since we no longer extract raw content, we'll use the summary as the content
    const contentHash = generateContentHash(
      llmResult.summary_long || llmResult.summary_short || llmResult.title,
    );

    // Step 3: Upsert bookmark_contents
    await db
      .insert(schema.bookmarkContents)
      .values({
        bookmarkId,
        rawContent: null, // No longer storing raw extracted content
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
          rawContent: null, // No longer storing raw extracted content
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

    // Step 4: Update bookmark with LLM-generated metadata
    const updateData: Record<string, any> = {
      status: "processed",
      lastProcessedAt: new Date(),
      updatedAt: new Date(),
    };

    // Update title if it wasn't provided or if LLM has a better one
    if (!bookmark.title || bookmark.title.length === 0) {
      updateData.title = llmResult.title;
    }

    await db
      .update(schema.bookmarks)
      .set(updateData)
      .where(eq(schema.bookmarks.id, bookmarkId));

    // Step 5: Handle tags
    if (llmResult.tags && llmResult.tags.length > 0) {
      const tagIds = await ensureTags(db, userId, llmResult.tags);
      await updateBookmarkTags(db, bookmarkId, tagIds);
    }

    // Step 6: Update search vector
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
