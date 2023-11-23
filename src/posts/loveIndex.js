const express = require('express');
const loveIndx = express.Router();
const bodyParser = require('body-parser');
const messages = require('../messages/constants');
const db = require('../../dbConnection');
const jwtMiddleware = require('../../jwtMiddleware');
const logger = require('../../logger');

loveIndx.use(express.json());
loveIndx.use(express.urlencoded({ extended: true }));

loveIndx.post('/like-post',jwtMiddleware.verifyToken, async (req, res) => {

    const { userType } = req;
    if (userType !== 'pet_owner'&& userType !== 'pet_doctor'&& userType !== 'pet_trainer') {
        return res.status(403).json({ message: messages.FORBID });
    }

    const { user_id, user_name } = req.body;
    const { love_index_id } = req.query;
    try {
        const existingLikesSql = 'SELECT likes FROM onelove.love_index WHERE love_index_id = ?';
        const [existingLikesResult] = await db.query(existingLikesSql, [love_index_id]);
        if (existingLikesResult.length === 0) {
            return res.status(200).json({ message:messages.NO_DATA });
        }

        const existingLikes = existingLikesResult[0].likes || [];
        const userLiked = existingLikes.some(like => like.user_id === user_id);

        if (userLiked) {
            return res.status(400).json({ message: messages.ALREADY_LIKED });
        }

        existingLikes.push({ user_id, user_name });
        const updateLikesSql = 'UPDATE onelove.love_index SET likes = ? WHERE love_index_id = ?';
        const updateLikesValues = [JSON.stringify(existingLikes), love_index_id];
        await db.query(updateLikesSql, updateLikesValues);
        const likeCount = existingLikes.length;

        res.status(200).json({ message: messages.LIKE_SUCCESSFUL, like_count: likeCount });
    } catch (err) {
        logger.error('Error while liking post:', err);
        res.status(400).json({ message: messages.LIKE_FAILED });
    }
});


loveIndx.post('/unlike-post',jwtMiddleware.verifyToken, async (req, res) => {

    const { userType } = req;
         if (userType !== 'pet_owner'&& userType !== 'pet_doctor'&& userType !== 'pet_trainer') {
             return res.status(403).json({ message: messages.FORBID });
         }

    const { user_id } = req.body;
    const { love_index_id } = req.query;
    try {
        const existingLikesSql = 'SELECT likes FROM onelove.love_index WHERE love_index_id = ?';
        const [existingLikesResult] = await db.query(existingLikesSql, [love_index_id]);

        if (existingLikesResult.length === 0) {
            return res.status(200).json({ message:messages.NO_DATA });
        }

        let existingLikes = [];
        if (Array.isArray(existingLikesResult[0].likes)) {
            existingLikes = existingLikesResult[0].likes;
        } else {
            logger.error('Invalid likes data:', existingLikesResult[0].likes);
            return res.status(400).json({ message:messages.UNLIKE_FAILED });
        }
        const userLikedIndex = existingLikes.findIndex(like => like.user_id === user_id);
        if (userLikedIndex === -1) {
            return res.status(400).json({ message: messages.NOT_LIKED_YET });
        }

        existingLikes.splice(userLikedIndex, 1);

        const updateLikesSql = 'UPDATE onelove.love_index SET likes = ? WHERE love_index_id = ?';
        const updateLikesValues = [JSON.stringify(existingLikes), love_index_id];
        await db.query(updateLikesSql, updateLikesValues);

        const likeCount = existingLikes.length;
        res.status(200).json({ message: messages.UNLIKE_SUCCESSFUL, like_count: likeCount });

    } catch (err) {
        logger.error('Error while unliking post:', err);
        res.status(400).json({ message: messages.UNLIKE_FAILED });
    }
});



