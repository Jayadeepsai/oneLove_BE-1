const express = require("express");
//define the router
const notification = express.Router();
require('dotenv').config();

const OneSignal = require('@onesignal/node-onesignal');
const logger = require('../../logger');

async function sendnotification(Name,mess,uniqId,endpoint) {
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
        notification.url ={
            deepLinkUrl:`roone://onelove/${endpoint}`
        }
        // notification.custom_data ={
        //     deepLinkUrl:`roone://onelove/${endpoint}`
        // }
        
        const {id} = await client.createNotification(notification);
      
        const response = await client.getNotification(ONESIGNAL_APP_ID, id);
        logger.info('notification response',id)
        logger.info('notification message',response )
        // console.log('notificaiton message', response);
    }catch(err) {
        logger.error('notification func error', err)
    }

 }

module.exports = {sendnotification};