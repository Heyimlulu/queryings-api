import express, { Request, Response, NextFunction } from "express";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import cors from "cors";
import basicAuth from "express-basic-auth";
import dotenv from "dotenv";
import typeDefs from "./graphql/schema";
import resolvers from "./graphql/resolvers";
import apiRoute from "./routes/api";
import { SharedContext } from "./graphql/context";
import { logger } from "./utils/logger";

dotenv.config();

const startApolloServer = async () => {
  const app = express();
  const server = new ApolloServer<SharedContext>({ typeDefs, resolvers });
  const port = process.env.PORT || 8080;
  const adminPassword = process.env.ADMIN_PASSWORD;

  await server.start();

  app.use(cors());
  app.use(express.json());
  app.use(
    basicAuth({ users: { qryAdmin: adminPassword }, challenge: true }),
    (req: basicAuth.IBasicAuthedRequest, res: Response, next: NextFunction) => {
      if (req.path === "/api/ping") return next();
      if (req.auth?.user !== "qryAdmin" || req.auth?.password !== adminPassword)
        return res.status(401).json({ message: "Unauthorized" });
      next();
    }
  );
  app.use("/api", apiRoute);

  app.use(
    "/graphql",
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
