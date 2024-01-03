const jwt = require("jsonwebtoken");
const config = require("config");

const auth = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).send("Denied access. You need to login");
  }

  jwt.verify(token, config.get("jwtSecret"), (err, user) => {
    if (err) {
      return res.status(401).send("Invalid token. You need to login");
    }
    req.user = user;
  });

  next();
};

module.exports = auth;
