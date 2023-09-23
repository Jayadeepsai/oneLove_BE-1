const express = require('express');
const images = express.Router();
const bodyParser = require('body-parser');
const messages = require('../messages/constants');
require('dotenv').config();

images.use(express.json()); // To parse JSON bodies
images.use(express.urlencoded({ extended: true })); // To parse URL-encoded bodies

const AWS = require('aws-sdk');


AWS.config.update({
    accessKeyId: 'AKIAVMRPENK3CKWKGCGU',
    secretAccessKey: '56yngO3FifhJEQAdkBvXoAD4K9ME4mxx26Q5Rimn',
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


  images.post('/multi-upload', (req, res) => {
    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).json({ message: 'No files were uploaded.' });
    }
  
    const uploadedFiles = req.files.images; // 'images' should match your HTML form field name
  
    // Iterate through the uploaded files and upload them to S3
    const uploadPromises = uploadedFiles.map((file) => {
      const params = {
        Bucket: 'onelovemysql',
        Key: file.name,
        Body: file.data,
      };
  
      return s3.upload(params).promise();
    });
  
    Promise.all(uploadPromises)
      .then((results) => {
        res.status(200).json({ message: 'Files uploaded successfully', results });
      })
      .catch((err) => {
        console.error('Error uploading files to S3:', err);
        res.status(500).json({ message: 'Error uploading files to S3', error: err });
      });
  });

  

  module.exports = images;