const mysql = require('mysql');
const express = require('express');
const app = express();
require('dotenv').config();
const connection = require('./dbConnection')

const vaccine = require('./src/clinic/vaccine');
const items = require('./src/store/item');
const pets = require('./src/pets/pets');
const loveIndx = require('./src/posts/loveIndex');
const address = require('./src/registrartion/address');
const contact = require('./src/registrartion/contactDetails');
const registration = require('./src/registrartion/registration');
const posts = require('./src/posts/posts');
const service = require('./src/service/service');



app.use('/onelove/vaccine',vaccine);
app.use('/onelove/items',items);
app.use('/onelove/pets',pets);
app.use('/onelove/loveIndex',loveIndx);
app.use('/onelove/address',address);
app.use('/onelove/contact',contact);
app.use('/onelove/registration',registration);
app.use('/onelove/posts',posts);
app.use('/onelove/services',service);


module.exports = app