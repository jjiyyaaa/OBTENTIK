/**
 * OBTENTIK - QR Code & Batch ID Parser Utility
 * 
 * Extracts and sanitizes a Batch ID from scanned QR code payloads or manual user inputs.
 * Supports:
 * 1. Raw Batch ID: e.g. "BATCH-2026-PARA500"
 * 2. Absolute URL: e.g. "https://example.com/?batchId=BATCH-2026-PARA500"
 * 3. Relative URL: e.g. "/?batchId=BATCH-2026-PARA500"
 * 4. Whitespace and encoding normalization
 */

export function extractBatchId(rawInput: string | null | undefined): string {
  if (!rawInput) return "";

  const trimmed = rawInput.trim();
  if (!trimmed) return "";

  // If payload contains "batchId=", extract query parameter
  if (trimmed.includes("batchId=")) {
    try {
      // Use dummy base "http://localhost" to reliably parse relative URLs
      const parsedUrl = new URL(trimmed, "http://localhost");
      const param = parsedUrl.searchParams.get("batchId");
      if (param && param.trim()) {
        return param.trim();
      }
    } catch {
      // Fallback regex if URL constructor fails on unconventional formatting
      const match = trimmed.match(/[?&]batchId=([^&#\s]+)/i);
      if (match && match[1]) {
        try {
          return decodeURIComponent(match[1]).trim();
        } catch {
          return match[1].trim();
        }
      }
    }
  }

  return trimmed;
}

export default extractBatchId;
