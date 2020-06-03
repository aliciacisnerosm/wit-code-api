const methodPermissions = {
  PATCH: 1,
  GET: 1,
  POST: 1,
  DELETE: 2,
};
// Use 4 for superuser --> queries return all fields

module.exports = (req, res, next) => {
  if (req.params.route === "login") {
    next();
  } else {
    if (!req.user) {
      res.statusMessage = "Missing permissions";
      return res.status(400).end();
    }

    if (req.user.user_type >= methodPermissions[req.method]) {
      // VALID PERMISSIONS
      next();
    } else {
      res.statusMessage = "Not enough permissions";
      return res.status(401).end();
    }
  }
};
