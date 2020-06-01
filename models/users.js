const mongoose = require("mongoose");

const usersSchema = mongoose.Schema({
  studentId: {
    type: String,
    required: true,
    unique: true,
  },
  full_name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  user_type: {
    type: Number,
    required: true,
  },
  active: {
    type: Boolean,
    required: true,
  },
});

const modelName = "users";

const userModel = mongoose.model(modelName, usersSchema);

const validProjection = {
  _id: 1,
  studentId: 1,
  full_name: 1,
  email: 1,
  user_type: 1,
  active: 1,
};

function formatUser(user) {
  return {
    _id: user._id,
    studentId: user.studentId,
    full_name: user.full_name,
    email: user.email,
    user_type: user.user_type,
    active: user.active,
  };
}

const Users = {
  modelName: modelName,
  createUser: function (newUser) {
    return userModel
      .create(newUser)
      .then((user) => {
        return formatUser(user);
      })
      .catch((err) => {
        throw new Error(err.message);
      });
  },
  getUserById: function (user_id) {
    return userModel
      .findById(user_id, validProjection)
      .then((user) => {
        return user;
      })
      .catch((err) => {
        throw new Error(err.message);
      });
  },
  // This needs to return password --> Login
  getUserByEmail: function (email) {
    return userModel
      .findOne({ email: email })
      .then((user) => {
        return user;
      })
      .catch((err) => {
        throw new Error(err.message);
      });
  },
  getAllUsers: function (active = null) {
    let filter = {};
    if (active) filter.active = active;
    return userModel
      .find(filter, validProjection)
      .then((result) => {
        return result;
      })
      .catch((err) => {
        throw new Error(err.message);
      });
  },
  getAllType: function (type, active = null) {
    let filter = { user_type: type };
    if (active) filter.active = active;
    return userModel
      .find(filter, validProjection)
      .then((result) => {
        return result;
      })
      .catch((err) => {
        throw new Error(err.message);
      });
  },
  updateUser: function (user_id, newUser) {
    return userModel
      .update({ _id: user_id }, newUser)
      .then((result) => {
        console.log(result);

        if (result.n === 0) throw new Error("Not found");
        else return true;
      })
      .catch((err) => {
        throw new Error(err.message);
      });
  },
  deleteUser: function (user_id) {
    return userModel
      .deleteOne({ _id: user_id })
      .then((result) => {
        console.log(result);

        if (result.n === 0) throw new Error("Not found");
        else return true;
      })
      .catch((err) => {
        throw new Error(err.message);
      });
  },
};

module.exports = Users;
