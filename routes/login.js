const router = require("express").Router({ mergeParams: true });
const bcryptjs = require("bcryptjs");
const jwt = require("jsonwebtoken");
let users = require("../models/users");
const { SECRET_TOKEN } = require("../config");

router.post("/", (req, res) => {
  let { email, password } = req.body;

  if (!email || !password) {
    res.statusMessage = "Parameter missing in the body of the request.";
    return res.status(400).end();
  }

  users
    .getUserByEmail(email)
    .then((user) => {
      if (user) {
        bcryptjs
          .compare(password, user.password)
          .then((result) => {
            if (result) {
              if (result.active === false) {
                res.statusMessage = "User is not active";
                return res.status(401).end();
              }
              let userData = {
                _id: user._id,
              };
              jwt.sign(
                userData,
                SECRET_TOKEN,
                { expiresIn: "1d" },
                (err, token) => {
                  if (err) {
                    res.statusMessage = "Something went wrong generating token";
                    return res.status(400).end();
                  }

                  let formatUser = {
                    _id: user._id,
                    full_name: user.full_name,
                    email: user.email,
                    user_type: user.user_type,
                  };

                  return res
                    .status(200)
                    .json({ sessiontoken: token, user: formatUser });
                }
              );
            } else {
              throw new Error("Invalid credentials");
            }
          })
          .catch((err) => {
            res.statusMessage = err.message;
            return res.status(400).end();
          });
      } else {
        throw new Error("User doesn't exists");
      }
    })
    .catch((err) => {
      res.statusMessage = err.message;
      return res.status(400).end();
    });
});

module.exports = router;
