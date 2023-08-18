const express = require('express');
const posts = express.Router();
const bodyParser = require('body-parser');
const messages = require('../messages/constants');

const db = require('../../dbConnection')

posts.use(express.json()); // To parse JSON bodies
posts.use(express.urlencoded({ extended: true })); // To parse URL-encoded bodies


posts.post('/posts',async (req,res)=>{

    const {post_type, post_description, video, love_index_id, image_id, user_id, pet_id} = req.body;
    const sql = 'INSERT INTO onelove.posts (post_type, post_description, video, love_index_id, image_id, user_id, pet_id) VALUES (?, ?, ?, ?, ?, ?, ?)';
    const values = [post_type, post_description, video, love_index_id, image_id, user_id, pet_id];

    try{
    const [result]=await db.query(sql,values)
    res.status(200).json({
        data: result,
        message: messages.POST_SUCCESS
    });

    }catch(err){
       console.error('Error posting data:', err.message);
        res.status(400).json({
            message: err
        });
    }
});


posts.get('/posts', async (req,res)=>{

    const sql = `SELECT p.*, l.*, i1.image_id AS post_image_id, i1.image_url AS post_image_url, u.*, e.*, i2.image_id AS pet_image_id, i2.image_url AS pet_image_url
    FROM onelove.posts p
    LEFT JOIN love_index l ON p.love_index_id = l.love_index_id
    LEFT JOIN images i1 ON p.image_id = i1.image_id
    LEFT JOIN users u ON p.user_id = u.user_id
    LEFT JOIN pet e ON p.pet_id = e.pet_id
    LEFT JOIN images i2 ON e.image_id = i2.image_id`;

    try{
         const [results]= await db.query(sql);
         const postsData = JSON.parse(JSON.stringify(results));
         res.status(200).json({
            postsData,
            message: messages.ALL_POSTS_DATA,
        });

    }catch(err){
        console.error('Error fetching data:', err);
        res.status(500).json({
            message: messages.FAILED,
        });
    }
});


posts.get('/posts-id', async (req, res) => {
    const postId = req.query.post_id; 
    
    if (!postId) {
        return res.status(400).json({
            message: messages.INVALID_ID,
        });
    }

    const sql = `SELECT p.*, l.*, i1.image_id AS post_image_id, i1.image_url AS post_image_url, u.*, e.*, i2.image_id AS pet_image_id, i2.image_url AS pet_image_url
    FROM onelove.posts p
    LEFT JOIN love_index l ON p.love_index_id = l.love_index_id
    LEFT JOIN images i1 ON p.image_id = i1.image_id
    LEFT JOIN users u ON p.user_id = u.user_id
    LEFT JOIN pet e ON p.pet_id = e.pet_id
    LEFT JOIN images i2 ON e.image_id = i2.image_id
                 WHERE p.post_id = ?`; 

    try {
        const [results] = await db.query(sql, [postId]);
        const postData = JSON.parse(JSON.stringify(results));

        if (postData) {
            res.status(200).json({
                postData,
                message: messages.SUCCESS_MESSAGE,
            });
        } else {
            res.status(404).json({
                message: messages.FAILED,
            });
        }

    } catch (err) {
        console.error('Error fetching data:', err);
        res.status(500).json({
            message: messages.FAILURE_MESSAGE,
        });
    }
});


posts.get('/user-posts', async (req, res) => {
    const userId = req.query.user_id; 
    
  
    if (!userId) {
        return res.status(400).json({
            message: messages.INVALID_ID,
        });
    }

    const sql = `SELECT p.*, l.*, i1.image_id AS post_image_id, i1.image_url AS post_image_url, u.*, e.*, i2.image_id AS pet_image_id, i2.image_url AS pet_image_url
    FROM onelove.posts p
    LEFT JOIN love_index l ON p.love_index_id = l.love_index_id
    LEFT JOIN images i1 ON p.image_id = i1.image_id
    LEFT JOIN users u ON p.user_id = u.user_id
    LEFT JOIN pet e ON p.pet_id = e.pet_id
    LEFT JOIN images i2 ON e.image_id = i2.image_id
    WHERE p.user_id = ?`;

    try {
        const [results] = await db.query(sql, [userId]);
        const postsData = JSON.parse(JSON.stringify(results));

        if (postsData.length > 0) {
            res.status(200).json({
                postsData,
                message:messages.SUCCESS_MESSAGE,
            });
        } else {
            res.status(404).json({
                message: messages.NO_DATA,
            });
        }

    } catch (err) {
        console.error('Error fetching data:', err);
        res.status(500).json({
            message: messages.FAILURE_MESSAGE,
        });
    }
});



posts.get('/posts-pet-user', async (req, res) => {
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

        let sql = `SELECT p.*, l.*, i1.image_id AS post_image_id, i1.image_url AS post_image_url, u.*, e.*, i2.image_id AS pet_image_id, i2.image_url AS pet_image_url
        FROM onelove.posts p
        LEFT JOIN love_index l ON p.love_index_id = l.love_index_id
        LEFT JOIN images i1 ON p.image_id = i1.image_id
        LEFT JOIN users u ON p.user_id = u.user_id
        LEFT JOIN pet e ON p.pet_id = e.pet_id
        LEFT JOIN images i2 ON e.image_id = i2.image_id
       `;
        
        if (condition) {
            sql += ' WHERE ' + condition;
        }

        const [results] = await db.query(sql, values);
        const postData = JSON.parse(JSON.stringify(results));

        if (postData.length > 0) {
            res.status(200).json({
                postData,
                message: messages.SUCCESS_MESSAGE,
            });
        } else {
            res.status(404).json({
                message: messages.NO_DATA,
            });
        }
    } catch (err) {
        console.error('Error fetching data:', err);
        res.status(500).json({
            message: messages.FAILURE_MESSAGE,
        });
    }
});





posts.put('/update-post', async (req, res) => {
    try {
        const post_id = req.query.post_id;

        const {
            post_type, post_description, love_index_id, video, image_id, user_id} = req.body;

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
        if (video !== undefined) {
            sql += ' video=?,';
            values.push(video);
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
        console.error('Error updating data:', err.message);
        res.status(400).json({ message: messages.DATA_UPDATE_FALIED });
    }
});



posts.delete('/delete-post', async (req, res) => {
    try {
        const post_id = req.query.post_id;

        const sql = `DELETE FROM onelove.posts WHERE post_id = ?`;

        const [result] = await db.query(sql, [post_id]); 

        // Check if the post was deleted successfully
        if (result.affectedRows === 0) {
            res.status(404).json({
                message: messages.INVALID_ID,
            });
        } else {
            res.status(200).json({
                message: messages.DATA_DELETED,
            });
        }
    } catch (err) {
        console.error('Error deleting post:', err);
        res.status(500).json({
            message: messages.FAILED_TO_DELETE,
        });
    }
});



module.exports=posts;