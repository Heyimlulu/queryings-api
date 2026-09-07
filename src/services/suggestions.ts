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

export const fetchSuggestions = async (
  keyword: string,
  prefix = ""
): Promise<string[]> => {
  const q = encodeURIComponent(`${prefix}${keyword}`.trim());
  const url = `http://suggestqueries.google.com/complete/search?client=firefox&q=${q}`;

  try {
    const response = await axios.get(url);
    validateResponse(response);
    return response.data?.[1] ?? [];
  } catch (error) {
    // Fail gracefully and return an empty array so the overall result still completes.
    return [];
  }
};
