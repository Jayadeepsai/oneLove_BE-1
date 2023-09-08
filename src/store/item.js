const express = require('express');
const items = express.Router();
const bodyParser = require('body-parser');
const messages = require('../messages/constants');

const db = require('../../dbConnection');


items.use(express.json()); // To parse JSON bodies
items.use(express.urlencoded({ extended: true })); // To parse URL-encoded bodies



async function performTransaction(req,res){
    try{
        await db.beginTransaction();

        const { image_type, image_url } = req.body;
        const imageSql = `INSERT INTO onelove.images (image_type, image_url) VALUES (?, ?)`;
        const imageValues = [image_type, JSON.stringify(image_url)];
        const [imageResult] = await db.query(imageSql,imageValues);
        const image_id = imageResult.insertId;

        const { brand_name, product_title, pet_type_product, item_description, product_details, sub_cate_id, store_id, quantity } = req.body;
        const itemSql = `INSERT INTO onelove.items (brand_name, product_title, pet_type_product, item_description, product_details, sub_cate_id, store_id, image_id, quantity) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        const itemValues = [brand_name, product_title, pet_type_product, item_description, product_details, sub_cate_id, store_id, image_id, JSON.stringify(quantity)];
        const [itemResult] = await db.query(itemSql,itemValues);
        const item_id = itemResult.insertId;

        
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



items.get('/products',async(req,res)=>{
    const sql = `SELECT i.*,s.*,s1.*,i1.*,a.*,c.*
                 FROM onelove.items i
                 LEFT JOIN sub_category s ON i.sub_cate_id = s.sub_cate_id
                 LEFT JOIN store s1 ON i.store_id = s1.store_id
                 LEFT JOIN address a ON s1.address_id = a.address_id
                 LEFT JOIN contact_details c ON s1.contact_id = c.contact_id
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
    const sql = `SELECT i.*,s.*,s1.*,i1.*,a.*,c.*
                 FROM onelove.items i
                 LEFT JOIN sub_category s ON i.sub_cate_id = s.sub_cate_id
                 LEFT JOIN store s1 ON i.store_id = s1.store_id
                 LEFT JOIN address a ON s1.address_id = a.address_id
                 LEFT JOIN contact_details c ON s1.contact_id = c.contact_id
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

    const sql = `SELECT i.*,s.*,s1.*,i1.*,a.*,c.*
                 FROM onelove.items i
                 LEFT JOIN sub_category s ON i.sub_cate_id = s.sub_cate_id
                 LEFT JOIN store s1 ON i.store_id = s1.store_id
                 LEFT JOIN address a ON s1.address_id = a.address_id
                 LEFT JOIN contact_details c ON s1.contact_id = c.contact_id
                 LEFT JOIN images i1 ON i.image_id = i1.image_id
                 WHERE i.store_id=?`
    try{
        const [results] = await db.query(sql,store_id); 

        const productsData = JSON.parse(JSON.stringify(results));
        if (productsData.length > 0) {
            // Convert numeric boolean values to actual boolean values in the response
            const convertedProductsData = productsData.map(item => ({
                ...item,
                food_treats: item.food_treats === 1,
                accessories: item.accessories === 1,
                toys: item.toys === 1,
                health_care: item.health_care === 1,
                dog_service: item.dog_service === 1,
                breader_adoption_sale: item.breader_adoption_sale === 1,
            }));

            res.status(200).json({
                productData: convertedProductsData,
                message: messages.SUCCESS_MESSAGE,
            });
        } else {
            res.status(404).json({
                message: messages.NO_DATA,
            });
        }
      
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


items.put('/update-item', async (req, res) => {
    try {
        const item_id = req.query.item_id;

        await db.beginTransaction();

        const { brand_name, product_title, pet_type_product, item_description, product_details, sub_cate_id, store_id, quantity } = req.body;

        if(brand_name || product_title || pet_type_product || item_description || product_details || sub_cate_id || store_id || quantity){

            let itemSql = 'UPDATE onelove.items SET';
            const itemValues=[];

            if (brand_name !== undefined) {
                itemSql += ' brand_name=?,';
                itemValues.push(brand_name);
            }
            if (product_title !== undefined) {
                itemSql += ' product_title=?,';
                itemValues.push(product_title);
            }
            if (pet_type_product !== undefined) {
                itemSql += ' pet_type_product=?,';
                itemValues.push(pet_type_product);
            }
            if (item_description !== undefined) {
                itemSql += ' item_description=?,';
                itemValues.push(item_description);
            }
            if (product_details !== undefined) {
                itemSql += ' product_details=?,';
                itemValues.push(product_details);
            }
            if (sub_cate_id !== undefined) {
                itemSql += ' sub_cate_id=?,';
                itemValues.push(sub_cate_id);
            }
            if (store_id !== undefined) {
                itemSql += ' sub_cate_id=?,';
                itemValues.push(sub_cate_id);
            }
            if (quantity !== undefined) {
                itemSql += ' quantity=?,';
                itemValues.push(JSON.stringify(quantity));
            }
            
            itemSql = itemSql.slice(0, -1);
            itemSql += ' WHERE item_id= ?';
            itemValues.push(item_id);

            await db.query(itemSql,itemValues);
        }
       
        const { image_type, image_url } = req.body;

        if(image_type || image_url){
            let imageSql = 'UPDATE images SET';
            const imageValues = [];
      
            if (image_type !== undefined) {
                imageSql += ' image_type=?,';
                imageValues.push(image_type);
            }
            if (image_url !== undefined) {
                imageSql += ' image_url=?,';
                imageValues.push(JSON.stringify(image_url));
            }
    
            imageSql = imageSql.slice(0, -1);
            imageSql += ' WHERE image_id=(SELECT image_id FROM items WHERE item_id=?)';
            imageValues.push(item_id);
    
            await db.query(imageSql, imageValues);
        }
        await db.commit();

        console.log('Data updated successfully.');

        // Send a success response to the client
        res.status(200).json({ message: 'Data updated successfully.' });
    } catch (err) {
        await db.rollback();

        console.error('Error updating data:', err.message);

        // Send an error response to the client
        res.status(500).json({ message: 'Failed to update data.' });
    }
});



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



items.get('/stores',async(req,res)=>{

    const sql = `
    SELECT  s.*,u.*,a.*,c.*,i.*
    FROM users u
    LEFT JOIN address a ON u.address_id = a.address_id
    LEFT JOIN contact_details c ON u.contact_id = c.contact_id
    LEFT JOIN store s ON u.store_id = s.store_id
    LEFT JOIN images i ON u.image_id = i.image_id
     WHERE u.user_type = 'pet_store'`;

    try{
    const [results] = await db.query(sql);
        const storesData = JSON.parse(JSON.stringify(results));

        if (storesData.length > 0) {
            res.status(200).json({
                storesData,
                message:messages.SUCCESS_MESSAGE,
            });
        } else {
            res.status(404).json({
                message: messages.NO_DATA,
            });
        }
    }catch(err){
        console.error('Error fetching data:', err);
        res.status(500).json({
            message: messages.FAILURE_MESSAGE,
        });
    }
});




module.exports = items;