    const mysql = require('mysql2');
    require('dotenv').config();
    // const connection = mysql.createConnection({

    //     host: process.env.DB_HOST,
    //     port: process.env.DB_PORT,
    //     user: process.env.DB_USER,
    //     password: process.env.DB_PASSWORD,
    //     database: process.env.DB_DATABASE
        

    // })

    const connection = mysql.createConnection({
        host: 'your-aurora-endpoint',
        user: 'aurora_db_user',
        password: 'aurora_db_password',
        database: 'aurora_db_name',
      });
    connection.connect(function (error) {
        if (error) throw error
        else{
            console.log('connected to mysql database')
        //  var sql = `ALTER TABLE store
        //  ADD COLUMN address_id int(11),
        //  ADD COLUMN contact_id int(11),
        //  ADD CONSTRAINT fk_store_address
        //  FOREIGN KEY (address_id) REFERENCES address(address_id),
        //  ADD CONSTRAINT fk_store_contact
        //  FOREIGN KEY (contact_id) REFERENCES contact_details(contact_id);`
        
        

        // connection.query(sql, (err, result) => {
        //     if (err) throw err;
        //     console.log("Qurey Executed")
        //  })
        }
    })


    module.exports = connection.promise();


