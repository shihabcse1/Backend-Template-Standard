const express = require('express');
const router = express.Router();


const verifytoken = require('../middleware/auth'); 
const {createUser,updateUser,sendtac,searchUser,useTac, generateInviteCode, checkInviteCode,useInviteCode } = require('../controller/userController');

//For handling User Add / Serach / Delete / Update Operation
router.post('/user/create',createUser); // => Working Fine
router.post('/user/search',searchUser); 
router.put('/user/update',verifytoken,updateUser);
router.post('/user/sms-tac',sendtac);
router.post('/user/sms-tac/use',useTac);

router.get('/user/invite-code/generate',generateInviteCode);
router.post('/user/invite-code/check',checkInviteCode);
router.post('/user/invite-code/use',useInviteCode);


module.exports = router;