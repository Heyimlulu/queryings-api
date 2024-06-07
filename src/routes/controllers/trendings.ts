import dayjs from "dayjs";
import { Router, Request, Response } from "express";
import { withAuth } from "../../utils/basicAuth";
import { apiPaths } from "../../utils/paths";
import { TrendingsResult } from "../../types/Trending";
import { fetchTrendings } from "../../services/trendings";

const trendRoute = Router();

/**
 * Get trendings from Google Trends for the last 30 days
 * 
 * @param geolocation The geolocation to fetch trendings from
 * @param extended If true, returns the full results instead of just the trending searches titles
 * 
 * @returns Trendings for the last 30 days
 */
trendRoute.get(apiPaths.getTrendings, withAuth, async (req: Request, res: Response) => {
  const { geolocation, extended } = req.query;

  const results: TrendingsResult[] = [];

  // Fetch trendings for the last 30 days
  await Promise.all(
    Array.from({ length: 30 }, (_, i) =>
      fetchTrendings(
        geolocation as string,
        dayjs().subtract(i, "day").format("YYYY-MM-DD")
      ).then((trendings) => {
        results.push(...trendings);
      })
    )
  );

  if (extended == "true") {
    return res.json({
      results: results.sort((a, b) => (a.date > b.date ? -1 : 1)),
    });
  }

  return res.json({
    results: results.flatMap((r) =>
      r.trendingSearches.map((t) => t.title.query)
    ),
  });
});

/**
 * Get trendings from Google Trends for a specific date
 * 
 * @param geolocation The geolocation to fetch trendings from
 * @param date The date to fetch trendings for
 * @param extended If true, returns the full results instead of just the trending searches titles
 * 
 * @returns Trendings for the specified date
 */
trendRoute.get(apiPaths.getTrending, withAuth, async (req: Request, res: Response) => {
  const { geolocation, date, extended } = req.query;
  const results = await fetchTrendings(geolocation as string, date as string);

  // If extended is true, return the full results
  if (extended == "true") {
    return res.json({ results });
  }

  // Otherwise, return only the trending searches titles
  return res.json({
    results: results.flatMap((r) =>
      r.trendingSearches.map((t) => t.title.query)
    ),
  });
});

export default trendRoute;
