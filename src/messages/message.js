const express = require('express');
const message = express.Router();
const bodyParser = require('body-parser');
const messages = require('./constants');
const db = require('../../dbConnection')

message.use(express.json()); // To parse JSON bodies
message.use(express.urlencoded({ extended: true })); // To parse URL-encoded bodies


message.post('/messages', async (req, res) => {
    try {
      // Get data from the request body
      const { sender_id, receiver_id, message } = req.body;
      // Get the current date and time
      const currentTime = new Date();

      const sql = 'INSERT INTO messages (sender_id, receiver_id, message, time) VALUES (?, ?, ?, ?)';
     
      // Insert the message into the database
      await db.query(sql, [sender_id, receiver_id, message, currentTime]);

      res.status(201).json({ message: 'Message sent successfully' });
    } catch (error) {
      console.error('Error posting message:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });


  // Route to get messages between sender_id and receiver_id
message.get('/messages', async (req, res) => {
    try {
      // Get sender_id and receiver_id from the URL parameters
      const { sender_id, receiver_id } = req.query;
      const sql ='SELECT * FROM messages WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?) ORDER BY time DESC';
  
      // Retrieve messages ordered by time (most recent first)
      const [messages] = await db.query(sql,[sender_id, receiver_id, receiver_id, sender_id]);
      const chat = JSON.parse(JSON.stringify(messages));

  
      res.status(200).json({
        chat,
        message:"chat"
      });
    } catch (error) {
      console.error('Error getting messages:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });


  message.get('/chat_history', async (req, res) => {
    try {
      const { user_id } = req.query;

      const sql ='SELECT u.user_id, MAX(m.time) as latest_time ' +
      'FROM users u ' +
      'JOIN messages m ON (u.user_id = m.sender_id OR u.user_id = m.receiver_id) ' +
      'WHERE (m.sender_id = ? OR m.receiver_id = ?) AND u.user_id != ? ' +
      'GROUP BY u.user_id ' +
      'ORDER BY latest_time DESC'
  
      // Retrieve chat history for the user with the latest time for each user
      const [chatHistory] = await db.query(sql,[user_id, user_id, user_id]);
      const Data = JSON.parse(JSON.stringify(chatHistory));
  
      res.status(200).json({
        Data,
        message: 'All chat inbox',
    });
    } catch (error) {
      console.error('Error getting chat history:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  


module.exports = message;