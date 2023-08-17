const express = require('express');
const registration = express.Router();
const bodyParser = require('body-parser');
const connection = require('../../dbConnection')
const messages = require('../messages/constants')

registration.use(express.json()); // To parse JSON bodies
registration.use(express.urlencoded({ extended: true })); // To parse URL-encoded bodies

async function performTransaction(req, res) { // Pass req and res as arguments
    // const connection = await db.getConnection();

    try {
        // Start the transaction
        await connection.beginTransaction();

        // Insert into address table
        const { address, city, state, zip, country, landmark, address_type } = req.body;
        const addressQuery = 'INSERT INTO onelove.address (address, city, state, zip, country, landmark, address_type) VALUES (?, ?, ?, ?, ?, ?, ?)';
        const addressValues = [address, city, state, zip, country, landmark, address_type];

        const [addressResult] = await connection.query(addressQuery, addressValues);
        const address_id = addressResult.insertId;

        // Insert into contact_details table
        const { mobile_number, email } = req.body;
        const contactQuery = 'INSERT INTO onelove.contact_details (mobile_number, email) VALUES (?, ?)';
        const contactValues = [mobile_number, email];

        const [contactResult] = await connection.query(contactQuery, contactValues);
        const contact_id = contactResult.insertId;

        // Insert into users table
        const { user_type, user_name } = req.body;
        const userQuery = 'INSERT INTO onelove.users (user_type, user_name, address_id, contact_id) VALUES (?, ?, ?, ?)';
        const userValues = [user_type, user_name, address_id, contact_id];

        const [userResult] = await connection.query(userQuery, userValues);
        const user_id = userResult.insertId;

        // Insert into registrations table
        const regQuery = 'INSERT INTO onelove.registrations (user_id, address_id, contact_id) VALUES (?, ?, ?)';
        const regValues = [user_id, address_id, contact_id];

        await connection.query(regQuery, regValues);

        // Commit the transaction if all queries are successful
        await connection.commit();

        console.log('Transaction committed successfully.');

        // Send a success response to the client
        res.status(200).json({ message: 'Transaction committed successfully.' });
    } catch (error) {
        // Rollback the transaction if any query fails
        await connection.rollback();

        console.error('Error in transaction:', error.message);

        // Send an error response to the client
        res.status(500).json({ message: 'Failed to perform transaction.' });
    }
    //  finally {
    //     // Release the connection back to the pool
    //     connection.release();
    // }
}


registration.post('/registration', (req, res) => {
    performTransaction(req, res)
        .then(() => {
            console.log('Transaction completed successfully');
        })
        .catch((err) => {
            console.error('Error in address.post API:', err);
        });
});


registration.get('/registration', async (req, res) => {
    try {
        const sql = `SELECT a.*, c.*, u.*, r.*
                     FROM onelove.registrations r
                     LEFT JOIN address a ON r.address_id = a.address_id
                     LEFT JOIN contact_details c ON r.contact_id = c.contact_id
                     LEFT JOIN users u ON r.user_id = u.user_id`;

        const [data] = await connection.query(sql);

        res.status(200).json({
            registrationData: data,
            message: "All registers data"
        });

    } catch (error) {
        console.error('Error fetching registers data:', error.message);
        res.status(500).json({
            message: 'Failed to fetch registers data.'
        });
    }
});


registration.get('/registration-id', async(req,res)=>{

const reg_id = req.query.reg_id;
try{
    if (!reg_id) {
        return res.status(400).json({ message: "reg_id is required as a query parameter" });
    }

    const sql =`SELECT a.*, c.*, u.*, r.*
    FROM onelove.registrations r
    LEFT JOIN address a ON r.address_id = a.address_id
    LEFT JOIN contact_details c ON r.contact_id = c.contact_id
    LEFT JOIN users u ON r.user_id = u.user_id WHERE r.reg_id=?`;
    const [data] = await connection.query(sql,[reg_id]);

    if (data.length === 0) {
        return res.status(404).json({ message: "Registration not found" });
    }

    res.status(200).json({
        registrationData: data,
        message: "Registration Data"
    });

}catch(error){
    console.log("Error", err);
    res.status(500).json({ message: "Failed to fetch register data." });
}

});


