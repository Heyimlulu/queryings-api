const { Router } = require("express");
const { generateAccessToken } = require("../security");

const authRoute = Router();

authRoute.post("/generate-access-token", (req, res) => {
  const { username } = req.body;
  if (username) {
    const accessToken = generateAccessToken(username);
    res.json({ accessToken });
  } else {
    res.status(400).json({ message: "Missing username parameter" });
  }
});

module.exports = authRoute;
