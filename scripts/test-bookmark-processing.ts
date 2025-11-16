#!/usr/bin/env tsx
/**
 * Test script for bookmark content extraction and LLM processing
 * Usage: npx tsx scripts/test-bookmark-processing.ts <url>
 * Example: npx tsx scripts/test-bookmark-processing.ts https://example.com
 */

import { fetchAndExtractContent } from "../lib/content-extractor";
import { summarizeAndTag } from "../lib/llm-client";

async function testBookmarkProcessing(url: string) {
  console.log("\n=== Testing Bookmark Processing ===\n");
  console.log(`URL: ${url}\n`);

  try {
    // Step 1: Extract content from URL
    console.log("📥 Step 1: Extracting content from URL...\n");
    const extracted = await fetchAndExtractContent(url);

    console.log("✅ Content Extraction Results:");
    console.log("─".repeat(60));
    console.log(`Title: ${extracted.title || "(none)"}`);
    console.log(`Meta Description: ${extracted.metaDescription || "(none)"}`);
    console.log(`Favicon URL: ${extracted.faviconUrl || "(none)"}`);
    console.log(`Source Type: ${extracted.sourceType}`);
    console.log(
      `Text Content Length: ${extracted.textContent?.length || 0} chars`,
    );
    if (extracted.textContent) {
      console.log(
        `Text Content Preview: ${extracted.textContent.substring(0, 200)}...`,
      );
    }
    console.log("─".repeat(60));
    console.log("");

    // Step 2: Summarize and tag with LLM
    console.log("🤖 Step 2: Processing with LLM...\n");
    const llmResult = await summarizeAndTag({
      url,
      title: extracted.title,
      metaDescription: extracted.metaDescription,
      contentText: extracted.textContent,
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
