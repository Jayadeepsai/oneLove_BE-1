const express = require('express');
const ratings = express.Router();
const bodyParser = require('body-parser');
const messages = require('../messages/constants');
const db = require('../../dbConnection');
const jwtMiddleware = require('../../jwtMiddleware');
const notification= require('../oneSignal/notifications');
const logger = require('../../logger');

ratings.use(express.json());
ratings.use(express.urlencoded({ extended: true }));


ratings.post('/rating-review',jwtMiddleware.verifyToken, async (req, res) => {

    const { userType } = req;
         if (userType !== 'pet_owner') {
             return res.status(403).json({ message: messages.FORBID });
         }

    try {
        const { user_id, ratings_reviews } = req.body;          
        const checkIfExistsQuery = 'SELECT ratings_reviews FROM onelove_v2.rating_review WHERE user_id = ?';
        const [existingRows] = await db.query(checkIfExistsQuery, [user_id]);

        let updatedReviews = [];

        if (existingRows.length > 0) {
            const existingReviews = existingRows[0].ratings_reviews;
            
            if (Array.isArray(existingReviews)) {
                updatedReviews = existingReviews.concat(ratings_reviews);
            } else {
                try {
                    const parsedReviews = JSON.parse(existingReviews);
                    updatedReviews = parsedReviews.concat(ratings_reviews);
                } catch (parseError) {
                    logger.error('Error parsing existingReviews:', parseError);
                    res.status(400).json({
                        message: 'Error parsing existingReviews',
                    });
                    return;
                }
            }
            
            const updateQuery = 'UPDATE onelove_v2.rating_review SET ratings_reviews = ? WHERE user_id = ?';
            const updateValues = [JSON.stringify(updatedReviews), user_id];
            await db.query(updateQuery, updateValues);
        } else {
            const insertQuery = 'INSERT INTO onelove_v2.rating_review (user_id, ratings_reviews) VALUES (?, ?)';
            const insertValues = [user_id, JSON.stringify(ratings_reviews)];
            await db.query(insertQuery, insertValues);
        }

        const sql1 = `SELECT external_id FROM onelove_v2.users WHERE user_id = ${user_id}`
        const [sql1Result] = await db.query(sql1)
        const external_id=sql1Result[0].external_id;
        logger.info('external id',external_id)

        const mess = "Recieved a feedback for your service, Please visit and check";
        const uniqId = external_id; 
        const Heading = "Feedback!"
        const endpoint = "trainerreviews"

        await notification.sendnotification( mess, uniqId,Heading,endpoint);

        res.status(200).json({
            message: messages.POST_SUCCESS
        });
    } catch (err) {
        logger.error('Error posting/updating data:', err.message);
        res.status(400).json({
            message:messages.POST_FAILED
        });
    }
});


// ratings.get('/rating-review',jwtMiddleware.verifyToken,async(req,res)=>{
//    try{
//     const sql = `SELECT r.*,u.*,a.*,c.*,s.*,i.image_id AS user_image_id,i.image_url as user_image_url
//     FROM onelove_v2.rating_review r
//     LEFT JOIN users u ON r.user_id = u.user_id
//     LEFT JOIN address a ON u.address_id = a.address_id
//     LEFT JOIN contact_details c ON u.contact_id = c.contact_id
//     LEFT JOIN images i ON u.image_id = i.image_id
//     LEFT JOIN service s ON u.service_id = s.service_id`;

//     const [result] = await db.query(sql);
//     const ratingData = JSON.parse(JSON.stringify(result));
//     res.status(200).json({
//         ratingData,
//         message: messages.SUCCESS_MESSAGE,
//     });

//       }catch(err){
//         logger.error('Error fetching data:', err);
//         res.status(400).json({
//             message: messages.FAILURE_MESSAGE,
//         });
//      }
// });


ratings.get('/rating-review-user',jwtMiddleware.verifyToken,async(req,res)=>{

    const { userType } = req;
    if (userType !== 'pet_owner'&& userType !== 'pet_trainer') {
        return res.status(403).json({ message: messages.FORBID });
    }
    
       const user_id = req.query.user_id

    try{
     const sql = `SELECT r.*,u.*,a.*,c.*,s.*,i.image_id AS user_image_id,i.image_url as user_image_url
     FROM onelove_v2.rating_review r
     LEFT JOIN users u ON r.user_id = u.user_id
     LEFT JOIN address a ON u.address_id = a.address_id
     LEFT JOIN contact_details c ON u.contact_id = c.contact_id
     LEFT JOIN images i ON u.image_id = i.image_id
     LEFT JOIN service s ON u.service_id = s.service_id
     WHERE r.user_id = ?`;
 
     const [result] = await db.query(sql,user_id);
     const ratingData = JSON.parse(JSON.stringify(result));
     res.status(200).json({
         ratingData,
         message: messages.SUCCESS_MESSAGE,
     });
 
       }catch(err){
         logger.error('Error fetching  data:', err);
         res.status(400).json({
             message: messages.FAILURE_MESSAGE,
         });
      }
 });


module.exports = ratings;