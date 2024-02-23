import { Router, Request, Response } from "express";
import {
  fetchSuggestions,
  questions,
  prepositions,
  comparisons,
} from "../services";
import { Queries } from "../types/Queries";

const router = Router();

router.get("/ping", (req: Request, res: Response) =>
  res.json({ message: "Server is up and running!" })
);

router.get("/get-queries", async (req: Request, res: Response) => {
  const query = req.query.q;

  if (!query)
    return res.status(400).json({ message: "Missing query parameter" });
  if (query.toString().length < 3)
    return res.status(400).json({
      message: "query parameter should be at least 3 characters long",
    });
  if (query.toString().length > 15)
    return res.status(400).json({
      message: "query parameter should be at most 15 characters long",
    });

  if (!req.headers["x-client-referer"])
    return res.status(400).json({ message: "Missing x-client-referer header" });
  if (req.headers["x-client-referer"] !== "queryings-app")
    return res.status(401).json({ message: "Unauthorized client" });

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
});

export default router;
