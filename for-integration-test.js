const express = require('express');
const fileUpload = require('express-fileupload');
var bodyParser = require('body-parser');

//adding router
const userRoute = require('./Route/user');
const fileRoute = require('./Route/file');
const elasticRoute = require('./Route/elastic');
const authenticationRoute = require('./Route/authentication');
const paymentRoute = require('./Route/payment');

//adding custom middleware
const logger = require('./middleware/logger');
const db = require('./controller/dbController');
var constants = require('./constants');


//add secured http header middleware
const helmet = require('helmet'); 
const morgan = require('morgan');
const config = require('config'); 
var cors = require('cors')
var path = require('path');

//For Swagger Documentation
var swaggerUi = require('swagger-ui-express');
var swaggerDocument = require('./swagger.json');

//Importing error middleware for handling Try-Catch Error
const error = require('./middleware/error');


const app = express();

//view Engine
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');



//Handling uncaught exception
process.on("uncaughtException",(ex)=>{
    console.log("Uncaught Exception Happened!");
    logger.uncaughtErrorLog(ex);
    process.exit(1);
})

process.on("unhandledRejection",(ex)=>{
    console.log("Unhandeled rejection Happened!");
    logger.unhandeledRejectionLog(ex);
    process.exit(1);
})


app.use(express.static(__dirname + '/' + config.get('app_security_image_folder')));
app.use(helmet());
app.use(fileUpload());
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(cors())
db.integrationTestConnect();



//only in dev environment
if(app.get('env') != 'production'){
    app.use(morgan('tiny'))
}



//default route
app.get('/',(req,res)=>{
    res.redirect('/api-docs');
})

  

// Route definition
app.use('/',userRoute);
app.use('/',fileRoute);
app.use('/',authenticationRoute);
app.use('/',elasticRoute);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));



app.use('/payment',paymentRoute);

app.use(error);














/***********  To run test open this***************/
const port = 5000;
const server = app.listen(port,function(){
    console.log(`App is running on ${port} Port`)
})
module.exports = server;
/**************************************************/ 
