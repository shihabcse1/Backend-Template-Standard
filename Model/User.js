const mongoose = require('mongoose');
var uuid = require('node-uuid');
const Joi = require('joi');
const currency  = require('../config-other/currency');
const AutoIncrement = require('mongoose-sequence')(mongoose);


console.log("Available currency : ", currency)

const userSchema = new mongoose.Schema({
    relationalId: { type: Number },
    salutation : {type : String,required : true},
    name : {type: String,required:true,trim:true,minlength:3, es_indexed: true},
    email:{type: String,required:true, es_indexed: true},
    country:{type: String,required:true,maxlength:25 ,es_indexed: true},
    zappId : {type: String,required:true,maxlength:25 ,es_indexed: true},
    contact:{type: String,required:true,maxlength:11, es_indexed: true},
    password:{type: String,required:true},
    tpin : {type: String, required:true},
    touchId : {type : Boolean , required:true},
    faceId : { type : Boolean, required:true},
    securityImage : { type : String, required : true},
    inviteCodeBool : {type : Boolean, required : true},
    inviteCode : {type : String, required : false},
    accountAmount : {type : String , required:false},
    currency : {type : String , required:true, enum : currency },
    date : {type : Date , default:Date.now }
});

userSchema.plugin(AutoIncrement, { inc_field: 'relationalId' });

const User = mongoose.model('User',userSchema);



function validateInput(inputobject){
    const schema = {
        "salutation" : Joi.string().min(1).required(),
        "name" : Joi.string().min(3).required(),
        "email":Joi.string().email().required(),
        "country" : Joi.string().max(25).required(),
        "zappId" : Joi.string().min(4).max(25).required(),
        "contact" : Joi.string().max(11).required(),
        "password":Joi.string().min(5).max(255).required(),
        "tpin" : Joi.string().required().min(6).max(6),
        "touchId" : Joi.boolean().required(),
        "faceId" : Joi.boolean().required(),
        "securityImage" : Joi.string().required(),
        "inviteCodeBool" : Joi.boolean().required(),
        "inviteCode" : Joi.string(),
        "currency" : Joi.strict().required()
    }
    return Joi.validate(inputobject,schema);
}


function validateUpdate(inputobject){
    const schema = {
        "credential" : Joi.string().min(3),
        "newtpin" : Joi.string().min(6).max(6),
        "oldtpin" : Joi.string().min(6).max(6)
    }
    return Joi.validate(inputobject,schema);
}

function validateSendTac(inputobject){
    const schema = {
        "PhoneNo" : Joi.string().min(10).max(12), //with followed by 60*********8 [Max 12,min 10]
        "Source"  : Joi.string().min(4).max(7),
        "Message" : Joi.string().min(6)
    }
    return Joi.validate(inputobject,schema);
}

exports.UserModel = User;
exports.Validate = validateInput;
exports.ValidateUpdate = validateUpdate;
exports.ValidateSendTac = validateSendTac;