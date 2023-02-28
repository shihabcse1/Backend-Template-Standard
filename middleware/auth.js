const jwt = require('jsonwebtoken');
const config = require('config');
function verifytoken(req,res,next){
    /* 
       apply jwt token based on default configaration
       Configaration file location:
       Environment = "Development" => config/development.json
       Environment = ""            => config/default.json
    */   
    if(config.get('app_authentication'))
    {
        const jwtToken = req.headers['x-access-token'];
        if(!jwtToken) return res.status(401).send({"response" : "No Token Found!"});
        try
        {
            const extractedData = jwt.verify(jwtToken,config.get('app_jwttoken'));
            if(extractedData.loggedInUser)
            {
                //saving verified jwt in local memory to use next
                res.locals.user = extractedData.loggedInUser.zappId;
                next();
            }
        }
        catch(e)
        {
            res.status(400).send({
                "response" : "Invalid Token"
            })
        }        
    }
    else
    {
        //
        res.locals.user = "db-operation-required";
        next();
    }

    
}

module.exports = verifytoken;   