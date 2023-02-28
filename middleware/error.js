const logger = require("./logger");
module.exports = function(err,req,res,next){
    // Log the exception
    
    res.status(200).send({
      "status" : "Fail",
      "statusCode" : 500,
      "response" : "Internal Server Error.",
      "exception" : err
    });
    logger.errorLog(err);

}  