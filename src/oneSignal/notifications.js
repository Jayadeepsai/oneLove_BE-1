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
        notification.android_channel_id = ['8024b972-0938-44f7-b466-a568a0848454','8d6c6b90-029f-4728-af33-602a544625ba','84cc6567-6c47-4538-8817-78c02edbec95','dda94b5e-4aa1-4d68-b426-78f554bf73ce','d1b133f2-919b-457a-8563-0599b7d8c406']

        const {id} = await client.createNotification(notification);
      
        const response = await client.getNotification(ONESIGNAL_APP_ID, id);
        logger.info('notification response',id)
        logger.info('notification message',response )
    }catch(err) {
        logger.error('notification func error', err)
    }

 }

module.exports = {sendnotification};