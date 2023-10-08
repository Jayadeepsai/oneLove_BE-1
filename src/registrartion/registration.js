const express = require('express');
const registration = express.Router();
const bodyParser = require('body-parser');
const connection = require('../../dbConnection')
const messages = require('../messages/constants')
require('dotenv').config();

registration.use(express.json()); // To parse JSON bodies
registration.use(express.urlencoded({ extended: true })); // To parse URL-encoded bodies
const jwtMiddleware = require('../../jwtMiddleware');



async function performTransaction(req, res) {
    try {
        // Start the transaction
        await connection.beginTransaction();

        const { mobile_number } = req.body;

        // Check if mobile number already exists in contact_details table
        const checkQuery = 'SELECT contact_id FROM onelove.contact_details WHERE mobile_number = ?';
        const [checkResult] = await connection.query(checkQuery, [mobile_number]);

        if (checkResult.length > 0) {
            // Mobile number already exists, send a response
            return res.status(400).json({ message: 'User with this mobile number is already registered.' });
        }

       // Insert into address table
       const { address, city, state, zip, country, landmark, address_type, lat_cords, lan_cords } = req.body;
       const addressQuery = 'INSERT INTO onelove.address (address, city, state, zip, country, landmark, address_type, lat_cords, lan_cords) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
       const addressValues = [address, city, state, zip, country, landmark, address_type, lat_cords, lan_cords];

       const [addressResult] = await connection.query(addressQuery, addressValues);
       const address_id = addressResult.insertId;

       // Insert into contact_details table
      const {email} = req.body;
       const contactQuery = 'INSERT INTO onelove.contact_details (mobile_number, email) VALUES (?, ?)';
       const contactValues = [mobile_number,email ];

       const [contactResult] = await connection.query(contactQuery, contactValues);
       const contact_id = contactResult.insertId;

       let image_id = null; // Initialize image_id as null

    //    const imageFile = req.files.image;
    //    const s3ImageUrl = await uploadImageToS3(imageFile.data, imageFile.name);
       const { image_type, image_url } = req.body;

       if (image_type && image_url) {
           const imageQuery = 'INSERT INTO onelove.images (image_type, image_url) VALUES (?, ?)';
           const imageValues = [image_type, JSON.stringify(image_url)];

        try {
            const [imageResult] = await connection.query(imageQuery, imageValues);
            image_id = imageResult.insertId;
        } catch (error) {
            console.error('Error inserting image:', error);
        
        }
      }      

        const { user_type, user_name } = req.body;
        
        // Initialize clinic_id, service_id, and store_id as null
        let clinic_id = null;
        let service_id = null;
        let store_id = null;

        switch (user_type) {
            case 'pet_owner':
                const userQuery = 'INSERT INTO onelove.users (user_type, user_name, address_id, contact_id, service_id, clinic_id, store_id, image_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
                const userValues = [user_type, user_name, address_id, contact_id, service_id, clinic_id, store_id, image_id];
    
                const [userResult] = await connection.query(userQuery, userValues);
                const user_id = userResult.insertId;
    
                // Insert into registrations table
                const regQuery = 'INSERT INTO onelove.registrations (user_id, address_id, contact_id, image_id) VALUES (?, ?, ?, ?)';
                const regValues = [user_id, address_id, contact_id, image_id];
    
                await connection.query(regQuery, regValues);
                break;

            case 'pet_trainer':
               // Insert into service table for pet_doctor
               const { pet_walking, pet_sitting, pet_boarding, event_training, training_workshop, adoption_drives, pet_intelligence_rank_card, pet_grooming, trainer_experience, service_start_day, service_end_day, service_start_time, service_end_time} = req.body;
               const serviceQuery = 'INSERT INTO onelove.service (pet_walking, pet_sitting, pet_boarding, event_training, training_workshop, adoption_drives, pet_intelligence_rank_card, pet_grooming, trainer_experience, service_start_day, service_end_day, service_start_time, service_end_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
               const serviceValues = [pet_walking, pet_sitting, pet_boarding, event_training, training_workshop, adoption_drives, pet_intelligence_rank_card, pet_grooming, trainer_experience, service_start_day, service_end_day, service_start_time, service_end_time];
             
                const [serviceResult] = await connection.query(serviceQuery, serviceValues);
                service_id = serviceResult.insertId;

            // Insert into users and registrations tables for pet_doctor
                const userQuery1 = 'INSERT INTO onelove.users (user_type, user_name, address_id, contact_id, service_id, clinic_id, store_id, image_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
                const userValues1 = [user_type, user_name, address_id, contact_id, service_id, clinic_id, store_id, image_id];

                const [userResult1] = await connection.query(userQuery1, userValues1);
                const user_id1 = userResult1.insertId;

            // Insert into registrations table
                const regQuery1 = 'INSERT INTO onelove.registrations (user_id, address_id, contact_id, image_id) VALUES (?, ?, ?, ?)';
                const regValues1 = [user_id1, address_id, contact_id, image_id];

            await connection.query(regQuery1, regValues1);
                break;

            case 'pet_doctor':
                const { clinic_name, specialisation, clinic_license, experience, education, week_start_day, week_end_day, start_time, end_time } = req.body;
                const clinicQuery = 'INSERT INTO onelove.clinics (clinic_name, specialisation, clinic_license, experience, education, week_start_day, week_end_day, start_time, end_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
                const clinicValues = [clinic_name, JSON.stringify(specialisation), clinic_license, experience, education, week_start_day, week_end_day, start_time, end_time];
    
                const [clinicResult] = await connection.query(clinicQuery, clinicValues);
                clinic_id = clinicResult.insertId;
    
                // Insert into users and registrations tables for pet_trainer
                const userQuery2 = 'INSERT INTO onelove.users (user_type, user_name, address_id, contact_id, service_id, clinic_id, store_id, image_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
                const userValues2 = [user_type, user_name, address_id, contact_id, service_id, clinic_id, store_id, image_id];
    
                const [userResult2] = await connection.query(userQuery2, userValues2);
                const user_id2 = userResult2.insertId;
    
                // Insert into registrations table
                const regQuery2 = 'INSERT INTO onelove.registrations (user_id, address_id, contact_id, image_id) VALUES (?, ?, ?, ?)';
                const regValues2 = [user_id2, address_id, contact_id, image_id];
    
                await connection.query(regQuery2, regValues2);
                break;

            case 'pet_store':
                const { store_name, food_treats, accessories, toys, health_care, dog_service, breader_adoption_sale } = req.body;
                const storeQuery = 'INSERT INTO onelove.store (store_name, address_id, contact_id, food_treats, accessories, toys, health_care, dog_service, breader_adoption_sale) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
                const storeValues =[ store_name, address_id, contact_id, food_treats, accessories, toys, health_care, dog_service, breader_adoption_sale ];

                const [storeResult] = await connection.query(storeQuery,storeValues);
                store_id = storeResult.insertId;

             // Insert into users and registrations tables for pet_trainer
                const userQuery3 = 'INSERT INTO onelove.users (user_type, user_name, address_id, contact_id, service_id, clinic_id, store_id, image_id) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
                const userValues3 = [user_type, user_name, address_id, contact_id, service_id, clinic_id, store_id, image_id];
 
                const [userResult3] = await connection.query(userQuery3, userValues3);
                const user_id3 = userResult3.insertId;
 
             // Insert into registrations table
                const regQuery3 = 'INSERT INTO onelove.registrations (user_id, address_id, contact_id, image_id) VALUES (?, ?, ?, ?)';
                const regValues3 = [user_id3, address_id, contact_id, image_id];
 
             await connection.query(regQuery3, regValues3);
                break;

            default:
              return res.status(400).json({message:"user_type you have choosen is invalid"});
                break;
        }

        // Commit the transaction if all queries are successful
        await connection.commit();

        // Send a success response to the client
       return res.status(200).json({ message: 'Transaction committed successfully.' });
    } catch (error) { 
        // Rollback the transaction if any query fails
        await connection.rollback();

        console.error('Error in transaction:', error);

        // Send an error response to the client
       return res.status(500).json({ message: 'Failed to perform transaction.' });
    }
}



