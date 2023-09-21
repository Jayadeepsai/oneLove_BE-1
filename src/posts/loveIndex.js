const express = require('express');
const loveIndx = express.Router();
const bodyParser = require('body-parser');
const messages = require('../messages/constants');
const db = require('../../dbConnection')

loveIndx.use(express.json()); // To parse JSON bodies
loveIndx.use(express.urlencoded({ extended: true })); // To parse URL-encoded bodies


loveIndx.post('/like-post', async (req, res) => {
    const { user_id, user_name } = req.body;
    const { love_index_id } = req.query;

    try {
        // Fetch the existing likes data from the database for the specified love_index_id
        const existingLikesSql = 'SELECT likes FROM onelove.love_index WHERE love_index_id = ?';
        const [existingLikesResult] = await db.query(existingLikesSql, [love_index_id]);

        if (existingLikesResult.length === 0) {
            return res.status(404).json({ message: 'Love index not found.' });
        }

        // Extract the likes data from the query result or initialize it as an empty array if it's null
        const existingLikes = existingLikesResult[0].likes || [];

        // Check if the user has already liked the post
        const userLiked = existingLikes.some(like => like.user_id === user_id);

        if (userLiked) {
            return res.status(400).json({ message: 'User has already liked the post.' });
        }

        // Add the new like to the existing likes array
        existingLikes.push({ user_id, user_name });

        // Update the likes data in the database
        const updateLikesSql = 'UPDATE onelove.love_index SET likes = ? WHERE love_index_id = ?';
        const updateLikesValues = [JSON.stringify(existingLikes), love_index_id];
        await db.query(updateLikesSql, updateLikesValues);

        // Get the like count for the post
        const likeCount = existingLikes.length;

        // Send the like count as a response
        res.status(200).json({ message: 'Post liked successfully.', like_count: likeCount });
    } catch (err) {
        console.error('Error while liking post:', err);
        res.status(500).json({ message: 'Failed to like the post.' });
    }
});




loveIndx.post('/unlike-post', async (req, res) => {
    const { user_id } = req.body;
    const { love_index_id } = req.query;

    try {
        // Fetch the existing likes data from the database for the specified love_index_id
        const existingLikesSql = 'SELECT likes FROM onelove.love_index WHERE love_index_id = ?';
        const [existingLikesResult] = await db.query(existingLikesSql, [love_index_id]);

        if (existingLikesResult.length === 0) {
            return res.status(404).json({ message: 'Love index not found.' });
        }

        let existingLikes = [];

        if (Array.isArray(existingLikesResult[0].likes)) {
            existingLikes = existingLikesResult[0].likes;
        } else {
            // If the likes data is not an array, log an error or handle it accordingly
            console.error('Invalid likes data:', existingLikesResult[0].likes);
            return res.status(500).json({ message: 'Failed to unlike the post.' });
        }

        // Check if the user has liked the post
        const userLikedIndex = existingLikes.findIndex(like => like.user_id === user_id);

        if (userLikedIndex === -1) {
            return res.status(400).json({ message: 'User has not liked the post.' });
        }

        // Remove the user's like from the existing likes array
        existingLikes.splice(userLikedIndex, 1);

        // Update the likes data in the database
        const updateLikesSql = 'UPDATE onelove.love_index SET likes = ? WHERE love_index_id = ?';
        const updateLikesValues = [JSON.stringify(existingLikes), love_index_id];
        await db.query(updateLikesSql, updateLikesValues);

        // Get the updated like count for the post
        const likeCount = existingLikes.length;

        // Send the updated like count as a response
        res.status(200).json({ message: 'Post unliked successfully.', like_count: likeCount });
    } catch (err) {
        console.error('Error while unliking post:', err);
        res.status(500).json({ message: 'Failed to unlike the post.' });
    }
});



loveIndx.post('/comment', async (req, res) => {
    const { love_index_id } = req.query;
    const { comments } = req.body;

    try {
        // Fetch the existing comments data from the database for the specified love_index_id
        const existingCommentsSql = 'SELECT comments FROM onelove.love_index WHERE love_index_id = ?';
        const [existingCommentsResult] = await db.query(existingCommentsSql, [love_index_id]);

        let updatedComments = [];

        if (existingCommentsResult.length > 0) {
            // If a row exists, fetch the existing JSON array
            const existingComments = existingCommentsResult[0].comments;

            if (existingComments === null) {
                // If it's null, initialize the updatedComments array with the new data
                updatedComments = comments;
            } else if (Array.isArray(existingComments)) {
                // If it's an array, concatenate the new data
                updatedComments = existingComments.concat(comments);
            } else {
                try {
                    // If it's not an array, parse it and then concatenate
                    const parsedComments = JSON.parse(existingComments);
                    updatedComments = parsedComments.concat(comments);
                } catch (parseError) {
                    // Handle JSON parsing error here
                    console.error('Error parsing existingComments:', parseError);
                    res.status(400).json({
                        message: 'Error parsing existingComments',
                    });
                    return;
                }
            }

            // Update the JSON data in the database
            const updateQuery = 'UPDATE onelove.love_index SET comments = ? WHERE love_index_id = ?';
            const updateValues = [JSON.stringify(updatedComments), love_index_id];
            await db.query(updateQuery, updateValues);
        } else {
            // If no row exists, insert a new row with the new data
            const insertQuery = 'INSERT INTO onelove.love_index (comments) VALUES (?)';
            const insertValues = [JSON.stringify(comments)];
            await db.query(insertQuery, insertValues);
        }

        res.status(200).json({
            message: "Data posted or updated"
        });
    } catch (err) {
        console.error('Error posting/updating data:', err.message);
        res.status(400).json({
            message: err
        });
    }
});



