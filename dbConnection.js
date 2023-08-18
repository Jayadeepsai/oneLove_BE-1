const mysql = require('mysql2');
require('dotenv').config();
const connection = mysql.createConnection({

    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
    

})
connection.connect(function (error) {
    if (error) throw error
     else{
        console.log('connected to mysql database')
    //  var sql = `ALTER TABLE onelove.posts
    //  ADD COLUMN pet_id INT,
    //  ADD FOREIGN KEY (pet_id) REFERENCES onelove.pet(pet_id);`
     
    

    // connection.query(sql, (err, result) => {
    //     if (err) throw err;
    //     console.log("Qurey Executed")
    //  })
    }
})


module.exports = connection.promise();