registration.post('/registration', (req, res) => {
    performTransaction(req, res)
        .then(() => {
            console.log('Transaction completed successfully');
        })
        .catch((err) => {
            console.error('Error in address.post API:', err);
        });
});


registration.get('/registration',jwtMiddleware.verifyToken, async (req, res) => {
    try {
        const sql = `SELECT a.*, c.*, u.*, r.*,i.*
                     FROM onelove.registrations r
                     LEFT JOIN address a ON r.address_id = a.address_id
                     LEFT JOIN contact_details c ON r.contact_id = c.contact_id
                     LEFT JOIN users u ON r.user_id = u.user_id
                     LEFT JOIN images i ON r.image_id = i.image_id`;

        const [data] = await connection.query(sql);

        res.status(200).json({
            registrationData: data,
            message: messages.SUCCESS_MESSAGE
        });

    } catch (error) {
        console.error('Error fetching registers data:', error.message);
        res.status(500).json({
            message: messages.FAILURE_MESSAGE
        });
    }
});


registration.get('/registration-id',jwtMiddleware.verifyToken, async(req,res)=>{

const reg_id = req.query.reg_id;
try{
    if (!reg_id) {
        return res.status(400).json({ message:messages.NO_DATA });
    }

    const sql =`SELECT a.*, c.*, u.*, r.*,i.*
                FROM onelove.registrations r
                LEFT JOIN address a ON r.address_id = a.address_id
                LEFT JOIN contact_details c ON r.contact_id = c.contact_id
                LEFT JOIN users u ON r.user_id = u.user_id
                LEFT JOIN images i ON r.image_id = i.image_id WHERE r.reg_id=?`;
    const [data] = await connection.query(sql,[reg_id]);

    if (data.length === 0) {
        return res.status(404).json({ message: messages.SUCCESS_MESSAGE  });
    }

    res.status(200).json({
        registrationData: data,
        message: "Registration Data"
    });

}catch(error){
    console.log("Error", error);
    res.status(500).json({ message:messages.FAILURE_MESSAGE});
}

});


  
  registration.post('/refresh-token', (req, res) => {
    const refreshTokenValue = req.body.refreshToken;
  
    // Verify the refresh token
    jwtMiddleware.refreshToken(req, res);
  });


