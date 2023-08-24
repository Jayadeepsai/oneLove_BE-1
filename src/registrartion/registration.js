const express = require('express');
const registration = express.Router();
const bodyParser = require('body-parser');
const connection = require('../../dbConnection')
const messages = require('../messages/constants')

registration.use(express.json()); // To parse JSON bodies
registration.use(express.urlencoded({ extended: true })); // To parse URL-encoded bodies


// async function performTransaction(req, res) {

//     try {
//         // Start the transaction
//         await connection.beginTransaction();

//         // Insert into address table
//         const { address, city, state, zip, country, landmark, address_type } = req.body;
//         const addressQuery = 'INSERT INTO onelove.address (address, city, state, zip, country, landmark, address_type) VALUES (?, ?, ?, ?, ?, ?, ?)';
//         const addressValues = [address, city, state, zip, country, landmark, address_type];

//         const [addressResult] = await connection.query(addressQuery, addressValues);
//         const address_id = addressResult.insertId;

//         // Insert into contact_details table
//         const { mobile_number, email } = req.body;
//         const contactQuery = 'INSERT INTO onelove.contact_details (mobile_number, email) VALUES (?, ?)';
//         const contactValues = [mobile_number, email];

//         const [contactResult] = await connection.query(contactQuery, contactValues);
//         const contact_id = contactResult.insertId;

//         const { user_type, user_name } = req.body;
        
//         // Initialize clinic_id and service_id as null
//         let clinic_id = null;
//         let service_id = null;
//         let store_id = null;

//         if (user_type === 'pet_owner') {
//             // Insert into users and registrations tables for pet_owner
//             const userQuery = 'INSERT INTO onelove.users (user_type, user_name, address_id, contact_id, service_id, clinic_id, store_id) VALUES (?, ?, ?, ?, ?, ?, ?)';
//             const userValues = [user_type, user_name, address_id, contact_id, service_id, clinic_id, store_id];

//             const [userResult] = await connection.query(userQuery, userValues);
//             const user_id = userResult.insertId;

//             // Insert into registrations table
//             const regQuery = 'INSERT INTO onelove.registrations (user_id, address_id, contact_id) VALUES (?, ?, ?)';
//             const regValues = [user_id, address_id, contact_id];

//             await connection.query(regQuery, regValues);
//         } else if (user_type === 'pet_trainer') {
//             // Insert into service table for pet_doctor
//             const { pet_walking, pet_sitting, pet_boarding, event_training, training_workshop, adoption_drives, pet_intelligence_rank_card, pet_grooming } = req.body;
//             const serviceQuery = 'INSERT INTO onelove.service (pet_walking, pet_sitting, pet_boarding, event_training, training_workshop, adoption_drives, pet_intelligence_rank_card, pet_grooming) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
//             const serviceValues = [pet_walking, pet_sitting, pet_boarding, event_training, training_workshop, adoption_drives, pet_intelligence_rank_card, pet_grooming];
            
//             const [serviceResult] = await connection.query(serviceQuery, serviceValues);
//             service_id = serviceResult.insertId;

//             // Insert into users and registrations tables for pet_doctor
//             const userQuery = 'INSERT INTO onelove.users (user_type, user_name, address_id, contact_id, service_id, clinic_id, store_id) VALUES (?, ?, ?, ?, ?, ?, ?)';
//             const userValues = [user_type, user_name, address_id, contact_id, service_id, clinic_id, store_id];

//             const [userResult] = await connection.query(userQuery, userValues);
//             const user_id = userResult.insertId;

//             // Insert into registrations table
//             const regQuery = 'INSERT INTO onelove.registrations (user_id, address_id, contact_id) VALUES (?, ?, ?)';
//             const regValues = [user_id, address_id, contact_id];

//             await connection.query(regQuery, regValues);
//         } else if (user_type === 'pet_doctor') {
//             // Insert into clinic table for pet_trainer
//             const { clinic_name, specialisation, clinic_license, experience, education } = req.body;
//             const clinicQuery = 'INSERT INTO onelove.clinics (clinic_name, specialisation, clinic_license, experience, education) VALUES (?, ?, ?, ?, ?)';
//             const clinicValues = [clinic_name, specialisation, clinic_license, experience, education];

//             const [clinicResult] = await connection.query(clinicQuery, clinicValues);
//             clinic_id = clinicResult.insertId;

//             // Insert into users and registrations tables for pet_trainer
//             const userQuery = 'INSERT INTO onelove.users (user_type, user_name, address_id, contact_id, service_id, clinic_id, store_id) VALUES (?, ?, ?, ?, ?, ?, ?)';
//             const userValues = [user_type, user_name, address_id, contact_id, service_id, clinic_id, store_id];

