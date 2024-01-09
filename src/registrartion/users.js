const express = require('express');
const users = express.Router();
const bodyParser = require('body-parser');
const messages = require('../messages/constants');
const db = require('../../dbConnection');
const jwtMiddleware = require('../../jwtMiddleware');
const logger = require('../../logger');

users.use(express.json());
users.use(express.urlencoded({ extended: true }));


users.get('/users-id',jwtMiddleware.verifyToken,async(req,res)=>{

    const user_id=req.query.user_id;

    const sql=` SELECT
    u.user_id,
    u.user_type,
    u.address_id,
    u.contact_id,
    u.user_name,
    u.store_id,
    u.service_id,
    u.clinic_id,
    u.image_id,
    u.external_id,
    a.address,
    a.city,
    a.state,
    a.zip,
    a.country,
    a.landmark,
    a.address_type,
    a.lat_cords,
    a.lan_cords,
    c.mobile_number,
    c.email,
    s.store_name,
    c1.clinic_name,
    i.image_type,
    i.image_url,
    s.food_treats,
    s.accessories,
    s.toys,
    s.health_care,
    s.dog_service,
    s.breader_adoption_sale
FROM
    onelove_v2.users u
    LEFT JOIN onelove_v2.address a ON u.address_id = a.address_id
    LEFT JOIN onelove_v2.contact_details c ON u.contact_id = c.contact_id
    LEFT JOIN onelove_v2.store s ON u.store_id = s.store_id
    LEFT JOIN onelove_v2.clinics c1 ON u.clinic_id = c1.clinic_id
    LEFT JOIN onelove_v2.images i ON u.image_id = i.image_id
WHERE
    u.user_id=?;`
try{
    const [results] = await db.query(sql, [user_id]);
    const userData = JSON.parse(JSON.stringify(results));

    if (userData.length > 0) {
        return res.status(200).json({
            userData,
            message:messages.SUCCESS_MESSAGE,
        });
    } else {
        return res.status(200).json({
            message: messages.NO_DATA,
        });
    }

}catch(err){
    logger.error('Error fetching data:', err);
    return res.status(400).json({
        message: messages.FAILURE_MESSAGE,
    });
}
});


// users.get('/users-pet-owners-user-id',jwtMiddleware.verifyToken,async(req,res)=>{
//     const user_id=req.query.user_id;
//     const sql=`
//     SELECT u.*, a.*, c.*,s.*,c1.*,s1.*, i.*
//     FROM users u
//     LEFT JOIN address a ON u.address_id = a.address_id
//     LEFT JOIN contact_details c ON u.contact_id = c.contact_id 
//     LEFT JOIN service s ON u.service_id = s.service_id
//     LEFT JOIN clinics c1 ON  u.clinic_id = c1.clinic_id
//     LEFT JOIN store s1 ON u.store_id = s1.store_id
//     LEFT JOIN images i ON u.image_id = i.image_id
//     WHERE u.user_id = ? AND u.user_type='pet_owner'`;
// try{
//     const [results] = await db.query(sql, [user_id]);
//     const userData = JSON.parse(JSON.stringify(results));

//     if (userData.length > 0) {
//         return res.status(200).json({
//             userData,
//             message:messages.SUCCESS_MESSAGE,
//         });
//     } else {
//         return res.status(200).json({
//             message: messages.NO_DATA,
//         });
//     }

// }catch(err){
//     logger.error('Error fetching data:', err);
//     return res.status(400).json({
//         message: messages.FAILURE_MESSAGE,
//     });
// }
// });



// users.get('/users-pet-owners',jwtMiddleware.verifyToken,async(req,res)=>{
//     const sql=`
//     SELECT u.*, a.*, c.*,s.*,c1.*,s1.*,i.*
//     FROM users u
//     LEFT JOIN address a ON u.address_id = a.address_id
//     LEFT JOIN contact_details c ON u.contact_id = c.contact_id 
//     LEFT JOIN service s ON u.service_id = s.service_id
//     LEFT JOIN clinics c1 ON  u.clinic_id = c1.clinic_id
//     LEFT JOIN store s1 ON u.store_id = s1.store_id
//     LEFT JOIN images i ON u.image_id = i.image_id
//     WHERE u.user_type='pet_owner'`;
// try{
//     const [results] = await db.query(sql);
//     const userData = JSON.parse(JSON.stringify(results));

//     if (userData.length > 0) {
//         return res.status(200).json({
//             userData,
//             message:messages.SUCCESS_MESSAGE,
//         });
//     } else {
//         return res.status(200).json({
//             message: messages.NO_DATA,
//         });
//     }

