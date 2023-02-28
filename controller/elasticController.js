var client = require('../elasticsearch/connection.js');

module.exports.createIndex = async (req,res)=>{

    client.index({  
        index: req.body.indexName,
        type:  req.body.indexType,
        body: {
            "zappId": req.body.zappId,
            "email": req.body.email,
            "contact": req.body.contact,
            "address": req.body.address,
            "userName": req.body.userName,
            "walletAmount": req.body.walletAmount,
            "country": req.body.country,
            "time" : new Date()
        }
      },function(err,resp,status) {
          res.send(resp);
      });

}

module.exports.deleteIndex = async (req,res)=>{

    client.delete({  
        index: req.body.indexName,
        id: req.body.id,
        type: req.body.indexType
      },function(err,resp,status) 
      {
        res.send(resp);
      });

}

module.exports.searchIndex = async (req,res) =>{
    client.search({  
        index: req.body.indexName,
        type: req.body.indexType,
        body: {
            query: {  
                "match_all": {}
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

module.exports.searchIndexFilter = (req,res) =>{
    client.search({  
        index: req.body.indexName,
        type: req.body.indexType,
        body: {
            "query": {
                "match": {
                  "deviceName": {
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

