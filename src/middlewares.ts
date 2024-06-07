import express from "express";
import cors from "cors";
import { name, version } from "../package.json";

const middlewares = (app: express.Application) => {
    app.use(cors());
    app.use(express.json());
    
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
        res.header("Access-Control-Allow-Methods", "GET");
        return res.status(200).json({});
      }
      // set the client
      res.header("Client", `${name}:${version}`);
      next();
    });
 
}

export default middlewares;