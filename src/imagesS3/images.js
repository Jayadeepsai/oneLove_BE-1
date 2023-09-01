const express = require('express');
const images = express.Router();
const bodyParser = require('body-parser');
const messages = require('../messages/constants');
require('dotenv').config();

images.use(express.json()); // To parse JSON bodies
images.use(express.urlencoded({ extended: true })); // To parse URL-encoded bodies

const AWS = require('aws-sdk');


AWS.config.update({
    accessKeyId: process.env.AWS_ID,
    secretAccessKey: process.env.SECRET_KEY,
    // region: 'us-east-1' // Update with your region
  });
  
  // Create an S3 instance
  const s3 = new AWS.S3();

  images.post('/upload', async (req, res) => {
    try {
      if (!req.files || !req.files.image) {
        return res.status(400).json({ message: 'No image file uploaded.' });
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
        message: 'Image uploaded successfully',
        imageUrl: uploadResult.Location
      });
    } catch (error) {
      console.error('Error uploading image:', error);
      res.status(500).json({ message: 'Failed to upload image.' });
    }
  });


  module.exports = images;