const express = require('express');
const orders = express.Router();
const bodyParser = require('body-parser');
const messages = require('../messages/constants');

const db = require('../../dbConnection');

orders.use(express.json()); // To parse JSON bodies
orders.use(express.urlencoded({ extended: true })); // To parse URL-encoded bodies


orders.post('/order',async(req,res)=>{
    const {store_id, user_id, orders, order_no} = req.body;
    try{
        const sql = `INSERT INTO onelove.orders(store_id, user_id, orders, order_no) VALUES(?, ?, ?, ?)`;
        const values = [store_id, user_id, JSON.stringify(orders), order_no];
        const [result] = await db.query(sql,values);

        res.status(200).json({
            data: result,
            message: messages.POST_SUCCESS
        });

    }catch(err){
        console.error('Error posting data:', err.message);
        res.status(400).json({
            message: messages.POST_FAILED
        });
    }
});


orders.get('/orders',async(req,res)=>{
    try{
        const sql = `SELECT * FROM onelove.orders`
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
})

module.exports = orders;