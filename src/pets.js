const express = require('express');
const pets = express.Router();
const bodyParser = require('body-parser');

const db = require('../dbConnection')

pets.use(express.json()); // To parse JSON bodies
pets.use(express.urlencoded({ extended: true })); // To parse URL-encoded bodies


pets.get('/petsData', (req, res) => {                  //Fetching all the Items data

    const sql = `SELECT p.*, v.*, i.* 
                 FROM onelove.pet p
                 LEFT JOIN vaccination v ON p.vaccination_id = v.vaccination_id
                 LEFT JOIN images i ON p.image_id = i.image_id`;

    db.query(sql, (err, results) => {
        if (err) {
            console.error('Error fetching pets data:', err);
            res.status(500).json({
                message: 'Failed to fetch pets data',
            });
        } else {
            const petsData = JSON.parse(JSON.stringify(results));
            console.log(petsData)
            res.status(200).json({
                petsData,
                message: 'All pets data',
            });
        }
    });
});



pets.post('/petPost', (req, res) => {

    const pet_type = req.body.pet_type;
    const pet_name = req.body.pet_name;
    const pet_breed = req.body.pet_breed;
    const pet_gender = req.body.pet_gender;
    const pet_weight = req.body.pet_weight;
    const pet_description = req.body.pet_description;
    const vaccination_id = req.body.vaccination_id;
    const pet_dob = req.body.pet_dob;
    const image_id = req.body.image_id;

    const sql = `
    INSERT INTO onelove.pet 
    (pet_type, pet_name, pet_breed, pet_gender, pet_weight, pet_description, vaccination_id, pet_dob, image_id) 
    VALUES 
    ("${pet_type}", "${pet_name}", "${pet_breed}", "${pet_gender}", "${pet_weight}", "${pet_description}", 
    ${vaccination_id === undefined ? 'NULL' : vaccination_id}, "${pet_dob}", ${image_id === undefined ? 'NULL' : image_id})`;

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
            console.log(err)
        }
    });
});



pets.put('/updatePetData/:pet_id', (req, res) => {           //Updating data in pet table based on pet_id
    const pet_id = req.params.pet_id;

    const pet_type = req.body.pet_type;
    const pet_name = req.body.pet_name;
    const pet_breed = req.body.pet_breed;
    const pet_gender = req.body.pet_gender;
    const pet_weight = req.body.pet_weight;
    const pet_description = req.body.pet_description;
    const vaccination_id = req.body.vaccination_id;
    const pet_dob = req.body.pet_dob;
    const image_id = req.body.image_id;

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

    // Remove the trailing comma from the SQL query
    sql = sql.slice(0, -1);

    sql += ' WHERE pet_id=?';
    values.push(pet_id);

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


pets.get('/pets/images/:petId', (req, res) => {
    const petId = req.params.petId;

    // SQL query to fetch images with the given petId
    const sql = `SELECT i.* FROM images i WHERE i.image_id IN (SELECT p.image_id FROM pets p WHERE p.pet_id = ?)`;

    db.query(sql, [petId], (err, results) => {
        if (err) {
            console.error('Error fetching images:', err);
            res.status(500).json({
                message: 'Failed to fetch images',
            });
        } else {
            const images = JSON.parse(JSON.stringify(results));
            res.status(200).json({
                images,
                message: 'Images fetched successfully',
            });
        }
    });
});


pets.delete('/deletePet/:petId', (req, res) => {
    const petId = req.params.petId; // Get the petId from the URL parameter

    // SQL query to delete the pet with the given petId
    const sql = `DELETE FROM pet WHERE pet_id = ?`;

    db.query(sql, [petId], (err, result) => {
        if (err) {
            console.error('Error deleting pet:', err);
            res.status(500).json({
                message: 'Failed to delete pet',
            });
        } else {
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
        }
    });
});




module.exports = pets