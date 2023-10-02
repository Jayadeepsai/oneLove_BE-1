const express = require('express');
const videos = express.Router();
const AWS = require('aws-sdk');
// const fileUpload = require('express-fileupload');
require('dotenv').config();
const bodyParser = require('body-parser');


// AWS configuration (same as in your image upload route)
AWS.config.update({
  accessKeyId: process.env.AWS_ID,
  secretAccessKey: process.env.SECRET_KEY,
  // region: 'us-east-1' // Update with your region
});

// Create an S3 instance
const s3 = new AWS.S3();

videos.use(express.json());
videos.use(express.urlencoded({ extended: true }));

// Handle video uploads
videos.post('/upload-video', (req, res) => {
  try {
    if (!req.files || !req.files.video) {
      return res.status(400).json({ message: 'No video file uploaded.' });
    }

    const videoFile = req.files.video;

    const params = {
      Bucket: 'onelovemysql', // Update with your S3 bucket name
      Key: videoFile.name,
      Body: videoFile.data,
      ACL: 'public-read'
    };

    s3.upload(params, (err, data) => {
      if (err) {
        console.error('Error uploading video:', err);
        return res.status(500).json({ message: 'Failed to upload video.' });
      }

      res.status(200).json({
        message: 'Video uploaded successfully',
        videoUrl: data.Location
      });
    });
  } catch (error) {
    console.error('Error handling video upload:', error);
    res.status(500).json({ message: 'Failed to handle video upload.' });
  }
});

module.exports = videos;
