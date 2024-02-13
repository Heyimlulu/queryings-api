const { Router } = require("express");
const {
  fetchSuggestions,
  questions,
  prepositions,
  comparisons,
} = require("../services");
const { authenticateToken } = require("../security");

const apiRoute = Router();

apiRoute.get("/ping", (req, res) => {
  res.json({ message: "Server is up and running!" });
});

apiRoute.get("/get-queries", async (req, res, next) => {
  // authenticateToken(req, res, next);

  if (
    !req.headers["x-client-app"] ||
    req.headers["x-client-app"] !== "queryings-app"
  ) {
    return res.status(400).json({ message: "Missing header" });
  }

  let query = req.query.q;

  const results = {
    name: query,
    children: {
      questions: {},
      prepositions: {},
      comparisons: {},
      alphabeticals: {},
    },
  };

  if (query) {
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

    res.json(results);
  } else {
    res.status(400).json({ message: "Missing query parameter" });
  }
});

module.exports = apiRoute;
