const express = require('express');
const message = express.Router();
const bodyParser = require('body-parser');
const constant = require('../messages/constants');
const db = require('../../dbConnection');
const cron = require('node-cron');
const moment = require('moment');
const logger = require('../../logger');
const http = require('http')
const { Server } = require("socket.io")
const he = require('he')
const httpServer = http.createServer();
const notification= require('../oneSignal/notifications');
const jwtMiddleware = require('../../jwtMiddleware');

const io = new Server(httpServer)

message.use(express.json());
message.use(express.urlencoded({ extended: true }));

const userSocketMap = new Map();

io.on('connection', (socket) => {
  logger.info('A user connected');
  console.log('user connected', socket.id)


  socket.on('set_user_id', (user_id) => {
    userSocketMap.set(user_id, socket.id);
  });

  socket.on('send_message', async (data) => {
    try {
      const { sender_id, receiver_id, message, time} = data;
      const sql = 'INSERT INTO messages (sender_id, receiver_id, message, time, read) VALUES (?, ?, ?, ?, ?)';
      const encodedMessage = he.encode(message);
      await db.query(sql, [sender_id, receiver_id, encodedMessage, time]);

      const receiverSocketId = userSocketMap.get(receiver_id);

      logger.info('receiverSocketId' ,receiverSocketId )
      logger.info('userSocketMap',userSocketMap)
      if (receiverSocketId) {
        io.to(receiverSocketId).emit('receive_message', data);
      }
      logger.info('Message saved and sent:', data);
      
      const sql1 = `SELECT external_id FROM onelove.users WHERE user_id = ${receiver_id}`
      const [sql1Result] = await db.query(sql1)
      const external_id=sql1Result[0].external_id;
      console.log('external id',external_id)

      const sql2 = `SELECT user_name FROM onelove.users WHERE user_id = ${sender_id}`
      const [sql2Result] = await db.query(sql2);
      const user_name = sql2Result[0].user_name

      const sql3 = `SELECT user_name FROM onelove.users WHERE user_id = ${receiver_id}`
      const [sql3Result] = await db.query(sql3);
      const user_type = sql3Result[0].user_type

      const retriveEndpoint = {
        pet_owner:`ChatScreen`,
        pet_trainer:`trainer`,
        pet_doctor:`doctor`

      }

      const mess = `Heyy you got a message from ${user_name}`;
      const uniqId = external_id; 
      const Heading = "New message"
      const endpoint = retriveEndpoint[user_type]

      await notification.sendnotification(mess, uniqId,Heading,endpoint);

    } catch (error) {
      logger.error('Error posting message:', error);
    }
  });



  socket.on('disconnect', () => {
    logger.warn('A user disconnected');
    console.log('user disconnected', socket.id)
  });
});



message.get('/messages',jwtMiddleware.verifyToken, async (req, res) => {
  try {
    const { sender_id, receiver_id } = req.query;
    const sql = 'SELECT * FROM messages WHERE (sender_id = ? AND receiver_id = ?) OR (sender_id = ? AND receiver_id = ?) ORDER BY time ASC';
    const [messages] = await db.query(sql, [sender_id, receiver_id, receiver_id, sender_id]);
    const convo = messages.map((message) => ({
      ...message,
      time: moment(message.time).format('YYYY-MM-DD HH:mm:ss'),
      message: he.decode(message.message), 
    }));

    const chat = JSON.parse(JSON.stringify(convo));

    res.status(200).json({
      chat,
      message: constant.SUCCESS_MESSAGE
    });
  } catch (error) {
    logger.error('Error getting messages:', error);
    res.status(500).json({ error: constant.FAILURE_MESSAGE });
  }
});


message.get('/chat_history',jwtMiddleware.verifyToken, async (req, res) => {
  try {
    const { user_id } = req.query;

  //   const sql = `
  //     SELECT
  //         u.user_id,
  //         u.user_name,
  //         u.user_type,
  //         i.image_url AS user_image_url,
  //         m.message,
  //         m.read,
  //         MAX(m.time) AS latest_time 
  //     FROM
  //         users u
  //     JOIN
  //         messages m ON (u.user_id = m.sender_id OR u.user_id = m.receiver_id)
  //     LEFT JOIN
  //         images i ON u.image_id = i.image_id
  //     WHERE
  //         (m.sender_id = ? OR m.receiver_id = ?) AND u.user_id != ?
  //     GROUP BY
  //         u.user_id, u.user_name, i.image_url, m.message, m.read
  //     ORDER BY
  //         latest_time DESC
  // `;

  const sql =`
  SELECT
    u.user_id,
    u.user_name,
    u.user_type,
    i.image_url AS user_image_url,
    m.read AS latest_read,
    m.time AS latest_time,
    m.message AS latest_message
FROM
    users u
JOIN
    messages m ON (u.user_id = m.sender_id OR u.user_id = m.receiver_id)
LEFT JOIN
    images i ON u.image_id = i.image_id
WHERE
    (m.sender_id = ? OR m.receiver_id = ?) AND u.user_id != ?
AND
    m.time = (
        SELECT MAX(time)
        FROM messages
        WHERE (sender_id = u.user_id OR receiver_id = u.user_id)
    )
ORDER BY
    m.time DESC

`;

    const [chatHistory] = await db.query(sql, [user_id, user_id, user_id]);
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


// const deleteOldConversations = async () => {
//   try {
//     const currentTime = new Date();
//     const twentyFourHoursAgo = new Date(currentTime - 24 * 60 * 60 * 1000); 
//     const sql = 'DELETE FROM messages WHERE time < ?';
//     const [sqlResult] = await db.query(sql, [twentyFourHoursAgo]);

//     if (sqlResult.affectedRows > 0) {
//       logger.info('Old conversations deleted');
//     }

//   } catch (error) {
//     logger.error('Error deleting old conversations:', error);
//   }
// };


cron.schedule('*/10 * * * *',  deleteOldConversations = async () => {
  try {
    const currentTime = new Date();
    const twentyFourHoursAgo = new Date(currentTime - 24 * 60 * 60 * 1000); 
    const sql = 'DELETE FROM messages WHERE time < ?';
    const [sqlResult] = await db.query(sql, [twentyFourHoursAgo]);

    if (sqlResult.affectedRows > 0) {
      logger.info('Old conversations deleted');
    }

  } catch (error) {
    logger.error('Error deleting old conversations:', error);
  }
});


message.get('/get-mobile-number', async (req, res) => {
  try {
    const userId = req.query.user_id;

    if (!userId) {
      return res.status(400).json({ message: 'user_id is required' });
    }

    const sql = 'SELECT cd.mobile_number FROM users u INNER JOIN contact_details cd ON u.contact_id = cd.contact_id WHERE u.user_id = ?';
    const [rows] = await db.query(sql, [userId]);

    if (rows.length === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    const mobileNumber = rows[0].mobile_number;
    return res.status(200).json({ mobile_number: mobileNumber });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ message: 'An error occurred' });
  }
});



module.exports = message;
module.exports.io = io;