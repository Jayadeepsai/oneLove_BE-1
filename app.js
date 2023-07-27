const mysql = require('mysql');
const express = require('express');
const app = express();
require('dotenv').config();
const env = require('./src/environment')
const connection = require('./dbConnection')

const vaccine = require('./src/vaccine');
const items = require('./src/item');



app.use('/vaccine',vaccine);
app.use('/items',items);


module.exports = app