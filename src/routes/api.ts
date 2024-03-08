import dayjs from "dayjs";
import { Router, Request, Response } from "express";
import {
  fetchSuggestions,
  questions,
  prepositions,
  comparisons,
  fetchTrendings,
} from "../services";
import { Queries } from "../types/Queries";
import { withAuth } from "../utils/auth";
import { apiPaths } from "../utils/paths";
import { TrendingsResult } from "../types/Trending";

const apiRoute = Router();

apiRoute.get(apiPaths.ping, (_, res: Response) =>
  res.json({ message: "Server is up and running!" })
);

apiRoute.get(
  apiPaths.getQueries,
  withAuth,
  async (req: Request, res: Response) => {
    const query = req.query.q;

    if (!query)
      return res.status(400).json({ message: "Missing query parameter" });
    if (query.toString().length < 3 || query.toString().length > 25)
      return res.status(400).json({
        message: "Query parameter must be between 3 and 25 characters",
      });

    const results: Queries = {
      name: query.toString(),
      children: {
        questions: {},
        prepositions: {},
        comparisons: {},
        alphabeticals: {},
      },
    };

    await Promise.all([
      ...questions.map((question) =>
        fetchSuggestions(query.toString(), question + " ").then((data) => {
          results.children.questions[question] = data;
        })
      ),
      ...prepositions.map((preposition) =>
        fetchSuggestions(query.toString() + " " + preposition).then((data) => {
          results.children.prepositions[preposition] = data;
        })
      ),
      ...comparisons.map((comparison) =>
        fetchSuggestions(query.toString() + " " + comparison).then((data) => {
          results.children.comparisons[comparison] = data;
        })
      ),
      ..."abcdefghijklmnopqrstuvwxyz*".split("").map((letter) =>
        fetchSuggestions(query.toString() + " " + letter).then((data) => {
          results.children.alphabeticals[letter] = data;
        })
      ),
    ]);

    return res.json(results);
  }
);

apiRoute.get(apiPaths.getTrendings, async (req: Request, res: Response) => {
  const { geolocation, extended } = req.query;

  const results: TrendingsResult[] = [];

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
      results: results.flatMap((r) =>
        r.trendingSearches.map((t) => t.title.query)
      ),
    });
  }

  return res.json({
    results: results.sort((a, b) => (a.date > b.date ? -1 : 1)),
  });
});

apiRoute.get(apiPaths.getTrending, async (req: Request, res: Response) => {
  const { geolocation, date, extended } = req.query;
  const results = await fetchTrendings(geolocation as string, date as string);

  if (extended == "true") {
    return res.json({
      results: results.flatMap((r) =>
        r.trendingSearches.map((t) => t.title.query)
      ),
    });
  }
  return res.json({ results });
});

export default apiRoute;
