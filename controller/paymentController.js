const asyncMiddleware = require('../middleware/async');
var crypto = require('crypto');
const config = require('config');
const jwt = require('jsonwebtoken');


const _ = require('lodash');
const { OrderModel,ValidateOrderPayload } = require('../Model/Order');
const { UserModel } = require('../Model/User');


module.exports.orderRequest = asyncMiddleware(async (req, res) => {
    const {orderAmount,transactionType,orderDetail} = req.body;
    const tokenWithPayload = {
        "orderAmount" : orderAmount,
        "transactionType" : transactionType,
        "orderDetail" : orderDetail,
        "token" : req.headers['x-access-token'],
    }
    const payloadValidation = ValidateOrderPayload(tokenWithPayload);
    if (payloadValidation.error) {
        res.status(200).send({
            "status": "failed",
            "statusCode": 422,
            "result": "validation error",
            "response": payloadValidation.error
        });
        return;
    }
    
    var jwtToken = req.headers['x-access-token'];
    const extractedData = jwt.verify(jwtToken,config.get('app_jwttoken'));
    const userInfo = extractedData.loggedInUser;
    const CUSTOMER_ID = userInfo.relationalId;
    const AMOUNT = orderAmount.toFixed(2);
    var updateLog = [];   
    updateLog.push({"action" : "Order Create Request", "processedAt" : "Zapp-Backend" , "response" : null,"time" : new Date()});

    const post = {
        "userCredential": userInfo.relationalId,
        "transactionType" : transactionType,
        "orderDetail" : orderDetail,
        "orderAmount" : AMOUNT,
        "transactionLog" : updateLog
    }

    //to handle malicious input and generate order id
    const useLoadash = _.pick(post, ["userCredential", 'transactionType', 'orderDetail','orderAmount','transactionLog']);
    const order = new OrderModel(useLoadash);
    const save = await order.save();
    const ORDER_ID = save.orderId; 



    //For saving sha512 
    var TXN_SIGNATURE = null;
    var combinedStr = config.get('upay_verifyKey')+config.get('upay_identifier')+AMOUNT.toString()+CUSTOMER_ID.toString()+ORDER_ID.toString();
    var hash = crypto.createHash('sha512');
    var data = hash.update(combinedStr, 'utf-8');
    TXN_SIGNATURE = data.digest('hex');

    //Find then update
    updateLog = save.transactionLog;
    updateLog.push({"action" : "sha512 Save Request", "processedAt" : "Zapp-Backend" , "response" : null, "time" : new Date() });
    var orderSearch = await OrderModel.findOne({ "orderId" : ORDER_ID });
    
    orderSearch.sha512 = TXN_SIGNATURE;
    orderSearch.transactionLog = updateLog;
    const finalOrder = await orderSearch.save();
    
    return res.status(200).send({        
        "sha512"  : finalOrder.sha512,
        "amount"  : finalOrder.orderAmount,
        "userId"  : finalOrder.userCredential,
        "orderId" : finalOrder.orderId,
    });



});

module.exports.callback = asyncMiddleware(async (req,res)=>{
    const response = req.body ;

    var updateLog = [];
    var finalOrder = {};
    var userInfo   = {};
    var currentBalance = null;
    var orderSearch = await OrderModel.findOne({ "orderId" :response.ORDER_ID });
    
    //Initial Balance
    var userAccount = await UserModel.findOne({"relationalId" : orderSearch.userCredential})
    currentBalance  = userAccount.accountAmount;
    
    updateLog = orderSearch.transactionLog;   
    updateLog.push({"action" : "received response from Payment Gateway" , "processedAt" : "I-Serve Payment gateway" , "response" : response, "time" : new Date()});

    if(response.STATUS_CODE === "00") 
    {
      // Order Schema update task
      orderSearch.status = "success"; 
      orderSearch.transactionLog = updateLog;
      finalOrder = await orderSearch.save(); 

      // User balance update task
      userAccount.accountAmount = Number(userAccount.accountAmount) + Number(response.AMOUNT);
      userInfo   = await userAccount.save()
      currentBalance = userInfo.accountAmount;
    }
    else
    {
      // Order Schema update task
      orderSearch.status = "failed"; 
      orderSearch.transactionLog = updateLog;
      finalOrder = await orderSearch.save();  
    } 
    
    
    return res.redirect('/payment/response/confirmation?orderid='+finalOrder.orderId + '&&userbalance='+ currentBalance + '&&transactionstatus=' + finalOrder.status);



});


module.exports.confirmation = asyncMiddleware(async (req,res)=>{
    res.status(200).send({
        "orderid" : req.query.orderid,
        "userbalance" : Number(req.query.userbalance).toFixed(2),
        "transactionstatus" : req.query.transactionstatus
    });
});



module.exports.webrequest = asyncMiddleware(async (req,res)=>{
    res.render('payment');
});


























