const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

dotenv.config();

const generateAccessToken = (username) => {
  return jwt.sign({ username }, process.env.TOKEN_SECRET, { expiresIn: 1800 });
};

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const accessToken = authHeader && authHeader.split(" ")[1];
  console.log(accessToken);
  if (accessToken === null) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  jwt.verify({ accessToken }, process.env.TOKEN_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: "Forbidden" });
    }
    req.user = user;
    next();
  });
};

module.exports = {
  generateAccessToken,
  authenticateToken,
};
