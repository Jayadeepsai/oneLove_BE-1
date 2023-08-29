const express = require('express');
const items = express.Router();
const bodyParser = require('body-parser');


const db = require('../../dbConnection');


items.use(express.json()); // To parse JSON bodies
items.use(express.urlencoded({ extended: true })); // To parse URL-encoded bodies

const AWS = require('aws-sdk');
const s3 = new AWS.S3({
    accessKeyId: 'AKIAVMRPENK3CKWKGCGU',
    secretAccessKey: '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',
});


async function uploadImageToS3(imageData, filename) {
    const params = {
      Bucket: 'onelovemysql',
      Key: filename,
      Body: imageData,
      ACL: "public-read"
    };
  
    const uploadResult = await s3.upload(params).promise();
    return uploadResult.Location; // S3 object URL
  }


async function performTransaction(req,res){
    try{
        await db.beginTransaction();

        const imageFile = req.files.image;
        const s3ImageUrl = await uploadImageToS3(imageFile.data, imageFile.name);

        const { image_type } = req.body;
        const imageSql = `INSERT INTO onelove.images (image_type, image_url) VALUES (?, ?)`;
        const imageValues = [image_type, s3ImageUrl];
        const [imageResult] = await db.query(imageSql,imageValues);
        const image_id = imageResult.insertId;

        console.log('Received req.body:', req.body);
        console.log('Received req.files:', req.files);

        const { brand_name, product_title, item_description, product_details, sub_cate_id, store_id } = req.body;
        const itemSql = `INSERT INTO onelove.items (brand_name, product_title, item_description, product_details, sub_cate_id, store_id, image_id) VALUES (?, ?, ?, ?, ?, ?, ?)`;
        const itemValues = [brand_name, product_title, item_description, product_details, sub_cate_id, store_id, image_id];
        const [itemResult] = await db.query(itemSql,itemValues);
        const item_id = itemResult.insertId;


        const quantityPackages = req.body.quantityPackages;

        if (!Array.isArray(quantityPackages)) {
            console.error("error in transaction")
            return res.status(400).json({ message: 'Invalid quantityPackages data.' });
          }
        
        for (const package of quantityPackages) {
            const { quantity_type, quantity, item_count, mrp, discount } = package;
            // Calculate total_price based on mrp and discount
            const calculatedDiscount = (mrp * discount) / 100;
            const total_price = mrp - calculatedDiscount;
            const quantitySql = `INSERT INTO onelove.quantity (quantity_type, quantity, item_count, mrp, discount, total_price, item_id) VALUES (?, ?, ?, ?, ?, ?, ?)`;
            const quantityValues = [quantity_type, quantity, item_count, mrp, discount, total_price, item_id];
            await db.query(quantitySql, quantityValues);
        }
       
        
        await db.commit();
       
        console.log('Transaction committed successfully.');

        // Send a success response to the client
        res.status(200).json({ message: 'Transaction committed successfully.' });

    }catch(err){
        await db.rollback();

        console.error('Error in transaction:', err);

        // Send an error response to the client
        res.status(500).json({ message: 'Failed to perform transaction.' });
    }
}


items.post('/item-entry',(req,res)=>{
   performTransaction(req,res)
.then(() => {
    console.log('Transaction completed successfully');
   })
.catch((err) => {
    console.error('Error in address.post API:', err);
   });
});


items.get('/itemsData', (req, res) => {                       //Fetching all the Items data
    const sql = `SELECT * FROM onelove.items`;
    db.query(sql, function (err, results, fields) {
        if (!err) {
            var data = JSON.parse(JSON.stringify(results));
            console.log(data)
            res.status(200).json({
                itemsData: data,
                message: "All Items Data"
            })
        } else {
            res.status(400).json({
                message: err
            })
        }
    });
});


items.post('/itemDataByCondition', (req, res) => {                //Fetching item data by passing condition

    const item_id = req.body.item_id;
    const sql = `SELECT * FROM onelove.items WHERE item_id = ?`;
    db.query(sql, item_id, function (err, result, fields) {
        if (!err) {
            var data = JSON.parse(JSON.stringify(result));
            console.log(data)
            res.status(200).json({
                itemData: data,
                message: "Item Data"
            })
        } else {
            res.status(400).json({
                message: err
            })
        }
    })
});


module.exports = items;