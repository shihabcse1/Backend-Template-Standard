const { UserModel, Validate, ValidateUpdate, ValidateSendTac } = require('../Model/User');
const { TacModel,InviteCodeModel, UpdateTacValidation } = require('../Model/Tac');
const crypto = require("crypto");
const _ = require('lodash');
const bcrypt = require('bcrypt');
const config = require('config');
const axios = require('axios');
const asyncMiddleware = require('../middleware/async');
const jwt = require('jsonwebtoken');
var ObjectId = require('mongodb').ObjectID;

/*  For MongoDB TRansaction testing
    const Fawn = require('fawn');
    var mongoose = require("mongoose");
    mongoose.set('useUnifiedTopology', true);
    mongoose.set('useNewUrlParser', true);
    mongoose.connect('mongodb://'+config.get('mongoUrl')+'/'+config.get('database'), { useNewUrlParser: true });
    Fawn.init(mongoose);
*/

module.exports.createUser = asyncMiddleware(async (req, res) => {
    const data = Validate(req.body);
    if (data.error) {
        res.status(200).send({
            "status": "failed",
            "statusCode": 422,
            "result": "validation error",
            "response": data.error
        });
        return;
    }

    //encrypting password before creating post object
    //Salt key Prime number is a good choice Folder location : config/*
    const { salutation,name,email,country,zappId,contact,touchId,faceId,securityImage,inviteCode,inviteCodeBool,currency } = req.body;
    const salt = await bcrypt.genSalt(config.get('app_salt'));
    const encryptPassword = await bcrypt.hash(req.body.password, salt);
    const encryptTpin = await bcrypt.hash(req.body.tpin, salt);
    const post = {
        "salutation": salutation,
        "name": name,
        "email": email,
        "country": country,
        "password": encryptPassword,
        "zappId": zappId,
        "contact": contact,
        "tpin": encryptTpin,
        "touchId": touchId,
        "faceId": faceId,
        "securityImage": securityImage,
        "inviteCodeBool": inviteCodeBool,
        "inviteCode": inviteCode,
        "accountAmount": 0,
        "currency" : currency
    }

    const search = await UserModel.find({ $or: [{ "zappId": zappId }, { "email": email }, { "contact": contact }] }).select({"password": 0,"tpin" : 0, "relationalId" : 0,"zappId" : 0, "contact" : 0, "accountAmount" : 0}); 
    if (search.length > 0) {
        res.status(200).send({
            "status": "failed",
            "statusCode": 409,
            "response": "User already exist - Duplicate Record",
            "userId" : search[0]._id,
            "relatedEndpoint" : config.get('app_base_url')+"/user/invite-code/use",
            "relation" : "[ userId ] <==> [ inviteCodeUser ]" 
        });
        return;
    }

    //to handle malicious input
    const useLoadash = _.pick(post, ['salutation', 'name', 'email', 'country', 'password', 'zappId', 'contact', 'tpin', 'touchId', 'faceId', 'securityImage', 'inviteCodeBool', 'inviteCode', 'accountAmount','currency']);

    const user = new UserModel(useLoadash);

    const save = await user.save();
    res.status(200).send({
        "status": "success",
        "statusCode": 200,
        "response": "New user created",
        "userId" : save._id,
        "relatedEndpoint" : config.get('app_base_url')+"/user/invite-code/use",
        "relation" : "[ userId ] <==> [ inviteCodeUser ]"  
    });


    

});


