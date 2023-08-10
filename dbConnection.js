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


module.exports = connection.promise();

// const mysql = require('mysql2/promise'); // Import mysql2/promise for better promises support
// require('dotenv').config();

// const pool = mysql.createPool({
//     host: 'localhost',
//     port: process.env.DB_PORT,
//     user: process.env.DB_USER,
//     password: process.env.DB_PASSWORD,
//     database: process.env.DB_DATABASE,
  
// });

// (async () => {
//     try {
//         const connection = await pool.getConnection();
//         console.log('Connected to MySQL database');

//         // You can use the connection to perform database operations
//         // For example:
//         // const [rows, fields] = await connection.query('SELECT * FROM your_table');
        
//         connection.release(); // Release the connection back to the pool when done
//     } catch (error) {
//         console.error('Error connecting to MySQL database:', error);
//     }
// })();

// module.exports = pool;
