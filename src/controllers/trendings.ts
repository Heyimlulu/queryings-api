import dayjs from "dayjs";
import { Request, Response } from "express";
import { TrendingsResult } from "../types/Trending";
import { fetchTrendings } from "../services/trendings";

const DEFAULT_GEOLOCATION = "US";
const DATE_FORMAT = "YYYY-MM-DD";

const isValidDate = (value: unknown): value is string =>
  typeof value === "string" && dayjs(value, DATE_FORMAT, true).isValid();

const isExtended = (value: unknown): boolean => value === "true";

/**
 * Get trendings from Google Trends for the last 30 days
 *
 * @param geolocation The geolocation to fetch trendings from
 * @param extended If true, returns the full results instead of just the trending searches titles
 *
 * @returns Trendings for the last 30 days
 */
export const getTrendings = async (req: Request, res: Response) => {
  const { geolocation, extended } = req.query;

  const geo = (geolocation as string) || DEFAULT_GEOLOCATION;

  // Fetch trendings for the last 30 days in parallel and combine results safely
  const nestedResults = await Promise.all(
    Array.from({ length: 30 }, (_, i) => {
      const date = dayjs().subtract(i, "day").format(DATE_FORMAT);
      return fetchTrendings(geo, date);
    })
  );

  const results = nestedResults.flat();

  if (isExtended(extended)) {
    return res.json({
      results: results.sort((a, b) => (a.date > b.date ? -1 : 1)),
    });
  }

  return res.json({
    results: results.flatMap((r) =>
      r.trendingSearches.map((t) => t.title.query)
    ),
  });
};

/**
 * Get trendings from Google Trends for a specific date
 *
 * @param geolocation The geolocation to fetch trendings from
 * @param date The date to fetch trendings for
 * @param extended If true, returns the full results instead of just the trending searches titles
 *
 * @returns Trendings for the specified date
 */
export const getTrending = async (req: Request, res: Response) => {
  const { geolocation, date, extended } = req.query;

  if (!isValidDate(date)) {
    return res.status(400).json({ message: "Invalid or missing date parameter" });
  }

  const geo = (geolocation as string) || DEFAULT_GEOLOCATION;
  const results = await fetchTrendings(geo, date);

  // If extended is true, return the full results
  if (isExtended(extended)) {
    return res.json({ results });
  }

  // Otherwise, return only the trending searches titles
  return res.json({
    results: results.flatMap((r) =>
      r.trendingSearches.map((t) => t.title.query)
    ),
  });
};
