const express = require('express');
const items = express.Router();
const bodyParser = require('body-parser');
const messages = require('../messages/constants');
const logger = require('../../logger');

const db = require('../../dbConnection');
const jwtMiddleware = require('../../jwtMiddleware');
const notification= require('../oneSignal/notifications');


items.use(express.json()); // To parse JSON bodies
items.use(express.urlencoded({ extended: true })); // To parse URL-encoded bodies


async function performTransaction(req, res) {
    try {
        await db.beginTransaction();

        const { image_type, image_url } = req.body;
        const imageSql = `INSERT INTO onelove.images (image_type, image_url) VALUES (?, ?)`;
        const imageValues = [image_type, JSON.stringify(image_url)];
        const [imageResult] = await db.query(imageSql, imageValues);
        const image_id = imageResult.insertId;

        const { brand_name, product_title, pet_type_product, item_description, product_details, store_id, quantity, sub_category_name, collection_name } = req.body;
        const itemSql = `INSERT INTO onelove.items (brand_name, product_title, pet_type_product, item_description, product_details, store_id, image_id, quantity, sub_category_name, collection_name) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        const itemValues = [brand_name, product_title, pet_type_product, item_description, product_details, store_id, image_id, JSON.stringify(quantity), sub_category_name, collection_name];
        const [itemResult] = await db.query(itemSql, itemValues);
        const item_id = itemResult.insertId;

        await db.commit();

        // Send notifications to pet owners
        const notifSql = `SELECT external_id FROM onelove.users WHERE user_type = 'pet_owner'`;
        const [notifSqlResult] = await db.query(notifSql);

        if (notifSqlResult && notifSqlResult.length > 0) {
            // Filter and map the external IDs
            const externalIds = notifSqlResult
                .filter(item => item.external_id !== null && item.external_id !== 'null')
                .map(item => item.external_id);

                console.log(externalIds)
            if (externalIds.length > 0) {
                const Name = "New stock!";
                const mess = "Check out the latest products for your pet in the store!";
                const endpoint = `ShopScreen/${store_id}`
                for (const uniqId of externalIds) {
                    await notification.sendnotification(Name, mess, uniqId, endpoint);
                }
            }
        }

        // Send a success response to the client
        res.status(201).json({ message: messages.POST_SUCCESS });

    } catch (err) {
        await db.rollback();
        logger.error('Error in transaction:', err);
        // Send an error response to the client
        res.status(500).json({ message: messages.POST_FAILED });
    }
}


items.post('/item-entry',jwtMiddleware.verifyToken,(req,res)=>{

    const { userType } = req;
    if (userType !== 'pet_store') {
        return res.status(403).json({ message: messages.FORBID });
    }

    performTransaction(req,res)
    .then(() => {
        logger.info('Transaction completed successfully');
       })
    .catch((err) => {
        logger.error('Error in address.post API:', err);
       });
});



items.get('/products',jwtMiddleware.verifyToken,async(req,res)=>{
    const sql = `SELECT i.*,s1.*,i1.*,a.*,c.*
                 FROM onelove.items i
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
        logger.error('Error fetching pets data:', err);
        res.status(500).json({
            message:messages.FAILURE_MESSAGE,
        });
    }
});


items.get('/products-id',jwtMiddleware.verifyToken,async(req,res)=>{
    const { userType } = req;
    if (userType !== 'pet_owner'&& userType !== 'pet_store') {
        return res.status(403).json({ message: messages.FORBID });
    }
    const item_id = req.query.item_id
    const sql = `SELECT i.*,s1.*,i1.*,a.*,c.*
                 FROM onelove.items i
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
        logger.error('Error fetching pets data:', err);
        res.status(500).json({
            message:messages.FAILURE_MESSAGE,
        });
    }
});



items.get('/products-store-id',jwtMiddleware.verifyToken,async(req,res)=>{

    const { userType } = req;
    if (userType !== 'pet_owner'&& userType !== 'pet_store') {
        return res.status(403).json({ message: messages.FORBID });
    }

    const store_id = req.query.store_id

    const sql = `SELECT i.*,s1.*,i1.*,a.*,c.*
                 FROM onelove.items i
                 LEFT JOIN store s1 ON i.store_id = s1.store_id
                 LEFT JOIN address a ON s1.address_id = a.address_id
                 LEFT JOIN contact_details c ON s1.contact_id = c.contact_id
                 LEFT JOIN images i1 ON i.image_id = i1.image_id
                 WHERE i.store_id=?
                 ORDER BY i.item_id DESC`
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
        logger.error('Error fetching pets data:', err);
        res.status(500).json({
            message:messages.FAILURE_MESSAGE,
        });
    }
});


items.get('/product-store-item-id',jwtMiddleware.verifyToken, async (req, res) => {
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

        let sql = `SELECT i.*,s1.*,i1.*
        FROM onelove.items i
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
        logger.error('Error fetching data:', err);
        res.status(500).json({
            message: messages.FAILURE_MESSAGE,
        });
    }
});


