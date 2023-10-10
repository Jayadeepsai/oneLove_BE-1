    // const mysql = require('mysql2');
    // require('dotenv').config();
    // const connection = mysql.createConnection({

    //     host: process.env.DB_HOST,
    //     port: process.env.DB_PORT,
    //     user: process.env.DB_USER,
    //     password: process.env.DB_PASSWORD,
    //     database: process.env.DB_DATABASE
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
    
    // Function to create a MySQL connection
    function createConnection() {
      const connection = mysql.createConnection({
        host: process.env.DB_HOST,
        port: process.env.DB_PORT,
        user: process.env.DB_USER,
        password: process.env.DB_PASSWORD,
        database: process.env.DB_DATABASE
      });
    
      return connection;
    }
    
    // Function to connect to the database with retry logic
    function connectWithRetry() {
      const connection = createConnection();
    
      connection.connect((error) => {
        if (error) {
          console.error('Failed to connect to MySQL:', error);
          setTimeout(() => {
            // Retry connecting after a delay (e.g., 2 seconds)
            console.log('Retrying database connection...');
            connectWithRetry();
          }, 2000); // Adjust the retry delay as needed
        } else {
          console.log('Connected to MySQL database');
        }
      });
    
      // Handle unexpected disconnections
      connection.on('error', (err) => {
        console.error('MySQL connection error:', err);
        if (err.code === 'PROTOCOL_CONNECTION_LOST') {
          // Re-establish the connection
          console.log('Reconnecting to MySQL...');
          connectWithRetry();
        } else {
          throw err;
        }
      });
    
      return connection;
    }
    
    // Establish the initial connection with retry
    const dbConnection = connectWithRetry();
    
    module.exports = dbConnection.promise();
    