//TPIN & NAME CAN BE UPDATED
module.exports.updateUser = asyncMiddleware(async (req, res) => {

    //validate
    const data = ValidateUpdate(req.body);

    //proceed to next for update
    if (data.error) {
        res.status(404).send({
            "response": data.error
        });
        return;
    }
    const {credential,oldtpin,newtpin } = req.body;
    //checking data availabilty
    var user = await UserModel.findOne({ $or: [{ "zappId": credential }, { "email": credential }, { "contact": credential }] });
    if (!user) {
        res.status(200).send({
            "status": "Not Found",
            "statusCode": 400,
            "result": "user not found"
        });
        return;
    }

    //If all stage passed => 
    //which property need to be updated

    const isTrue = await bcrypt.compare(oldtpin, user.tpin)
    const salt = await bcrypt.genSalt(config.get('app_salt'));
    const encryptTpin = await bcrypt.hash(newtpin, salt);
    if (isTrue) {
        user.tpin = encryptTpin;
        const update = await user.save();
        res.status(200).send({
            "status": "success",
            "statusCode": 200,
            "message": "Data updated",
            "response": update
        });

    }
    else {
        res.status(200).send({
            "status": "Failed",
            "statusCode": 422,
            "result": "Error while updating records",
            "response": "Old pin mismatched"
        });
    }

})


//Recieve tac
module.exports.sendtac = asyncMiddleware(async (req, res) => {

    var generateTac = randomFixedInteger(6).toString();

    var contact = req.body.PhoneNo.replace("+", "").trim();

    const smsBody = {
        "Source": "Zapp",
        "PhoneNo": contact,
        "Message": "Your tac is : " + generateTac
    };

    //validate
    const data = ValidateSendTac(smsBody);
    //proceed to next for update
    if (data.error) {
        res.status(422).send({
            "status": "validation error",
            "response": data.error
        });
        return;
    }

    //sending message  
    const response = await axios.post(config.get('tac_endpoint'), smsBody);
    if (response.data) {
        res.status(200).send({
            "status": "success",
            "response": response.data
        });

        const post = {
            "tac": generateTac,
            "contact": contact,
            "purpose": "Registration",
            "usedStatus": config.get('CONDITION_DEFAULT'),
        }
        const useLoadash = _.pick(post, ['tac', 'contact', 'purpose', 'usedStatus']);
        const tacSave = new TacModel(useLoadash);
        const saveTac = await tacSave.save();
        if (saveTac) {
            console.log("Tac saved succesfully!");
        }



    }
    else {
        res.status(503).send({
            "status": "Service Unavailable",
            "response": "Server under maintainance. Sorry for the inconvenience!"
        });
    }




})


//use Tac
module.exports.useTac = asyncMiddleware(async (req,res)=>{
    //validate
    const data = UpdateTacValidation(req.body);

    //proceed to next for update
    if (data.error) {
        return res.status(200).send({
            "status": "failed",
            "statusCode": 422,
            "result": "validation error",
            "response": data.error
        });
    }

    const {PhoneNo,tac} = req.body ;
    var findTac = await TacModel.findOne({ "contact" :PhoneNo,"tac" : tac });
    if(findTac){
        if(findTac.usedStatus === config.get('CONDITION_DEFAULT')){
            findTac.usedStatus = config.get('CONDITION_UPDATE');
            const updateTac = await findTac.save();
            return res.status(200).send({
            "status" : "success",
            "statusCode" : 200,
            "response" : "Operation successfull"
            })
        }
        if(findTac.usedStatus === config.get('CONDITION_UPDATE')){
            return res.status(200).send({
            "status" : "failed/Bad Request",
            "statusCode" : 400,
            "response" : "Tac already used"
            })
        }    
    }
    
    else return res.status(200).send({
        "status" : "unsuccessful",
        "statusCode" : 404,
        "response" : "Tac not found"
     })
    
    
});


module.exports.searchUser = asyncMiddleware(async (req, res, next) => {
    const search = await UserModel.find({ $or: [{ "zappId": req.body.credential }, { "email": req.body.credential }, { "contact": req.body.credential }] });
    if (search.length > 0) {
        return res.status(200).send({
            "status": "success",
            "statusCode": 200,
            "message": "User already exist",
            "response": search
        });
        
    }
    else {
        return res.status(200).send({
            "status": "success",
            "statusCode": 200,
            "response": "Please proceed with next step.",
        });
        
    }

})

