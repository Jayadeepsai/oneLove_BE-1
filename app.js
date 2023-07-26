const mysql = require('mysql');
const express = require('express');
const app = express();
require('dotenv').config();
const connection = require('./dbConnection')

const vaccine = require('./apis/vaccine');
const items = require('./apis/item');



app.use('/vaccine',vaccine);
app.use('/items',items);


module.exports = app