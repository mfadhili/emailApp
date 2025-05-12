import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function textToHtml(text: string): string {
  if (!text) return ""

  // Replace line breaks with <br> tags
  let html = text.replace(/\n/g, "<br>")

  // Convert sections with headings (lines followed by a colon)
  html = html.replace(/^([^:]+):\s*<br>/gm, "<p><strong>$1:</strong></p>")

  // Convert bullet points with emojis
  html = html.replace(/(✅|🔹|[0-9]️⃣)\s+([^<]+)<br>/g, "<li>$1 $2</li>")

  // Wrap bullet point sections in <ul> tags
  html = html.replace(/(<li>✅[^<]+<\/li>)+/g, "<ul>$&</ul>")
  html = html.replace(/(<li>🔹[^<]+<\/li>)+/g, "<ul>$&</ul>")

  // Wrap numbered points in <ol> tags
  html = html.replace(/(<li>[0-9]️⃣[^<]+<\/li>)+/g, "<ol>$&</ol>")

  // Convert remaining line breaks to paragraphs
  html = "<p>" + html.replace(/<br>/g, "</p><p>") + "</p>"

  // Clean up empty paragraphs
  html = html.replace(/<p><\/p>/g, "")

  // Fix nested paragraphs in lists
  html = html.replace(/<p>(<li>)/g, "$1")
  html = html.replace(/(<\/li>)<\/p>/g, "$1")
  html = html.replace(/<p>(<ul>|<ol>)/g, "$1")
  html = html.replace(/(<\/ul>|<\/ol>)<\/p>/g, "$1")

  return html
}