module.exports.generateInviteCode = asyncMiddleware(async (req, res, next) => {
    var jwtToken = req.headers['x-access-token'];
    const extractedData = jwt.verify(jwtToken,config.get('app_jwttoken'));
    const userInfo = extractedData.loggedInUser;
    const mongoId = userInfo._id;
    const currency = userInfo.currency;
    const inviteCode = randomString(10);
    const payload = {
        "senderId" : mongoId,
        "currency" : currency,
        "inviteCode" : inviteCode,
        "invitationValue" : config.get('registration_invite_code_redeem_value')

    }
    const inviteModel = new InviteCodeModel(payload);
    const data = await inviteModel.save();
    return res.status(200).send({
        "message" : "Invitation Code generated",
        "response" : data,
        "urlToShare" : config.get('app_base_url')+'/invitecode='+inviteCode
    });    
    
    

})

module.exports.checkInviteCode = asyncMiddleware(async (req, res, next) => {
    const { inviteCode } = req.body;
    var findInviteCode = await InviteCodeModel.findOne({ "inviteCode" :inviteCode,"usedStatus" : config.get('CONDITION_DEFAULT') }).select({ "_id": 0,"date" : 0, "usedDate" : 0,"usedBy" : 0});
    if(findInviteCode)
    {
        return res.status(200).send({
            "status" : "success",
            "message" : "Invite code is available to Use"
         });
    }
    else
    {
        return res.status(200).send({
            "status" : "fail",
            "message" : "Not a valid invite code"
         }); 
    }

})


module.exports.useInviteCode = asyncMiddleware(async (req, res, next) => {
    const { inviteCode, inviteCodeUser } = req.body;
    var count = 0;
    var userArray = [inviteCodeUser];
    var findInviteCode = await InviteCodeModel.findOne({ "inviteCode" :inviteCode,"usedStatus" : config.get('CONDITION_DEFAULT') });
    
    if(findInviteCode)
    {   
        var requestedCurrency = findInviteCode.currency;
        userArray.push(findInviteCode.senderId);
        const amountToCredit = findInviteCode.invitationValue;
        findInviteCode.usedStatus = config.get('CONDITION_UPDATE');
        findInviteCode.usedBy = inviteCodeUser;
        const invitationUpdate = await findInviteCode.save();
        if(invitationUpdate && userArray.length === 2)
        {
            const response = await Promise.all(
            userArray.map(async (single) => {
              var getUser = await UserModel.findById(single);
              if(requestedCurrency === getUser.currency){
                getUser.accountAmount =  Number(getUser.accountAmount) + Number(amountToCredit);
                await getUser.save();     
              }   
              return count++;
            }));
            if(response.length === 2)
            {
                return res.status(200).send({
                    "status" : "success",
                    "response" : "Congratulation! You got RM"+amountToCredit+ " credited to your account."
                });   
            }
        }
        
    }
    else
    {
        return res.status(200).send({
            "status" : "fail",
            "response" : "Not a valid invite code"
         });
    }

    /* Example of mongoose transaction */
    // var task = Fawn.Task();
    // task.update('invitecodes',{ "inviteCode" :inviteCode,"usedStatus" : config.get('CONDITION_DEFAULT') },{"usedStatus" : config.get('CONDITION_UPDATE')})
    // .update('users',{ "_id" : ObjectId(""+inviteCodeUser) },{"accountAmount" : "100"})
    // .update('users',{ "_id" : ObjectId(""+findInviteCode.senderId)},{"accountAmount" : "100"})
    // .run()



})

//Generating random 6 digit number
var randomFixedInteger = function (length) {
    return Math.floor(Math.pow(10, length - 1) + Math.random() * (Math.pow(10, length) - Math.pow(10, length - 1) - 1));
}


function randomString(length) {
    var chars = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
    var result = '';
    for (var i = length; i > 0; --i) result += chars[Math.round(Math.random() * (chars.length - 1))];
    return result;
}


