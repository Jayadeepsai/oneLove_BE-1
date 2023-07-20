const mysql = require('mysql');
const express= require('express');
const app = express();

const connection = mysql.createConnection({
    host: '18.223.134.88',
    user: 'root',
    password: 'oneLove@ro-one',
    database: 'oneLove',
    multipleStatements: true
  });
  
  connection.connect((error) => {
    if (error) {
      console.error('Error connecting to the database: ', error);
    } else {
      console.log('Connected to the database!');
    }
  });