"use client";

import { useEffect, useState, Suspense } from "react";
import { SearchFilter } from "@/components/bookmarks/search-filter";
import { BookmarksList } from "./bookmarks-list";
import { AddBookmarkForm } from "./add-bookmark";

interface Tag {
  id: string;
  name: string;
  bookmarkCount: number;
}

export function BookmarksPage() {
  const [tags, setTags] = useState<Tag[]>([]);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        const response = await fetch("/api/tags");
        if (response.ok) {
          const data = await response.json();
          setTags(data.tags);
        }
      } catch (error) {
        console.error("Failed to fetch tags:", error);
      }
    };

    fetchTags();
  }, []);

  return (
    <main className="mx-auto w-full flex-1 max-w-6xl px-4 py-10">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
        <div className="space-y-6">
          <SearchFilter tags={tags} />
          <Suspense
            fallback={
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div
                    key={i}
                    className="h-40 bg-gray-100 rounded-lg animate-pulse"
                  />
                ))}
              </div>
            }
          >
            <BookmarksList />
          </Suspense>
        </div>
        <div className="lg:sticky lg:top-24 lg:self-start">
          <AddBookmarkForm />
        </div>
      </div>
    </main>
  );
}
