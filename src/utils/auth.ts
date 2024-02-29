import basicAuth from "express-basic-auth";
import dotenv from "dotenv";

dotenv.config();

const username = process.env.ADMIN_USERNAME;
const password = process.env.ADMIN_PASSWORD;

export const withAuth = basicAuth({
  users: { [username]: password },
  unauthorizedResponse: { message: "Unauthorized" },
});
