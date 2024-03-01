import express from "express";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import cors from "cors";
import typeDefs from "./graphql/schema";
import resolvers from "./graphql/resolvers";
import apiRoute from "./routes/api";
import { SharedContext } from "./graphql/context";
import { logger } from "./utils/logger";
import { withAuth } from "./utils/auth";

const startApolloServer = async () => {
  const app = express();
  const server = new ApolloServer<SharedContext>({ typeDefs, resolvers });
  const port = process.env.PORT || 8080;

  await server.start();

  app.use(cors());
  app.use(express.json());
  app.use("/", apiRoute);
  app.use(
    "/graphql",
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