loveIndx.post('/comment',jwtMiddleware.verifyToken, async (req, res) => {

    const { userType } = req;
         if (userType !== 'pet_owner'&& userType !== 'pet_doctor'&& userType !== 'pet_trainer') {
             return res.status(403).json({ message: messages.FORBID });
         }

    const { love_index_id } = req.query;
    const { comments } = req.body;

    try {
        const existingCommentsSql = 'SELECT comments FROM onelove.love_index WHERE love_index_id = ?';
        const [existingCommentsResult] = await db.query(existingCommentsSql, [love_index_id]);

        let updatedComments = [];

        if (existingCommentsResult.length > 0) {
            const existingComments = existingCommentsResult[0].comments;

            if (existingComments === null) {
                updatedComments = comments;
            } else if (Array.isArray(existingComments)) {
                updatedComments = existingComments.concat(comments);
            } else {
                try {
                    const parsedComments = JSON.parse(existingComments);
                    updatedComments = parsedComments.concat(comments);
                } catch (parseError) {
                    logger.error('Error parsing existingComments:', parseError);
                    res.status(400).json({
                        message: 'Error parsing existingComments',
                    });
                    return;
                }
            }

            const updateQuery = 'UPDATE onelove.love_index SET comments = ? WHERE love_index_id = ?';
            const updateValues = [JSON.stringify(updatedComments), love_index_id];
            await db.query(updateQuery, updateValues);

        } else {
            const insertQuery = 'INSERT INTO onelove.love_index (comments) VALUES (?)';
            const insertValues = [JSON.stringify(comments)];
            await db.query(insertQuery, insertValues);
        }
        res.status(200).json({
            message: messages.POST_SUCCESS
        });
    } catch (err) {
        logger.error('Error posting/updating data:', err.message);
        res.status(400).json({
            message: messages.POST_FAILED
        });
    }
});



loveIndx.delete('/delete-comment',jwtMiddleware.verifyToken, async (req, res) => {
    const { love_index_id, user_id } = req.query;

    try {
        const existingCommentsSql = 'SELECT comments FROM onelove.love_index WHERE love_index_id = ?';
        const [existingCommentsResult] = await db.query(existingCommentsSql, [love_index_id]);

        if (existingCommentsResult.length === 0) {
            return res.status(404).json({ message: messages.NO_DATA });
        }

        let existingComments = [];

        if (existingCommentsResult[0].comments !== null) {
            if (Array.isArray(existingCommentsResult[0].comments)) {
                existingComments = existingCommentsResult[0].comments;
            } else {
                logger.error('Invalid comments data:', existingCommentsResult[0].comments);
                return res.status(400).json({ message: messages.FAILED_TO_DELETE });
            }
        }
        const commentIndex = existingComments.findIndex(comment => comment.user_id === user_id);

        if (commentIndex === -1) {
            return res.status(200).json({ message:messages.NO_DATA});
        }
        existingComments.splice(commentIndex, 1);

        const updateCommentsSql = 'UPDATE onelove.love_index SET comments = ? WHERE love_index_id = ?';
        const updateCommentsValues = [JSON.stringify(existingComments), love_index_id];
        await db.query(updateCommentsSql, updateCommentsValues);

        res.status(200).json({ message:messages.DATA_DELETED });
    } catch (err) {
        logger.error('Error while deleting comment:', err);
        res.status(400).json({ message: messages.FAILED_TO_DELETE });
    }
});



loveIndx.get('/love_index_data',jwtMiddleware.verifyToken, async (req, res) => {
        const post_id = req.query.post_id;
        try {
            const sql = `SELECT * FROM onelove.love_index WHERE love_index_id = (SELECT love_index_id FROM onelove.posts WHERE post_id = ?)`;
            const [results] = await db.query(sql, [post_id]);
            const postData = JSON.parse(JSON.stringify(results));
    
            if (!postData) {
                return res.status(400).json({
                    message: messages.FAILED,
                });
            }
    
            let likesCount = 0;
            let commentsCount = 0;
    
            if (postData[0].likes) {
                likesCount = postData[0].likes.length;
            }
    
            if (postData[0].comments) {
                commentsCount = postData[0].comments.length;
            }
    
            res.status(200).json({
                postData,
                likesCount,
                commentsCount,
                message: messages.SUCCESS_MESSAGE,
            });
        } catch (err) {
            logger.error('Error fetching data:', err);
            res.status(400).json({
                message: messages.FAILURE_MESSAGE,
            });
        }
    });
    

loveIndx.get('/loveIndexDataByCondition/:love_index_id',jwtMiddleware.verifyToken, (req, res) => { 
    const love_index_id = req.params.love_index_id;
    const sql = `SELECT * FROM onelove.love_index WHERE love_index_id = ?`;

    db.query(sql, love_index_id, function (err, result, fields) {
        if (!err) {
            var data = JSON.parse(JSON.stringify(result));
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


module.exports=loveIndx;