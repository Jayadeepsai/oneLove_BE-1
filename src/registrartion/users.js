const express = require('express');
const users = express.Router();
const bodyParser = require('body-parser');
const messages = require('../messages/constants');

const db = require('../../dbConnection')

users.use(express.json()); // To parse JSON bodies
users.use(express.urlencoded({ extended: true })); // To parse URL-encoded bodies



users.get('/users-id',async(req,res)=>{
    const user_id=req.query.user_id;
    const sql=`
    SELECT u.*, a.*, c.*,s.*,c1.*,s1.*,t.*
    FROM users u
    LEFT JOIN address a ON u.address_id = a.address_id
    LEFT JOIN contact_details c ON u.contact_id = c.contact_id 
    LEFT JOIN service s ON u.service_id = s.service_id
    LEFT JOIN clinics c1 ON  u.clinic_id = c1.clinic_id
    LEFT JOIN store s1 ON u.store_id = s1.store_id
    LEFT JOIN time t ON c1.time_id = t.time_id
    WHERE u.user_id = ?`;
try{
    const [results] = await db.query(sql, [user_id]);
    const userData = JSON.parse(JSON.stringify(results));

    if (userData.length > 0) {
        res.status(200).json({
            userData,
            message:messages.SUCCESS_MESSAGE,
        });
    } else {
        res.status(404).json({
            message: messages.NO_DATA,
        });
    }

}catch(err){
    console.error('Error fetching data:', err);
    res.status(500).json({
        message: messages.FAILURE_MESSAGE,
    });
}
});



users.put('/update-user',async(req,res)=>{
try{
    const user_id = req.query.user_id;

    if(!user_id){
     res.status(400).json({message:messages.INVALID_ID})
    }

    const { user_name, user_type} = req.body;

    let userSql = 'UPDATE users SET';

    const userValues =[];

    if (user_name !== undefined) {
        userSql += ' user_name=?,';
        userValues.push(user_name);
    }
    if (user_type !== undefined) {
        userSql += ' user_type=?,';
        userValues.push(user_type);
    }

    userSql = userSql.slice(0, -1);
        userSql += ' WHERE user_id=?';
        userValues.push(user_id);

        await db.beginTransaction();

        res.status(200).json({
            message: messages.DATA_UPDATED,
        });

    }catch(err){
        await db.rollback();
        console.error('Error updating data:', err.message);
        res.status(400).json({ message: messages.DATA_UPDATE_FALIED });
    }
});


// users.put('/update-user-profile',async(req,res)=>{
  
//     try{
//         const user_id = req.query.user_id;

//         if(!user_id){
//          res.status(400).json({message:messages.INVALID_ID})
//         }
//         const { address, city, state, zip, country, landmark, address_type, mobile_number, email, user_type, user_name, store_name, discounts, pet_walking, pet_sitting, pet_boarding, event_training, training_workshop, adoption_drives, pet_intelligence_rank_card, pet_grooming, clinic_name, specialisation, clinic_license, experience, education } = req.body;
         
//         let addressSql = 'UPDATE address SET';
//         let contact_detailsSql = 'UPDATE contact_details SET';
//         let usersSql = 'UPDATE users SET';
//         let serviceSql = 'UPDATE service SET';
//         let storeSql = 'UPDATE store SET';
//         let clinicSql = 'UPDATE clinc SET';

//         const addressValues = [];
//         const contactDetailsValues = [];
//         const usersValues = [];
//         const serviceValues = [];
//         const storeValues =[];
//         const clinicValues = [];

//         // Update address table
//         if (address !== undefined) {
//             addressSql += ' address=?,';
//             addressValues.push(address);
//         }
//         if (city !== undefined) {
//             addressSql += ' city=?,';
//             addressValues.push(city);
//         }
//         if (state !== undefined) {
//             addressSql += ' state=?,';
//             addressValues.push(state);
//         }
//         if (zip !== undefined) {
//             addressSql += ' zip=?,';
//             addressValues.push(zip);
//         }
//         if (country !== undefined) {
//             addressSql += ' country=?,';
//             addressValues.push(country);
//         }
//         if (landmark !== undefined) {
//             addressSql += ' landmark=?,';
//             addressValues.push(landmark);
//         }
//         if (address_type !== undefined) {
//             addressSql += ' address_type=?,';
//             addressValues.push(address_type);
//         }

//         addressSql = addressSql.slice(0, -1);
//         addressSql += ' WHERE address_id=(SELECT address_id FROM users WHERE user_id=?)';
//         addressValues.push(user_id);

