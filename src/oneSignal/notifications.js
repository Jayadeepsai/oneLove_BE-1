const express = require("express");
const notification = express.Router();
require('dotenv').config();

const OneSignal = require('@onesignal/node-onesignal');
const logger = require('../../logger');

async function sendnotification(mess,uniqId,Heading,endpoint) {
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
            en: mess,
        };
        notification.headings={
            en: Heading
        }
        notification.app_url = `roone://onelove/${endpoint}`
        notification.android_channel_id = ['8024b972-0938-44f7-b466-a568a0848454','b797d43e-9212-421f-b5e6-900e95207e6c','d97d442f-dd48-4c86-b438-ae6d38da6578','e36cc1c1-9fa1-423c-9f6b-ff85d1d037a3']

        const {id} = await client.createNotification(notification);
      
        const response = await client.getNotification(ONESIGNAL_APP_ID, id);
        logger.info('notification response',id)
        logger.info('notification message',response )
    }catch(err) {
        logger.error('notification func error', err)
    }

 }

module.exports = {sendnotification};