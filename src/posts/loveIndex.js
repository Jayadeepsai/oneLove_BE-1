const express = require('express');
const loveIndx = express.Router();
const bodyParser = require('body-parser');

const db = require('../../dbConnection')

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


loveIndx.get('/loveIndexDataByCondition/:love_index_id', (req, res) => {                //Fetching data based on id
    const love_index_id = req.params.love_index_id;
    const sql = `SELECT * FROM onelove.love_index WHERE love_index_id = ?`;

    db.query(sql, love_index_id, function (err, result, fields) {
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



loveIndx.put('/updateloveIndexData/:love_index_id', (req, res) => {           //Updating data in vaccination table based on vaccination_id
    const love_index_id = req.params.love_index_id;

    const {love_tags, share, hoots} = req.body;

    // Create the SQL query for the update operation
    let sql = 'UPDATE onelove.love_index SET';

    // Initialize an array to store the values for the query
    const values = [];

    // Append the fields to the query only if they are provided in the request body
    if (love_tags !== undefined) {
        sql += ' love_tags=?,';
        values.push(love_tags);
    }
    if (share !== undefined) {
        sql += ' share=?,';
        values.push(share);
    }
    if (hoots !== undefined) {
        sql += ' hoots=?,';
        values.push(hoots);
    }
   
    // Remove the trailing comma from the SQL query
    sql = sql.slice(0, -1);

    sql += ' WHERE love_index_id=?';
    values.push(love_index_id);

    // Execute the update query
    db.query(sql, values, (err, result) => {
        if (err) {
            console.error('Error updating data:', err.message);
            res.status(400).json({ message: 'Failed to update data.' });
        } else {
            console.log('Data updated successfully.');
            res.status(200).json({
                updatedData: result,
                message: 'Data updated successfully.',
            });
            console.log(result)
        }
    });
});



module.exports=loveIndx;