import { NextRequest, NextResponse } from "next/server";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq, sql } from "drizzle-orm";
import * as schema from "@/app/schema/schema";
import { stackServerApp } from "@/app/stack";

/**
 * GET /api/tags - Get all tags for the current user with bookmark counts
 */
export async function GET(request: NextRequest) {
  try {
    // Get authenticated user
    const user = await stackServerApp.getUser();
    if (!user || !user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Initialize database
    const db = drizzle(neon(process.env.DATABASE_URL!), { schema });

    // Fetch tags with bookmark counts
    const tags = await db
      .select({
        id: schema.tags.id,
        name: schema.tags.name,
        createdAt: schema.tags.createdAt,
        bookmarkCount: sql<number>`COUNT(${schema.bookmarkTags.bookmarkId})::int`,
      })
      .from(schema.tags)
      .leftJoin(
        schema.bookmarkTags,
        eq(schema.tags.id, schema.bookmarkTags.tagId),
      )
      .where(eq(schema.tags.userId, user.id))
      .groupBy(schema.tags.id, schema.tags.name, schema.tags.createdAt)
      .orderBy(sql`COUNT(${schema.bookmarkTags.bookmarkId}) DESC`);

    return NextResponse.json({ tags });
  } catch (error) {
    console.error("Error fetching tags:", error);
    return NextResponse.json(
      {
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
