import { Request, Response } from "express";
import {
  fetchSuggestions,
  questions,
  prepositions,
  comparisons,
} from "../services/suggestions";
import { validateQuery } from "../utils/validator";
import { logger } from "../utils/logger";
import { Queries } from "../types/Queries";

/**
 * Get suggestions for a specific query
 *
 * @param q The query to fetch suggestions for
 *
 * @returns Suggestions for the specified query
 */
export const getQueries = async (req: Request, res: Response) => {
  try {
    const query = validateQuery(req.query.q);
    logger.info(`[queries] ip=${req.ip} user=${res.locals.user?.name ?? "anonymous"} q="${query}"`);

    const results: Queries = {
      name: query,
      children: {
        questions: {},
        prepositions: {},
        comparisons: {},
        alphabeticals: {},
      },
    };

    await Promise.all([
      ...questions.map((question) =>
        fetchSuggestions(query, question + " ").then((data) => {
          results.children.questions[question] = data;
        })
      ),
      ...prepositions.map((preposition) =>
        fetchSuggestions(query + " " + preposition).then((data) => {
          results.children.prepositions[preposition] = data;
        })
      ),
      ...comparisons.map((comparison) =>
        fetchSuggestions(query + " " + comparison).then((data) => {
          results.children.comparisons[comparison] = data;
        })
      ),
      ..."abcdefghijklmnopqrstuvwxyz*".split("").map((letter) =>
        fetchSuggestions(query + " " + letter).then((data) => {
          results.children.alphabeticals[letter] = data;
        })
      ),
    ]);

    return res.json(results);
  } catch (error) {
    const detail = error instanceof Error ? error.message : "Unknown error";
    logger.warn(`[queries] validation error from ${req.ip}: ${detail}`);
    return res.status(400).json({ message: "Invalid request" });
  }
};
