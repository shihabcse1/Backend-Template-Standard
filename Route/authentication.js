const express = require('express');
const router = express.Router();
const {authFunc} = require('../controller/authenticationController');

router.post('/authenticate',authFunc);
module.exports = router;