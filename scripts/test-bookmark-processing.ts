#!/usr/bin/env tsx
/**
 * Test script for bookmark processing with Grounding
 * Usage: npx tsx scripts/test-bookmark-processing.ts <url>
 * Example: npx tsx scripts/test-bookmark-processing.ts https://example.com
 */

import { summarizeAndTag } from "../lib/llm-client";

async function testBookmarkProcessing(url: string) {
  console.log("\n=== Testing Bookmark Processing with Grounding ===\n");
  console.log(`URL: ${url}\n`);

  try {
    // Process URL with LLM using Grounding with Google Search
    console.log(
      "🤖 Processing URL with Gemini (using Grounding with Google Search)...\n",
    );
    const llmResult = await summarizeAndTag({
      url,
    });

    console.log("✅ LLM Processing Results:");
    console.log("─".repeat(60));
    console.log(`Title: ${llmResult.title}`);
    console.log(`Language: ${llmResult.language}`);
    console.log(`Category: ${llmResult.category || "(none)"}`);
    console.log(`Tags: ${llmResult.tags.join(", ")}`);
    console.log("");
    if (llmResult.summary_short) {
      console.log(`Short Summary:\n${llmResult.summary_short}`);
      console.log("");
    }
    if (llmResult.summary_long) {
      console.log(`Long Summary:\n${llmResult.summary_long}`);
      console.log("");
    }
    console.log("─".repeat(60));

    console.log("\n✨ Processing completed successfully!\n");
  } catch (error) {
    console.error("\n❌ Error during processing:");
    console.error(error);
    process.exit(1);
  }
}

// Get URL from command line arguments
const url = process.argv[2];

if (!url) {
  console.error("❌ Error: URL argument is required");
  console.error("\nUsage: npx tsx scripts/test-bookmark-processing.ts <url>");
  console.error(
    "Example: npx tsx scripts/test-bookmark-processing.ts https://example.com",
  );
  process.exit(1);
}

// Validate URL format
try {
  new URL(url);
} catch {
  console.error(`❌ Error: Invalid URL format: ${url}`);
  process.exit(1);
}

// Run the test
testBookmarkProcessing(url);
