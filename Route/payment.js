const express = require('express');
const router = express.Router();


const verifytoken = require('../middleware/auth'); 
const {orderRequest,callback,webrequest,confirmation} = require('../controller/paymentController');

/* 
   Route will start will 'payment' prefix 
   in index.js => app.use('/payment',paymentRoute)
*/ 

router.get('/webrequest', webrequest);  
router.post('/order',verifytoken, orderRequest); 
router.post('/response/callback',callback); 
router.get('/response/confirmation',confirmation);

module.exports = router;