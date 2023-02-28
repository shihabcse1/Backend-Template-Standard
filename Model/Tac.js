const mongoose = require('mongoose');
var uuid = require('node-uuid');
const Joi = require('joi');


const tacSchema = new mongoose.Schema({
    tac: { type: String,required:true},
    contact: { type: String,required:true},
    purpose: { type: String,required:true},
    usedStatus: { type: String,required:true},
    date : { type : Date , default:Date.now }
});
const Tac = mongoose.model('Tac',tacSchema);


const inviteCodeSchema = new mongoose.Schema({
    senderId: { type: String,required:true},
    currency: { type: String,required:true},
    inviteCode: { type: String,required:true,unique: true},
    usedStatus: { type: String,default: 'NOT-YET'},
    usedBy: { type: String,default:null},
    invitationValue : { type: String,required:true},
    date : { type : Date , default:Date.now },
    usedDate : { type : Date , default:Date.now },
});
const InviteCode = mongoose.model('InviteCode',inviteCodeSchema);


function UpdateTacPayload(inputobject){
    const schema = {
        "PhoneNo" : Joi.string().min(10).max(12).required(),
        "tac" : Joi.string().min(6).max(6).required()
    }
    return Joi.validate(inputobject,schema);
}

exports.TacModel = Tac;
exports.InviteCodeModel = InviteCode;
exports.UpdateTacValidation = UpdateTacPayload;