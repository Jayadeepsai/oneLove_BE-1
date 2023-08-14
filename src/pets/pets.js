const express = require('express');
const pets = express.Router();
const bodyParser = require('body-parser');

const db = require('../../dbConnection')

pets.use(express.json()); // To parse JSON bodies
pets.use(express.urlencoded({ extended: true })); // To parse URL-encoded bodies


pets.get('/pets', async (req, res) => { // Add "async" keyword
    try {
        const sql = `SELECT p.*, v.*, i.*, u.* 
                     FROM onelove.pet p
                     LEFT JOIN vaccination v ON p.vaccination_id = v.vaccination_id
                     LEFT JOIN images i ON p.image_id = i.image_id
                     LEFT JOIN users u ON p.user_id=u.user_id`;

        const [results] = await db.query(sql); // Use await to execute the query

        const petsData = JSON.parse(JSON.stringify(results));
        console.log(petsData);
        res.status(200).json({
            petsData,
            message: 'All pets data',
        });
    } catch (err) {
        console.error('Error fetching pets data:', err);
        res.status(500).json({
            message: 'Failed to fetch pets data',
        });
    }
});


pets.post('/pet-post', async (req, res) => { // Add "async" keyword
    try {
        const { pet_type, pet_name, pet_breed, pet_gender, pet_weight, pet_description, vaccination_id, pet_dob, image_type, image_url, user_id } = req.body;

        // Insert into images table
        const sql = `INSERT INTO onelove.images (image_type, image_url) VALUES (?, ?)`;
        const imageValues = [image_type, image_url];

        const [imageResult] = await db.query(sql, imageValues); // Use await to execute the query

        const image_id = imageResult.insertId; // Get the image_id generated from the previous query

        // Insert into pet table
        const sql2 = `
            INSERT INTO onelove.pet 
            (pet_type, pet_name, pet_breed, pet_gender, pet_weight, pet_description, pet_dob, image_id, user_id) 
            VALUES 
            (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        const petValues = [pet_type, pet_name, pet_breed, pet_gender, pet_weight, pet_description, pet_dob, image_id, user_id];

        const [petResult] = await db.query(sql2, petValues); // Use await to execute the query

        return res.status(200).json({ message: "Records inserted successfully", petResult });
    } catch (err) {
        console.error("Error inserting records:", err);
        return res.status(400).json({ message: "Error inserting records", err});
    }
});

 

pets.put('/update-pet', async (req, res) => { // Use "async" keyword
    try {
        const pet_id = req.query.pet_id; // Use "req.query" instead of "req.params"

        const { pet_type, pet_name, pet_breed, pet_gender, pet_weight, pet_description, vaccination_id, pet_dob, image_id, user_id } = req.body;

        // Create the SQL query for the update operation
        let sql = 'UPDATE onelove.pet SET';

        // Initialize an array to store the values for the query
        const values = [];

        // Append the fields to the query only if they are provided in the request body
        if (pet_type !== undefined) {
            sql += ' pet_type=?,';
            values.push(pet_type);
        }
        if (pet_name !== undefined) {
            sql += ' pet_name=?,';
            values.push(pet_name);
        }
        if (pet_breed !== undefined) {
            sql += ' pet_breed=?,';
            values.push(pet_breed);
        }
        if (pet_gender !== undefined) {
            sql += ' pet_gender=?,';
            values.push(pet_gender);
        }
        if (pet_weight !== undefined) {
            sql += ' pet_weight=?,';
            values.push(pet_weight);
        }
        if (pet_description !== undefined) {
            sql += ' pet_description=?,';
            values.push(pet_description);
        }
        if (vaccination_id !== undefined) {
            sql += ' vaccination_id=?,';
            values.push(vaccination_id);
        }
        if (pet_dob !== undefined) {
            sql += ' pet_dob=?,';
            values.push(pet_dob);
        }
        if (image_id !== undefined) {
            sql += ' image_id=?,';
            values.push(image_id);
        }
        if (user_id !== undefined) {
            sql += ' user_id=?,';
            values.push(user_id);
        }

        // Remove the trailing comma from the SQL query
        sql = sql.slice(0, -1);

        sql += ' WHERE pet_id=?';
        values.push(pet_id);

        // Execute the update query
        const [result] = await db.query(sql, values); // Use await to execute the query

        console.log('Data updated successfully.');
        res.status(200).json({
            updatedData: result,
            message: 'Data updated successfully.',
        });
        console.log(result);
    } catch (err) {
        console.error('Error updating data:', err.message);
        res.status(400).json({ message: 'Failed to update data.' });
    }
});



pets.get('/pets-images', async (req, res) => { 
    try {
        const pet_id = req.query.pet_id; 

      
        const sql = `SELECT i.* FROM images i WHERE i.image_id IN (SELECT p.image_id FROM pets p WHERE p.pet_id = ?)`;

        const [results] = await db.query(sql, [pet_id]); 

        const images = JSON.parse(JSON.stringify(results));
        res.status(200).json({
            images,
            message: 'Images fetched successfully',
        });
    } catch (err) {
        console.error('Error fetching images:', err);
        res.status(500).json({
            message: 'Failed to fetch images',
        });
    }
});


pets.get('/pets-users', async (req, res) => { 
    try {
        const pet_id = req.query.pet_id; 

        const sql = `SELECT u.* FROM users u WHERE u.user_id IN (SELECT p.user_id FROM pet p WHERE p.pet_id = ?)`;

        const [results] = await db.query(sql, [pet_id]); // Use await to execute the query

        const user = JSON.parse(JSON.stringify(results));
        res.status(200).json({
            user,
            message: 'Fetched successfully',
        });
    } catch (err) {
        console.error('Error fetching :', err);
        res.status(500).json({
            message: 'Failed to fetch',
        });
    }
});



pets.delete('/delete-pet', async (req, res) => { 
    try {
        const pet_id = req.query.pet_id; 

        // SQL query to delete the pet with the given petId
        const sql = `DELETE FROM pet WHERE pet_id = ?`;

        const [result] = await db.query(sql, [pet_id]); // Use await to execute the query

        // Check if the pet was deleted successfully
        if (result.affectedRows === 0) {
            res.status(404).json({
                message: 'Pet not found',
            });
        } else {
            res.status(200).json({
                message: 'Pet deleted successfully',
            });
        }
    } catch (err) {
        console.error('Error deleting pet:', err);
        res.status(500).json({
            message: 'Failed to delete pet',
        });
    }
});





module.exports = pets