const mysql = require('mysql');
const express = require('express');
const app = express();
require('dotenv').config();
const env = require('./src/environment')
const connection = require('./dbConnection')

const vaccine = require('./src/vaccine');
const items = require('./src/item');
const pets = require('./src/pets');



app.use('/onelove/vaccine',vaccine);
app.use('onelove/items',items);
app.use('/onelove/pets',pets)


module.exports = app