items.put('/update-item',jwtMiddleware.verifyToken, async (req, res) => {

    const { userType } = req;
    if (userType !== 'pet_store') {
        return res.status(403).json({ message: messages.FORBID });
    }

    try {
        const item_id = req.query.item_id;

        await db.beginTransaction();

        const { brand_name, product_title, pet_type_product, item_description, product_details, store_id, quantity, sub_category_name, collection_name } = req.body;

        if (brand_name || product_title || pet_type_product || item_description || product_details || store_id || quantity || sub_category_name || collection_name) {

            let itemSql = 'UPDATE onelove.items SET';
            const itemValues = [];

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
            if (store_id !== undefined) {
                itemSql += ' store_id=?,';
                itemValues.push(store_id);
            }
            if (sub_category_name !== undefined) {
                itemSql += ' sub_category_name=?,';
                itemValues.push(sub_category_name);
            }
            if (collection_name !== undefined) {
                itemSql += ' collection_name=?,';
                itemValues.push(collection_name);
            }
            if (quantity !== undefined) {
                itemSql += ' quantity=?,';
                itemValues.push(JSON.stringify(quantity));
            }

            itemSql = itemSql.slice(0, -1);
            itemSql += ' WHERE item_id= ?';
            itemValues.push(item_id);

            await db.query(itemSql, itemValues);
        }

        const { image_type, image_url } = req.body;

        if (image_type || image_url) {
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
        // Send a success response to the client
        res.status(200).json({ message: messages.DATA_UPDATED});
    } catch (err) {
        await db.rollback();
        logger.error('Error updating data:', err.message);
        // Send an error response to the client
        res.status(500).json({ message: messages.DATA_UPDATE_FALIED });
    }
});


items.delete('/delete-items',jwtMiddleware.verifyToken, async (req, res) => {

    const { userType } = req;
    if (userType !== 'pet_store') {
        return res.status(403).json({ message: messages.FORBID });
    }

    try {
        const itemIds = req.query.item_id; // Accept item_ids as an array of IDs
        
        if (!Array.isArray(itemIds)) {
            res.status(400).json({
                message: messages.INVALID_ID,
            });
            return;
        }
        const sql = `DELETE FROM onelove.items WHERE item_id IN (?)`; // Use IN clause for multiple IDs

        const [result] = await db.query(sql, [itemIds]); 

        // Check if any items were deleted
        if (result.affectedRows === 0) {
            res.status(202).json({
                message: messages.NO_DATA,
            });
        } else {
            res.status(200).json({
                message: messages.DATA_DELETED,
            });
        }
    } catch (err) {
        logger.error('Error deleting items:', err);
        res.status(500).json({
            message: messages.FAILED_TO_DELETE,
        });
    }
});



items.get('/stores',jwtMiddleware.verifyToken, async (req, res) => {

    const { userType } = req;
    if (userType !== 'pet_owner') {
        return res.status(403).json({ message: messages.FORBID });
    }
    
    const sql = `
      SELECT
        s.*,
        u.*,
        a.*,
        c.*,
        i.*,
        COUNT(i2.item_id) AS item_count
      FROM
        users u
      LEFT JOIN
        address a ON u.address_id = a.address_id
      LEFT JOIN
        contact_details c ON u.contact_id = c.contact_id
      LEFT JOIN
        store s ON u.store_id = s.store_id
      LEFT JOIN
        images i ON u.image_id = i.image_id
      LEFT JOIN
        items i2 ON u.store_id = i2.store_id
      WHERE
        u.user_type = 'pet_store'
      GROUP BY
        u.store_id`;
  
    try {
      const [results] = await db.query(sql);
      const storesData = JSON.parse(JSON.stringify(results));
      
      if (storesData.length > 0) {
        // Convert numeric boolean values to actual boolean values in the response
        const convertedStoresData = storesData.map(store => ({
          ...store,
          food_treats: store.food_treats === 1,
          accessories: store.accessories === 1,
          pet_boarding: store.pet_boarding === 1,
          toys: store.toys === 1,
          health_care: store.health_care === 1,
          dog_service: store.dog_service === 1,
          breader_adoption_sale: store.breader_adoption_sale === 1,
          item_count: store.item_count // Add item_count to the response
        }));
  
        res.status(200).json({
          storesData: convertedStoresData,
          message: messages.SUCCESS_MESSAGE,
        });
      } else {
        res.status(404).json({
          message: messages.NO_DATA,
        });
      }
    } catch (err) {
      logger.error('Error fetching data:', err);
      res.status(500).json({
        message: messages.FAILURE_MESSAGE,
      });
    }
  });
  

module.exports = items;