const express = require('express');
const router = express.Router();


const verifytoken = require('../middleware/auth'); 
const {SecurityImageGet,SecurityImageAdd,SecurityImageDelete,SecurityImageGetAll} = require('../controller/fileController');

//For handling File Operation
router.get('/file/security-image/get',SecurityImageGet); // Random 9
router.get('/file/security-image/getall',SecurityImageGetAll); // all image list
router.post('/file/security-image/add',SecurityImageAdd); // Add new resource
router.delete('/file/security-image/delete',SecurityImageDelete); // remove resource




module.exports = router;