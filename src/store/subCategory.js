// const express = require('express');
// const subCate = express.Router();
// const bodyParser = require('body-parser');
// const messages = require('../messages/constants')

// const db = require('../../dbConnection')

// subCate.use(express.json()); // To parse JSON bodies
// subCate.use(express.urlencoded({ extended: true })); // To parse URL-encoded bodies


// subCate.post('/sub-category',async(req,res)=>{
//     try{
//         const { collection_name, sub_category_name, products_count, store_id } = req.body;
//         const sql = `INSERT INTO onelove.sub_category (collection_name, sub_category_name, products_count, store_id) VALUES (?, ?, ?, ?)`;
//         const sqlValues = [collection_name, sub_category_name, products_count, store_id]

//        const [sqlResult] =  await db.query(sql,sqlValues);
//       return res.status(200).json({
//         data: sqlResult,
//         message: messages.POST_SUCCESS
//     });
//     }catch(err){
//         console.error('Error posting data:', err);
//        return res.status(500).json({
//             message: messages.POST_FAILED,
//         });
//     }
// });


// subCate.get('/sub-category',async(req,res)=>{
//     const store_id = req.query.store_id;

//     if (!store_id) {
//         return res.status(400).json({ message:messages.INVALID_ID });
//     }
//     const sql = `SELECT * FROM onelove.sub_category WHERE store_id=?`;
//     try{
//        const [sqlResult] = await db.query(sql,store_id);
//        const data = JSON.parse(JSON.stringify(sqlResult));
      
//        return res.status(200).json({
//         data,
//         message:messages.SUCCESS_MESSAGE
//        });
       
//     }catch(err){
//         console.error('Error fetching :', err.message);
//        return res.status(400).json({
//             message: messages.FAILURE_MESSAGE
//         });
//     }
// });


// subCate.put('/update-sub-category', async (req, res) => {
//     try {
//         const sub_cate_id = req.query.sub_cate_id;

//         const { collection_name, sub_category_name, products_count, store_id } = req.body;

//         let sql = 'UPDATE onelove.sub_category SET';
//         const values = [];

//         if (collection_name !== undefined) {
//             sql += ' collection_name=?,';
//             values.push(collection_name);
//         }
//         if (sub_category_name !== undefined) {
//             sql += ' sub_category_name=?,';
//             values.push(sub_category_name);
//         }
//         if (products_count !== undefined) {
//             sql += ' products_count=?,';
//             values.push(products_count);
//         }
//         if (store_id !== undefined) {
//             sql += ' store_id=?,';
//             values.push(store_id);
//         }

//         sql = sql.slice(0, -1);
//         sql += ' WHERE sub_cate_id=?';
//         values.push(sub_cate_id);

//         const [result] = await db.query(sql, values);

//         res.status(200).json({
//             updatedData: result,
//             message: messages.DATA_UPDATED,
//         });
//     } catch (err) {
//         console.error('Error updating data:', err.message);
//         res.status(400).json({ message: messages.DATA_UPDATE_FALIED });
//     }
// });


// subCate.delete('/delete-sub-category', async (req, res) => {
//     try {
//         const sub_cate_id = req.query.sub_cate_id;

//         const sql = `DELETE FROM onelove.sub_category WHERE sub_cate_id = ?`;

//         const [result] = await db.query(sql, [sub_cate_id]); 

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




// module.exports = subCate;