import { Readability } from "@mozilla/readability";
import { parseHTML } from "linkedom";

export interface ExtractedContent {
  title: string | null;
  metaDescription: string | null;
  textContent: string | null;
  faviconUrl: string | null;
  sourceType: string;
}

/**
 * Fetches HTML content from a URL with timeout and size limits
 */
export async function fetchPageHtml(
  url: string,
  timeoutMs: number = 10000,
  maxSizeBytes: number = 2 * 1024 * 1024, // 2MB
): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (compatible; BookmarkBot/1.0; +https://example.com/bot)",
      },
      redirect: "follow",
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    // Check content type
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("text/html")) {
      throw new Error(`Invalid content type: ${contentType}`);
    }

    // Check content length
    const contentLength = response.headers.get("content-length");
    if (contentLength && parseInt(contentLength) > maxSizeBytes) {
      throw new Error(`Content too large: ${contentLength} bytes`);
    }

    const html = await response.text();

    // Double-check size after download
    if (html.length > maxSizeBytes) {
      return html.substring(0, maxSizeBytes);
    }

    return html;
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === "AbortError") {
        throw new Error(`Request timeout after ${timeoutMs}ms`);
      }
      throw error;
    }
    throw new Error("Unknown error fetching page");
  }
}

/**
 * Extracts readable content from HTML using Mozilla Readability
 */
export function extractReadableContent(
  html: string,
  url: string,
): ExtractedContent {
  try {
    const { document } = parseHTML(html);

    // Extract metadata
    const metaDescription =
      document
        .querySelector('meta[name="description"]')
        ?.getAttribute("content") ||
      document
        .querySelector('meta[property="og:description"]')
        ?.getAttribute("content") ||
      null;

    // Extract favicon
    let faviconUrl: string | null = null;
    const faviconLink =
      document.querySelector<HTMLLinkElement>('link[rel~="icon"]');
    if (faviconLink?.href) {
      faviconUrl = new URL(faviconLink.href, url).href;
    }

    // Detect source type
    let sourceType = "article";
    const ogType = document
      .querySelector('meta[property="og:type"]')
      ?.getAttribute("content");
    if (ogType) {
      sourceType = ogType;
    } else if (url.includes("youtube.com") || url.includes("youtu.be")) {
      sourceType = "video";
    } else if (url.includes("twitter.com") || url.includes("x.com")) {
      sourceType = "tweet";
    }

    // Use Readability to extract main content
    const reader = new Readability(document);
    const article = reader.parse();

    if (!article) {
      // Readability failed, try to get basic info
      return {
        title: document.title || null,
        metaDescription,
        textContent: null,
        faviconUrl,
        sourceType,
      };
    }

    // Convert HTML content to plain text
    const { document: contentDoc } = parseHTML(article.content || "");
    const textContent = contentDoc.body.textContent || "";

    return {
      title: article.title || document.title || null,
      metaDescription,
      textContent: textContent.trim(),
      faviconUrl,
      sourceType,
    };
  } catch (error) {
    throw new Error(
      `Failed to extract content: ${error instanceof Error ? error.message : "Unknown error"}`,
    );
  }
}

/**
 * Main function to fetch and extract content from a URL
 */
export async function fetchAndExtractContent(
  url: string,
): Promise<ExtractedContent> {
  const html = await fetchPageHtml(url);

  if (!html) {
    throw new Error("Failed to fetch HTML content");
  }

  return extractReadableContent(html, url);
}
