const express = require('express');
const videos = express.Router();
const AWS = require('aws-sdk');
require('dotenv').config();
const bodyParser = require('body-parser');
const jwtMiddleware = require('../../jwtMiddleware');
const messages = require('../messages/constants');
const logger = require('../../logger');

AWS.config.update({
  accessKeyId: process.env.AWS_ID,
  secretAccessKey: process.env.SECRET_KEY,
});

const s3 = new AWS.S3();

videos.use(express.json());
videos.use(express.urlencoded({ extended: true }));


videos.post('/upload-video',jwtMiddleware.verifyToken, (req, res) => {
  const { userType } = req;
  if (userType !== 'pet_owner'&& userType !== 'pet_doctor'&& userType !== 'pet_trainer') {
      return res.status(403).json({ message: messages.FORBID });
  }
  try {
    if (!req.files || !req.files.video) {
      return res.status(400).json({ message: messages.NO_FILE_UPLOADED });
    }

    const videoFile = req.files.video;

    const params = {
      Bucket: 'onelovebucket',
      Key: videoFile.name,
      Body: videoFile.data,
      ACL: 'public-read'
    };

    s3.upload(params, (err, data) => {
      if (err) {
        logger.error('Error uploading video:', err);
        return res.status(400).json({ message: messages.FAILED_UPLOADING });
      }

      res.status(200).json({
        message: messages.FILE_UPLOADED,
        videoUrl: data.Location
      });
    });
  } catch (error) {
    logger.error('Error handling video upload:', error);
    res.status(400).json({ message: messages.FAILED_UPLOADING });
  }
});

module.exports = videos;
