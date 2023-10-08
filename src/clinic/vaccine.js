// const express = require('express');
// const vaccine = express.Router();
// const bodyParser = require('body-parser');

// const db = require('../../dbConnection')

// vaccine.use(express.json()); // To parse JSON bodies
// vaccine.use(express.urlencoded({ extended: true })); // To parse URL-encoded bodies


// /**
//  * post api for vaccine 
//  */
// vaccine.post('/vaccine', async (req, res) => {
//     const { vaccine_name, effdt, dosage, cost, enddt } = req.body;

//     const sql = 'INSERT INTO onelove.vaccination (vaccine_name, effdt, dosage, cost, enddt) VALUES (?, ?, ?, ?, ?)';
//     const values = [vaccine_name, effdt, dosage, cost, enddt];

//     try {
//         // Execute the insert query with the values as parameters
//         const [result] = await db.query(sql, values);

//         console.log('Data posted successfully.');
//         res.status(200).json({
//             data: result,
//             message: "Data posted"
//         });
//     } catch (err) {
//         console.error('Error posting data:', err.message);
//         res.status(400).json({
//             message: err
//         });
//     }
// });



// /**
//  * Fetching tha vaccine data
//  */

// vaccine.get('/vaccine', async (req, res) => {
//     const sql = `SELECT * FROM onelove.vaccination`;

//     try {
//         // Execute the SELECT query
//         const [results] = await db.query(sql);

//         const data = JSON.parse(JSON.stringify(results));
//         console.log(data);
//         res.status(200).json({
//             vaccinationData: data,
//             message: "All Vaccination Data"
//         });
//     } catch (err) {
//         console.error('Error fetching vaccination data:', err.message);
//         res.status(400).json({
//             message: err
//         });
//     }
// });


// vaccine.get('/vaccine-id', async (req, res) => {
//     const vaccination_id = req.query.vaccination_id;

//     if (!vaccination_id) {
//         return res.status(400).json({ message: "vaccination_id is required as a query parameter" });
//     }

//     const sql = `SELECT * FROM onelove.vaccination WHERE vaccination_id = ?`;

//     try {
//         // Execute the SELECT query with parameter binding
//         const [result] = await db.query(sql, [vaccination_id]);

//         const data = JSON.parse(JSON.stringify(result));
//         res.status(200).json({
//             vaccinationData: data,
//             message: "Vaccination Data"
//         });
//     } catch (err) {
//         console.error('Error fetching vaccination data:', err.message);
//         res.status(400).json({
//             message: err
//         });
//     }
// });




// vaccine.put('/update-vaccine', async (req, res) => {
//     const vaccination_id = req.query.vaccination_id;

//     const { vaccine_name, effdt, dosage, cost, enddt } = req.body;

//     // Create the SQL query for the update operation
//     let sql = 'UPDATE onelove.vaccination SET';

//     // Initialize an array to store the values for the query
//     const values = [];

//     // Append the fields to the query only if they are provided in the request body
//     if (vaccine_name !== undefined) {
//         sql += ' vaccine_name=?,';
//         values.push(vaccine_name);
//     }
//     if (effdt !== undefined) {
//         sql += ' effdt=?,';
//         values.push(effdt);
//     }
//     if (dosage !== undefined) {
//         sql += ' dosage=?,';
//         values.push(dosage);
//     }
//     if (cost !== undefined) {
//         sql += ' cost=?,';
//         values.push(cost);
//     }
//     if (enddt !== undefined) {
//         sql += ' enddt=?,';
//         values.push(enddt);
//     }

//     // Remove the trailing comma from the SQL query
//     sql = sql.slice(0, -1);

//     sql += ' WHERE vaccination_id=?';
//     values.push(vaccination_id);

//     try {
//         // Execute the update query with parameter binding
//         const [result] = await db.query(sql, values);

//         console.log('Data updated successfully.');
//         res.status(200).json({
//             updatedData: result,
//             message: 'Data updated successfully.',
//         });
//     } catch (err) {
//         console.error('Error updating data:', err.message);
//         res.status(400).json({ message: 'Failed to update data.' });
//     }
// });



// // vaccine.delete('/delete-vaccine', async (req, res) => {
// //     const vaccination_id = req.query.vaccination_id;
// //     const sql = 'DELETE FROM `vaccination` WHERE `vaccination_id`=?';

// //     try {
// //         // Execute the delete query with parameter binding
// //         const [results] = await db.query(sql, vaccination_id);
// //         var data = JSON.parse(JSON.stringify(results));

// //         console.log('Data is Deleted');
// //         res.status(200).json({
// //             data: data,
// //             message: "Data Deleted"
// //         });
// //     } catch (err) {
// //         console.error('Error deleting data:', err.message);
// //         res.status(400).json({
// //             message: err
// //         });
// //     }
// // });



// module.exports = vaccine