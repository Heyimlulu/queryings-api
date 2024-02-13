const express = require("express");
const { ApolloServer } = require("apollo-server-express");
const { default: rateLimit } = require("express-rate-limit");
const requestIp = require("request-ip");
const typeDefs = require("./graphql/schema");
const resolvers = require("./graphql/resolvers");
const apiRoute = require("./routes/apiRoute");
const authRoute = require("./routes/authRoute");

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

  app.use((req, res, next) => {
    // set the CORS policy
    res.header("Access-Control-Allow-Origin", "*");
    // set the CORS headers
    res.header(
      "Access-Control-Allow-Headers",
      "origin, X-Requested-With,Content-Type,Accept, Authorization"
    );
    // set the CORS method headers
    if (req.method === "OPTIONS") {
      res.header("Access-Control-Allow-Methods", "POST,GET");
      return res.status(200).json({});
    }
    next();
  });
  app.use(requestIp.mw());
  app.use(limitMiddleware);
  app.use(express.json()); // Middleware to parse JSON bodies
  app.use("/api", apiRoute);
  app.use("/auth", authRoute);

  app.listen(port, () => {
    console.log(`⭐ Server listening at http://localhost:${port}`);
    console.log(
      `🚀 GraphQL server ready at http://localhost:${port}${server.graphqlPath}`
    );
  });
}

startApolloServer(typeDefs, resolvers);
