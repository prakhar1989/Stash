import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { and, desc, eq, inArray, ilike } from "drizzle-orm";
import * as schema from "@/app/schema/schema";

/**
 * GET /api/users/[username]/bookmarks - List public bookmarks for a user
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ username: string }> },
) {
  try {
    const { username } = await params;

    // Initialize database
    const db = drizzle(neon(process.env.DATABASE_URL!), { schema });

    // Find user by username
    const cleanUsername = username.trim();

    const userResult = await db
      .select()
      .from(schema.users)
      .where(ilike(schema.users.username, cleanUsername))
      .limit(1);

    if (userResult.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const targetUser = userResult[0];

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "10");

    // Build query
    // Note: In a real app, we might want to filter by visibility (public/private)
    // For now, we assume all bookmarks are public as per requirements
    const conditions = [eq(schema.bookmarks.userId, targetUser.id)];

    // Get total count
    // @ts-ignore
    const countResult = await db
      .select({ count: schema.bookmarks.id })
      .from(schema.bookmarks)
      .where(and(...conditions));

    const total = countResult.length;

    // Get paginated results
    const bookmarks = await db
      .select({
        id: schema.bookmarks.id,
        url: schema.bookmarks.url,
        title: schema.bookmarks.title,
        description: schema.bookmarks.description,
        status: schema.bookmarks.status,
        createdAt: schema.bookmarks.createdAt,
        summaryShort: schema.bookmarkContents.summaryShort,
        faviconUrl: schema.bookmarks.faviconUrl,
      })
      .from(schema.bookmarks)
      .leftJoin(
        schema.bookmarkContents,
        eq(schema.bookmarks.id, schema.bookmarkContents.bookmarkId),
      )
      .where(and(...conditions))
      .orderBy(desc(schema.bookmarks.createdAt))
      .limit(pageSize)
      .offset((page - 1) * pageSize);

    // Fetch tags for all bookmarks
    const bookmarkIds = bookmarks.map((b) => b.id);
    const allTags =
      bookmarkIds.length > 0
        ? await db
            .select({
              bookmarkId: schema.bookmarkTags.bookmarkId,
              tagId: schema.tags.id,
              tagName: schema.tags.name,
            })
            .from(schema.tags)
            .innerJoin(
              schema.bookmarkTags,
              eq(schema.tags.id, schema.bookmarkTags.tagId),
            )
            .where(inArray(schema.bookmarkTags.bookmarkId, bookmarkIds))
        : [];

    // Group tags by bookmark ID
    const tagsByBookmark = allTags.reduce(
      (acc, tag) => {
        if (!acc[tag.bookmarkId]) {
          acc[tag.bookmarkId] = [];
        }
        acc[tag.bookmarkId].push({
          id: tag.tagId,
          name: tag.tagName,
        });
        return acc;
      },
      {} as Record<string, { id: string; name: string }[]>,
    );

    // Attach tags to bookmarks
    const bookmarksWithTags = bookmarks.map((bookmark) => ({
      ...bookmark,
      tags: tagsByBookmark[bookmark.id] || [],
    }));

    return NextResponse.json({
      bookmarks: bookmarksWithTags,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
      user: {
        username: targetUser.username,
        // Don't expose email or other private info
      },
    });
  } catch (error) {
    console.error("Error fetching user bookmarks:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
