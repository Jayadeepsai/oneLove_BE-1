const express = require('express');
const ratings = express.Router();
const bodyParser = require('body-parser');
const messages = require('../messages/constants');

const db = require('../../dbConnection');


ratings.use(express.json()); // To parse JSON bodies
ratings.use(express.urlencoded({ extended: true })); // To parse URL-encoded bodies

ratings.post('/rating-review',async(req,res)=>{
    try{
        const {user_id, ratings, reviews } = req.body;
        const sql = 'INSERT INTO onelove.rating_review(user_id, ratings, reviews) VALUES(?, ?, ?)';
        const values = [user_id, JSON.stringify(ratings), JSON.stringify(reviews)]

        const [result] = await db.query(sql,values);
        res.status(200).json({
            data: result,
            message: "Data posted"
        });

    }catch(err){
        console.error('Error posting data:', err.message);
        res.status(400).json({
            message: err
        });
    }
});

ratings.get('/rating-review',async(req,res)=>{
   try{

      }catch(err){

     }
})


module.exports = ratings;