//             const [userResult] = await connection.query(userQuery, userValues);
//             const user_id = userResult.insertId;

//             // Insert into registrations table
//             const regQuery = 'INSERT INTO onelove.registrations (user_id, address_id, contact_id) VALUES (?, ?, ?)';
//             const regValues = [user_id, address_id, contact_id];

//             await connection.query(regQuery, regValues);
//         }else if(user_type === 'pet_store') {
//             const { store_name, discounts, item_id, order_id, payment_id, inventory_id } = req.body;
//             const storeQuery = 'INSERT INTO onelove.store (store_name, discounts, item_id, order_id, payment_id, inventory_id) VALUES (?, ?, ?, ?, ?, ?)';
//             const storeValues =[ store_name, discounts, item_id, order_id, payment_id, inventory_id ];

//             const [storeResult] = await connection.query(storeQuery,storeValues);
//             store_id = storeResult.insertId;

//              // Insert into users and registrations tables for pet_trainer
//              const userQuery = 'INSERT INTO onelove.users (user_type, user_name, address_id, contact_id, service_id, clinic_id, store_id) VALUES (?, ?, ?, ?, ?, ?, ?)';
//              const userValues = [user_type, user_name, address_id, contact_id, service_id, clinic_id, store_id];
 
//              const [userResult] = await connection.query(userQuery, userValues);
//              const user_id = userResult.insertId;
 
//              // Insert into registrations table
//              const regQuery = 'INSERT INTO onelove.registrations (user_id, address_id, contact_id) VALUES (?, ?, ?)';
//              const regValues = [user_id, address_id, contact_id];
 
//              await connection.query(regQuery, regValues);
//         }

//         // Commit the transaction if all queries are successful
//         await connection.commit();

        

//         // Send a success response to the client
//         res.status(200).json({ message: 'Transaction committed successfully.' });
//         console.log('Transaction committed successfully.');
//     } catch (error) {
//         // Rollback the transaction if any query fails
//         await connection.rollback();

//         console.error('Error in transaction:', error.message);

//         // Send an error response to the client
//         res.status(500).json({ message: 'Failed to perform transaction.' });
//     }
//     //  finally {
//     //     // Release the connection back to the pool
//     //     connection.release();
//     // }
// }


