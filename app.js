const mysql = require('mysql');
const express = require('express');
const app = express();
require('dotenv').config();
const connection = require('./dbConnection');
const fileUpload = require('express-fileupload');
const actuator = require('express-actuator');


// const vaccine = require('./src/clinic/vaccine');
const items = require('./src/store/item');
const pets = require('./src/pets/pets');
const loveIndx = require('./src/posts/loveIndex');
const address = require('./src/registrartion/address');
const contact = require('./src/registrartion/contactDetails');
const registration = require('./src/registrartion/registration');
const posts = require('./src/posts/posts');
const service = require('./src/service/service');
const clinic = require('./src/clinic/clinicAdd');
const user = require('./src/registrartion/users');
// const subCate = require('./src/store/subCategory');
const images = require('./src/imagesS3/images');
const video = require('./src/imagesS3/video');
const ratings = require('./src/ratings_reviews/ratings');
const orders = require('./src/orders/orders');
const message = require('./src/messages/message');
// const notification = require('./src/oneSignal/notifications');



app.use(fileUpload());
// app.use('/onelove/vaccine',vaccine);
app.use('/onelove/items',items);
app.use('/onelove/pets',pets);
app.use('/onelove/loveIndex',loveIndx);
app.use('/onelove/address',address);
app.use('/onelove/contact',contact);
app.use('/onelove/registration',registration);
app.use('/onelove/posts',posts);
app.use('/onelove/services',service);
app.use('/onelove/clinic',clinic);
app.use('/onelove/users',user);
// app.use('/onelove/sub-cate',subCate);
app.use('/onelove/image',images);
app.use('/onelove/video',video);
app.use('/onelove/ratings',ratings);
app.use('/onelove/order',orders);
app.use('/onelove/message',message);
// app.use('/onelove/notification',notification);


module.exports = app