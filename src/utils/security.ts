import crypto from "crypto";
import fs from "fs";
import path from "path";

export const generatePersonalAccessToken = (username: string) => {
  const token = crypto.createHash("sha256").update(username).digest("hex");
  const filepath = path.join(__dirname, "../data/tokens.txt");
  const file = fs.readFileSync(filepath, "utf-8");

  if (file.includes(`${username}:${token}`)) return token;
  fs.appendFileSync(filepath, `${username}:${token}\n`);

  return token;
};

export const verifyPersonalAccessToken = (authHeader: string) => {
  const tokenType = authHeader.split(" ")[0];
  const token = authHeader.split(" ")[1];
  const file = fs.readFileSync(
    path.join(__dirname, "../data/tokens.txt"),
    "utf-8"
  );

  if (!file.includes(token) || tokenType !== "QRY") return false;
  return true;
};
