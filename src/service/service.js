const express = require('express');
const service = express.Router();
const bodyParser = require('body-parser');
const messages = require('../messages/constants');

const db = require('../../dbConnection');
const dbConnection = require('../../dbConnection');
const jwtMiddleware = require('../../jwtMiddleware');
const logger = require('../../logger');

service.use(express.json()); // To parse JSON bodies
service.use(express.urlencoded({ extended: true })); // To parse URL-encoded bodies

async function serviceQueries(req, res) { // Pass req and res as arguments


    try {
        // Start the transaction
        await db.beginTransaction();

        const { pet_walking, pet_sitting, pet_boarding, event_training, training_workshop, adoption_drives, pet_intelligence_rank_card, pet_grooming, trainer_experience, service_start_day, service_end_day, service_start_time, service_end_time} = req.body;
        const serviceQuery = 'INSERT INTO onelove.service (pet_walking, pet_sitting, pet_boarding, event_training, training_workshop, adoption_drives, pet_intelligence_rank_card, pet_grooming, trainer_experience, service_start_day, service_end_day, service_start_time, service_end_time) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
        const serviceValues = [pet_walking, pet_sitting, pet_boarding, event_training, training_workshop, adoption_drives, pet_intelligence_rank_card, pet_grooming, trainer_experience, service_start_day, service_end_day, service_start_time, service_end_time];

        await db.query(serviceQuery, serviceValues);
        // Commit the transaction if all queries are successful
        await db.commit();
        logger.info('Transaction committed successfully.');
        // Send a success response to the client
        res.status(200).json({ message:messages.POST_SUCCESS });
    } catch (error) {
        // Rollback the transaction if any query fails
        await db.rollback();
        logger.error('Error in transaction:', error.message);
        // Send an error response to the client
        res.status(400).json({ message: messages.POST_FAILED });
    }

}

service.post('/service',jwtMiddleware.verifyToken, (req, res) => {
    serviceQueries(req, res)
        .then(() => {
            logger.info('Transaction completed successfully');
        })
        .catch((err) => {
            logger.error('Error in address.post API:', err);
        });
});




service.get('/service',jwtMiddleware.verifyToken, async(req,res)=>{

    const { userType } = req;
    if (userType !== 'pet_owner') {
        return res.status(403).json({ message: messages.FORBID });
    }

    const sql = `
    SELECT  s.*,u.*,a.*,c.*, i.*
    FROM users u
    LEFT JOIN service s ON u.service_id = s.service_id
    LEFT JOIN address a ON u.address_id = a.address_id
    LEFT JOIN images i ON u.image_id = i.image_id
    LEFT JOIN contact_details c ON u.contact_id = c.contact_id
    WHERE u.user_type = 'pet_trainer'`;

    try{
        const [results] = await db.query(sql);
        const servicesData = JSON.parse(JSON.stringify(results));

        if (servicesData.length > 0) {
            // Convert numeric boolean values to actual boolean values in the response
            const convertedServicesData = servicesData.map(item => ({
                ...item,
                pet_walking: item.pet_walking === 1,
                pet_sitting: item.pet_sitting === 1,
                pet_boarding: item.pet_boarding === 1,
                event_training: item.event_training === 1,
                training_workshop: item.training_workshop === 1,
                adoption_drives: item.adoption_drives === 1,
                pet_intelligence_rank_card: item.pet_intelligence_rank_card === 1,
                pet_grooming: item.pet_grooming === 1,
            }));

            res.status(200).json({
                servicesData: convertedServicesData,
                message: messages.SUCCESS_MESSAGE,
            });
        } else {
            res.status(200).json({
                message: messages.NO_DATA,
            });
        }

    }catch(err){
        logger.error('Error fetching data:', err);
        res.status(400).json({
            message: messages.FAILURE_MESSAGE,
        });
    }
});


service.get('/service-user-id',jwtMiddleware.verifyToken, async (req, res) => {

    const { userType } = req;
    if (userType !== 'pet_owner'&& userType !== 'pet_trainer') {
        return res.status(403).json({ message: messages.FORBID });
    }

    const userId = req.query.user_id;

    if (!userId) {
        return res.status(400).json({
            message: messages.INVALID_ID,
        });
    }

    const sql = `
    SELECT  s.*, u.*, a.*, c.*, i.*
    FROM users u
    LEFT JOIN service s ON u.service_id = s.service_id
    LEFT JOIN address a ON u.address_id = a.address_id
    LEFT JOIN contact_details c ON u.contact_id = c.contact_id
    LEFT JOIN images i ON u.image_id = i.image_id
    WHERE u.user_id = ?`;

    try {
        const [results] = await db.query(sql, [userId]);
        const servicesData = JSON.parse(JSON.stringify(results));

        if (servicesData.length > 0) {
            // Convert numeric boolean values to actual boolean values in the response
            const convertedServicesData = servicesData.map(item => ({
                ...item,
                pet_walking: item.pet_walking === 1,
                pet_sitting: item.pet_sitting === 1,
                pet_boarding: item.pet_boarding === 1,
                event_training: item.event_training === 1,
                training_workshop: item.training_workshop === 1,
                adoption_drives: item.adoption_drives === 1,
                pet_intelligence_rank_card: item.pet_intelligence_rank_card === 1,
                pet_grooming: item.pet_grooming === 1,
            }));

            res.status(200).json({
                servicesData: convertedServicesData,
                message: messages.SUCCESS_MESSAGE,
            });
        } else {
            res.status(200).json({
                message: messages.NO_DATA,
            });
        }
    } catch (err) {
        logger.error('Error fetching data:', err);
        res.status(400).json({
            message: messages.FAILURE_MESSAGE,
        });
    }
});



service.put('/update-service', jwtMiddleware.verifyToken,async (req, res) => {
    try {
        const service_id = req.query.service_id;

        const { pet_walking, pet_sitting, pet_boarding, event_training, training_workshop, adoption_drives, pet_intelligence_rank_card, pet_grooming, trainer_experience, service_start_day, service_end_day, service_start_time, service_end_time } = req.body;

        let serviceSql = 'UPDATE onelove.service SET'
        const serviceValues = []

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
        serviceSql += ' WHERE service_id=?';
        serviceValues.push(service_id);

        await db.query(serviceSql, serviceValues);

        await db.commit();

        return res.status(200).json({
            message: messages.DATA_UPDATED,
        });

    } catch (err) {
        await db.rollback();
        logger.error('Error updating data:', err.message);
        return res.status(400).json({ message: messages.DATA_UPDATE_FALIED });
    }
});



module.exports=service;