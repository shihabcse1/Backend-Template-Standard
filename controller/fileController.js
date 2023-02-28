var path = require('path');
const fs = require('fs');
const config = require('config'); 
var rimraf = require("rimraf");
const asyncMiddleware = require('../middleware/async');


const directoryPath = path.join(__dirname, '../'+config.get('app_security_image_folder'));



module.exports.SecurityImageGet = asyncMiddleware(async(req,res)=>{

    fs.readdir(directoryPath, async function (err, files) {
        //handling error
        if (err) {
            return console.log('Unable to scan directory: ' + err);
        } 
        //generate random number between 1 to files.length
        var tempArray = [];
        var jsonArray = [];
        
        for(var i=0;i<=files.length;i++)
        {
          var random = await randomIntFromInterval(1,files.length);
          if(tempArray.indexOf(random) === -1 && tempArray.length <= (Number(config.get('app_security_image_serve')) -1 ) )
          {
            tempArray.push(random);
            jsonArray.push({ "id" : random, "iamgePath" : "/"+random+ "/" + "border.png", "url" : config.get('app_base_url')+"/"+random+ "/" + "border.png"});
          }
          if(tempArray.length === Number(config.get('app_security_image_serve')))
          {
            res.status(200).send({
                "count" : jsonArray.length,
                "data" :{
                    message : jsonArray
                 }
            });
            return;   
          }
        }

    });


})

module.exports.SecurityImageAdd = asyncMiddleware(async(req,res)=>{

  fs.readdir(directoryPath, function (err, files) {
    if (err) {
        return console.log('Unable to scan directory: ' + err);
    } 

    var largest = files[0];
    for (var i = 0; i < files.length; i++) {
        if (largest < parseInt(files[i] )) {
            largest = parseInt(files[i]);
        }
    }

    var folderName = largest + 1;
    if (!fs.existsSync(directoryPath+"/"+folderName)){
        
        fs.mkdirSync(directoryPath+"/"+folderName);

        if (!req.files || Object.keys(req.files).length === 0) {
          return res.status(400).send('No files were uploaded.');
        }   
        let singleFile = req.files.file;
        //file is being renamed and uploaded
        singleFile.mv(directoryPath+"/"+folderName+"/border.png", function(err) {
          if (err){
            return res.status(200).send(
              {
              "status" : "failed",
              "statusCode" : 500,  
              "message" : "Failed to upload!"
            });
          }
          else
          {
            return res.status(200).send(
              {
              "status" : "success",
              "statusCode" : 200,  
              "message" : "File uploaded successfully"
            });
          }
              
        });
    }

  });
  
})

module.exports.SecurityImageDelete = asyncMiddleware(async(req,res)=>{
 
  // directory path
  const dir = directoryPath+'/'+req.body.deleteId;
  rimraf(dir, function (err) { 
    if(err)
    {
      return res.status(200).send(
        {
        "status" : "failed",
        "statusCode" : 500,  
        "message" : "Icon resource can't remove! Please try again."
      });
    }
    else
    {
      return res.status(200).send(
        {
        "status" : "success",
        "statusCode" : 200,  
        "message" : "Icon resource has been removed"
      });
    }
  });

});


module.exports.SecurityImageGetAll = asyncMiddleware(async(req,res)=>{
  fs.readdir(directoryPath, async function (err, files) {
      //handling error
      if (err) {
          return console.log('Unable to scan directory: ' + err);
      } 
      var jsonArray = [];
      for(var i=0;i<files.length;i++)
      {
        jsonArray.push({ "id" : files[i], "iamgePath" : "/"+files[i]+ "/" + "border.png", "url" : config.get('app_base_url')+"/"+files[i]+ "/" + "border.png"});
      }
      
      return res.status(200).send({
        "count" : jsonArray.length,
        "data" :{
            message : jsonArray
         }
      });
        

  });


});


async function randomIntFromInterval(min, max) 
{ 
    return Math.floor(Math.random() * (max - min + 1) + min);
}





