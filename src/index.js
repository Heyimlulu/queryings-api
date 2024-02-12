const express = require("express");
const { ApolloServer } = require("apollo-server-express");
const { default: slowDown } = require("express-slow-down");
const typeDefs = require("./graphql/schema");
const resolvers = require("./graphql/resolvers");
const router = require("./routes/route");

async function startApolloServer(typeDefs, resolvers) {
  const app = express();
  const server = new ApolloServer({ typeDefs, resolvers });
  const port = process.env.PORT || 8080;

  await server.start();
  server.applyMiddleware({ app });

  const limitMiddleware = slowDown({
    windowMs: 15 * 60 * 1000, // 15 minutes
    delayAfter: 3, // 3 requests per 15 minutes
    delayMs: (hits) => hits * hits * 1000, // begin adding 1000ms of delay per request: (ie. 4 * 4 * 1000 = 16000ms) (16 seconds)
  });

  app.use(limitMiddleware);
  app.use(express.json()); // Middleware to parse JSON bodies
  app.use("/api", router);

  app.listen(port, () => {
    console.log(`⭐ Server listening at http://localhost:${port}`);
    console.log(
      `🚀 GraphQL server ready at http://localhost:${port}${server.graphqlPath}`
    );
  });
}

startApolloServer(typeDefs, resolvers);
