import express from "express";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import cors from "cors";

import defaultRoute from "./routes";
import v1Route from "./routes/v1";

import typeDefs from "./graphql/schema";
import resolvers from "./graphql/resolvers";
import { SharedContext } from "./graphql/context";

import { logger } from "./utils/logger";
import { withAuth } from "./utils/basicAuth";
import { apiPaths } from "./utils/paths";

import middlewares from "./middlewares";

import { name, version } from "../package.json";

const startApolloServer = async () => {
  const app = express();
  const server = new ApolloServer<SharedContext>({ typeDefs, resolvers });
  const port = process.env.PORT || 8080;

  const corsOptions: cors.CorsOptions = {
    origin: "*",
    methods: "GET,POST",
    allowedHeaders: "Content-Type,Authorization",
  };

  await server.start();

  app.use(cors(corsOptions));

  // Only allow the specified paths
  app.all("/*", (req, res, next) => {
    const path = req.path;
    const allowedPaths = Object.values(apiPaths);
    const versionedPathRegex = /^\/v\d+\/.*/;
    if (versionedPathRegex.test(path) || allowedPaths.includes(path)) {
      return next();
    }
    return res.status(404).json({ message: "Not Found" });
  });

  // Apply middlewares
  middlewares(app);

  // Express Routes
  app.use("/", defaultRoute);
  app.use("/v1", v1Route);

  // GraphQL Routes
  app.use(
    apiPaths.graphql,
    cors(corsOptions),
    express.json(),
    expressMiddleware(server, {
      context: async ({ req }) => ({
        Client: `${name}:${version}`,
      }),
    })
  );

  // Start the server
  app.listen(port, () => {
    logger.info(`⭐ Server listening at http://localhost:${port}`);
    logger.info(`🚀 GraphQL server ready at http://localhost:${port}/graphql`);
  });
};

startApolloServer();
