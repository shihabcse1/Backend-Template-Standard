const Joi = require('joi');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('config'); 
const {UserModel} = require('../Model/User');
module.exports.authFunc = async (req,res)=>{

    const foundUser = await UserModel.findOne({ $or : [{"zappId" : req.body.credential},{"email" : req.body.credential}]});
    if(!foundUser)
    {
        res.status(400).send({
            "response" : "No user found"
        });
        return;
    }

    //now compare user password with given password
    const isTrue = await bcrypt.compare(req.body.password,foundUser.password)
    if(isTrue)
    {
        //here i'm going to sign the response
        const token = jwt.sign({loggedInUser:foundUser},config.get('app_jwttoken'))
        res.status(200).send({
            "response" : "Valid credentials",
            "x-access-token" : token
        });
        return;       
    }
    else
    {
        res.status(400).send({
            "response" : "Password didn't match"
        }); 
        return;
    }
    
}
