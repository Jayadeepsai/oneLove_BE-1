    const mysql = require('mysql2');
    require('dotenv').config();
    const connection = mysql.createConnection({

        host: 'onelove.cxb7nmtc66dn.us-east-2.rds.amazonaws.com',
        port: 3306,
        user: 'onelove',
        password: 'OneloveRone',
        database: 'onelove'
    })

   
    // const connection = mysql.createConnection({

    //     host: 'localhost',
    //     port: '3306',
    //     user: 'userrone',
    //     password: 'mysql@onelove',
    //     database: 'onelove'
    // })

    connection.connect(function (error) {
        if (error) throw error
        else{
            console.log('connected to mysql database')
        //  var sql = `show tables;`
        
        

        // connection.query(sql, (err, result) => {
        //     if (err) throw err;
        //     console.log("Qurey Executed",result)
        //  })
        }
    })


    module.exports = connection.promise();


