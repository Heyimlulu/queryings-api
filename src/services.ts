import axios, { AxiosResponse } from "axios";
import dayjs from "dayjs";
import { TrendingsResult } from "./types/Trending";

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

export const validateResponse = (response: AxiosResponse) => {
  if (response.status !== 200) {
    throw new Error(`Request failed with status code ${response.status}`);
  }
  return response;
};

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

export const fetchTrendings = async (
  geolocation?: string,
  date?: string
): Promise<TrendingsResult[]> => {
  return axios
    .get("https://trends.google.com/trends/api/dailytrends", {
      params: {
        hl: "en",
        tz: "-60",
        geo: geolocation || "US",
        ns: 15,
        ed: dayjs(date).format("YYYYMMDD"),
      },
    })
    .then(
      (response) =>
        JSON.parse(validateResponse(response).data.slice(5)).default
          .trendingSearchesDays ?? []
    )
    .catch(() => []);
};
