const mysql = require('mysql');
require('dotenv').config();
const connection = mysql.createConnection({

    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE,
    // multipleStatements: true,
    // host: '18.223.134.88',
    // port:'3306',
    // user: 'root',
    // password: 'oneLove@ro-one',
    // database: 'oneLove',
    // multipleStatements: true

})
connection.connect(function (error) {
    if (error) throw error
    else console.log('connected to mysql database')
})


module.exports = connection