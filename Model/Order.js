const mongoose = require('mongoose');
var uuid = require('node-uuid');
const Joi = require('joi');
const AutoIncrement = require('mongoose-sequence')(mongoose);


const orderSchema = new mongoose.Schema({
    orderId: { type: Number },
    userCredential : { type : Number,required : true },
    transactionType : { type: String,required:true,trim:true, es_indexed: true },
    status:{ type: String, default : 'pending' },
    orderDetail : { type: String },
    orderAmount : { type : String },
    requestedToken : { type : String},
    transactionLog : { type : Array},
    sha512 : { type : String },
    gatewayResponse : { type : Object , default : null },
    date : { type : Date , default:Date.now }
});

orderSchema.plugin(AutoIncrement, { inc_field: 'orderId',start_seq : 10000 });

const Order = mongoose.model('Order',orderSchema);

function validateOrderInput(inputobject){
    const schema = {
        "orderAmount" : Joi.number().min(20).required(),
        "transactionType" : Joi.string().required(),
        "orderDetail":Joi.string().required(),
        "token":Joi.string().required(),
    }
    return Joi.validate(inputobject,schema);
}


exports.OrderModel = Order;
exports.ValidateOrderPayload = validateOrderInput;
