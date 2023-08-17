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
    SELECT u.*, a.*, c.*
    FROM users u
    LEFT JOIN address a ON u.address_id = a.address_id
    LEFT JOIN contact_details c ON u.contact_id = c.contact_id 
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


module.exports=users;