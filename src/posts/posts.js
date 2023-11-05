const express = require('express');
const posts = express.Router();
const bodyParser = require('body-parser');
const messages = require('../messages/constants');

const db = require('../../dbConnection')
const jwtMiddleware = require('../../jwtMiddleware');
const logger = require('../../logger');
const he = require('he');

posts.use(express.json()); // To parse JSON bodies
posts.use(express.urlencoded({ extended: true })); // To parse URL-encoded bodies
  

async function performTransaction(req, res) {
    try {
        await db.beginTransaction();
        const { likes, comments, image_url, image_type } = req.body;
        // Insert love_index data
        const loveIndexSql = 'INSERT INTO onelove.love_index ( likes, comments) VALUES ( ?, ?)';
        const loveIndexValues = [JSON.stringify(likes), JSON.stringify(comments)];
        const [loveIndexResult] = await db.query(loveIndexSql, loveIndexValues);
        const love_index_id = loveIndexResult.insertId;
        // Insert images data
        const imageInsertSql = 'INSERT INTO onelove.images (image_type, image_url) VALUES (?, ?)';
        const imageValues = [image_type, JSON.stringify(image_url)];
            const [imageResult] = await db.query(imageInsertSql, imageValues);
            const image_id = imageResult.insertId;
            
        const { video_type, video_url} = req.body;
        let video_id = null;
        if(video_type && video_url){
            const videoSql = 'INSERT INTO onelove.videos (video_type, video_url) VALUES (?, ?)';
            const videoValues = [video_type, JSON.stringify(video_url)];
            const [videoResult] = await db.query(videoSql, videoValues);
             video_id = videoResult.insertId;
        }   
     // Encode the post_description to handle emojis
     const encodedDescription = he.encode(req.body.post_description);
        // Insert posts data
        const { post_type, user_id, pet_id } = req.body;
        const postSql = 'INSERT INTO onelove.posts (post_type, post_description, video_id, love_index_id, image_id, user_id, pet_id) VALUES (?, ?, ?, ?, ?, ?, ?)';
        const postValues = [post_type, encodedDescription, video_id, love_index_id, image_id, user_id, pet_id];
        const [postResult] = await db.query(postSql, postValues);
        const post_id = postResult.insertId;


        await db.commit();
        logger.info('Transaction committed successfully.');
        // Send a success response to the client
        res.status(200).json({ message: messages.POST_SUCCESS });
    } catch (err) {
        await db.rollback();
        logger.error('Error in transaction:', err);
        // Send an error response to the client
        res.status(400).json({ message: messages.POST_FAILED });
    }
}


posts.post('/post-feed',jwtMiddleware.verifyToken,(req,res)=>{
    const { userType } = req;
         if (userType !== 'pet_owner'&& userType !== 'pet_doctor'&& userType !== 'pet_trainer') {
             return res.status(403).json({ message: messages.FORBID });
         }
    performTransaction(req, res)
    .then(() => {
        logger.info('Transaction completed successfully');
    })
    .catch((err) => {
        logger.error('Error in address.post API:', err);
    });
})




posts.get('/posts',jwtMiddleware.verifyToken,async (req,res)=>{

    const { userType } = req;
         if (userType !== 'pet_owner'&& userType !== 'pet_doctor'&& userType !== 'pet_trainer') {
             return res.status(403).json({ message: messages.FORBID });
         }

    const sql = `SELECT p.*, u.*, p1.pet_id AS pet_id,
     p1.pet_name AS pet_name, p1.image_id AS pet_image_id,
     i2.image_url AS pet_image_url, i1.image_id AS post_image_id,
     i3.image_id AS user_image_id, i3.image_url AS user_image_url,
     i1.image_url AS post_image_url,l.*,v.video_id AS post_video_id, v.video_url AS post_video_url
     FROM onelove.posts p
     LEFT JOIN users u ON p.user_id = u.user_id
     LEFT JOIN pet p1 ON p.pet_id = p1.pet_id
     LEFT JOIN images i1 ON p.image_id = i1.image_id
     LEFT JOIN images i2 ON p1.image_id = i2.image_id
     LEFT JOIN images i3 ON u.image_id = i3.image_id
     LEFT JOIN love_index l ON p.love_index_id = l.love_index_id
     LEFT JOIN videos v ON p.video_id = v.video_id
     ORDER BY p.post_id DESC`

    try{
         const [results]= await db.query(sql);
         const postsData = JSON.parse(JSON.stringify(results));

         postsData.forEach(post => {
            post.post_description = he.decode(post.post_description);
        });

         res.status(200).json({
            postsData,
            message: messages.ALL_POSTS_DATA,
        });

    }catch(err){
        logger.error('Error fetching data:', err);
        res.status(400).json({
            message: messages.FAILED,
        });
    }
});




