const express = require('express');
const address = express.Router();
const bodyParser = require('body-parser');

const connection = require('../../dbConnection');
const jwtMiddleware = require('../../jwtMiddleware');
const logger = require('../../logger');
const messages = require('../messages/constants');

address.use(express.json()); // To parse JSON bodies
address.use(express.urlencoded({ extended: true })); // To parse URL-encoded bodies



address.post('/address',jwtMiddleware.verifyToken, async (req, res) => {
    const { address, city, state, zip, country, landmark, address_type, lat_cords, lan_cords } = req.body;

    const sql = `INSERT INTO onelove.address (address, city, state, zip, country, landmark, address_type, lat_cords, lan_cords) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const values = [address, city, state, zip, country, landmark, address_type, lat_cords, lan_cords];

    try {
        // Execute the insert query
        const [result] = await db.query(sql, values);

        var data = JSON.parse(JSON.stringify(result));
        return res.status(200).json({
            data: data,
            message: messages.POST_SUCCESS
        });
    } catch (err) {
        return res.status(400).json({
            message: err
        });
    }
});




address.get('/address',jwtMiddleware.verifyToken, async (req, res) => {
    try {
        const sql = `SELECT * FROM onelove.address;`;
        const [data] = await connection.query(sql); // Use await with promise-based query

       return res.status(200).json({
            addressData: data, 
            message: messages.SUCCESS_MESSAGE
        });
    } catch (error) {
        logger.error('Error fetching address data:', error.message);
       return res.status(500).json({
            message: messages.FAILURE_MESSAGE
        });
    }
});




address.get('/address-id',jwtMiddleware.verifyToken, async (req, res) => {
    const address_id = req.query.address_id;

    try {
        if (!address_id) {
            return res.status(400).json({ message: messages.NO_DATA });
        }

        const sql = `SELECT * FROM onelove.address WHERE address_id = ?`;
        const [data] = await connection.query(sql, [address_id]);

        if (data.length === 0) {
            return res.status(202).json({ message: messages.FAILURE_MESSAGE });
        }

       return res.status(200).json({
            addressData: data,
            message: messages.SUCCESS_MESSAGE
        });
    } catch (err) {
        logger.log("Error", err);
        return res.status(500).json({ message: messages.FAILURE_MESSAGE });
    }
});




address.put('/update-address',jwtMiddleware.verifyToken, async (req, res) => {
    const address_id = req.query.address_id;

    const { address, city, state, zip, country, landmark, address_type, lat_cords, lan_cords } = req.body;

    // Create the SQL query for the update operation
    let sql = 'UPDATE onelove.address SET';

    // Initialize an array to store the values for the query
    const values = [];

    // Append the fields to the query only if they are provided in the request body
    if (address !== undefined) {
        sql += ' address=?,';
        values.push(address);
    }
    if (city !== undefined) {
        sql += ' city=?,';
        values.push(city);
    }
    if (state !== undefined) {
        sql += ' state=?,';
        values.push(state);
    }
    if (zip !== undefined) {
        sql += ' zip=?,';
        values.push(zip);
    }
    if (country !== undefined) {
        sql += ' country=?,';
        values.push(country);
    }
    if (landmark !== undefined) {
        sql += ' landmark=?,';
        values.push(landmark);
    }
    if (address_type !== undefined) {
        sql += ' address_type=?,';
        values.push(address_type);
    }
    if (lat_cords !== undefined) {
        sql += ' lat_cords=?,';
        values.push(lat_cords);
    }
    if (lan_cords !== undefined) {
        sql += ' lan_cords=?,';
        values.push(lan_cords);
    }
    // Remove the trailing comma from the SQL query
    sql = sql.slice(0, -1);

    sql += ' WHERE address_id=?';
    values.push(address_id);

    try {
        // Execute the update query
        const [result] = await connection.query(sql, values);

       return res.status(200).json({
            updatedData: result,
            message: messages.DATA_UPDATED,
        });
    } catch (err) {
        logger.error('Error updating data:', err.message);
        return res.status(400).json({ message: messages.DATA_UPDATE_FALIED });
    }
});



address.delete('/delete-address',jwtMiddleware.verifyToken, async (req, res) => {
    const address_id = req.query.address_id;
    const sql = 'DELETE FROM `address` WHERE `address_id`=?';

    try {
        // Execute the delete query
        const [result] = await connection.query(sql, address_id);

        return res.status(200).json({
            deletedData: result,
            message:messages.DATA_DELETED
        });
    } catch (err) {
        logger.error("Error deleting data", err.message);
        return res.status(400).json({ message:messages.FAILED_TO_DELETE});
    }
});


module.exports = address;