import express from "express";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@as-integrations/express4";

import defaultRoute from "./routes";
import v1Route from "./routes/v1";

import typeDefs from "./graphql/schema";
import resolvers from "./graphql/resolvers";
import { SharedContext } from "./graphql/context";

import { logger } from "./utils/logger";
import { apiPaths } from "./utils/paths";

import middlewares from "./middlewares";

import { name, version } from "../package.json";
import { withAuth } from "./utils/basicAuth";

const startApolloServer = async () => {
  const app = express();
  const server = new ApolloServer<SharedContext>({ typeDefs, resolvers });
  const port = process.env.PORT || 8080;

  await server.start();

  // Apply middlewares
  middlewares(app);

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

  // Express Routes
  app.use("/", defaultRoute);
  app.use("/v1", v1Route);

  // GraphQL Routes
  // express.json() and CORS are already applied globally in middlewares().
  app.use(apiPaths.graphql, withAuth);
  app.use(
    apiPaths.graphql,
    expressMiddleware(server, {
      context: async ({ req, res }) => ({
        Client: `${name}:${version}`,
        ip: req.ip,
        user: res.locals.user,
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
