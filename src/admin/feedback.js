const express = require('express');
const feedback = express.Router();
const bodyParser = require('body-parser');
const text = require('../messages/constants');
const db = require('../../dbConnection');
const logger = require('../../logger');

feedback.use(express.json());
feedback.use(express.urlencoded({ extended: true }));


feedback.post('/feedback',async(req,res)=>{
    const { name, mail, messages } = req.body;
try{

    const currentDate = new Date();
      
        const formattedDate = currentDate.toLocaleString();

    const sql = `INSERT INTO onelove_v2.feedback(name, mail, messages, date_time) VALUES(?, ?, ?, ?)`;
    const values = [name, mail, messages, formattedDate];
    const [result] = await db.query(sql, values);

    res.status(200).json({
        data: result,
        message: text.POST_SUCCESS
    });

}catch(err){

    logger.error('Error posting data:',err.message);
    console.log(err.message)
    res.status(400).json({
        message: text.POST_FAILED,
        
    });
}
});



feedback.get('/feedbacks',async(req,res)=>{

    const sql = `
    SELECT 
        feedback_id, 
        name, 
        mail, 
        messages, 
        DATE_FORMAT(STR_TO_DATE(date_time, '%m/%d/%Y, %h:%i:%s %p'), '%c/%e/%Y, %h:%i:%s %p') AS formatted_date_time
    FROM onelove_v2.feedback 
    ORDER BY STR_TO_DATE(date_time, '%m/%d/%Y, %h:%i:%s %p') DESC;
`;

    try{

        const [results] = await db.query(sql);
        const feedbackData = JSON.parse(JSON.stringify(results));

            res.status(200).json({
                Data: feedbackData,
                message: text.SUCCESS_MESSAGE,
            });
    }catch(err){
        logger.error('Error fetching data:', err);
        res.status(400).json({
            message: text.FAILURE_MESSAGE,
        });
    }
});

module.exports = feedback;