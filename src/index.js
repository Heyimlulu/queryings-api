const express = require("express");
const { ApolloServer } = require("apollo-server-express");
const { default: rateLimit } = require("express-rate-limit");
const requestIp = require("request-ip");
const typeDefs = require("./graphql/schema");
const resolvers = require("./graphql/resolvers");
const router = require("./routes/route");

async function startApolloServer(typeDefs, resolvers) {
  const app = express();
  const server = new ApolloServer({ typeDefs, resolvers });
  const port = process.env.PORT || 8080;

  await server.start();
  server.applyMiddleware({ app });

  const limitMiddleware = rateLimit({
    windowMs: 30 * 60 * 1000, // 30 minutes
    max: 3,
    message: (req, res) => {
      return res.json({
        status: 429,
        message: "Too many requests, please try again later.",
      });
    },
    keyGenerator: function (req) {
      return req.clientIp;
    },
    skip: (req) => {
      const { clientIp, path } = req;
      if (clientIp === "::1" || path === "/api/ping") {
        return true;
      }
      return false;
    },
  });

  app.use(requestIp.mw());
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
