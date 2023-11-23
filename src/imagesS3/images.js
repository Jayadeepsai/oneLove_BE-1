const express = require('express');
const images = express.Router();
const bodyParser = require('body-parser');
const messages = require('../messages/constants');
require('dotenv').config();

images.use(express.json()); 
images.use(express.urlencoded({ extended: true })); 

const AWS = require('aws-sdk');
const jwtMiddleware = require('../../jwtMiddleware');
const logger = require('../../logger');


AWS.config.update({
  accessKeyId: process.env.AWS_ID,
  secretAccessKey: process.env.SECRET_KEY,
});
  
  const s3 = new AWS.S3();

  images.post('/upload',jwtMiddleware.verifyToken, async (req, res) => {
    try {
      if (!req.files || !req.files.image) {
        return res.status(400).json({ message: messages.NO_FILE_UPLOADED });
      }
  
      const imageFile = req.files.image;
  
      const params = {
        Bucket: 'onelovebucket', 
        Key: imageFile.name,
        Body: imageFile.data,
        ACL: 'public-read'
      };
  
      const uploadResult = await s3.upload(params).promise();

      res.status(200).json({
        message: messages.FILE_UPLOADED,
        imageUrl: uploadResult.Location
      });
    } catch (error) {
      logger.error('Error uploading image:', error);
      res.status(400).json({ message: messages.FAILED_UPLOADING });
    }
  });



  images.delete('/delete', jwtMiddleware.verifyToken, async (req, res) => {
    try {
      const imageUrl = req.query.imageUrl; 

      const params = {
        Bucket: 'onelovebucket', 
        Key: imageUrl,
      };
  
      await s3.deleteObject(params).promise();
  
      res.status(200).json({
        message: messages.FILE_DELETED,
      });
    } catch (error) {
      logger.error('Error deleting image:', error);
      res.status(400).json({ message: messages.FAILED_DELETING });
    }
  });


  images.post('/upload-registration', async (req, res) => {
    try {
      if (!req.files || !req.files.image) {
        return res.status(400).json({ message: messages.NO_FILE_UPLOADED });
      }
  
      const imageFile = req.files.image;
  
      const params = {
        Bucket: 'onelovebucket',
        Key: imageFile.name,
        Body: imageFile.data,
        ACL: 'public-read'
      };
      const uploadResult = await s3.upload(params).promise();
      res.status(200).json({
        message: messages.FILE_UPLOADED,
        imageUrl: uploadResult.Location
      });
    } catch (error) {
      logger.error('Error uploading image:', error);
      res.status(400).json({ message: messages.FAILED_UPLOADING });
    }
  });


  images.post('/upload-registration', async (req, res) => {
    try {
      if (!req.files || !req.files.image) {
        return res.status(400).json({ message: messages.NO_FILE_UPLOADED });
      }
  
      const imageFile = req.files.image;
  
      const params = {
        Bucket: 'onelovebucket',
        Key: imageFile.name,
        Body: imageFile.data,
        ACL: 'public-read'
      };
  
      const uploadResult = await s3.upload(params).promise();

      res.status(200).json({
        message: messages.FILE_UPLOADED,
        imageUrl: uploadResult.Location
      });
    } catch (error) {
      logger.error('Error uploading image:', error);
      res.status(400).json({ message: messages.FAILED_UPLOADING });
    }
  });


  images.post('/multi-upload',jwtMiddleware.verifyToken, (req, res) => {
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({ message: messages.NO_FILE_UPLOADED });
    }
  
    const uploadedFiles = req.files.images; 

    const uploadPromises = uploadedFiles.map((file) => {
      const params = {
        Bucket: 'onelovebucket',
        Key: file.name,
        Body: file.data,
        ACL: 'public-read'
      };
  
      return s3.upload(params).promise();
    });
  
    Promise.all(uploadPromises)
      .then((results) => {
        res.status(200).json({ message: messages.FILE_UPLOADED, results });
      })
      .catch((err) => {
        logger.error('Error uploading files to S3:', err);
        res.status(400).json({ message: messages.FAILED_UPLOADING, error: err });
      });
  });


  module.exports = images;