loveIndx.delete('/delete-comment', async (req, res) => {
    const { love_index_id, user_id } = req.query;

    try {
        // Fetch the existing comments data from the database for the specified love_index_id
        const existingCommentsSql = 'SELECT comments FROM onelove.love_index WHERE love_index_id = ?';
        const [existingCommentsResult] = await db.query(existingCommentsSql, [love_index_id]);

        if (existingCommentsResult.length === 0) {
            return res.status(404).json({ message: 'Love index not found.' });
        }

        let existingComments = [];

        if (existingCommentsResult[0].comments !== null) {
            if (Array.isArray(existingCommentsResult[0].comments)) {
                existingComments = existingCommentsResult[0].comments;
            } else {
                // If the comments data is not an array, log an error or handle it accordingly
                console.error('Invalid comments data:', existingCommentsResult[0].comments);
                return res.status(500).json({ message: 'Failed to delete comment.' });
            }
        }

        // Find the index of the comment with the specified user_id
        const commentIndex = existingComments.findIndex(comment => comment.user_id === user_id);

        if (commentIndex === -1) {
            return res.status(404).json({ message: 'Comment not found.' });
        }

        // Remove the comment from the existing comments array
        existingComments.splice(commentIndex, 1);

        // Update the comments data in the database
        const updateCommentsSql = 'UPDATE onelove.love_index SET comments = ? WHERE love_index_id = ?';
        const updateCommentsValues = [JSON.stringify(existingComments), love_index_id];
        await db.query(updateCommentsSql, updateCommentsValues);

        // Send a success response
        res.status(200).json({ message: 'Comment deleted successfully.' });
    } catch (err) {
        console.error('Error while deleting comment:', err);
        res.status(500).json({ message: 'Failed to delete comment.' });
    }
});



loveIndx.get('/love_index_data',async(req,res)=>{
    const post_id = req.query.post_id;
try{
    const sql = `SELECT * FROM onelove.love_index WHERE love_index_id = (SELECT love_index_id FROM onelove.posts WHERE post_id = ?)`
    const [results] = await db.query(sql, [post_id]);
    const postData = JSON.parse(JSON.stringify(results));
    const likesCount = postData[0].likes.length;
    const commentsCount = postData[0].comments.length;

    if (postData) {
        res.status(200).json({
            postData,
            likesCount,
            commentsCount,
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



loveIndx.get('/loveIndexDataByCondition/:love_index_id', (req, res) => {                //Fetching data based on id
    const love_index_id = req.params.love_index_id;
    const sql = `SELECT * FROM onelove.love_index WHERE love_index_id = ?`;

    db.query(sql, love_index_id, function (err, result, fields) {
        if (!err) {
            var data = JSON.parse(JSON.stringify(result));
            console.log(data);
            res.status(200).json({
                loveIndexData: data,
                message: "loveIndex Data"
            });
        } else {
            res.status(400).json({
                message: err
            });
        }
    });
});



loveIndx.put('/updateloveIndexData/:love_index_id', (req, res) => {           //Updating data in vaccination table based on vaccination_id
    const love_index_id = req.params.love_index_id;

    const {love_tags, share, hoots} = req.body;

    // Create the SQL query for the update operation
    let sql = 'UPDATE onelove.love_index SET';

    // Initialize an array to store the values for the query
    const values = [];

    // Append the fields to the query only if they are provided in the request body
    if (love_tags !== undefined) {
        sql += ' love_tags=?,';
        values.push(love_tags);
    }
    if (share !== undefined) {
        sql += ' share=?,';
        values.push(share);
    }
    if (hoots !== undefined) {
        sql += ' hoots=?,';
        values.push(hoots);
    }
   
    // Remove the trailing comma from the SQL query
    sql = sql.slice(0, -1);

    sql += ' WHERE love_index_id=?';
    values.push(love_index_id);

    // Execute the update query
    db.query(sql, values, (err, result) => {
        if (err) {
            console.error('Error updating data:', err.message);
            res.status(400).json({ message: 'Failed to update data.' });
        } else {
            console.log('Data updated successfully.');
            res.status(200).json({
                updatedData: result,
                message: 'Data updated successfully.',
            });
            console.log(result)
        }
    });
});



module.exports=loveIndx;