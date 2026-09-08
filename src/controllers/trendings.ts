import dayjs from "dayjs";
import { Request, Response } from "express";
import { TrendingsResult } from "../types/Trending";
import { fetchTrendings } from "../services/trendings";
import { logger } from "../utils/logger";
import {
  validateBoolean,
  validateDate,
  validateGeolocation,
} from "../utils/validator";

const DATE_FORMAT = "YYYY-MM-DD";

/**
 * Get trendings from Google Trends for the last 30 days
 *
 * @param geolocation The geolocation to fetch trendings from
 * @param extended If true, returns the full results instead of just the trending searches titles
 *
 * @returns Trendings for the last 30 days
 */
export const getTrendings = async (req: Request, res: Response) => {
  try {
    const geo = validateGeolocation(req.query.geolocation);
    const extended = validateBoolean(req.query.extended);

    logger.info(
      `[trendings] ip=${req.ip} user=${res.locals.user?.name ?? "anonymous"} geo=${geo} range=last30days`
    );

    // Fetch trendings for the last 30 days in parallel and combine results safely
    const nestedResults = await Promise.all(
      Array.from({ length: 30 }, (_, i) => {
        const date = dayjs().subtract(i, "day").format(DATE_FORMAT);
        return fetchTrendings(geo, date);
      })
    );

    const results = nestedResults.flat();

    if (extended) {
      return res.json({
        results: results.sort((a, b) => (a.date > b.date ? -1 : 1)),
      });
    }

    return res.json({
      results: results.flatMap((r) =>
        r.trendingSearches.map((t) => t.title.query)
      ),
    });
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Unknown error";
    logger.warn(`[trendings] validation error from ${req.ip}: ${detail}`);
    return res.status(400).json({ message: "Invalid request" });
  }
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
  try {
    const geo = validateGeolocation(req.query.geolocation);
    const date = validateDate(req.query.date, DATE_FORMAT);
    const extended = validateBoolean(req.query.extended);

    logger.info(
      `[trending] ip=${req.ip} user=${res.locals.user?.name ?? "anonymous"} geo=${geo} date=${date}`
    );

    const results = await fetchTrendings(geo, date);

    // If extended is true, return the full results
    if (extended) {
      return res.json({ results });
    }

    // Otherwise, return only the trending searches titles
    return res.json({
      results: results.flatMap((r) =>
        r.trendingSearches.map((t) => t.title.query)
      ),
    });
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Unknown error";
    logger.warn(`[trending] validation error from ${req.ip}: ${detail}`);
    return res.status(400).json({ message: "Invalid request" });
  }
};
