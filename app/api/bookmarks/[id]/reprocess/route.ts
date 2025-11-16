import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { and, eq } from "drizzle-orm";
import * as schema from "@/app/schema/schema";
import { stackServerApp } from "@/app/stack";
import { processBookmark } from "@/lib/bookmark-processor";

/**
 * POST /api/bookmarks/[id]/reprocess - Retry processing a bookmark
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    // Get authenticated user
    const user = await stackServerApp.getUser();
    if (!user || !user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Initialize database
    const db = drizzle(neon(process.env.DATABASE_URL!), { schema });

    // Verify bookmark exists and belongs to user
    const bookmarks = await db
      .select({ id: schema.bookmarks.id })
      .from(schema.bookmarks)
      .where(
        and(eq(schema.bookmarks.id, id), eq(schema.bookmarks.userId, user.id)),
      )
      .limit(1);

    if (bookmarks.length === 0) {
      return NextResponse.json(
        { error: "Bookmark not found" },
        { status: 404 },
      );
    }

    // Reprocess the bookmark
    await processBookmark(db, id, user.id, { forceReprocess: true });

    // Fetch updated bookmark
    const updatedBookmark = await db
      .select({
        id: schema.bookmarks.id,
        url: schema.bookmarks.url,
        title: schema.bookmarks.title,
        description: schema.bookmarks.description,
        status: schema.bookmarks.status,
        errorMessage: schema.bookmarks.errorMessage,
        summaryShort: schema.bookmarkContents.summaryShort,
      })
      .from(schema.bookmarks)
      .leftJoin(
        schema.bookmarkContents,
        eq(schema.bookmarks.id, schema.bookmarkContents.bookmarkId),
      )
      .where(eq(schema.bookmarks.id, id))
      .limit(1);

    return NextResponse.json({
      message: "Bookmark reprocessed successfully",
      bookmark: updatedBookmark[0],
    });
  } catch (error) {
    console.error("Error reprocessing bookmark:", error);
    return NextResponse.json(
      {
        error: "Failed to reprocess bookmark",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
