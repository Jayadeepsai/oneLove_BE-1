const express = require('express');
const contact = express.Router();
const bodyParser = require('body-parser');

const db = require('../../dbConnection');
const jwtMiddleware = require('../../jwtMiddleware');

contact.use(express.json());
contact.use(express.urlencoded({ extended: true }));


contact.post('/contact',jwtMiddleware.verifyToken, async (req, res) => {
    const { mobile_number, email } = req.body;
    const sql = `INSERT INTO onelove.contact_details (mobile_number, email) VALUES (?, ?)`;
    const values = [mobile_number, email];

    try {
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
    let sql = 'UPDATE onelove.contact_details SET';
    const values = [];

    if (mobile_number !== undefined) {
        sql += ' mobile_number=?,';
        values.push(mobile_number);
    }
    if (email !== undefined) {
        sql += ' email=?,';
        values.push(email);
    }

    sql = sql.slice(0, -1);
    sql += ' WHERE contact_id=?';
    values.push(contact_id);

    try {
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