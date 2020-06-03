var express = require("express");
var router = express.Router();
let handlePromise = require("../helpers/handlePromise");
const bcryptjs = require("bcryptjs");
let entregas = require("../models/entregas");

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

/* GET entregas listing. */
router.get("/", validatePermission(3), function (req, res) {
  let active = req.query.active;
  handlePromise(req, res, entregas.getAllEntregas(active));
});

router.get("/attendance", validatePermission(3), function (req, res) {
  let active = req.query.active;
  handlePromise(req, res, entregas.getAllType(1, active));
});

router.get("/evidence", validatePermission(3), function (req, res) {
  let active = req.query.active;
  handlePromise(req, res, entregas.getAllType(2, active));
});

router.get("/misEntregas", (req, res) => {
  handlePromise(req, res, entregas.getEntregaByUserId(req.user._id));
});

router.post("/", (req, res) => {
  let { weekId, link, date, accepted, entrega_type } = req.body;
  if (
    (!weekId, !link || !date || !accepted)
  ) {
    res.statusMessage = "Parameter missing in the body of the request.";
    return res.status(406).end();
  }

  let newEntrega = {
    weekId,
    user: req.user._id,
    link,
    date,
    accepted,
    entrega_type,
  };

  handlePromise(req, res, entregas.createEntrega(newEntrega));
});

router.patch("/", (req, res) => {
  let {
    _id,
    weekId,
    link,
    date,
    entrega_type,
    accepted,
  } = req.body;

  user = re.user._id

  if (!_id) {
    res.statusMessage = "Missing '_id'";
    return res.status(400).end();
  }

  let newEntrega = {
    _id: _id,
  };

  if (weekId) {
    newEntrega.weekId = weekId;
  }

  if (user) {
    newEntrega.user = user;
  }

  if (link) {
    newEntrega.link = link;
  }

  if (date) {
    newEntrega.date = date;
  }

  if (entrega_type) {
    newEntrega.entrega_type = entrega_type;
  }

  if (typeof accepted === "boolean") {
    newEntrega.accepted = accepted;
  }
  handlePromise(req, res, entregas.updateEntrega(_id, newEntrega));

});

router.delete("/", (req, res) => {
  let { _id } = req.body;
  if (!_id) {
    res.statusMessage = "Missing '_id' parameter in body";
    return res.status(400).end();
  } else {
    handlePromise(req, res, entregas.deleteEntrega(_id));
  }
});

module.exports = router;