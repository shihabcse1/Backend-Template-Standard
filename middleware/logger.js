const winston = require('winston');
require('winston-daily-rotate-file');
require('winston-mongodb');
const config = require('config'); 

module.exports.errorLog = async (messagelog) =>{

    /*
     * This code block is for saving error log to Remote mongodb
     */
    var transport = new winston.transports.MongoDB({
        db: 'mongodb://'+config.get('mongoUrl')+'/'+config.get('database'),
        level : 'info'
    });

    var logger = winston.createLogger({
        transports: [
        transport
        ]
    });

    logger.info(messagelog);      
  }

  module.exports.dbErrorLog = async (messagelog) =>{
    
    /*
     * This code block is for saving error log to local file 
     */
     
    var transport = new winston.transports.DailyRotateFile({
        filename: 'logs/log.%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '2'
    });


    var logger = winston.createLogger({
        transports: [
        transport
        ]
    });

    logger.info(messagelog);      
  }


  module.exports.uncaughtErrorLog = async (messagelog) =>{
    
    /*
     * This code block is for saving error log to local file 
     */
     
    var transport = new winston.transports.DailyRotateFile({
        filename: 'logs/uncaughtErrorlog.%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '2'
    });


    var logger = winston.createLogger({
        transports: [
        transport
        ]
    });

    logger.info(messagelog);      
  }


  module.exports.unhandeledRejectionLog = async (messagelog) =>{
    
    /*
     * This code block is for saving error log to local file 
     */
     
    var transport = new winston.transports.DailyRotateFile({
        filename: 'logs/unhandeledRejectionLog.%DATE%.log',
        datePattern: 'YYYY-MM-DD',
        zippedArchive: true,
        maxSize: '20m',
        maxFiles: '2'
    });


    var logger = winston.createLogger({
        transports: [
        transport
        ]
    });

    logger.info(messagelog);      
  }


