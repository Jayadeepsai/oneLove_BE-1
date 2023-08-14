const express = require('express');
const service = express.Router();
const bodyParser = require('body-parser');
const messages = require('../messages/constants');

const db = require('../../dbConnection')

service.use(express.json()); // To parse JSON bodies
service.use(express.urlencoded({ extended: true })); // To parse URL-encoded bodies




async function serviceQueries(req, res) { // Pass req and res as arguments
    // const connection = await db.getConnection();

    try {
        // Start the transaction
        await db.beginTransaction();

        
        const { week_start_date, week_end_date, service_start_time, service_end_time } = req.body;
        const timeQuery = 'INSERT INTO onelove.time (week_start_date, week_end_date, service_start_time, service_end_time) VALUES (?, ?, ?, ?)';
        const timeValues = [week_start_date, week_end_date, service_start_time, service_end_time];

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
        res.status(200).json({ message: 'Transaction committed successfully.' });
    } catch (error) {
        // Rollback the transaction if any query fails
        await db.rollback();

        console.error('Error in transaction:', error.message);

        // Send an error response to the client
        res.status(500).json({ message: 'Failed to perform transaction.' });
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

    // const sql = `SELECT s.*, t.*, u.* 
    // FROM service s
    // LEFT JOIN time t ON s.time_id = t.time_id
    // LEFT JOIN users u ON s.user_id = u.user_id
    // WHERE s.user_id = ?`;
    
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
                message: messages.NO_POSTS,
            });
        }

    }catch(err){
        console.error('Error fetching data:', err);
        res.status(500).json({
            message: messages.FAILURE_MESSAGE,
        });
    }
});





module.exports=service;