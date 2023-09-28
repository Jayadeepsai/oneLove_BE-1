const express = require('express');
const orders = express.Router();
const bodyParser = require('body-parser');
const messages = require('../messages/constants');

const db = require('../../dbConnection');

orders.use(express.json()); // To parse JSON bodies
orders.use(express.urlencoded({ extended: true })); // To parse URL-encoded bodies


orders.post('/order', async (req, res) => {
    const { store_id, user_id, orders, status } = req.body;

    try {
        let order_no;
        let isUnique = false;

        // Generate a unique random 5-digit number
        while (!isUnique) {
            order_no = generateRandomNumber(10000, 99999); // Generate a random number between 10000 and 99999
            isUnique = await isOrderNoUnique(order_no);
        }

        const sql = `INSERT INTO onelove.orders(store_id, user_id, orders, order_no, status) VALUES(?, ?, ?, ?, ?)`;
        const values = [store_id, user_id, JSON.stringify(orders), order_no, status];
        const [result] = await db.query(sql, values);

        res.status(200).json({
            data: result,
            message: messages.POST_SUCCESS
        });
    } catch (err) {
        console.error('Error posting data:', err.message);
        res.status(400).json({
            message: messages.POST_FAILED
        });
    }
});

// Function to generate a random number between min and max (inclusive)
function generateRandomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Function to check if the generated order_no is unique
async function isOrderNoUnique(order_no) {
    const sql = `SELECT COUNT(*) AS count FROM onelove.orders WHERE order_no = ?`;
    const [result] = await db.query(sql, [order_no]);
    return result[0].count === 0;
}
 


orders.get('/all-orders',async(req,res)=>{
    try{
        const sql = `SELECT o.*, u.*, s.*, a.*, c.*, sa.address_id as store_address_id, sa.address as store_address, sa.city as store_city, sa.state as store_state, sa.zip as store_zip, sa.country as store_country, sa.landmark as store_landmark, sa.address_type as stote_address_type, sc.contact_id as store_contact_id, sc.email as store_email, sc.mobile_number as store_mobile_number
        FROM onelove.orders o
        LEFT JOIN users u ON o.user_id = u.user_id
        LEFT JOIN address a ON u.address_id = a.address_id
        LEFT JOIN contact_details c ON u.contact_id = c.contact_id
        LEFT JOIN store s ON o.store_id = s.store_id
        LEFT JOIN address sa ON s.address_id = sa.address_id
        LEFT JOIN contact_details sc ON s.contact_id = sc.contact_id`
        const [result] = await db.query(sql);
        const ordersData = JSON.parse(JSON.stringify(result));
        res.status(200).json({
            data: ordersData,
            message: messages.SUCCESS_MESSAGE
        });

    }catch(err){
        console.error('Error posting data:', err.message);
        res.status(400).json({
            message: messages.FAILURE_MESSAGE
        });
    }
});

orders.get('/orders', async (req, res) => {
    const { user_id, order_id, store_id } = req.query;
    
    try {
        let sql;
        let values;

        if (user_id) {
            sql = `SELECT o.*, u.*, s.*, a.*, c.*, sa.address_id as store_address_id, sa.address as store_address, sa.city as store_city, sa.state as store_state, sa.zip as store_zip, sa.country as store_country, sa.landmark as store_landmark, sa.address_type as stote_address_type, sc.contact_id as store_contact_id, sc.email as store_email, sc.mobile_number as store_mobile_number
            FROM onelove.orders o
            LEFT JOIN users u ON o.user_id = u.user_id
            LEFT JOIN address a ON u.address_id = a.address_id
            LEFT JOIN contact_details c ON u.contact_id = c.contact_id
            LEFT JOIN store s ON o.store_id = s.store_id
            LEFT JOIN address sa ON s.address_id = sa.address_id
            LEFT JOIN contact_details sc ON s.contact_id = sc.contact_id
            ORDER BY o.order_id DESC
            WHERE o.user_id = ?`;
            values = [user_id];
        } else if (order_id) {
            sql = `SELECT o.*, u.*, s.*, a.*, c.*, sa.address_id as store_address_id, sa.address as store_address, sa.city as store_city, sa.state as store_state, sa.zip as store_zip, sa.country as store_country, sa.landmark as store_landmark, sa.address_type as stote_address_type, sc.contact_id as store_contact_id, sc.email as store_email, sc.mobile_number as store_mobile_number
            FROM onelove.orders o
            LEFT JOIN users u ON o.user_id = u.user_id
            LEFT JOIN address a ON u.address_id = a.address_id
            LEFT JOIN contact_details c ON u.contact_id = c.contact_id
            LEFT JOIN store s ON o.store_id = s.store_id
            LEFT JOIN address sa ON s.address_id = sa.address_id
            LEFT JOIN contact_details sc ON s.contact_id = sc.contact_id
            ORDER BY o.order_id DESC
            WHERE o.order_id = ?`;
            values = [order_id];
        } else if (store_id) {
            sql = `SELECT o.*, u.*, s.*, a.*, c.*, sa.address_id as store_address_id, sa.address as store_address, sa.city as store_city, sa.state as store_state, sa.zip as store_zip, sa.country as store_country, sa.landmark as store_landmark, sa.address_type as stote_address_type, sc.contact_id as store_contact_id, sc.email as store_email, sc.mobile_number as store_mobile_number
            FROM onelove.orders o
            LEFT JOIN users u ON o.user_id = u.user_id
            LEFT JOIN address a ON u.address_id = a.address_id
            LEFT JOIN contact_details c ON u.contact_id = c.contact_id
            LEFT JOIN store s ON o.store_id = s.store_id
            LEFT JOIN address sa ON s.address_id = sa.address_id
            LEFT JOIN contact_details sc ON s.contact_id = sc.contact_id
            ORDER BY o.order_id DESC
            WHERE o.store_id = ?`;
            values = [store_id];
        }

        const [result] = await db.query(sql, values);
        const ordersData = JSON.parse(JSON.stringify(result));
        res.status(200).json({
            data: ordersData,
            message: messages.SUCCESS_MESSAGE
        });
    } catch (err) {
        console.error('Error getting data:', err.message);
        res.status(400).json({
            message: messages.FAILURE_MESSAGE
        });
    }
});




orders.put('/update-status',async(req,res)=>{
    const order_id = req.query.order_id;
    const status = req.body.status;
 try{
       const sql = `UPDATE onelove.orders SET status = ? WHERE order_id = ?`;
       const values = [status, order_id];
       const [result] = await db.query(sql,values)

    return res.status(200).json({
    message: messages.DATA_UPDATED,
    result
    });
 }catch(err){
      console.error('Error updating data:', err.message);
      return  res.status(400).json({ message: 'Failed to update data.' });
 }
});




module.exports = orders;