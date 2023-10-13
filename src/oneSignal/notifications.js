const express = require("express");
//define the router
const notification = express.Router();
require('dotenv').config();

const OneSignal = require('@onesignal/node-onesignal')


async function sendnotification(Name,mess,uniqId) {
    try {
        const ONESIGNAL_APP_ID = process.env.ONESIGNAL_APP_ID;
 
        const app_key_provider = {
            getToken() {
            return process.env.REST_API_KEY;
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
        notification.include_external_user_ids = uniqId;
        notification.contents = { 
            en: Name +
            "  " +mess
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