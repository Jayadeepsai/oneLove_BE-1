const express = require('express');
const items = express.Router();
const bodyParser = require('body-parser');
const messages = require('../messages/constants');

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

//item post without s3-bucket

async function performTransactionWithoutS3(req,res){
    try{
        await db.beginTransaction();

        const { image_type, image_url } = req.body;
        const imageSql = `INSERT INTO onelove.images (image_type, image_url) VALUES (?, ?)`;
        const imageValues = [image_type, image_url];
        const [imageResult] = await db.query(imageSql,imageValues);
        const image_id = imageResult.insertId;

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


items.post('/item-post-nos3',(req,res)=>{
    performTransactionWithoutS3(req,res)
    .then(() => {
        console.log('Transaction completed successfully');
       })
    .catch((err) => {
        console.error('Error in address.post API:', err);
       });
});



items.get('/products',async(req,res)=>{
    const sql = `SELECT i.*,s.*,s1.*,i1.*
                 FROM onelove.items i
                 LEFT JOIN sub_category s ON i.sub_cate_id = s.sub_cate_id
                 LEFT JOIN store s1 ON i.store_id = s1.store_id
                 LEFT JOIN images i1 ON i.image_id = i1.image_id`
    try{
        const [results] = await db.query(sql); // Use await to execute the query

        const productsData = JSON.parse(JSON.stringify(results));
        res.status(200).json({
            productsData,
            message: messages.SUCCESS_MESSAGE,
        });
    }catch(err){
        console.error('Error fetching pets data:', err);
        res.status(500).json({
            message:messages.FAILURE_MESSAGE,
        });
    }
});


items.get('/products-id',async(req,res)=>{
    const item_id = req.query.item_id
    const sql = `SELECT i.*,s.*,s1.*,i1.*
                 FROM onelove.items i
                 LEFT JOIN sub_category s ON i.sub_cate_id = s.sub_cate_id
                 LEFT JOIN store s1 ON i.store_id = s1.store_id
                 LEFT JOIN images i1 ON i.image_id = i1.image_id
                 WHERE i.item_id=?`
    try{
        const [results] = await db.query(sql,item_id); // Use await to execute the query

        const productData = JSON.parse(JSON.stringify(results));
      
        res.status(200).json({
            productData,
            message: messages.SUCCESS_MESSAGE,
        });
    }catch(err){
        console.error('Error fetching pets data:', err);
        res.status(500).json({
            message:messages.FAILURE_MESSAGE,
        });
    }
});



items.get('/products-store-id',async(req,res)=>{

    const store_id = req.query.store_id

    const sql = `SELECT i.*,s.*,s1.*,i1.*
                 FROM onelove.items i
                 LEFT JOIN sub_category s ON i.sub_cate_id = s.sub_cate_id
                 LEFT JOIN store s1 ON i.store_id = s1.store_id
                 LEFT JOIN images i1 ON i.image_id = i1.image_id
                 WHERE i.store_id=?`
    try{
        const [results] = await db.query(sql,store_id); 

        const productsData = JSON.parse(JSON.stringify(results));
      
        res.status(200).json({
            productsData,
            message: messages.SUCCESS_MESSAGE,
        });
    }catch(err){
        console.error('Error fetching pets data:', err);
        res.status(500).json({
            message:messages.FAILURE_MESSAGE,
        });
    }
});


items.get('/product-store-item-id', async (req, res) => {
    try {
        const { store_id, item_id } = req.query;

        let condition = '';
        const values = [];

        if (store_id) {
            condition += 'i.store_id = ?';
            values.push(store_id);
        }

        if (item_id) {
            if (condition) {
                condition += ' AND ';
            }
            condition += 'i.item_id = ?';
            values.push(item_id);
        }

        let sql = `SELECT i.*,s.*,s1.*,i1.*
        FROM onelove.items i
        LEFT JOIN sub_category s ON i.sub_cate_id = s.sub_cate_id
        LEFT JOIN store s1 ON i.store_id = s1.store_id
        LEFT JOIN images i1 ON i.image_id = i1.image_id`;
        
        if (condition) {
            sql += ' WHERE ' + condition;
        }

        const [results] = await db.query(sql, values);
        const productData = JSON.parse(JSON.stringify(results));

        if (productData.length > 0) {
            res.status(200).json({
                productData,
                message: messages.SUCCESS_MESSAGE,
            });
        } else {
            res.status(404).json({
                message: messages.NO_DATA,
            });
        }
    } catch (err) {
        console.error('Error fetching data:', err);
        res.status(500).json({
            message: messages.FAILURE_MESSAGE,
        });
    }
});


// items.delete('/delete-item', async (req, res) => {
//     try {
//         const item_id = req.query.item_id;

//         const sql = `DELETE FROM onelove.items WHERE item_id = ?`;

//         const [result] = await db.query(sql, [item_id]); 

//         // Check if the post was deleted successfully
//         if (result.affectedRows === 0) {
//             res.status(404).json({
//                 message: messages.INVALID_ID,
//             });
//         } else {
//             res.status(200).json({
//                 message: messages.DATA_DELETED,
//             });
//         }
//     } catch (err) {
//         console.error('Error deleting post:', err);
//         res.status(500).json({
//             message: messages.FAILED_TO_DELETE,
//         });
//     }
// });


items.delete('/delete-items', async (req, res) => {
    try {
        const itemIds = req.query.item_id; // Accept item_ids as an array of IDs
        
        if (!Array.isArray(itemIds)) {
            res.status(400).json({
                message: 'Invalid item_ids data.',
            });
            return;
        }

        const sql = `DELETE FROM onelove.items WHERE item_id IN (?)`; // Use IN clause for multiple IDs

        const [result] = await db.query(sql, [itemIds]); 

        // Check if any items were deleted
        if (result.affectedRows === 0) {
            res.status(404).json({
                message: 'No items found to delete.',
            });
        } else {
            res.status(200).json({
                message: 'Items deleted successfully.',
            });
        }
    } catch (err) {
        console.error('Error deleting items:', err);
        res.status(500).json({
            message: 'Failed to delete items.',
        });
    }
});


module.exports = items;