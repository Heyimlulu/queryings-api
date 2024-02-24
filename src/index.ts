import express from "express";
import { ApolloServer, BaseContext } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import cors from "cors";
import typeDefs from "./graphql/schema";
import resolvers from "./graphql/resolvers";
import routes from "./routes/routes";
import { SharedContext } from "./context";
import { logger } from "./logger";

const startApolloServer = async () => {
  const app = express();
  const server = new ApolloServer<SharedContext>({ typeDefs, resolvers });
  const port = process.env.PORT || 8080;

  await server.start();

  app.use(cors());
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
  app.use(express.json()); // Middleware to parse JSON bodies

  app.use("/api", routes);
  app.use(
    "/graphql",
    cors<cors.CorsRequest>(),
    express.json(),
    expressMiddleware(server, {
      context: async ({ req }) => ({ client: req.headers["x-client-referer"] }),
    })
  );

  app.listen(port, () => {
    logger.info(`⭐ Server listening at http://localhost:${port}`);
    logger.info(`🚀 GraphQL server ready at http://localhost:${port}/graphql`);
  });
};

startApolloServer();
