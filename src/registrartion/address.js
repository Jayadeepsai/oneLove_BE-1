const express = require('express');
const address = express.Router();
const bodyParser = require('body-parser');

const connection = require('../../dbConnection')

address.use(express.json()); // To parse JSON bodies
address.use(express.urlencoded({ extended: true })); // To parse URL-encoded bodies



address.post('/address', async (req, res) => {
    const { address, city, state, zip, country, landmark, address_type, lat_cords, lan_cords } = req.body;

    const sql = `INSERT INTO onelove.address (address, city, state, zip, country, landmark, address_type, lat_cords, lan_cords) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const values = [address, city, state, zip, country, landmark, address_type, lat_cords, lan_cords];

    try {
        // Execute the insert query
        const [result] = await db.query(sql, values);

        var data = JSON.parse(JSON.stringify(result));
        res.status(200).json({
            data: data,
            message: "Address posted"
        });
    } catch (err) {
        res.status(400).json({
            message: err
        });
    }
});




address.get('/address', async (req, res) => {
    try {
        const sql = `SELECT * FROM onelove.address;`;
        const [data] = await connection.query(sql); // Use await with promise-based query

        res.status(200).json({
            addressData: data, 
            message: "All address Data"
        });
    } catch (error) {
        console.error('Error fetching address data:', error.message);
        res.status(500).json({
            message: 'Failed to fetch address data.'
        });
    }
});




address.get('/address-id', async (req, res) => {
    const address_id = req.query.address_id;

    try {
        if (!address_id) {
            return res.status(400).json({ message: "address_id is required as a query parameter" });
        }

        const sql = `SELECT * FROM onelove.address WHERE address_id = ?`;
        const [data] = await connection.query(sql, [address_id]);

        if (data.length === 0) {
            return res.status(404).json({ message: "Address not found" });
        }

        res.status(200).json({
            addressData: data,
            message: "Address Data"
        });
    } catch (err) {
        console.log("Error", err);
        res.status(500).json({ message: "Failed to fetch address data." });
    }
});




address.put('/update-address', async (req, res) => {
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

        console.log('Data updated successfully.');
        res.status(200).json({
            updatedData: result,
            message: 'Data updated successfully.',
        });
    } catch (err) {
        console.error('Error updating data:', err.message);
        res.status(400).json({ message: 'Failed to update data.' });
    }
});



address.delete('/delete-address', async (req, res) => {
    const address_id = req.query.address_id;
    const sql = 'DELETE FROM `address` WHERE `address_id`=?';

    try {
        // Execute the delete query
        const [result] = await connection.query(sql, address_id);

        res.status(200).json({
            deletedData: result,
            message: "Data deleted successfully"
        });
    } catch (err) {
        console.error("Error deleting data", err.message);
        res.status(400).json({ message: 'Failed to delete data' });
    }
});


module.exports = address;