async function performTransaction(req, res) {
    try {
        // Start the transaction
        await connection.beginTransaction();

       // Insert into address table
       const { address, city, state, zip, country, landmark, address_type } = req.body;
       const addressQuery = 'INSERT INTO onelove.address (address, city, state, zip, country, landmark, address_type) VALUES (?, ?, ?, ?, ?, ?, ?)';
       const addressValues = [address, city, state, zip, country, landmark, address_type];

       const [addressResult] = await connection.query(addressQuery, addressValues);
       const address_id = addressResult.insertId;

       // Insert into contact_details table
       const { mobile_number, email } = req.body;
       const contactQuery = 'INSERT INTO onelove.contact_details (mobile_number, email) VALUES (?, ?)';
       const contactValues = [mobile_number, email];

       const [contactResult] = await connection.query(contactQuery, contactValues);
       const contact_id = contactResult.insertId;

       let image_id = null; // Initialize image_id as null
       const { image_type, image_url } = req.body;
       if (image_type && image_url) {
           const imageQuery = 'INSERT INTO onelove.images (image_type, image_url) VALUES (?, ?)';
           const imageValues = [image_type, image_url];

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
                const { pet_walking, pet_sitting, pet_boarding, event_training, training_workshop, adoption_drives, pet_intelligence_rank_card, pet_grooming } = req.body;
                const serviceQuery = 'INSERT INTO onelove.service (pet_walking, pet_sitting, pet_boarding, event_training, training_workshop, adoption_drives, pet_intelligence_rank_card, pet_grooming) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
                const serviceValues = [pet_walking, pet_sitting, pet_boarding, event_training, training_workshop, adoption_drives, pet_intelligence_rank_card, pet_grooming];
             
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
                const { clinic_name, specialisation, clinic_license, experience, education } = req.body;
                const clinicQuery = 'INSERT INTO onelove.clinics (clinic_name, specialisation, clinic_license, experience, education) VALUES (?, ?, ?, ?, ?)';
                const clinicValues = [clinic_name, specialisation, clinic_license, experience, education];
    
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
                const { store_name, discounts, item_id, order_id, payment_id, inventory_id } = req.body;
                const storeQuery = 'INSERT INTO onelove.store (store_name, discounts, item_id, order_id, payment_id, inventory_id) VALUES (?, ?, ?, ?, ?, ?)';
                const storeValues =[ store_name, discounts, item_id, order_id, payment_id, inventory_id ];

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
                res.status(400).json({message:"user_type you have choosen is invalid"});
                break;
        }

        // Commit the transaction if all queries are successful
        await connection.commit();

        console.log('Transaction committed successfully.');

        // Send a success response to the client
        res.status(200).json({ message: 'Transaction committed successfully.' });
    } catch (error) {
        // Rollback the transaction if any query fails
        await connection.rollback();

        console.error('Error in transaction:', error);

        // Send an error response to the client
        res.status(500).json({ message: 'Failed to perform transaction.' });
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


registration.get('/registration', async (req, res) => {
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


registration.get('/registration-id', async(req,res)=>{

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


registration.get('/registration-mobile-number', async(req,res)=>{

    const mobile_number = req.query.mobile_number;
    try{
        if (!mobile_number) {
            return res.status(400).json({ message: messages.NO_DATA });
        }
    
        const sql =`SELECT a.*, c.*, u.*, r.*, i.*
        FROM onelove.registrations r
        LEFT JOIN address a ON r.address_id = a.address_id
        LEFT JOIN contact_details c ON r.contact_id = c.contact_id
        LEFT JOIN users u ON r.user_id = u.user_id
        LEFT JOIN images i ON r.image_id = i.image_id WHERE c.mobile_number=?`;
        const [data] = await connection.query(sql,[mobile_number]);
    
        if (data.length === 0) {
            return res.status(404).json({ message: messages.SUCCESS_MESSAGE });
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


    

registration.put('/update-reg', async (req, res) => {
    try {
        const reg_id = req.query.reg_id;

        const { address, city, state, zip, country, landmark, address_type, mobile_number, email, user_type, user_name } = req.body;

        let addressSql = 'UPDATE address SET';
        let contact_detailsSql = 'UPDATE contact_details SET';
        let usersSql = 'UPDATE users SET';

        const addressValues = [];
        const contactDetailsValues = [];
        const usersValues = [];

        // Update address table
        if (address !== undefined) {
            addressSql += ' address=?,';
            addressValues.push(address);
        }
        if (city !== undefined) {
            addressSql += ' city=?,';
            addressValues.push(city);
        }
        if (state !== undefined) {
            addressSql += ' state=?,';
            addressValues.push(state);
        }
        if (zip !== undefined) {
            addressSql += ' zip=?,';
            addressValues.push(zip);
        }
        if (country !== undefined) {
            addressSql += ' country=?,';
            addressValues.push(country);
        }
        if (landmark !== undefined) {
            addressSql += ' landmark=?,';
            addressValues.push(landmark);
        }
        if (address_type !== undefined) {
            addressSql += ' address_type=?,';
            addressValues.push(address_type);
        }

        addressSql = addressSql.slice(0, -1);
        addressSql += ' WHERE address_id=(SELECT address_id FROM registrations WHERE reg_id=?)';
        addressValues.push(reg_id);

        // Update contact_details table
        if (mobile_number !== undefined) {
            contact_detailsSql += ' mobile_number=?,';
            contactDetailsValues.push(mobile_number);
        }
        if (email !== undefined) {
            contact_detailsSql += ' email=?,';
            contactDetailsValues.push(email);
        }
    

        contact_detailsSql = contact_detailsSql.slice(0, -1);
        contact_detailsSql += ' WHERE contact_id=(SELECT contact_id FROM registrations WHERE reg_id=?)';
        contactDetailsValues.push(reg_id);

        // Update users table
        if (user_type !== undefined) {
            usersSql += ' user_type=?,';
            usersValues.push(user_type);
        }
        if (user_name !== undefined) {
            usersSql += ' user_name=?,';
            usersValues.push(user_name);
        }

        usersSql = usersSql.slice(0, -1);
        usersSql += ' WHERE user_id=(SELECT user_id FROM registrations WHERE reg_id=?)';
        usersValues.push(reg_id);

        await connection.beginTransaction();

        await connection.query(addressSql, addressValues);
        await connection.query(contact_detailsSql, contactDetailsValues);
        await connection.query(usersSql, usersValues);

        await connection.commit();

        res.status(200).json({
            message: messages.DATA_UPDATED,
        });
    } catch (err) {
        await connection.rollback();
        console.error('Error updating data:', err.message);
        res.status(400).json({ message: messages.DATA_UPDATE_FALIED }); 
    }
});


registration.delete('/delete-registration-data', async (req, res) => {
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