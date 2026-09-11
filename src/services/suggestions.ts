import axios from "axios";
import { validateResponse } from "../utils/validator";

export const questions = [
  "can",
  "why",
  "who",
  "which",
  "will",
  "how",
  "what",
  "where",
  "are",
  "when",
  "how often",
  "how long",
];
export const prepositions = ["near", "without", "to", "with", "is", "for"];
export const comparisons = ["like", "versus", "vs", "and", "or", "against"];

const parseCharset = (contentType?: string): string => {
  if (!contentType) return "ISO-8859-1";
  const match = contentType.match(/charset=([^\s;]+)/i);
  const charset = match?.[1]?.toLowerCase() ?? "iso-8859-1";
  // The Google Suggest endpoint mostly returns ISO-8859-1; fall back to
  // windows-1252 for accented Western European characters if not specified.
  return charset === "iso-8859-1" ? "iso-8859-1" : charset;
};

export const fetchSuggestions = async (
  keyword: string,
  prefix = "",
  gl = "US",
  hl = "en"
): Promise<string[]> => {
  const q = encodeURIComponent(`${prefix}${keyword}`.trim());
  const url = `http://suggestqueries.google.com/complete/search?client=firefox&gl=${encodeURIComponent(
    gl
  )}&hl=${encodeURIComponent(hl)}&q=${q}`;

  try {
    const response = await axios.get(url, { responseType: "arraybuffer" });
    validateResponse(response);

    const charset = parseCharset(response.headers["content-type"] as string);
    const text = new TextDecoder(charset).decode(response.data as ArrayBuffer);
    const parsed = JSON.parse(text);
    return parsed?.[1] ?? [];
  } catch (error) {
    // Fail gracefully and return an empty array so the overall result still completes.
    return [];
  }
};
