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
    //  var sql = `ALTER TABLE onelove.inventory
    //  ADD COLUMN address_id INT,
    //  ADD CONSTRAINT fk_address_id_inventory
    //  FOREIGN KEY (address_id) REFERENCES onelove.address(address_id);`
     
    

    // connection.query(sql, (err, result) => {
    //     if (err) throw err;
    //     console.log("Qurey Executed")
    //  })
    }
})


module.exports = connection