registration.get('/registration-mobile-number', async (req, res) => {
    const mobile_number = req.query.mobile_number;
    try {
      if (!mobile_number) {
        return res.status(400).json({ message: messages.NO_DATA });
      }
  
      const sql = `SELECT a.*, c.*, u.*, i.*, s.*, c1.clinic_name AS clinic_name
          FROM onelove.users u
          LEFT JOIN address a ON u.address_id = a.address_id
          LEFT JOIN contact_details c ON u.contact_id = c.contact_id
          LEFT JOIN store s ON u.store_id = s.store_id
          LEFT JOIN clinics c1 ON u.clinic_id = c1.clinic_id
          LEFT JOIN images i ON u.image_id = i.image_id WHERE c.mobile_number=?`;
      const [data] = await connection.query(sql, [mobile_number]);
  
      if (data.length === 0) {
        return res.status(404).json({ message: messages.NO_DATA });
      }
  
      // Modify boolean values from 1 and 0 to true and false
      const modifiedData = data.map((row) => ({
        ...row,
        food_treats: row.food_treats === 1,
        accessories: row.accessories === 1,
        toys: row.toys === 1,
        health_care: row.health_care === 1,
        dog_service: row.dog_service === 1,
        breader_adoption_sale: row.breader_adoption_sale === 1,
      }));
  
      // After verifying the mobile number and logging in the user, generate a JWT token
      const userId = data[0].user_id;
      const token = jwtMiddleware.generateToken(userId);
      const refreshToken = jwtMiddleware.generateRefreshToken(userId);
  
      res.status(200).json({
        registrationData: modifiedData,
        token,
        refreshToken,
        message: messages.SUCCESS_MESSAGE,
      });
    } catch (error) {
      console.log("Error", error);
      res.status(500).json({ message: messages.FAILURE_MESSAGE });
    }
  });
  
//   registration.post('/refresh-token', (req, res) => {
//     const refreshTokenValue = req.body.refreshToken;
  
//     // Verify the refresh token
//     const isValidRefreshToken = jwtMiddleware.verifyRefreshToken(refreshTokenValue);
    
//     if (!isValidRefreshToken) {
//       return res.status(403).json({ message: 'Forbidden' });
//     }
  
//     // jwtMiddleware.refreshToken(req, res);
//   });


registration.delete('/delete-registration-data',jwtMiddleware.verifyToken, async (req, res) => {
    const reg_id = req.query.reg_id;
    const sql = 'DELETE FROM `registrations` WHERE `reg_id`=?';

    try {
        // Execute the delete query
        const [result] = await connection.query(sql, reg_id);

        res.status(200).json({
            deletedData: result,
            message: messages.DATA_DELETED
        });
    } catch (err) {
        console.error("Error deleting data", err.message);
        res.status(400).json({ message: messages.FAILED_TO_DELETE });
    }
});


module.exports=registration;