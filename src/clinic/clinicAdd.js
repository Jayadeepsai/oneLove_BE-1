const express = require('express');
const clinic = express.Router();
const bodyParser = require('body-parser');
const messages = require('../messages/constants');

const db = require('../../dbConnection')

clinic.use(express.json()); // To parse JSON bodies
clinic.use(express.urlencoded({ extended: true })); // To parse URL-encoded bodies


async function clinicAddQueries(req,res){

try{
    await db.beginTransaction();

    const { week_start_day, week_end_day, service_start_time, service_end_time } = req.body;
        const timeQuery = 'INSERT INTO onelove.time (week_start_day, week_end_day, service_start_time, service_end_time) VALUES (?, ?, ?, ?)';
        const timeValues = [week_start_day, week_end_day, service_start_time, service_end_time];

        const [timeResult] = await db.query(timeQuery, timeValues);
        const time_id = timeResult.insertId;

        const {clinic_name, specialisation, clinic_license, experience, education, user_id} = req.body;
        const clinicQuery ='INSERT INTO onelove.clinics(clinic_name, specialisation, clinic_license, experience, education, time_id, user_id) VALUES (?, ?, ?, ?, ?, ?, ?)';
        const clinicValues = [clinic_name, specialisation, clinic_license, experience, education, time_id, user_id]

        await db.query(clinicQuery,clinicValues)

        await db.commit();

        res.status(200).json({ message: messages.POST_SUCCESS});

}catch(err){

    await db.rollback();

    console.error('Error in transaction:', err.message);

    // Send an error response to the client
    res.status(500).json({ message:messages.POST_FAILED});
}
};

clinic.post('/clinic', (req, res) => {
    clinicAddQueries(req, res)
        .then(() => {
            console.log('Transaction completed successfully');
        })
        .catch((err) => {
            console.error('Error in address.post API:', err);
        });
});



clinic.get('/clinic',async(req,res)=>{

    const sql = `
    SELECT u.*, a.*, c.*, s.*, t.*
    FROM clinics s
    LEFT JOIN time t ON s.time_id = t.time_id
    LEFT JOIN users u ON s.user_id = u.user_id
    LEFT JOIN address a ON u.address_id = a.address_id
    LEFT JOIN contact_details c ON u.contact_id = c.contact_id`;

    try{
    const [results] = await db.query(sql);
        const clinicsData = JSON.parse(JSON.stringify(results));

        if (clinicsData.length > 0) {
            res.status(200).json({
                clinicsData,
                message:messages.SUCCESS_MESSAGE,
            });
        } else {
            res.status(404).json({
                message: messages.NO_DATA,
            });
        }
    }catch(err){
        console.error('Error fetching data:', err);
        res.status(500).json({
            message: messages.FAILURE_MESSAGE,
        });
    }
});


clinic.get('/clinic-user-id', async(req,res)=>{

    const userId = req.query.user_id; 
    
    if (!userId) {
        return res.status(400).json({
            message: messages.INVALID_ID,
        });
    }

    const sql = `
    SELECT u.*, a.*, c.*, s.*, t.*
    FROM clinics s
    LEFT JOIN time t ON s.time_id = t.time_id
    LEFT JOIN users u ON s.user_id = u.user_id
    LEFT JOIN address a ON u.address_id = a.address_id
    LEFT JOIN contact_details c ON u.contact_id = c.contact_id
    WHERE s.user_id = ?`;
    try{
        const [results] = await db.query(sql, [userId]);
        const clinicData = JSON.parse(JSON.stringify(results));

        if (clinicData.length > 0) {
            res.status(200).json({
                clinicData,
                message:messages.SUCCESS_MESSAGE,
            });
        } else {
            res.status(404).json({
                message: messages.NO_DATA,
            });
        }

    }catch(err){
        console.error('Error fetching data:', err);
        res.status(500).json({
            message: messages.FAILURE_MESSAGE,
        });
    }
});


clinic.put('/update-clinic', async (req, res) => {
    try {
        const user_id = req.query.user_id;

        const { clinic_name, specialisation, clinic_license, experience, education, week_start_day, week_end_day, service_start_time, service_end_time } = req.body;

        let clinicSql = 'UPDATE onelove.clinics SET';
        let timeSql = 'UPDATE time SET';

        const values = [];
        const timeValues = [];

        if (clinic_name !== undefined) {
            clinicSql += ' clinic_name=?,';
            values.push(clinic_name);
        }
        if (specialisation !== undefined) {
            clinicSql += ' specialisation=?,';
            values.push(specialisation);
        }
        if (clinic_license !== undefined) {
            clinicSql += ' clinic_license=?,';
            values.push(clinic_license);
        }
        if (experience !== undefined) {
            clinicSql += ' experience=?,';
            values.push(experience);
        }
        if (education !== undefined) {
            clinicSql += ' education=?,';
            values.push(education);
        }

        if (week_start_day !== undefined) {
            timeSql += ' week_start_day=?,';
            timeValues.push(week_start_day);
        }
        if (week_end_day !== undefined) {
            timeSql += ' week_end_day=?,';
            timeValues.push(week_end_day);
        }
        if (service_start_time !== undefined) {
            timeSql += ' service_start_time=?,';
            timeValues.push(service_start_time);
        }
        if (service_end_time !== undefined) {
            timeSql += ' service_end_time=?,';
            timeValues.push(service_end_time);
        }

        clinicSql = clinicSql.slice(0, -1);
        clinicSql += ' WHERE user_id=?';
        values.push(user_id);

        timeSql = timeSql.slice(0, -1);
        timeSql += ' WHERE time_id=(SELECT time_id FROM clinics WHERE user_id=?)';
        timeValues.push(user_id);

        await db.beginTransaction();

        // Update clinic data
        await db.query(clinicSql, values);

        // Update time data
        await db.query(timeSql, timeValues);

        await db.commit();

        res.status(200).json({
            message: messages.DATA_UPDATED,
        });
    } catch (err) {
        await db.rollback();
        console.error('Error updating data:', err.message);
        res.status(400).json({ message: messages.DATA_UPDATE_FALIED });
    }
});


clinic.delete('/delete-clinic', async (req, res) => {
    try {
        const user_id = req.query.user_id;

        const sql = `DELETE FROM onelove.clinics WHERE user_id = ?`;

        const [result] = await db.query(sql, [user_id]); 

        // Check if the post was deleted successfully
        if (result.affectedRows === 0) {
            res.status(404).json({
                message: messages.INVALID_ID,
            });
        } else {
            res.status(200).json({
                message: messages.DATA_DELETED,
            });
        }
    } catch (err) {
        console.error('Error deleting post:', err);
        res.status(500).json({
            message: messages.FAILED_TO_DELETE,
        });
    }
});




module.exports=clinic;