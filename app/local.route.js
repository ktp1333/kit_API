var MongoClient = require('mongodb').MongoClient;
var moment = require('moment');
var mongoose = require('mongoose');
var async = require('async');
var dbpath = 'mongodb://localhost:27017/kit';
exports.findconsent = function (req, res) {

    MongoClient.connect(dbpath, (connectErr, db) => {
        var dbo = db;
        dbo.collection("consent").find(
            {
                nationalid: req.body.nationalid,
                // orguid: req.body.orguid,
            }).toArray((err, docs) => {
                console.log(docs);
                res.status(200).json({ consent: docs });
                db.close();
            });
    });
}
exports.saveconsent = function (req, res) {
    var mongoose = require('mongoose')
    MongoClient.connect(dbpath, (connectErr, db) => {
        if (req.body != null) {
            var dbo = db;
            dbo.collection("consent").find(
                {
                    nationalid: req.body.nationalid,
                }).toArray((err, docs) => {
                    if (docs.length == 0) {
                        var newconsent = {};
                        newconsent.name = req.body.name;
                        newconsent.nationalid = req.body.nationalid;
                        newconsent.recdate = new Date();
                        newconsent.consentimage = req.body.consentimage;
                        dbo.collection("consent").save(newconsent, function (Innererr) {
                            if (!Innererr) {
                                res.status(200).json({ consent: newconsent });
                            } else {
                                res.status(500).json({ error: 'ERRORS.CREATEERROR' });
                            }
                        });

                    } else {
                        res.status(200).json({ save_co: null });
                    }

                });
        } else {
            res.status(500).json({ error: 'ERRORS.CODEINUSE' });
        }
    });
}

