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
    //  var sql = `ALTER TABLE onelove.users
    //  ADD COLUMN store_id INT,
    //  ADD COLUMN service_id INT,
    //  ADD COLUMN clinic_id INT,
    //  ADD FOREIGN KEY (store_id) REFERENCES onelove.store(store_id),
    //  ADD FOREIGN KEY (service_id) REFERENCES onelove.service(service_id),
    //  ADD FOREIGN KEY (clinic_id) REFERENCES onelove.clinics(clinic_id);`
     
    

    // connection.query(sql, (err, result) => {
    //     if (err) throw err;
    //     console.log("Qurey Executed")
    //  })
    }
})


module.exports = connection.promise();


