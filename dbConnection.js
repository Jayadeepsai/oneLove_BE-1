    // const mysql = require('mysql2');
    // require('dotenv').config();
    // const connection = mysql.createConnection({

    //     host: process.env.DB_HOST,
    //     port: process.env.DB_PORT,
    //     user: process.env.DB_USER,
    //     password: process.env.DB_PASSWORD,
    //     database: process.env.DB_DATABASE,
    //     charset: 'utf8mb4',
    //     ssl: {
    //         rejectUnauthorized: true,
    //       },
    // })


    // connection.connect(function (error) {
    //     if (error) throw error
    //     else{
    //         console.log('connected to mysql database')
    //     //  var sql = `show tables;`
        
        

    //     // connection.query(sql, (err, result) => {
    //     //     if (err) throw err;
    //     //     console.log("Qurey Executed",result)
    //     //  })
    //     }
    // })


    // module.exports = connection.promise();

    const mysql = require('mysql2');
    require('dotenv').config();
    
    let connection;
    
    function handleDisconnect() {
      connection = mysql.createConnection({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE,
        charset: 'utf8mb4',
        ssl: {
          rejectUnauthorized: true,
        },
      });
    
      connection.connect((err) => {
        if (err) {
          console.error('Error connecting to database:', err);
          setTimeout(handleDisconnect, 2000); // Attempt to reconnect after 2 seconds
        } else {
          console.log('Connected to MySQL database');
        }
      });
    
      connection.on('error', (err) => {
        console.error('Database error:', err);
    
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
          console.log('Reconnecting to the database...');
          handleDisconnect();
        } else {
          console.error('Unexpected error. Throwing it for now:', err);
          
        }
      });
    }
    
    handleDisconnect();
    
    module.exports = connection.promise();
    
    
