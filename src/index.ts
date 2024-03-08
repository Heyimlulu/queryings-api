import express from "express";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import cors from "cors";
import typeDefs from "./routes/graphql/schema";
import resolvers from "./routes/graphql/resolvers";
import apiRoute from "./routes/default/api";
import { SharedContext } from "./routes/graphql/context";
import { logger } from "./utils/logger";
import { withAuth } from "./utils/basicAuth";
import { apiPaths } from "./utils/paths";

const startApolloServer = async () => {
  const app = express();
  const server = new ApolloServer<SharedContext>({ typeDefs, resolvers });
  const port = process.env.PORT || 8080;

  await server.start();

  app.all("/*", (req, res, next) => {
    const path = req.path;
    const allowedPaths = Object.values(apiPaths);
    if (!allowedPaths.includes(path)) {
      return res.status(404).json({ message: "Not Found" });
    }
    return next();
  });
  app.use(cors());
  app.use(express.json());
  app.use("/", apiRoute);
  app.use(
    apiPaths.graphql,
    withAuth,
    cors<cors.CorsRequest>(),
    express.json(),
    expressMiddleware(server, {
      context: async ({ req }) => ({
        client: req.headers["x-client-referer"],
      }),
    })
  );

  app.listen(port, () => {
    logger.info(`⭐ Server listening at http://localhost:${port}`);
    logger.info(`🚀 GraphQL server ready at http://localhost:${port}/graphql`);
  });
};

startApolloServer();
