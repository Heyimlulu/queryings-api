const { Router } = require("express");
const {
  fetchSuggestions,
  questions,
  prepositions,
  comparisons,
} = require("../services");

const router = Router();

router.get("/ping", (req, res) => {
  res.json({ message: "Server is up and running!" });
});

router.get("/get-queries", async (req, res) => {
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
    res.status(400).json({ error: "Missing query parameter" });
  }
});

module.exports = router;
