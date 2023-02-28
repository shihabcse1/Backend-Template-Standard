const express = require('express');
const router = express.Router();


const verifytoken = require('../middleware/auth'); 
const {createIndex,deleteIndex,searchIndex,searchIndexFilter} = require('../controller/elasticController');
const {createIndexSecondary,getallSecondary} = require('../controller/elasticSecondaryController');

//For handling Elasticserch Endpoint
router.post('/elastic/index',verifytoken, createIndex); 
router.delete('/elastic/delete',verifytoken, deleteIndex); 
router.post('/elastic/search',verifytoken, searchIndex);
router.post('/elastic/search/filter',verifytoken, searchIndexFilter);


//For handling Elasticsearch Multiple Indices Query Route
router.post('/elastic/index/secondary',verifytoken, createIndexSecondary); 
router.post('/elastic/getall/secondary',verifytoken, getallSecondary); 


//For handling Parent-child relation in Elastic search



module.exports = router;