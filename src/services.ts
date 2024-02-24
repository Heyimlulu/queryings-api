import axios from "axios";
import { logger } from "./logger";

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
  try {
    const response = await axios.get(
      `http://suggestqueries.google.com/complete/search?client=firefox&q=${prefix}${keyword}`
    );
    return response.data[1];
  } catch (error) {
    logger.error("Error fetching suggestions", error);
    return [];
  }
};
