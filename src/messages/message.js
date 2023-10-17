const express = require('express');
const message = express.Router();
const bodyParser = require('body-parser');
const constant = require('../messages/constants');
const db = require('../../dbConnection');
const cron = require('node-cron');
const moment = require('moment');
const logger = require('../../logger');

// Include Socket.io and create a socket server instance
const httpServer = require('http').createServer();
const io = require('socket.io')(httpServer);

message.use(express.json()); // To parse JSON bodies
message.use(express.urlencoded({ extended: true })); // To parse URL-encoded bodies


// Initialize the socket server
io.on('connection', (socket) => {
  logger.info('A user connected');

  // Handle new messages here
  socket.on('newMessage', async (data) => {
    try {
      // Get data from the request body
      const { sender_id, receiver_id, message } = data;
      // Get the current date and time
      const currentTime = moment().format('YYYY-MM-DD HH:mm:ss');

      const sql = 'INSERT INTO messages (sender_id, receiver_id, message, time) VALUES (?, ?, ?, ?)';

      // Insert the message into the database
      await db.query(sql, [sender_id, receiver_id, message, currentTime]);

      // Emit the new message to all connected clients
      io.emit('message', {
        sender_id,
        receiver_id,
        message,
        time: currentTime,
      });

      logger.info('Message saved and sent:', data);

    } catch (error) {
      logger.error('Error posting message:', error);
    }
  });

  socket.on('disconnect', () => {
    logger.warn('A user disconnected');
  });
});


  // Route to get messages between sender_id and receiver_id
message.get('/messages', async (req, res) => {
    try {
      // Get sender_id and receiver_id from the URL parameters
      const { sender_id, receiver_id } = req.query;
      const sql ='SELECT * FROM messages WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?) ORDER BY time ASC';
  
      // Retrieve messages ordered by time (most recent first)
      const [messages] = await db.query(sql,[sender_id, receiver_id, receiver_id, sender_id]);
      
   // Format the timestamps in the response
   const convo = messages.map((message) => ({
    ...message,
    time: moment(message.time).format('YYYY-MM-DD HH:mm:ss'), // Format it as per your database format
  }));

  const chat =JSON.parse(JSON.stringify(convo));

      res.status(200).json({
        chat,
        message: constant.SUCCESS_MESSAGE
      });
    } catch (error) {
      logger.error('Error getting messages:', error);
      res.status(500).json({ error: constant.FAILURE_MESSAGE });
    }
  });


  message.get('/chat_history', async (req, res) => {
    try {
      const { user_id } = req.query;

      const sql = `
      SELECT
          u.user_id,
          u.user_name,
          i.image_url AS user_image_url,
          MAX(m.time) AS latest_time
      FROM
          users u
      JOIN
          messages m ON (u.user_id = m.sender_id OR u.user_id = m.receiver_id)
      LEFT JOIN
          images i ON u.image_id = i.image_id
      WHERE
          (m.sender_id = ? OR m.receiver_id = ?) AND u.user_id != ?
      GROUP BY
          u.user_id, u.user_name, i.image_url
      ORDER BY
          latest_time DESC
  `;
  
      // Retrieve chat history for the user with the latest time for each user
      const [chatHistory] = await db.query(sql,[user_id, user_id, user_id]);
      const Data = JSON.parse(JSON.stringify(chatHistory));
  
      res.status(200).json({
        Data,
        message: constant.SUCCESS_MESSAGE,
    });
    } catch (error) {
      logger.error('Error getting chat history:', error);
      res.status(500).json({ error: constant.FAILURE_MESSAGE });
    }
  });



  // message.delete('/delete_old_conversations', async (req, res) => {
  //   try {
  //     // Calculate the timestamp representing 24 hours ago
  //     const currentTime = new Date();
  //     const twentyFourHoursAgo = new Date(currentTime - 24 * 60 * 60 * 1000); // 24 hours in milliseconds
  
  //     const sql = 'DELETE FROM messages WHERE time < ?';
  
  //     // Delete conversations older than 24 hours
  //     await db.query(sql, [twentyFourHoursAgo]);
  
  //     res.status(200).json({ message: 'Old conversations deleted successfully' });
  //   } catch (error) {
  //     console.error('Error deleting old conversations:', error);
  //     res.status(500).json({ error: 'Internal Server Error' });
  //   }
  // });
  
  const deleteOldConversations = async () => {
    try {
      // Calculate the timestamp representing 24 hours ago
      const currentTime = new Date();
      const twentyFourHoursAgo = new Date(currentTime - 24 * 60 * 60 * 1000); // 24 hours in milliseconds
  
      const sql = 'DELETE FROM messages WHERE time < ?';
  
      // Delete conversations older than 24 hours
     const [sqlResult] = await db.query(sql, [twentyFourHoursAgo]);

     if(sqlResult.affectedRows > 0){
       logger.info('Old conversations deleted');
     }
      
    } catch (error) {
      logger.error('Error deleting old conversations:', error);
    }
  };
  
  // Schedule the deletion job to run every 10 mins
  cron.schedule('*/10 * * * *', deleteOldConversations); // This schedules the job to run at the beginning of every 10 mins

module.exports = message;
// Export the httpServer for Socket.io
module.exports.io = io;