// }catch(err){
//     logger.error('Error fetching data:', err);
//     return res.status(400).json({
//         message: messages.FAILURE_MESSAGE,
//     });
// }
// });



users.put('/update-user-profile',jwtMiddleware.verifyToken,async(req,res)=>{
  
    try{
        const user_id = req.query.user_id;

        if(!user_id){
            return res.status(400).json({message:messages.INVALID_ID})
        }

        const {address, city, state, zip, country, landmark, address_type, lat_cords, lan_cords} = req.body;
        const { mobile_number, email, password } = req.body;
        const { user_name, external_id } = req.body;
        const { store_name, food_treats, accessories, toys, health_care, dog_service, breader_adoption_sale } = req.body;  
        const { pet_walking, pet_sitting, pet_boarding, event_training, training_workshop, adoption_drives, pet_intelligence_rank_card, pet_grooming, trainer_experience, service_start_day, service_end_day, service_start_time, service_end_time} = req.body;
        const { clinic_name, specialisation, clinic_license, experience, education , week_start_day, week_end_day, start_time, end_time} = req.body;
        const { image_type, image_url} =req.body;

        await db.beginTransaction();

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
            imageSql += ' WHERE image_id=(SELECT image_id FROM users WHERE user_id=?)';
            imageValues.push(user_id);
    
            await db.query(imageSql, imageValues);

        }

        if(address || city || state || zip || country || landmark || address_type || lat_cords || lan_cords){

        let addressSql = 'UPDATE address SET';
        const addressValues = [];

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
        if (lat_cords !== undefined) {
            addressSql += ' lat_cords=?,';
            addressValues.push(lat_cords);
        }
        if (lan_cords !== undefined) {
            addressSql += ' lan_cords=?,';
            addressValues.push(lan_cords);
        }

        addressSql = addressSql.slice(0, -1);
        addressSql += ' WHERE address_id=(SELECT address_id FROM users WHERE user_id=?)';
        addressValues.push(user_id);

        await db.query(addressSql, addressValues);
    }

    if(mobile_number || email || password){

        let contact_detailsSql = 'UPDATE contact_details SET';
        const contactDetailsValues = [];

          if (mobile_number !== undefined) {
            contact_detailsSql += ' mobile_number=?,';
            contactDetailsValues.push(mobile_number);
        }
        if (email !== undefined) {
            contact_detailsSql += ' email=?,';
            contactDetailsValues.push(email);
        }
        if (password !== undefined) {
            contact_detailsSql += ' password=?,';
            contactDetailsValues.push(password);
        }
    
        contact_detailsSql = contact_detailsSql.slice(0, -1);
        contact_detailsSql += ' WHERE contact_id=(SELECT contact_id FROM users WHERE user_id=?)';
        contactDetailsValues.push(user_id);

        await db.query(contact_detailsSql, contactDetailsValues);
    }

    if( user_name || external_id){

        let usersSql = 'UPDATE users SET';
        const usersValues = [];

        if (user_name !== undefined) {
            usersSql += ' user_name=?,';
            usersValues.push(user_name);
        }
        if (external_id !== undefined) {
            usersSql += ' external_id=?,';
            usersValues.push(external_id);
        }

        usersSql = usersSql.slice(0, -1);
        usersSql += ' WHERE user_id=?';
        usersValues.push(user_id);

        await db.query(usersSql, usersValues);
    }

    if(store_name || food_treats || accessories || toys || health_care || dog_service || breader_adoption_sale){

        let storeSql = 'UPDATE store SET';
        const storeValues =[];

        if (store_name !== undefined) {
            storeSql += ' store_name=?,';
            storeValues.push(store_name);
        }
        if (food_treats !== undefined) {
            storeSql += ' food_treats=?,';
            storeValues.push(food_treats);
        }
        if (accessories !== undefined) {
            storeSql += ' accessories=?,';
            storeValues.push(accessories);
        }
        if (toys !== undefined) {
            storeSql += ' toys=?,';
            storeValues.push(toys);
        }
        if (health_care !== undefined) {
            storeSql += ' health_care=?,';
            storeValues.push(health_care);
        }
        if (dog_service !== undefined) {
            storeSql += ' dog_service=?,';
            storeValues.push(dog_service);
        }
        if (breader_adoption_sale !== undefined) {
            storeSql += ' breader_adoption_sale=?,';
            storeValues.push(breader_adoption_sale);
        }
     
        storeSql = storeSql.slice(0, -1);
        storeSql += ' WHERE store_id=(SELECT store_id FROM users WHERE user_id=?)';
        storeValues.push(user_id);

        await db.query(storeSql, storeValues);
    }

    if(pet_walking || pet_sitting || pet_boarding || event_training || training_workshop || adoption_drives || pet_intelligence_rank_card || pet_grooming || trainer_experience || service_start_day || service_end_day || service_start_time || service_end_time){

      
    
        let serviceSql = 'UPDATE service SET';
        const serviceValues = [];

        if (pet_walking !== undefined) {
            serviceSql += ' pet_walking=?,';
            serviceValues.push(pet_walking);
        }
        if (pet_sitting !== undefined) {
            serviceSql += ' pet_sitting=?,';
            serviceValues.push(pet_sitting);
        }
        if (pet_boarding !== undefined) {
            serviceSql += ' pet_boarding=?,';
            serviceValues.push(pet_boarding);
        }
        if (event_training !== undefined) {
            serviceSql += ' event_training=?,';
            serviceValues.push(event_training);
        }
        if (training_workshop !== undefined) {
            serviceSql += ' training_workshop=?,';
            serviceValues.push(training_workshop);
        }
        if (adoption_drives !== undefined) {
            serviceSql += ' adoption_drives=?,';
            serviceValues.push(adoption_drives);
        }
        if (pet_intelligence_rank_card !== undefined) {
            serviceSql += ' pet_intelligence_rank_card=?,';
            serviceValues.push(pet_intelligence_rank_card);
        }
        if (pet_grooming !== undefined) {
            serviceSql += ' pet_grooming=?,';
            serviceValues.push(pet_grooming);
        }
        if (trainer_experience !== undefined) {
            serviceSql += ' trainer_experience=?,';
            serviceValues.push(trainer_experience);
        }
        if (trainer_experience !== undefined) {
            serviceSql += ' trainer_experience=?,';
            serviceValues.push(trainer_experience);
        }
        if (service_start_day !== undefined) {
            serviceSql += ' service_start_day=?,';
            serviceValues.push(service_start_day);
        }
        if (service_end_day !== undefined) {
            serviceSql += ' service_end_day=?,';
            serviceValues.push(service_end_day);
        }
        if (service_start_time !== undefined) {
            serviceSql += ' service_start_time=?,';
            serviceValues.push(service_start_time);
        }
        if (service_end_time !== undefined) {
            serviceSql += ' service_end_time=?,';
            serviceValues.push(service_end_time);
        }

        serviceSql = serviceSql.slice(0, -1);
        serviceSql += ' WHERE service_id=(SELECT service_id FROM users WHERE user_id=?)';
        serviceValues.push(user_id);

        await db.query(serviceSql, serviceValues);
    }

    if(clinic_name || specialisation || clinic_license || experience || education || week_start_day || week_end_day || start_time || end_time){


        let clinicSql = 'UPDATE clinics SET';
        const clinicValues = [];

        if (clinic_name !== undefined) {
            clinicSql += ' clinic_name=?,';
            clinicValues.push(clinic_name);
        }
        if (specialisation !== undefined) {
            clinicSql += ' specialisation=?,';
            clinicValues.push(JSON.stringify(specialisation));
        }
        if (clinic_license !== undefined) {
            clinicSql += ' clinic_license=?,';
            clinicValues.push(clinic_license);
        }
        if (experience !== undefined) {
            clinicSql += ' experience=?,';
            clinicValues.push(experience);
        }
        if (education !== undefined) {
            clinicSql += ' education=?,';
            clinicValues.push(education);
        }
        if (week_start_day !== undefined) {
            clinicSql += ' week_start_day=?,';
            clinicValues.push(week_start_day);
        }
        if (week_end_day !== undefined) {
            clinicSql += ' week_end_day=?,';
            clinicValues.push(week_end_day);
        }
        if (start_time !== undefined) {
            clinicSql += ' start_time=?,';
            clinicValues.push(start_time);
        }
        if (end_time !== undefined) {
            clinicSql += ' end_time=?,';
            clinicValues.push(end_time);
        }
 

        clinicSql = clinicSql.slice(0, -1);
        clinicSql += ' WHERE clinic_id=(SELECT clinic_id FROM users WHERE user_id=?)';
        clinicValues.push(user_id);

        await db.query(clinicSql,clinicValues);
    }

        await db.commit();

        return res.status(200).json({
            message: messages.DATA_UPDATED,
        });

    }catch(err){
        await db.rollback();
        logger.error('Error updating data:', err);
        return res.status(400).json({ message: messages.DATA_UPDATE_FALIED });
    }
});


module.exports=users;