const express = require('express');
const admin = express.Router();
const bodyParser = require('body-parser');
const message = require('../messages/constants');
const db = require('../../dbConnection');
const logger = require('../../logger');

admin.use(express.json());
admin.use(express.urlencoded({ extended: true }));


admin.post('/admin-login',async(req,res)=>{

    try {
        
    const { mail, mobile, pass } = req.body;

    if (!mail && !mobile) {
        return res.status(400).json({ message: 'Please provide either mail or mobile for login.' });
    }

    let condition;
    if (mail) {
        condition = { mail };
    } else {
        condition = { mobile };
    }

    const sql = `SELECT * FROM admin_data WHERE ? AND pass = ?`;
    const [results] = await db.query(sql, [condition, pass]);

    if (results.length === 0) {
        return res.status(401).json({ message: 'Invalid credentials.' });
    }

    res.status(200).json({
        message: 'Login successful.',
    });
} catch (err) {
    console.error('Error during admin login:', err.message);
    res.status(500).json({ message: 'Internal Server Error' });
}
})


module.exports = admin;