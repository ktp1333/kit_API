var MongoClient = require('mongodb').MongoClient;
var ObjectId = require('mongodb').ObjectId;
var moment = require('moment');
var mongoose = require('mongoose');
var async = require('async');
var md5 = require('md5');
var dbpath = require('../config/db').dbpath;
exports.find_site = function (req, res) {
    MongoClient.connect(dbpath, (connectErr, db) => {
        var dbo = db;
        dbo.collection("organisations").aggregate([
            {
                "$match": {
                    "_id": mongoose.Types.ObjectId(req.body.orguid),
                    "statusflag": "A",
                }
            },
        ]).toArray((err, docs) => {
            console.log(docs);
            res.status(200).json({ data: docs });
            db.close();
        });
    });
}
exports.opd = function (req, res) {

    var visitdate = req.body.visitdate;
    var fromdate = moment(req.body.fromdate).startOf('day').toISOString();
    var todate = moment(req.body.todate).endOf('day').toISOString();

    MongoClient.connect(dbpath, (connectErr, db) => {
        var dbo = db;
        dbo.collection("patientvisits").aggregate([
            {
                "$match": {
                    "orguid": mongoose.Types.ObjectId(req.body.orguid),
                    "statusflag": "A",
                    "startdate": {
                        $gte: new Date(fromdate),
                        $lte: new Date(todate)
                    }
                }
            },
            {
                "$lookup": {
                    "from": "referencevalues",
                    "localField": "entypeuid",
                    "foreignField": "_id",
                    "as": "encounter"
                }
            },
            {
                "$match": {
                    "encounter.relatedvalue": "OPD"
                }
            },
            {
                "$group": {
                    "_id": {
                        "year": { "$year": [{ "$add": ["$startdate", 420 * 60 * 1000] }] },
                        "month": { "$month": [{ "$add": ["$startdate", 420 * 60 * 1000] }] },
                        "day": { "$dayOfMonth": { "$add": ["$startdate", 420 * 60 * 1000] } }

                    },
                    "first": { "$min": "$startdate" },
                    "count": { "$sum": 1 }
                }
            },
            {
                "$project": {
                    "_id": 0,
                    "visitdate": "$first",
                    "count": "$count"
                }
            },
            {
                "$sort": {
                    "visitdate": 1.0
                }
            }
        ]).toArray((err, docs) => {
            console.log(docs);
            res.status(200).json({ results: docs });
            db.close();
        });
    });
}
exports.ipd = function (req, res) {
    var orguid = req.body.orguid;
    MongoClient.connect(dbpath, (connectErr, db) => {
        var dbo = db;
        dbo.collection("patientvisits").aggregate([
            {
                "$match": {
                    "orguid": mongoose.Types.ObjectId(req.body.orguid),
                    "statusflag": "A",
                    "enddate": { $eq: null }
                }
            },
            {
                "$lookup": {
                    "from": "referencevalues",
                    "localField": "entypeuid",
                    "foreignField": "_id",
                    "as": "entypeuid"
                }
            },
            { "$unwind": "$entypeuid" },
            {
                "$match": {
                    "entypeuid.valuecode": "ENTYPE2"
                }
            },
            { "$unwind": "$bedoccupancy" },
            {
                "$lookup": {
                    "from": "wards",
                    "localField": "bedoccupancy.warduid",
                    "foreignField": "_id",
                    "as": "bedoccupancy.warduid"
                }
            },
            {
                "$unwind": "$bedoccupancy.warduid"
            },
            {
                "$match": {
                    $and: [
                        { "bedoccupancy.isactive": true },
                        { "bedoccupancy.enddate": null }
                    ]
                }
            },
            {
                "$lookup": {
                    "from": "beds",
                    "localField": "bedoccupancy.beduid",
                    "foreignField": "_id",
                    "as": "bedoccupancy.beduid"
                }
            },
            {
                "$unwind": "$bedoccupancy.beduid"
            },
            {
                "$match":
                    { "bedoccupancy.beduid.bedcategoryuid": { $ne: mongoose.Types.ObjectId("57f4aa78e311c733215e6580") } },

            },
            {
                "$match": {
                    $or: [
                        { "bedoccupancy.beduid.activeto": null },
                        { "bedoccupancy.beduid.activeto": { $gte: new Date() } }
                    ]
                }
            },
            {
                "$group": {
                    "_id": { warduid: "$bedoccupancy.warduid._id", "ward": "$bedoccupancy.warduid.name" },
                    "count": { $sum: 1 }
                }
            },
            {
                "$project": {
                    "_id": 0,
                    "ward": "$_id.ward",
                    "count": "$count"
                }
            }
        ]).toArray((err, docs) => {
            console.log(docs);
            res.status(200).json({ results: docs });
        });
    });
}
exports.login = function (req, res) {
    var password = md5(req.body.password);
    MongoClient.connect(dbpath, (connectErr, db) => {
        var dbo = db;
        dbo.collection("users").aggregate([{
            $match: {
                "statusflag": "A",
                "activeto": null,
                "loginid": req.body.loginid,
                "password": password,
            }
        }, ]).toArray((err, docs) => {
            console.log(docs);
            res.status(200).json({
                users: docs
            });
            db.close();
        });
    });
}
