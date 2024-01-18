const express = require('express');
const admin = express.Router();
const bodyParser = require('body-parser');
const messages = require('../messages/constants');
const db = require('../../dbConnection');
const logger = require('../../logger');
const jwtAdmin = require('../../jwtAdmin');

admin.use(express.json());
admin.use(express.urlencoded({ extended: true }));


admin.post('/admin-login',async(req,res)=>{

    try {

    const { mail, mobile, pass } = req.body;

    if (!mail && !mobile) {
        return res.status(400).json({ message: 'Please provide either mail or mobile for login.' });
    }

    let condition;
    if (mail) {
        condition = { mail };
    } else {
        condition = { mobile };
    }

    const sql = `SELECT admin_id,mail,mobile,admin_name FROM admin_data WHERE ? AND pass = ?`;
    const [results] = await db.query(sql, [condition, pass]);

    if (results.length === 0) {
        return res.status(401).json({ message: 'Invalid credentials.' });
    }

    const adminDetails = results[0]; 
    const adminId = results[0].admin_id;
    const token = jwtAdmin.generateTokenAdmin(adminId);
    const refreshToken = jwtAdmin.generateRefreshTokenAdmin(adminId);

    res.status(200).json({
        message: 'Login successful.',
           adminData: adminDetails,
            token,
            refreshToken
    });
} catch (err) {
    console.error('Error during admin login:', err.message);
    res.status(500).json({ message: 'Internal Server Error' });
}
});



admin.post('/refresh-token-admin', (req, res) => {

    const refreshTokenValue = req.body.refreshToken;
    jwtAdmin.refreshTokenAdmin(req, res, (err, newAccessToken) => {
        if (err) {
            return res.status(403).json({ message: messages.FORBID});
        }
        res.status(200).json({ accessToken: newAccessToken });
    });
});


admin.post('/logout-admin', async (req, res) => {
    try {
        const admin = req.body.admin_id;
        const sql = `SELECT admin_name FROM onelove_v2.admin_data WHERE admin_id =?`;
        const [sqlResult] = await db.query(sql, admin);
        logger.info("sqlResult", sqlResult);

        const tokenHeader = req.headers.authorization;
        if (tokenHeader) {
            const token = tokenHeader.split(' ')[1];
            jwtAdmin.addToBlacklistAdmin(token);
        }
        return res.status(200).json({
            message: messages.LOGOUT
        });
    } catch (err) {
        logger.error("Error", err);
        return res.status(400).json({ message: messages.LOGOUT_FAILED });
    }
});


admin.put('/admin-update',jwtAdmin.verifyTokenAdmin,async(req,res)=>{

    const admin_id = req.query.admin_id;

        if(!admin_id){
            return res.status(400).json({message:messages.INVALID_ID})
        }

        const { mail, mobile, pass, admin_name } = req.body;

    try{

        const checkUniqueSql = 'SELECT admin_id FROM onelove_v2.admin_data WHERE (mail = ? OR mobile = ?) AND admin_id <> ?';
        const [duplicateCheck] = await db.query(checkUniqueSql, [mail, mobile, admin_id]);

        if (duplicateCheck.length > 0) {
            return res.status(400).json({ message: 'Mail or mobile already exists for another admin.' });
        }

        if(mail || mobile || pass || admin_name){

            let admin_detailsSql = 'UPDATE onelove_v2.admin_data SET';
            const adminDetailsValues = [];
    
              if (mail !== undefined) {
                admin_detailsSql += ' mail=?,';
                adminDetailsValues.push(mail);
            }
            if (mobile !== undefined) {
                admin_detailsSql += ' mobile=?,';
                adminDetailsValues.push(mobile);
            }
            if (pass !== undefined) {
                admin_detailsSql += ' pass=?,';
                adminDetailsValues.push(pass);
            }
            if (admin_name !== undefined) {
                admin_detailsSql += ' admin_name=?,';
                adminDetailsValues.push(admin_name);
            }
        
            admin_detailsSql = admin_detailsSql.slice(0, -1);
            admin_detailsSql += ' WHERE admin_id=?';
            adminDetailsValues.push(admin_id);
    
            await db.query(admin_detailsSql, adminDetailsValues);
        }

        await db.commit();

        return res.status(200).json({
            message: messages.DATA_UPDATED,
        });

    }catch(err){

        await db.rollback();
        logger.error('Error updating data:', err);
        return res.status(400).json({ message: messages.DATA_UPDATE_FALIED });

    }
});

module.exports = admin;