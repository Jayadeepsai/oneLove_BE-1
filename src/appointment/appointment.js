const express = require('express');
const appoint = express.Router();
const bodyParser = require('body-parser');
const messages = require('../messages/constants');

const db = require('../../dbConnection');
const jwtMiddleware = require('../../jwtMiddleware');
const notification= require('../oneSignal/notifications');
const logger = require('../../logger');
const cors = require('cors');

appoint.use(express.json());
appoint.use(express.urlencoded({ extended: true }));


async function isAppoint(appointment_no) {
  const sql = `SELECT COUNT(*) AS count FROM onelove_v2.appointments WHERE appointment_no = ?`;
  const [result] = await db.query(sql, [appointment_no]);
  return result[0].count === 0;
}


function generateRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}


appoint.post('/appointment',jwtMiddleware.verifyToken,async(req,res)=>{

    const { appointee, appointer, pet, timings, add_service } = req.body;

try{
  let appointment_no;
        let isUnique = false;

        while (!isUnique) {
          appointment_no = generateRandomNumber(10000, 99999);
            isUnique = await isAppoint(appointment_no);
        }

    const sql = `INSERT INTO onelove_v2.appointments(appointee, appointer, pet, timings, add_service, app_status, appointment_no) VALUES(?, ?, ?, ?, ?, ?, ?)`;
    const values = [appointee, appointer, pet, timings, JSON.stringify(add_service), "Pending", appointment_no];
    const [result] = await db.query(sql, values);

    const sql1 = `SELECT external_id FROM onelove_v2.users WHERE user_id = ${appointee}`
        const [sql1Result] = await db.query(sql1)
        const external_id=sql1Result[0].external_id;
        console.log('external id',external_id)

        const mess = "You have an appointment to look up";
        const uniqId = external_id; 
        const Heading = "New Appointment"
        const endpoint = `Orders?tabIndex=0`

        await notification.sendnotification(mess, uniqId,Heading,endpoint);

    res.status(200).json({
        data: result,
        message: messages.POST_SUCCESS
    });

}catch(err){

    logger.error('Error posting data:',err.message);
    console.log(err.message)
    res.status(400).json({
        message: messages.POST_FAILED,
        
    });
}
});


appoint.get('/appointments',jwtMiddleware.verifyToken, async (req, res) => {
    try {
      const appointeeId = req.query.appointee;
      
      if (!appointeeId) {
        return res.status(400).json({ message: 'Appointee ID is required in query parameters.' });
      }
      const sql = `
      SELECT
        a.*,
        u_appointer.user_id AS appointer_id,
        u_appointer.user_name AS appointer_name,
        u_appointer.user_type AS appointer_type,
        u_appointer.address_id AS appointer_address_id,
        u_appointer.contact_id AS appointer_contact_id,
        u_appointer.image_id AS appointer_image_id,
        p.pet_id,
        p.pet_type,
        p.pet_name,
        p.pet_breed,
        p.pet_gender,
        p.pet_weight,
        p.pet_description,
        p.vaccination_id,
        p.pet_dob,
        p.image_id AS pet_image_id,
        p.user_id AS pet_user_id,
        ad.address,
        ad.city,
        ad.state,
        ad.zip,
        ad.country,
        ad.landmark,
        ad.address_type,
        cd.mobile_number,
        cd.email,
        i.image_id,
        i.image_url AS pet_owner_image
      FROM appointments a
      JOIN users u_appointer ON a.appointer = u_appointer.user_id
      JOIN pet p ON a.pet = p.pet_id
      LEFT JOIN address ad ON u_appointer.address_id = ad.address_id
      LEFT JOIN contact_details cd ON u_appointer.contact_id = cd.contact_id
      LEFT JOIN images i ON u_appointer.image_id = i.image_id
      WHERE a.appointee = ?
    `;
  
      const [result] = await db.query(sql, [appointeeId]);
  
      res.status(200).json({
        data: result,
        message: 'Appointments data fetched successfully.',
      });
    } catch (err) {
      console.error('Error fetching appointments data:', err.message);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });



  appoint.get('/appointment-history',jwtMiddleware.verifyToken, async (req, res) => {
    try {
      const appointerId = req.query.appointer;
  
      if (!appointerId) {
        return res.status(400).json({ message: 'Appointer ID is required in query parameters.' });
      }
  
      const sql = `
        SELECT
          a.*,
          u_appointee.user_id AS appointee_id,
          u_appointee.user_name AS appointee_name,
          u_appointee.user_type AS appointee_type,
          u_appointee.address_id AS appointee_address_id,
          u_appointee.contact_id AS appointee_contact_id,
          u_appointee.store_id AS appointee_store_id,
          u_appointee.service_id AS appointee_service_id,
          u_appointee.clinic_id AS appointee_clinic_id,
          u_appointee.image_id AS appointee_image_id,
          p.pet_id,
          p.pet_type,
          p.pet_name,
          p.pet_breed,
          p.pet_gender,
          p.pet_weight,
          p.pet_dob,
          p.image_id AS pet_image_id,
          p.user_id AS pet_user_id,
          ad.address,
          ad.city,
          ad.state,
          ad.zip,
          ad.country,
          ad.landmark,
          ad.address_type,
          cd.mobile_number,
          cd.email,
          i.image_id,
          i.image_url AS service_provider_image
        FROM appointments a
        JOIN users u_appointee ON a.appointee = u_appointee.user_id
        JOIN pet p ON a.pet = p.pet_id
        LEFT JOIN address ad ON u_appointee.address_id = ad.address_id
        LEFT JOIN contact_details cd ON u_appointee.contact_id = cd.contact_id
        LEFT JOIN images i ON u_appointee.image_id = i.image_id
        WHERE a.appointer = ?
      `;
  
      const [result] = await db.query(sql, [appointerId]);
  
      res.status(200).json({
        data: result,
        message: 'Appointment details fetched successfully.',
      });
    } catch (err) {
      console.error('Error fetching appointment details:', err.message);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });


  appoint.put('/appointment-status',jwtMiddleware.verifyToken,async(req,res)=>{

    // const { userType } = req;
    // if (userType !== 'pet_store' && userType !== 'pet_owner') {
    //     return res.status(403).json({ message: messages.FORBID });
    // }

    const appointment_id = req.query.appointment_id;
    const app_status = req.body.app_status;
 try{
       const sql = `UPDATE onelove_v2.appointments SET app_status = ? WHERE appointment_id = ?`;
       const values = [app_status, appointment_id];
       const [result] = await db.query(sql,values);

// if(app_status === "Cancelled"){
//        const sql1 = `SELECT external_id FROM onelove_v2.users WHERE store_id = ${store_id}`
//         const [sql1Result] = await db.query(sql1)
//         const external_id=sql1Result[0].external_id;
//         console.log('external id',external_id)

//         const mess = "Someone has cancelled their order!!Check it now";
//         const uniqId = external_id; 
//         const Heading = "Order Cancellation"
//         const endpoint = `Orders?tabIndex=2`

//         await notification.sendnotification(mess, uniqId,Heading,endpoint);
// }

    return res.status(200).json({
    message: messages.DATA_UPDATED,
    result
    });
 }catch(err){
    
      logger.error('Error updating data:', err.message);
      return res.status(400).json({ message: messages.DATA_UPDATE_FALIED });
 }
});


module.exports = appoint;