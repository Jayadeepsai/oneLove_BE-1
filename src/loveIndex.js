const express = require('express');
const loveIndx = express.Router();
const bodyParser = require('body-parser');

const db = require('../dbConnection')

loveIndx.use(express.json()); // To parse JSON bodies
loveIndx.use(express.urlencoded({ extended: true })); // To parse URL-encoded bodies


loveIndx.post('/loveIndxEntry', (req, res) => {                 //post api for loveIndex entry

    const {love_tags, share, hoots} = req.body;

    const sql = `INSERT INTO onelove.love_index (love_tags, share, hoots) VALUES ("${love_tags}","${share}","${hoots}")`;

    db.query(sql, function (err, result) {
        if (!err) {
            var data = JSON.parse(JSON.stringify(result));
            console.log(data)
            res.status(200).json({
                data: data,
                message: "Data posted"
            })
        } else {
            res.status(400).json({
                message: err
            })
        }
    });
});


loveIndx.get('/loveIndexData', (req, res) => {                //Fetching all the loveIndex data
    const sql = `SELECT * FROM onelove.love_index`;
    db.query(sql, function (err, results, fields) {
        if (!err) {
            var data = JSON.parse(JSON.stringify(results));
            console.log(data)
            res.status(200).json({
                Data: data,
                message: "All loveIndex Data"
            })
        } else {
            res.status(400).json({
                message: err
            })
        }
    });
});


loveIndx.get('/loveIndexDataByCondition/:loveIndex_id', (req, res) => {
    const loveIndex_id = req.params.loveIndex_id;
    const sql = `SELECT * FROM onelove.love_index WHERE loveIndex_id = ?`;

    db.query(sql, loveIndex_id, function (err, result, fields) {
        if (!err) {
            var data = JSON.parse(JSON.stringify(result));
            console.log(data);
            res.status(200).json({
                loveIndexData: data,
                message: "loveIndex Data"
            });
        } else {
            res.status(400).json({
                message: err
            });
        }
    });
});
