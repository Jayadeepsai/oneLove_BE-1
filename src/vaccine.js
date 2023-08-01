const express = require('express');
const vaccine = express.Router();
const bodyParser = require('body-parser');

const db = require('../dbConnection')

vaccine.use(express.json()); // To parse JSON bodies
vaccine.use(express.urlencoded({ extended: true })); // To parse URL-encoded bodies


vaccine.post('/vaccineEntry', (req, res) => {                 //post api for vaccine entry

    const {vaccineName, date, dosage, cost} = req.body;

    const sql = `INSERT INTO onelove.vaccination (vaccineName, date, dosage, cost) VALUES ("${vaccineName}","${date}","${dosage}","${cost}")`;

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


vaccine.get('/vaccineData', (req, res) => {                //Fetching all the vaccination data
    const sql = `SELECT * FROM onelove.vaccination`;
    db.query(sql, function (err, results, fields) {
        if (!err) {
            var data = JSON.parse(JSON.stringify(results));
            console.log(data)
            res.status(200).json({
                vaccinationData: data,
                message: "All Vaccination Data"
            })
        } else {
            res.status(400).json({
                message: err
            })
        }
    });
});


vaccine.post('/vaccineDataByCondition', (req, res) => {                //Fetching vaccination data by passing condition

    const vaccination_id = req.body.vaccination_id;
    const sql = `SELECT * FROM onelove.vaccination WHERE vaccination_id = ?`;
    db.query(sql, vaccination_id, function (err, result, fields) {
        if (!err) {
            var data = JSON.parse(JSON.stringify(result));
            console.log(data)
            res.status(200).json({
                vaccinationData: data,
                message: "Vaccination Data"
            })
        } else {
            res.status(400).json({
                message: err
            })
        }
    })
});


vaccine.put('/updateVaccineData/:vaccination_id', (req, res) => {           //Updating data in vaccination table based on vaccination_id
    const vaccination_id = req.params.vaccination_id;

    const {vaccineName, date, dosage, cost} = req.body;

    // Create the SQL query for the update operation
    let sql = 'UPDATE onelove.vaccination SET';

    // Initialize an array to store the values for the query
    const values = [];

    // Append the fields to the query only if they are provided in the request body
    if (vaccineName !== undefined) {
        sql += ' vaccineName=?,';
        values.push(vaccineName);
    }
    if (date !== undefined) {
        sql += ' date=?,';
        values.push(date);
    }
    if (dosage !== undefined) {
        sql += ' dosage=?,';
        values.push(dosage);
    }
    if (cost !== undefined) {
        sql += ' cost=?,';
        values.push(cost);
    }

    // Remove the trailing comma from the SQL query
    sql = sql.slice(0, -1);

    sql += ' WHERE vaccination_id=?';
    values.push(vaccination_id);

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


vaccine.delete('/deleteVaccideData/:vaccination_id', (req, res) => {              //delete api for vaccination data based on vaccination_id
    const vaccination_id = (req.params.vaccination_id)
    const sql = 'DELETE FROM `vaccination` WHERE `vaccination_id`=?'
    db.query(sql, vaccination_id, function (err, results, fields) {
        if (!err) {
            var data = JSON.parse(JSON.stringify(results));
            console.log(data)
            res.status(200).json({
                data: data,
                message: "Data Deleted"
            })
            console.log('Data is Deleted');
        } else {
            res.status(400).json({
                message: err
            })
        }
    });
});


module.exports = vaccine