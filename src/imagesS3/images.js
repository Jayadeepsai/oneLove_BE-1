const express = require('express');
const images = express.Router();
const bodyParser = require('body-parser');
const messages = require('../messages/constants');
require('dotenv').config();

images.use(express.json()); // To parse JSON bodies
images.use(express.urlencoded({ extended: true })); // To parse URL-encoded bodies

const AWS = require('aws-sdk');
const jwtMiddleware = require('../../jwtMiddleware');
const logger = require('../../logger');


AWS.config.update({
  accessKeyId: process.env.AWS_ID,
  secretAccessKey: process.env.SECRET_KEY,
  // region: 'us-east-1' // Update with your region
});
  
  // Create an S3 instance
  const s3 = new AWS.S3();

  images.post('/upload',jwtMiddleware.verifyToken, async (req, res) => {
    try {
      if (!req.files || !req.files.image) {
        return res.status(400).json({ message: messages.NO_FILE_UPLOADED });
      }
  
      const imageFile = req.files.image;
  
      const params = {
        Bucket: 'onelovemysql', // Update with your S3 bucket name
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
        Bucket: 'onelovemysql', // Update with your S3 bucket name
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
        Bucket: 'onelovemysql', // Update with your S3 bucket name
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
  
    const uploadedFiles = req.files.images; // 'images' should match your HTML form field name
  
    // Iterate through the uploaded files and upload them to S3
    const uploadPromises = uploadedFiles.map((file) => {
      const params = {
        Bucket: 'onelovemysql',
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