posts.get('/posts-id',jwtMiddleware.verifyToken, async (req, res) => {

    const { userType } = req;
    if (userType !== 'pet_owner'&& userType !== 'pet_doctor'&& userType !== 'pet_trainer') {
        return res.status(403).json({ message: messages.FORBID });
    }

    const postId = req.query.post_id; 
    
    if (!postId) {
        return res.status(400).json({
            message: messages.INVALID_ID,
        });
    }

    const sql = `SELECT p.*, u.*, p1.pet_id AS pet_id,
    p1.pet_name AS pet_name, p1.image_id AS pet_image_id,
    i2.image_url AS pet_image_url, i1.image_id AS post_image_id,
    i3.image_id AS user_image_id, i3.image_url AS user_image_url,
    i1.image_url AS post_image_url,l.*
    FROM onelove.posts p
    LEFT JOIN users u ON p.user_id = u.user_id
    LEFT JOIN pet p1 ON p.pet_id = p1.pet_id
    LEFT JOIN images i1 ON p.image_id = i1.image_id
    LEFT JOIN images i2 ON p1.image_id = i2.image_id
    LEFT JOIN images i3 ON u.image_id = i3.image_id
    LEFT JOIN love_index l ON p.love_index_id = l.love_index_id
    WHERE p.post_id = ?`; 

    try {
        const [results] = await db.query(sql, [postId]);
        const postData = JSON.parse(JSON.stringify(results));

        if (postData.length > 0) {
            postData[0].post_description = he.decode(postData[0].post_description);
        }

        if (postData) {
            res.status(200).json({
                postData,
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


posts.get('/user-posts',jwtMiddleware.verifyToken, async (req, res) => {
    
    const userId = req.query.user_id; 
    
    if (!userId) {
        return res.status(400).json({
            message: messages.INVALID_ID,
        });
    }

    const sql = `SELECT p.*, u.*, p1.pet_id AS pet_id,
    p1.pet_name AS pet_name, p1.image_id AS pet_image_id,
    i2.image_url AS pet_image_url, i1.image_id AS post_image_id,
    i3.image_id AS user_image_id, i3.image_url AS user_image_url,
    i1.image_url AS post_image_url,l.*
    FROM onelove.posts p
    LEFT JOIN users u ON p.user_id = u.user_id
    LEFT JOIN pet p1 ON p.pet_id = p1.pet_id
    LEFT JOIN images i1 ON p.image_id = i1.image_id
    LEFT JOIN images i2 ON p1.image_id = i2.image_id
    LEFT JOIN images i3 ON u.image_id = i3.image_id
    LEFT JOIN love_index l ON p.love_index_id = l.love_index_id
    WHERE p.user_id = ?
    ORDER BY p.post_id DESC`;

    try {
        const [results] = await db.query(sql, [userId]);
        const postsData = JSON.parse(JSON.stringify(results));

        postsData.forEach(post => {
            post.post_description = he.decode(post.post_description);
        });

        if (postsData.length > 0) {
            res.status(200).json({
                postsData,
                message:messages.SUCCESS_MESSAGE,
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



posts.get('/posts-pet-user',jwtMiddleware.verifyToken, async (req, res) => {

    const { userType } = req;
    if (userType !== 'pet_owner'&& userType !== 'pet_doctor'&& userType !== 'pet_trainer') {
        return res.status(403).json({ message: messages.FORBID });
    }

    try {
        const { user_id, pet_id } = req.query;

        let condition = '';
        const values = [];

        if (user_id) {
            condition += 'p.user_id = ?';
            values.push(user_id);
        }

        if (pet_id) {
            if (condition) {
                condition += ' AND ';
            }
            condition += 'p.pet_id = ?';
            values.push(pet_id);
        }

        let sql = `SELECT p.*, u.*,c.*, p1.pet_id AS pet_id,a.*,
        p1.pet_name AS pet_name, p1.image_id AS pet_image_id,
        p1.pet_gender AS pet_gender, p1.pet_type AS pet_type,
        p1.pet_breed AS pet_breed, p1.pet_dob AS pet_dob,
        p1.spay_neuter AS spay_neuter,
        i2.image_url AS pet_image_url, i1.image_id AS post_image_id,
        i3.image_id AS user_image_id, i3.image_url AS user_image_url,
        i1.image_url AS post_image_url,l.*
        FROM onelove.posts p
        LEFT JOIN users u ON p.user_id = u.user_id
        LEFT JOIN address a ON u.address_id = a.address_id
        LEFT JOIN pet p1 ON p.pet_id = p1.pet_id
        LEFT JOIN images i1 ON p.image_id = i1.image_id
        LEFT JOIN images i2 ON p1.image_id = i2.image_id
        LEFT JOIN images i3 ON u.image_id = i3.image_id
        LEFT JOIN contact_details c ON u.contact_id = c.contact_id
        LEFT JOIN love_index l ON p.love_index_id = l.love_index_id
       `;
        if (condition) {
            sql += ' WHERE ' + condition;
        }

        const [results] = await db.query(sql, values);
        const postData = JSON.parse(JSON.stringify(results));

        postData.forEach(post => {
            post.post_description = he.decode(post.post_description);
        });

        if (postData.length > 0) {
            res.status(200).json({
                postData,
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





posts.put('/update-post',jwtMiddleware.verifyToken, async (req, res) => {
    try {
        const post_id = req.query.post_id;

        const {
            post_type, post_description, love_index_id, image_id, user_id} = req.body;

        let sql = 'UPDATE onelove.posts SET';
        const values = [];

        if (post_type !== undefined) {
            sql += ' post_type=?,';
            values.push(post_type);
        }
        if (post_description !== undefined) {
            sql += ' post_description=?,';
            values.push(post_description);
        }
        if (love_index_id !== undefined) {
            sql += ' love_index_id=?,';
            values.push(love_index_id);
        }
        if (image_id !== undefined) {
            sql += ' image_id=?,';
            values.push(image_id);
        }
        if (user_id !== undefined) {
            sql += ' user_id=?,';
            values.push(user_id);
        }

        sql = sql.slice(0, -1);
        sql += ' WHERE post_id=?';
        values.push(post_id);

        const [result] = await db.query(sql, values);

        res.status(200).json({
            updatedData: result,
            message: messages.DATA_UPDATED,
        });
    } catch (err) {
        logger.error('Error updating data:', err.message);
        res.status(400).json({ message: messages.DATA_UPDATE_FALIED });
    }
});



posts.delete('/delete-post',jwtMiddleware.verifyToken, async (req, res) => {
    try {
        const post_id = req.query.post_id;

        const sql = `DELETE FROM onelove.posts WHERE post_id = ?`;

        const [result] = await db.query(sql, [post_id]); 

        // Check if the post was deleted successfully
        if (result.affectedRows === 0) {
            res.status(400).json({
                message: messages.INVALID_ID,
            });
        } else {
            res.status(200).json({
                message: messages.DATA_DELETED,
            });
        }
    } catch (err) {
        logger.error('Error deleting post:', err);
        res.status(400).json({
            message: messages.FAILED_TO_DELETE,
        });
    }
});

module.exports=posts;