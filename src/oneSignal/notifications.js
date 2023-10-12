const express = require("express");
//define the router
const notification = express.Router();
require('dotenv').config();

const OneSignal = require('@onesignal/node-onesignal')



// router.post('/sendMessages', async (req, res, next) => {

//     const externalId = req.body.externalId

//     const messageData = new adminMessage({
//         title: req.body.title,
//         description: req.body.description,
//         to:req.body.to
//     })
//     //8fda6cf4-bdbe-4f2e-a709-24f8990ad307
//     const ONESIGNAL_APP_ID = '8fda6cf4-bdbe-4f2e-a709-24f8990ad307';

//     const app_key_provider = {
//         getToken() {
//             //return 'ZjA4ZTMyOGEtOTEzMy00MzQyLTg2MmItYWM3YTExMTM2YzI2';
//             return 'OWE5OTk1MTctMjM1NC00ZTZiLWFhNTgtMmY2MTlkNTY0NWZm'
//         }
//     };

//     const configuration = OneSignal.createConfiguration({
//         authMethods: {
//             app_key: {
//                 tokenProvider: app_key_provider
//             }
//         }
//     });
//     const client = new OneSignal.DefaultApi(configuration);

//     const notification = new OneSignal.Notification();
//     notification.app_id = ONESIGNAL_APP_ID;
//     // notification.included_segments = ['Subscribed Users'];
//     notification.include_external_user_ids = externalId
//     console.log(messageData)
//     notification.headings = {
//         en: messageData.title
//     }
//     notification.contents = {
//         en: messageData.description
//     };
//     const { id } = await client.createNotification(notification);

//     const response = await client.getNotification(ONESIGNAL_APP_ID, id);

//     console.log(response)
//     const data = await messageData.save()
//     try {
//         return res.status(201).json({
//             message: "Notification sent successfully",
//             messsageDetails: data,
//             response
//         })
//     } catch (err) {
//         return res.status(500).json({
//             message: "Error sending the message"
//         })
//     }


// })



async function sendnotification( Name,mess,uniqId) {
    try {
        const ONESIGNAL_APP_ID = '3fd29a95-0021-4625-83ef-3998793e9c27';
 
        const app_key_provider = {
            getToken() {
            //  return 'MjY5ZDJjZWUtZDUyNi00YjZmLWJmZjQtNGM2ZmYzM2FmZTM2'
            return 'MDllM2QyN2MtYzJjNC00ZmE5LThkNDUtZjgyY2JkYTNlYjA5';
            }
        };
      
        const configuration = OneSignal.createConfiguration({
            authMethods: {
                app_key: {
                    tokenProvider: app_key_provider
                }
            }
        });
        const client = new OneSignal.DefaultApi(configuration);
      
        const notification = new OneSignal.Notification();
        notification.app_id = ONESIGNAL_APP_ID;
        notification.include_external_user_ids = [uniqId];
        notification.contents = { 
            en: Name +" "+mess
        };
        const {id} = await client.createNotification(notification);
      
        const response = await client.getNotification(ONESIGNAL_APP_ID, id);
        console.log('notification response',id)
        console.log('notification message',response )
    }catch(err) {
        console.log('notification func error', err)
    }

 }



module.exports = {sendnotification};