//         // Update contact_details table
//         if (mobile_number !== undefined) {
//             contact_detailsSql += ' mobile_number=?,';
//             contactDetailsValues.push(mobile_number);
//         }
//         if (email !== undefined) {
//             contact_detailsSql += ' email=?,';
//             contactDetailsValues.push(email);
//         }
    

//         contact_detailsSql = contact_detailsSql.slice(0, -1);
//         contact_detailsSql += ' WHERE contact_id=(SELECT contact_id FROM users WHERE user_id=?)';
//         contactDetailsValues.push(user_id);

//         // Update users table
//         if (user_type !== undefined) {
//             usersSql += ' user_type=?,';
//             usersValues.push(user_type);
//         }
//         if (user_name !== undefined) {
//             usersSql += ' user_name=?,';
//             usersValues.push(user_name);
//         }

//         usersSql = usersSql.slice(0, -1);
//         usersSql += ' WHERE user_id=?';
//         usersValues.push(user_id);

//         if (store_name !== undefined) {
//             storeSql += ' store_name=?,';
//             storeValues.push(store_name);
//         }
//         if (discounts !== undefined) {
//             storeSql += ' discounts=?,';
//             storeValues.push(discounts);
//         }

//         storeSql = storeSql.slice(0, -1);
//         storeSql += ' WHERE store_id=(SELECT store_id FROM users WHERE user_id=?)';
//         storeValues.push(user_id);
        

//         if (pet_walking !== undefined) {
//             serviceSql += ' pet_walking=?,';
//             serviceValues.push(pet_walking);
//         }
//         if (pet_sitting !== undefined) {
//             serviceSql += ' pet_sitting=?,';
//             serviceValues.push(pet_sitting);
//         }
//         if (pet_boarding !== undefined) {
//             serviceSql += ' pet_boarding=?,';
//             serviceValues.push(pet_boarding);
//         }
//         if (event_training !== undefined) {
//             serviceSql += ' event_training=?,';
//             serviceValues.push(event_training);
//         }
//         if (training_workshop !== undefined) {
//             serviceSql += ' training_workshop=?,';
//             serviceValues.push(training_workshop);
//         }
//         if (adoption_drives !== undefined) {
//             serviceSql += ' adoption_drives=?,';
//             serviceValues.push(adoption_drives);
//         }
//         if (pet_intelligence_rank_card !== undefined) {
//             serviceSql += ' pet_intelligence_rank_card=?,';
//             serviceValues.push(pet_intelligence_rank_card);
//         }
//         if (pet_grooming !== undefined) {
//             serviceSql += ' pet_grooming=?,';
//             serviceValues.push(pet_grooming);
//         }

//         serviceSql = serviceSql.slice(0, -1);
//         serviceSql += ' WHERE user_id=?';
//         serviceValues.push(user_id);

//         // Update clinic table
//         if (clinic_name !== undefined) {
//             clinicSql += ' clinic_name=?,';
//             clinicValues.push(clinic_name);
//         }
//         if (specialisation !== undefined) {
//             clinicSql += ' specialisation=?,';
//             clinicValues.push(specialisation);
//         }
//         if (clinic_license !== undefined) {
//             clinicSql += ' clinic_license=?,';
//             clinicValues.push(clinic_license);
//         }
//         if (experience !== undefined) {
//             clinicSql += ' experience=?,';
//             clinicValues.push(experience);
//         }
//         if (education !== undefined) {
//             clinicSql += ' education=?,';
//             clinicValues.push(education);
//         }

//         clinicSql = clinicSql.slice(0, -1);
//         clinicSql += ' WHERE clinic_id=(SELECT clinic_id FROM users WHERE user_id=?)';
//         clinicValues.push(user_id);

//         await db.beginTransaction();

//         await db.query(addressSql, addressValues);
//         await db.query(contact_detailsSql, contactDetailsValues);
//         await db.query(usersSql, usersValues);
//         await db.query(storeSql, storeValues);
//         await db.query(serviceSql, serviceValues);
//         await db.query(clinicSql,clinicValues);

//         await db.commit();

//         res.status(200).json({
//             message: messages.DATA_UPDATED,
//         });

//     }catch(err){
//         await db.rollback();
//         console.error('Error updating data:', err.message);
//         res.status(400).json({ message: messages.DATA_UPDATE_FALIED });
//     }
// });


module.exports=users;