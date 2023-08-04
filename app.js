const mysql = require('mysql');
const express = require('express');
const app = express();
require('dotenv').config();
const connection = require('./dbConnection')

const vaccine = require('./src/clinic/vaccine');
const items = require('./src/store/item');
const pets = require('./src/pets/pets');
const loveIndx = require('./src/posts/loveIndex');



app.use('/onelove/vaccine',vaccine);
app.use('onelove/items',items);
app.use('/onelove/pets',pets)
app.use('/onelove/loveIndex',loveIndx);


module.exports = app