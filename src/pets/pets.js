const express = require('express');
const pets = express.Router();
const bodyParser = require('body-parser');
const messages = require('../messages/constants');

const db = require('../../dbConnection');
const jwtMiddleware = require('../../jwtMiddleware');
const logger = require('../../logger');

pets.use(express.json()); // To parse JSON bodies
pets.use(express.urlencoded({ extended: true })); // To parse URL-encoded bodies


pets.post('/pet-post',jwtMiddleware.verifyToken, async (req, res) => { // Add "async" keyword
    try {
        const { pet_type, pet_name, pet_breed, pet_gender, pet_weight, pet_description, pet_dob, spay_neuter, image_type, image_url, user_id } = req.body;

        // Insert into images table
        const sql = `INSERT INTO onelove.images (image_type, image_url) VALUES (?, ?)`;
        const imageValues = [image_type,JSON.stringify(image_url)];

        const [imageResult] = await db.query(sql, imageValues); // Use await to execute the query

        const image_id = imageResult.insertId; // Get the image_id generated from the previous query

        // Insert into pet table
        const sql2 = `
            INSERT INTO onelove.pet 
            (pet_type, pet_name, pet_breed, pet_gender, pet_weight, pet_description, pet_dob, spay_neuter, image_id, user_id) 
            VALUES 
            (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        const petValues = [pet_type, pet_name, pet_breed, pet_gender, pet_weight, pet_description, pet_dob, spay_neuter, image_id, user_id];

        const [petResult] = await db.query(sql2, petValues); // Use await to execute the query

        return res.status(200).json({ message: messages.POST_SUCCESS, petResult });
    } catch (err) {
        logger.error("Error inserting records:", err);
        return res.status(400).json({ message: messages.POST_FAILED, err});
    }
});

pets.get('/pets',jwtMiddleware.verifyToken, async (req, res) => { // Add "async" keyword
    try {
        const sql = `SELECT p.*, v.*, i1.image_id AS pet_image_id, i1.image_url AS pet_image_url, u.* , i2.image_id AS user_image_id, i2.image_url AS user_image_url,c.*
        FROM onelove.pet p
        LEFT JOIN vaccination v ON p.vaccination_id = v.vaccination_id
        LEFT JOIN images i1 ON p.image_id = i1.image_id
        LEFT JOIN users u ON p.user_id = u.user_id
        LEFT JOIN contact_details c ON u.contact_id = c.contact_id
        LEFT JOIN images i2 ON u.image_id = i2.image_id`;

        const [results] = await db.query(sql); // Use await to execute the query

        const petsData = JSON.parse(JSON.stringify(results));
        res.status(200).json({
            petsData,
            message: messages.SUCCESS_MESSAGE,
        });
    } catch (err) {
        logger.error('Error fetching pets data:', err);
        res.status(500).json({
            message: messages.FAILURE_MESSAGE,
        });
    }
});

pets.put('/update-pet',jwtMiddleware.verifyToken, async (req, res) => { // Use "async" keyword   
    try {
        const pet_id = req.query.pet_id; // Use "req.query" instead of "req.params"
        const { pet_type, pet_name, pet_breed, pet_gender, pet_weight, pet_description, vaccination_id, pet_dob, image_id, user_id, spay_neuter, image_type, image_url } = req.body;

        await db.beginTransaction();

        if(pet_type || pet_name || pet_breed || pet_gender || pet_weight || pet_description || vaccination_id || pet_dob || image_id || user_id || spay_neuter){
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
        if (spay_neuter !== undefined) {
            sql += ' spay_neuter=?,';
            values.push(spay_neuter);
        }

        // Remove the trailing comma from the SQL query
        sql = sql.slice(0, -1);

        sql += ' WHERE pet_id=?';
        values.push(pet_id);

        await db.query(sql, values); // Use await to execute the query
    }
    if(image_type || image_url){
        let imageSql = 'UPDATE images SET';
        const imageValues = [];
  
        if (image_type !== undefined) {
            imageSql += ' image_type=?,';
            imageValues.push(image_type);
        }
        if (image_url !== undefined) {
            imageSql += ' image_url=?,';
            imageValues.push(JSON.stringify(image_url));
        }

        imageSql = imageSql.slice(0, -1);
        imageSql += ' WHERE image_id=(SELECT image_id FROM pet WHERE pet_id=?)';
        imageValues.push(pet_id);

        await db.query(imageSql, imageValues);
    }
    await db.commit();
       logger.info('Data updated successfully.');
       return res.status(200).json({
            message: messages.DATA_UPDATED,
        });
        
    } catch (err) {
        console.error('Error updating data:', err.message);
      return  res.status(400).json({ message: messages.DATA_UPDATE_FALIED });
    }
});



pets.put('/pet-update-image',jwtMiddleware.verifyToken, async (req, res) => {
    try {
        const pet_id = req.query.pet_id; // Get the pet ID from the query parameter
        const { image_type, image_url } = req.body; // Get the updated image_type from the request body
        // Update the image_url and image_type in the images table
        const updateImageSql = `
            UPDATE onelove.images
            SET image_type = ?, image_url = ?
            WHERE image_id = (SELECT image_id FROM onelove.pet WHERE pet_id = ?)`;
        const updateImageValues = [image_type, JSON.stringify(image_url), pet_id];
        // Execute the update query for images table
        const [updateImageResult] = await db.query(updateImageSql, updateImageValues);

        if (updateImageResult.affectedRows === 0) {
            return res.status(404).json({ message: messages.DATA_UPDATE_FALIED });
        }
        return res.status(200).json({ message: messages.DATA_UPDATED });
    } catch (err) {
        logger.error("Error updating image details:", err);
        return res.status(500).json({ message: messages.DATA_UPDATE_FALIED, err });
    }
});



pets.get('/pets-images',jwtMiddleware.verifyToken, async (req, res) => { 
    try {
        const pet_id = req.query.pet_id; 
        const sql = `SELECT i.* FROM images i WHERE i.image_id IN (SELECT p.image_id FROM pets p WHERE p.pet_id = ?)`;
        const [results] = await db.query(sql, [pet_id]); 
        const images = JSON.parse(JSON.stringify(results));
        res.status(200).json({
            images,
            message: messages.SUCCESS_MESSAGE,
        });
    } catch (err) {
        logger.error('Error fetching images:', err);
        res.status(500).json({
            message: messages.FAILURE_MESSAGE,
        });
    }
});


pets.get('/pets-users',jwtMiddleware.verifyToken, async (req, res) => { 
    const user_id = req.query.user_id;

    if (!user_id) {
        return res.status(400).json({
            message: messages.INVALID_ID,
        });
    }

    const sql = `
    SELECT
        p.*,
        v.*,
        i1.image_id AS pet_image_id,
        i1.image_url AS pet_image_url,
        u.*,
        i2.image_id AS user_image_id,
        i2.image_url AS user_image_url,
        COUNT(po.post_id) AS post_count
    FROM
        onelove.pet p
    LEFT JOIN
        vaccination v ON p.vaccination_id = v.vaccination_id
    LEFT JOIN
        images i1 ON p.image_id = i1.image_id
    LEFT JOIN
        users u ON p.user_id = u.user_id
    LEFT JOIN
        images i2 ON u.image_id = i2.image_id
    LEFT JOIN
        posts po ON p.pet_id = po.pet_id
    WHERE
        p.user_id = ?
    GROUP BY
        p.pet_id
`;
    
    try {
        const [results] = await db.query(sql, [user_id]);
        const pet = JSON.parse(JSON.stringify(results));

        res.status(200).json({
            pet,
            message: messages.SUCCESS_MESSAGE,
        });
    } catch (err) {
        logger.error('Error fetching:', err);
        res.status(500).json({
            message: messages.FAILURE_MESSAGE,
        });
    }
});



pets.delete('/delete-pet',jwtMiddleware.verifyToken, async (req, res) => { 
    try {
        const pet_id = req.query.pet_id; 
        // SQL query to delete the pet with the given petId
        const sql = `DELETE FROM pet WHERE pet_id = ?`;
        const [result] = await db.query(sql, [pet_id]); // Use await to execute the query
        // Check if the pet was deleted successfully
        if (result.affectedRows === 0) {
            res.status(200).json({
                message: messages.NO_DATA,
            });
        } else {
            res.status(200).json({
                message: messages.DATA_DELETED,
            });
        }
    } catch (err) {
        logger.error('Error deleting pet:', err);
        res.status(500).json({
            message: messages.FAILED_TO_DELETE,
        });
    }
});


module.exports = pets