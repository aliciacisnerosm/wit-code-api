const jwt = require("jsonwebtoken");
const { SECRET_TOKEN } = require("../config");
let users = require("../models/users");

module.exports = (req, res, next) => {
  let route = req.params.route;
  if (route == "login") {
    next();
  } else {
    const { sessiontoken } = req.headers;

    if (!sessiontoken) {
      res.statusMessage = "Missing header 'sessiontoken'";
      return res.status(401).end();
    }

    jwt.verify(sessiontoken, SECRET_TOKEN, (err, decoded) => {
      if (err) {
        res.statusMessage = "Session expired";
        return res.status(400).end();
      } else {
        users
          .getUserById(decoded._id)
          .then((user) => {
            if (!user) {
              res.statusMessage = "Invalid token";
              return res.status(400).end();
            } else {
              req.user = user;
              next();
            }
          })
          .catch((err) => {
            res.statusMessage = err.message;
            return res.status(400).end();
          });
      }
    });
  }
};
