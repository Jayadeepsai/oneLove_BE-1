const express = require('express');
const items = express.Router();
const bodyParser = require('body-parser');

const db = require('../../dbConnection')

items.use(express.json()); // To parse JSON bodies
items.use(express.urlencoded({ extended: true })); // To parse URL-encoded bodies



items.post('/item-entry', (req, res) => {                

    const {itemType, itemName, itemPrice, itemDescription} = req.body;

    const sql = `INSERT INTO onelove.items (itemType, itemName, itemPrice, itemDescription) 
    VALUES ("${itemType}","${itemName}","${itemPrice}","${itemDescription}")`;

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



items.get('/itemsData', (req, res) => {                       //Fetching all the Items data
    const sql = `SELECT * FROM onelove.items`;
    db.query(sql, function (err, results, fields) {
        if (!err) {
            var data = JSON.parse(JSON.stringify(results));
            console.log(data)
            res.status(200).json({
                itemsData: data,
                message: "All Items Data"
            })
        } else {
            res.status(400).json({
                message: err
            })
        }
    });
});


items.post('/itemDataByCondition', (req, res) => {                //Fetching item data by passing condition

    const item_id = req.body.item_id;
    const sql = `SELECT * FROM onelove.items WHERE item_id = ?`;
    db.query(sql, item_id, function (err, result, fields) {
        if (!err) {
            var data = JSON.parse(JSON.stringify(result));
            console.log(data)
            res.status(200).json({
                itemData: data,
                message: "Item Data"
            })
        } else {
            res.status(400).json({
                message: err
            })
        }
    })
});


module.exports = items;