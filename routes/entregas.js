require("dotenv")
var express = require("express");
var router = express.Router();
let handlePromise = require("../helpers/handlePromise");
const bcryptjs = require("bcryptjs");
let entregas = require("../models/entregas");
const AWS = require('aws-sdk');
const bluebird = require('bluebird');
const multer = require('multer');
let users = require("../models/users");

// configure the keys for accessing AWS
AWS.config.update({
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
});

// configure AWS to work with promises
AWS.config.setPromisesDependency(bluebird);
// create S3 instance
var storage = multer.memoryStorage();
var upload = multer({ storage: storage });

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
    handlePromise(req, res, entregas.getAllType('attendance', active));

});

router.get("/evidence", validatePermission(3), function (req, res) {
    let active = req.query.active;
    handlePromise(req, res, entregas.getAllType('evidence', active));
});

router.get("/misEntregas", (req, res) => {
    handlePromise(req, res, entregas.getEntregasByUserId(req.user._id));
});
router.get("/misEntregas/attendance", (req, res) => {
    handlePromise(req, res, entregas.getEntregasTypeByUserId(req.user._id, 'attendance'));
});
router.get("/misEntregas/evidence", (req, res) => {
    handlePromise(req, res, entregas.getEntregasTypeByUserId(req.user._id, 'evidence'));
});

router.post("/", (req, res) => {
    let { link, file, date, accepted, entrega_type } = req.body;
    
    if (!entrega_type) 
    {
        res.statusMessage = "Parameter missing in the body of the request.";
        return res.status(406).end();
    }
    users
        .getUserById(req.user._id)
        .then((response) => {
           let user = response._id
           if (entrega_type === 'evidence') {
            if(!file){
                res.statusMessage = "You need to send the file in the body of the request.";
                return res.status(406).end();
            }
            const s3bucket = new AWS.S3();
    
            var params = {
                Bucket: process.env.S3_BUCKET,
                Key: file.originalname,
                Body: file.buffer,
                ContentType: file.mimetype,
                ACL: 'public-read',
            };
            s3bucket.upload(params, function (err, data) {
                if (err) {
                    res.status(500).json({ error: true, Message: err });
                } else {
                    let newEntrega = {
                        user,
                        link: data.data.location,
                        date: new Date(),
                        accepted: false,
                        entrega_type,
                    };            
                    handlePromise(req, res, entregas.createEntrega(newEntrega));
                }
            });
        }
        else {
            if(!link){
                res.statusMessage = "Link missing in the body of the request.";
                return res.status(406).end();
            }
            let newEntrega = {
                user,
                link,
                date: new Date(),
                accepted: false,
                entrega_type,
            };    
            handlePromise(req, res, entregas.createEntrega(newEntrega));
        }    
          })
          .catch((err) => {
            res.statusMessage = err.message;
            return res.status(400).end();
          });  
    
});

router.patch("/", (req, res) => {
    let {
        _id,
        link,
        date,
        entrega_type,
        accepted,
    } = req.body;

    //user = req.user._id

    if (!_id) {
        res.statusMessage = "Missing '_id'";
        return res.status(400).end();
    }

    let newEntrega = {
        _id: _id,
    };

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
router.delete("/All", (req, res) => {
    handlePromise(req, res, entregas.deleteAll());
    
});

module.exports = router;