registration.put('/update-reg', async (req, res) => {
    try {
        const reg_id = req.query.reg_id;

        const { address, city, state, zip, country, landmark, address_type, mobile_number, email, user_type, user_name  } = req.body;

        let regSql = 'UPDATE onelove.registrations SET'
        let addressSql = 'UPDATE address SET';
        let contact_detailsSql = 'UPDATE contact_details SET';
        let usersSql  = 'UPDATE users SET';

        const regValues =[];
        const addressvalues = [];
        const contact_detailsValues = [];
        const usersValues = [];

        if (address !== undefined) {
            addressSql += ' address=?,';
            addressvalues.push(address);
        }
        if (city !== undefined) {
            addressSql += ' city=?,';
            addressvalues.push(city);
        }
        if (state !== undefined) {
            addressSql += ' state=?,';
            addressvalues.push(state);
        }
        if (zip !== undefined) {
            addressSql += ' zip=?,';
            addressvalues.push(zip);
        }
        if (country !== undefined) {
            addressSql += ' country=?,';
            addressvalues.push(country);
        }
        if (landmark !== undefined) {
            addressSql += ' landmark=?,';
            addressvalues.push(landmark);
        }
        if (address_type !== undefined) {
            addressSql += ' address_type=?,';
            addressvalues.push(address_type);
        }

        if (mobile_number !== undefined) {
            contact_detailsSql += ' mobile_number=?,';
            contact_detailsValues.push(mobile_number);
        }
        if (email !== undefined) {
            contact_detailsSql += ' email=?,';
            contact_detailsValues.push(email);
        }
        if (user_type !== undefined) {
            usersSql += ' user_type=?,';
            usersValues.push(user_type);
        }
        if (user_name !== undefined) {
            usersSql += ' user_name=?,';
            usersValues.push(user_name);
        }

        regSql = regSql.slice(0, -1);
        regSql += ' WHERE reg_id=?';
        regValues.push(reg_id);

        addressSql = addressSql.slice(0, -1);
        addressSql += ' WHERE reg_id=(SELECT address_id FROM registations WHERE reg_id=?)';
        addressvalues.push(reg_id);

        contact_detailsSql = contact_detailsSql.slice(0, -1);
        contact_detailsSql += ' WHERE reg_id=(SELECT contact_id FROM registrations WHERE reg_id=?)';
        contact_detailsValues.push(reg_id);

        usersSql = usersSql.slice(0, -1);
        usersSql += ' WHERE reg_id=(SELECT user_id FROM registrations WHERE reg_id=?)';
        usersValues.push(reg_id);

        await connection.beginTransaction();

       
        await connection.query(regSql, regValues);
        await connection.query(addressSql, addressvalues);
        await connection.query(contact_detailsSql, contact_detailsValues);
        await connection.query(usersSql, usersValues);

        await connection.commit();

        res.status(200).json({
            message: messages.DATA_UPDATED,
        });
    } catch (err) {
        await connection.rollback();
        console.error('Error updating data:', err.message);
        res.status(400).json({ message: messages.DATA_UPDATE_FALIED });
    }
});


// registration.put('/update-reg', async (req, res) => {
//     try {
//         const reg_id = req.query.reg_id;

//         const { address, city, state, zip, country, landmark, address_type, mobile_number, email, user_type, user_name } = req.body;

//         let regSql = 'UPDATE onelove.registrations SET';
//         let addressSql = 'UPDATE address SET';
//         let contact_detailsSql = 'UPDATE contact_details SET';
//         let usersSql = 'UPDATE users SET';

//         const regValues = [];
//         const addressValues = [];
//         const contactDetailsValues = [];
//         const usersValues = [];

//         // Update registrations table
//         if (address !== undefined) {
//             regSql += ' address=?,';
//             regValues.push(address);
//         }
//         // Other fields in registrations table ...

//         regSql = regSql.slice(0, -1);
//         regSql += ' WHERE reg_id=?';
//         regValues.push(reg_id);

//         // Fetch corresponding IDs for other tables
//         const [addressRow] = await connection.query('SELECT address_id FROM registrations WHERE reg_id = ?', [reg_id]);
//         const address_id = addressRow[0].address_id;

//         const [contactDetailsRow] = await connection.query('SELECT contact_id FROM registrations WHERE reg_id = ?', [reg_id]);
//         const contact_id = contactDetailsRow[0].contact_id;

//         const [usersRow] = await connection.query('SELECT user_id FROM registrations WHERE reg_id = ?', [reg_id]);
//         const user_id = usersRow[0].user_id;

//         // Update address table
//         if (city !== undefined) {
//             addressSql += ' city=?,';
//             addressValues.push(city);
//         }
//         // Other fields in address table ...

//         addressSql = addressSql.slice(0, -1);
//         addressSql += ' WHERE address_id=?';
//         addressValues.push(address_id);

//         // Update contact_details table
//         if (mobile_number !== undefined) {
//             contact_detailsSql += ' mobile_number=?,';
//             contactDetailsValues.push(mobile_number);
//         }
//         // Other fields in contact_details table ...

//         contact_detailsSql = contact_detailsSql.slice(0, -1);
//         contact_detailsSql += ' WHERE contact_id=?';
//         contactDetailsValues.push(contact_id);

//         // Update users table
//         if (user_type !== undefined) {
//             usersSql += ' user_type=?,';
//             usersValues.push(user_type);
//         }
//         // Other fields in users table ...

//         usersSql = usersSql.slice(0, -1);
//         usersSql += ' WHERE user_id=?';
//         usersValues.push(user_id);

//         await connection.beginTransaction();

//         await connection.query(regSql, regValues);
//         await connection.query(addressSql, addressValues);
//         await connection.query(contact_detailsSql, contactDetailsValues);
//         await connection.query(usersSql, usersValues);

//         await connection.commit();

//         res.status(200).json({
//             message: messages.DATA_UPDATED,
//         });
//     } catch (err) {
//         await connection.rollback();
//         console.error('Error updating data:', err.message);
//         res.status(400).json({ message: messages.DATA_UPDATE_FALIED });
//     }
// });




module.exports=registration;