const express = require("express");
const { ApolloServer } = require("apollo-server-express");
const typeDefs = require("./graphql/schema");
const resolvers = require("./graphql/resolvers");
const {
  fetchSuggestions,
  questions,
  prepositions,
  comparisons,
} = require("./function");
const port = 8080;

async function startApolloServer(typeDefs, resolvers) {
  const app = express();
  const server = new ApolloServer({ typeDefs, resolvers });

  await server.start();
  server.applyMiddleware({ app });

  app.use(express.json()); // Middleware to parse JSON bodies

  app.get("/api/query", async (req, res) => {
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

  app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`);
  });
}

startApolloServer(typeDefs, resolvers);
