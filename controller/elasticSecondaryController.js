var client = require('../elasticsearch/connection.js');
var axios = require("axios");

module.exports.createIndexSecondary = async (req,res)=>{

    client.index({  
        index: req.body.indexName,
        type:  req.body.indexType,
        body: {
            "refzappId": req.body.refzappId,
            "spendAmount": req.body.spendAmount,
            "productName": req.body.productName,
            "productShop": req.body.productShop,
            "productType": req.body.productType,
            "offer": req.body.offer,
            "discountAmountPercentige": req.body.discountAmountPercentige,
            "time" : new Date()
        }
      },function(err,resp,status) {
          res.send(resp);
      });

}

module.exports.getallSecondary = async (req,res)=>{

    client.search({  
        index: req.body.indexName,
        type: req.body.indexType,
        body: {
            "query": {
                "match": {
                  "refzappId": {
                    "query": req.body.searchString
                  }
                }
            }
          }
      },function (error, response,status) {
          if (error){
            console.log("search error: "+error)
          }
          else 
          {
            res.status(200).send({
                "result" : "Result",
                "records" : response
            });
          }
      });

}










