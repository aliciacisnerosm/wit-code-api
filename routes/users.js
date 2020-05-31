var express = require("express");
var router = express.Router();
let handlePromise = require("../helpers/handlePromise");
const bcryptjs = require("bcryptjs");
let users = require("../models/users");

let validatePermission = (requiredLevel) => {
  return (req, res, next) => {
    if (req.user.user_type >= requiredLevel) {
      next();
    } else {
      res.statusMessage = "Not enough permissions";
      return res.status(401).end();
    }
  };
};

/* GET users listing. */
router.get("/", validatePermission(3), function (req, res) {
  handlePromise(req, res, users.getAllUsers());
});

router.get("/tutor", validatePermission(2), function (req, res) {
  handlePromise(req, res, users.getAllType(1));
});

router.get("/coordinator", validatePermission(3), function (req, res) {
  handlePromise(req, res, users.getAllType(2));
});

router.get("/admin", validatePermission(3), function (req, res) {
  handlePromise(req, res, users.getAllType(3));
});

router.get("/myinfo", (req, res) => {
  handlePromise(req, res, users.getUserById(req.user._id));
});

router.post("/", (req, res) => {
  let { studentId, full_name, email, password, user_type, active } = req.body;
  if (
    (!studentId, !full_name || !email || !password || !user_type || !active)
  ) {
    res.statusMessage = "Parameter missing in the body of the request.";
    return res.status(406).end();
  }

  let sendUnauthorized = () => {
    res.statusMessage = "Unauthorized access";
    return res.status(401).end();
  };

  switch (req.user.user_type) {
    case 1:
      sendUnauthorized();
      break;
    case 2:
      if (user_type >= 2) sendUnauthorized();
      break;
    case 3:
      if (user_type >= 3) sendUnauthorized();
      break;
  }

  // REGEX test on color format
  var emailRegex = /^([\w-\.]+@([\w-]+\.)+[\w-]{2,4})?$/;
  if (!emailRegex.test(email)) {
    res.statusMessage = "Invalid 'email' format";
    return res.status(406).end();
  }

  let newUser = {
    studentId,
    full_name,
    email,
    password,
    user_type,
    active,
  };

  bcryptjs
    .hash(newUser.password, 10)
    .then((hashedPassword) => {
      newUser.password = hashedPassword;
      console.log(newUser);

      handlePromise(req, res, users.createUser(newUser));
    })
    .catch((err) => {
      throw new Error(err.message);
    });
});

router.patch("/", (req, res) => {
  let {
    _id,
    studentId,
    full_name,
    email,
    password,
    user_type,
    active,
  } = req.body;

  if (!_id) {
    res.statusMessage = "Missing '_id'";
    return res.status(400).end();
  }

  let newUser = {
    _id: _id,
  };

  if (studentId) {
    newUser.studentId = studentId;
  }

  if (full_name) {
    newUser.full_name = full_name;
  }

  if (email) {
    newUser.email = email;
  }

  if (password) {
    newUser.password = password;
  }

  if (user_type) {
    newUser.user_type = user_type;
  }

  if (typeof active === "boolean") {
    newUser.active = active;
  }

  if (password) {
    bcryptjs
      .hash(newUser.password, 10)
      .then((hashedPassword) => {
        newUser.password = hashedPassword;
        console.log(newUser);

        handlePromise(req, res, users.updateUser(_id, newUser));
      })
      .catch((err) => {
        throw new Error(err.message);
      });
  } else {
    console.log(newUser);
    handlePromise(req, res, users.updateUser(_id, newUser));
  }
});

router.delete("/", (req, res) => {
  let { _id } = req.body;
  if (!_id) {
    res.statusMessage = "Missing '_id' parameter in body";
    return res.status(400).end();
  } else {
    handlePromise(req, res, users.deleteUser(_id));
  }
});

module.exports = router;
