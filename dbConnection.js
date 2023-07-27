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
     else{
        console.log('connected to mysql database')
    //  var sql = `CREATE TABLE onelove.pet_trainer (
    //     pet_trainer_id INT AUTO_INCREMENT PRIMARY KEY,
    //     user_id INT,
    //     address_id INT,
    //     contact_id INT,
    //     service_id INT,
    //     FOREIGN KEY (user_id) REFERENCES onelove.users(user_id),
    //     FOREIGN KEY (address_id) REFERENCES onelove.address(address_id),
    //     FOREIGN KEY (contact_id) REFERENCES onelove.contact_details(contact_id),
    //     FOREIGN KEY (service_id) REFERENCES onelove.service(service_id)
    // );`
     
    

    // connection.query(sql, (err, result) => {
    //     if (err) throw err;
    //     console.log("Qurey Executed")
    //  })
    }
})


module.exports = connection