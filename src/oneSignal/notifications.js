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

// notification.post('/sendMessages', async (req, res, next) => {
//     try {
//         const externalIds = req.body.externalIds; // Assuming externalIds is an array of external IDs

//         if (!externalIds || externalIds.length === 0) {
//             return res.status(400).json({ message: 'No external IDs provided' });
//         }

//         const messageData = new adminMessage({
//             title: req.body.title,
//             description: req.body.description
            
//         });

//         const ONESIGNAL_APP_ID = proccess.env.ONESIGNAL_APP_ID;

//         const app_key_provider = {
//             getToken() {
               
//                 return 'MjY5ZDJjZWUtZDUyNi00YjZmLWJmZjQtNGM2ZmYzM2FmZTM2'
//             }
//         };

//         const configuration = OneSignal.createConfiguration({
//             authMethods: {
//                 app_key: {
//                     tokenProvider: app_key_provider,
//                 },
//             },
//         });

//         const client = new OneSignal.DefaultApi(configuration);

//         const notifications = externalIds.map((externalId) => {
//             const notification = new OneSignal.Notification();
//             notification.app_id = ONESIGNAL_APP_ID;
//             notification.include_external_user_ids = externalId;
//             notification.headings = {
//                 en: messageData.title,
//             };
//             notification.contents = {
//                 en: messageData.description,
//             };
//             return notification;
//         });

//         // Send notifications in parallel
//         const notificationPromises = notifications.map(async (notification) => {
//             const { id } = await client.createNotification(notification);
//             const response = await client.getNotification(ONESIGNAL_APP_ID, id);
//             return response;
//         });

//         const notificationResponses = await Promise.all(notificationPromises);

//         const data = await messageData.save();

//         return res.status(201).json({
//             message: 'Notifications sent successfully',
//             messageDetails: data,
//             response: notificationResponses,
//         });
//     } catch (error) {
//         console.error('Error sending notifications:', error);
//         return res.status(500).json({
//             message: 'Error sending notifications',
//         });
//     }
// });

async function sendnotification( Name,mess,uniqId) {
    try {
        const ONESIGNAL_APP_ID = 'e3a97e96-a59f-4b4e-a6fa-022eefa51a4a';
 
        const app_key_provider = {
            getToken() {
            //  return 'MjY5ZDJjZWUtZDUyNi00YjZmLWJmZjQtNGM2ZmYzM2FmZTM2'
            return 'Mzg3MDU0ZjEtZjBjNy00MjAyLTg4NjgtZDk4YWJkYzdiZGQ3';
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


// async function sendnotification(Name, mess, uniqId) {
//     try {
//         const ONESIGNAL_APP_ID = '4a0e6bbb-b788-4342-b52a-9134dadf5a81';

//         const app_key_provider = {
//             getToken() {
//                 return 'MjY5ZDJjZWUtZDUyNi00YjZmLWJmZjQtNGM2ZmYzM2FmZTM2';
//             }
//         };

//         const configuration = OneSignal.createConfiguration({
//             authMethods: {
//                 app_key: {
//                     tokenProvider: app_key_provider
//                 }
//             }
//         });
//         const client = new OneSignal.DefaultApi(configuration);

//         const notification = new OneSignal.Notification();
//         notification.app_id = ONESIGNAL_APP_ID;
//         notification.include_external_user_ids = [uniqId];
//         notification.contents = {
//             en: Name + ' ' + mess
//         };

//         // Log the contents of the notification
//         console.log('Notification Payload:', notification);

//         const notificationResponse = await client.createNotification(notification);

//         console.log('Notification Response:', notificationResponse);
//     } catch (err) {
//         console.log('Notification Function Error:', err);
//     }
// }


module.exports = {sendnotification};