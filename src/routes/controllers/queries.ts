import { Router, Request, Response } from "express";
import {
  fetchSuggestions,
  questions,
  prepositions,
  comparisons,
} from "../../services/suggestions";
import { Queries } from "../../types/Queries";
import { withAuth } from "../../utils/basicAuth";
import { apiPaths } from "../../utils/paths";

const queryRoute = Router();

/**
 * Get suggestions for a specific query
 * 
 * @param q The query to fetch suggestions for
 * 
 * @returns Suggestions for the specified query
 */
queryRoute.get(
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

export default queryRoute;