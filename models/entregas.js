const mongoose = require("mongoose");

const entregasSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'users',
    required: true
  },
  link: {
    type: String,
    required: true,
    unique: true,
  },
  date: {
    type: Date,
    required: true,
  },
  accepted: {
    type: Boolean,
    required: true,
  },
  entrega_type: {
    type: String,
    required: true,
  },
});

const modelName = "entregas";

const entregaModel = mongoose.model(modelName, entregasSchema);

const validProjection = {
  _id: 1,
  user: 1,
  link: 1,
  date: 1,
  accepted: 1,
  entrega_type: 1,
};

function formatEntrega(entrega) {
  return {
    _id: entrega._id,
    user: entrega.user.full_name,
    link: entrega.link,
    date: entrega.date,
    accepted: entrega.accepted,
    entrega_type: entrega.type,
  };
}

const Entregas = {
  modelName: modelName,
  createEntrega: function (newEntrega) {
    return entregaModel
      .create(newEntrega)
      .then((entrega) => {
        return formatEntrega(entrega);
      })
      .catch((err) => {
        throw new Error(err.message);
      });
  },
  getEntregaById: function (entrega_id) {
    return entregaModel
      .findById(entrega_id, validProjection)
      .then((entrega) => {
        return entrega;
      })
      .catch((err) => {
        throw new Error(err.message);
      });
  },
  getEntregasByUserId: function (user_id) {
    return entregaModel
      .find({user: user_id}, validProjection)
      .populate('user', ['full_name', 'studentId'])
      .then((entrega) => {
        return entrega;
      })
      .catch((err) => {
        throw new Error(err.message);
      });
  },  
  getEntregasTypeByUserId: function (user_id, entrega_type) {
    return entregaModel
      .find([{'user.user_id': user_id}, entrega_type], validProjection)
      .then((entrega) => {
        return entrega;
      })
      .catch((err) => {
        throw new Error(err.message);
      });
  },
  getEntregaByUser: function (user) {
    return entregaModel
      .find($or[{ 'user.full_name': new RegExp(name, "i") }, { 'user.studentId': new RegExp(name, "i") }])
      .populate('user', ['full_name', 'studentId'])
      .then(usersComments => {
        return usersComments;
      })
      .catch(err => {
        return err;
      });
  },
  getAllEntregas: function (active = null) {
    let filter = {};
    if (active) filter.active = active;
    return entregaModel
      .find(filter, validProjection)
      .populate('user', ['full_name', 'studentId'])
      .then((result) => {
        return result;
      })
      .catch((err) => {
        throw new Error(err.message);
      });
  },
  getAllType: function (type, active = null) {
    let filter = { entrega_type: type };
    if (active) filter.active = active;
    return entregaModel
      .find(filter, validProjection)
      .populate('user', ['full_name', 'studentId'])
      .then((result) => {
        return result;
      })
      .catch((err) => {
        throw new Error(err.message);
      });
  },
  updateEntrega: function (entrega_id, newEntrega) {
    return entregaModel
      .update({ _id: entrega_id }, newEntrega)
      .then((result) => {
        console.log(result);

        if (result.n === 0) throw new Error("Not found");
        else return true;
      })
      .catch((err) => {
        throw new Error(err.message);
      });
  },
  deleteEntrega: function (entrega_id) {
    return entregaModel
      .deleteOne({ _id: entrega_id })
      .then((result) => {
        console.log(result);

        if (result.n === 0) throw new Error("Not found");
        else return true;
      })
      .catch((err) => {
        throw new Error(err.message);
      });
  },
  deleteAll: function (){
    mongoose.connection.db.dropCollection('entregas', function(err, result) {});
  }
};

module.exports = Entregas;