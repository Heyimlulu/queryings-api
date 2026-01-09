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
  return axios
    .get(
      `http://suggestqueries.google.com/complete/search?client=firefox&q=${prefix}${keyword}`
    )
    .then((response) => validateResponse(response).data[1] ?? []);
};
