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



module.exports=registration;