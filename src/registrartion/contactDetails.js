const express = require('express');
const contact = express.Router();
const bodyParser = require('body-parser');

const db = require('../../dbConnection');
const jwtMiddleware = require('../../jwtMiddleware');

contact.use(express.json()); // To parse JSON bodies
contact.use(express.urlencoded({ extended: true })); // To parse URL-encoded bodies


contact.post('/contact',jwtMiddleware.verifyToken, async (req, res) => {
    const { mobile_number, email } = req.body;
    const sql = `INSERT INTO onelove.contact_details (mobile_number, email) VALUES (?, ?)`;
    const values = [mobile_number, email];

    try {
        // Execute the insert query
        const [result] = await db.query(sql, values);

        res.status(200).json({
            data: result,
            message: "Contact posted"
        });
    } catch (err) {
        console.error("Error posting contact:", err.message);
        res.status(400).json({
            message: err
        });
    }
});



contact.get('/contact',jwtMiddleware.verifyToken, async (req, res) => {
    const sql = `SELECT * FROM onelove.contact_details;`;

    try {
        // Execute the select query
        const [result] = await db.query(sql);

        var data = JSON.parse(JSON.stringify(result));
        console.log(data);

        res.status(200).json({
            vaccinationData: data,
            message: "All contacts Data"
        });
    } catch (err) {
        console.error("Error fetching contacts:", err.message);
        res.status(400).json({
            message: err
        });
    }
});



contact.get('/contact-id',jwtMiddleware.verifyToken, async (req, res) => {
    const contact_id = req.query.contact_id;

    if (!contact_id) {
        return res.status(400).json({ message: "contact_id is required as a query parameter" });
    }

    const sql = `SELECT * FROM onelove.contact_details WHERE contact_id = ?`;

    try {
        // Execute the select query with the contact_id as a parameter
        const [result] = await db.query(sql, [contact_id]);

        var data = JSON.parse(JSON.stringify(result));
        res.status(200).json({
            addressData: data,
            message: "Contact Data"
        });
    } catch (err) {
        console.error("Error fetching contact data:", err.message);
        res.status(400).json({
            message: err
        });
    }
});




contact.put('/update-contact',jwtMiddleware.verifyToken, async (req, res) => {
    const contact_id = req.query.contact_id;

    const { mobile_number, email } = req.body;

    // Create the SQL query for the update operation
    let sql = 'UPDATE onelove.contact_details SET';

    // Initialize an array to store the values for the query
    const values = [];

    // Append the fields to the query only if they are provided in the request body
    if (mobile_number !== undefined) {
        sql += ' mobile_number=?,';
        values.push(mobile_number);
    }
    if (email !== undefined) {
        sql += ' email=?,';
        values.push(email);
    }

    // Remove the trailing comma from the SQL query
    sql = sql.slice(0, -1);

    sql += ' WHERE contact_id=?';
    values.push(contact_id);

    try {
        // Execute the update query with the values as parameters
        const [result] = await db.query(sql, values);

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


contact.delete('/delete-contact',jwtMiddleware.verifyToken, async (req, res) => {
    const contact_id = req.query.contact_id;
    const sql = 'DELETE FROM `contact_details` WHERE `contact_id`=?';

    try {
        // Execute the delete query
        const [result] = await db.query(sql, contact_id);

        res.status(200).json({
            deletedData: result,
            message: "Data deleted successfully"
        });
    } catch (err) {
        console.error("Error deleting data", err.message);
        res.status(400).json({ message: 'Failed to delete data' });
    }
});


module.exports = contact;