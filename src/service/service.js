const express = require('express');
const service = express.Router();
const bodyParser = require('body-parser');
const messages = require('../messages/constants');

const db = require('../../dbConnection');
const dbConnection = require('../../dbConnection');

service.use(express.json()); // To parse JSON bodies
service.use(express.urlencoded({ extended: true })); // To parse URL-encoded bodies




async function serviceQueries(req, res) { // Pass req and res as arguments


    try {
        // Start the transaction
        await db.beginTransaction();

        
        const { week_start_day, week_end_day, service_start_time, service_end_time } = req.body;
        const timeQuery = 'INSERT INTO onelove.time (week_start_day, week_end_day, service_start_time, service_end_time) VALUES (?, ?, ?, ?)';
        const timeValues = [week_start_day, week_end_day, service_start_time, service_end_time];

        const [timeResult] = await db.query(timeQuery, timeValues);
        const time_id = timeResult.insertId;

       
        const { service_price, service_name, service_description, user_id } = req.body;
        const serviceQuery = 'INSERT INTO onelove.service (service_price, service_name, service_description, time_id, user_id) VALUES (?, ?, ?, ?, ?)';
        const serviceValues = [service_price, service_name, service_description, time_id, user_id ];

    
        await db.query(serviceQuery, serviceValues);

        // Commit the transaction if all queries are successful
        await db.commit();

        console.log('Transaction committed successfully.');

        // Send a success response to the client
        res.status(200).json({ message:messages.POST_SUCCESS });
    } catch (error) {
        // Rollback the transaction if any query fails
        await db.rollback();

        console.error('Error in transaction:', error.message);

        // Send an error response to the client
        res.status(500).json({ message: messages.POST_FAILED });
    }
    //  finally {
    //     // Release the connection back to the pool
    //     connection.release();
    // }
}

service.post('/service', (req, res) => {
    serviceQueries(req, res)
        .then(() => {
            console.log('Transaction completed successfully');
        })
        .catch((err) => {
            console.error('Error in address.post API:', err);
        });
});


service.get('/service-user-id', async(req,res)=>{

    const userId = req.query.user_id; 
    
    if (!userId) {
        return res.status(400).json({
            message: messages.INVALID_ID,
        });
    }

    const sql = `
    SELECT u.*, a.*, c.*, s.*, t.*
    FROM service s
    LEFT JOIN time t ON s.time_id = t.time_id
    LEFT JOIN users u ON s.user_id = u.user_id
    LEFT JOIN address a ON u.address_id = a.address_id
    LEFT JOIN contact_details c ON u.contact_id = c.contact_id
    WHERE s.user_id = ?`;
    try{
        const [results] = await db.query(sql, [userId]);
        const servicesData = JSON.parse(JSON.stringify(results));

        if (servicesData.length > 0) {
            res.status(200).json({
                servicesData,
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


service.put('/update-service', async (req, res) => {
    try {
        const user_id = req.query.user_id;

        const { week_start_day, week_end_day, service_start_time, service_end_time, service_price, service_name, service_description } = req.body;

        let timeSql = 'UPDATE time SET';
        let serviceSql = 'UPDATE service SET';

        const timeValues = [];
        const serviceValues = [];

        if (week_start_day !== undefined) {
            timeSql += ' week_start_day=?,';
            timeValues.push(week_start_day);
        }

        if (week_end_day !== undefined) {
            timeSql += ' week_end_day=?,';
            timeValues.push(week_end_day);
        }

        if (service_start_time !== undefined) {
            timeSql += ' service_start_time=?,';
            timeValues.push(service_start_time);
        }

        if (service_end_time !== undefined) {
            timeSql += ' service_end_time=?,';
            timeValues.push(service_end_time);
        }

        timeSql = timeSql.slice(0, -1);
        timeSql += ' WHERE time_id=(SELECT time_id FROM service WHERE user_id=?)';
        timeValues.push(user_id);

        await db.beginTransaction();

        await db.query(timeSql, timeValues);

        if (service_price !== undefined) {
            serviceSql += ' service_price=?,';
            serviceValues.push(service_price);
        }

        if (service_name !== undefined) {
            serviceSql += ' service_name=?,';
            serviceValues.push(service_name);
        }

        if (service_description !== undefined) {
            serviceSql += ' service_description=?,';
            serviceValues.push(service_description);
        }

        serviceSql = serviceSql.slice(0, -1);
        serviceSql += ' WHERE service_id=(SELECT service_id FROM service WHERE user_id=?)';
        serviceValues.push(user_id);

        await db.query(serviceSql, serviceValues);

        await db.commit();

        res.status(200).json({
            message: messages.DATA_UPDATED,
        });

    } catch (err) {
        await db.rollback();
        console.error('Error updating data:', err.message);
        res.status(400).json({ message: messages.DATA_UPDATE_FALIED });
    }
});



module.exports=service;