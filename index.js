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

//Kafka-Redis 
var kafka = require('kafka-node');
var redis = require('redis');
var Producer = kafka.Producer;
var client   = new kafka.KafkaClient();
var producer = new Producer(client);


const app = express();

//view Engine
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');


var http = require('http').Server(app);
var io = require('socket.io')(http);
var clientRedis = redis.createClient(6379, 'localhost', {no_ready_check: true});

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

//Variable declaration
var userPool = [];
var userPoolTemp = [];

app.use(express.static(__dirname + '/' + config.get('app_security_image_folder')));
app.use(helmet());
app.use(fileUpload());
app.use(express.json());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(cors())
db.connect();



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

app.get('/chat-window', function (req, res) {
    res.sendfile('client.html');
});

app.use('/payment',paymentRoute);

app.use(error);


/*-------------------------------------Producer--------------------------------*/
producer.on('ready', function () {
  producer.createTopics([
    constants.TOPIC_CHAT
  ], false, function (err, data) {
    if (err) { console.log(err) }
  });
  console.log('Kafka client is ready');
});

producer.on('error', function (err) {
  console.log('Kafka client is in an error state: ');
});



/*-----------------------------------Socket---------------------------*/

io.on('connection', socket => {
  socket.on("new-user", userId => {
    userPool[socket.id] = userId;
    userPoolTemp.push({
      "socketId": socket.id,
      "userId": userId
    })
  })

  socket.on('disconnect', function () {
    for (var i = 0; i < userPoolTemp.length; i++) {
      if (userPoolTemp[i]["socketId"] === socket.id) {
        userPoolTemp.splice(i, 1);;
      }
    }
    delete userPool[socket.id];
  });

  socket.on("send-message", data => {
    var isOnline = false;
    for (var i = 0; i < userPoolTemp.length; i++) {
      if (userPoolTemp[i]["userId"] === data.receiver) {
        var receiverSocketId = userPoolTemp[i].socketId;
        isOnline = true;
      }
    }
    var messageBody = {};
    if (isOnline === true) {
      messageBody = {
        "message": data.message,
        "receiver": data.receiver, //Unique Identity
        "from": data.from,
        "datetime": new Date(),
        "online": isOnline,
        "receiverSocketId": receiverSocketId, //For Instant message
        "isGroup": false
      }
    }
    else {
      messageBody = {
        "message": data.message,
        "receiver": data.receiver,  //Unique Identity
        "from": data.from,
        "datetime": new Date(),
        "online": isOnline,
        "receiverSocketId": "n/a",  //Sign for saving data to remote storage
        "isGroup": false
      }
    }



    var msg = JSON.stringify(messageBody);

    payloads = [{ topic: constants.TOPIC_CHAT, messages: msg, partition: 0 }];
    producer.send(payloads, function (err, data) {
      console.log("Producer received the pay load!");
    });

  })


  //Join Group socket connection  ==>tomorrow
  var groupInfo = ["Sales-Work", "IT-Work", "Markating-Work"];
  socket.on("join-group", data => {
    if (groupInfo.indexOf(data.groupName) !== -1) {
      socket.join(data.groupName);
      console.log(data.memberName + 'joined the room:' + data.groupName);
      io.sockets.to(socket.id).emit('joined-notification', "Successfully joined!");
    }
  })

  socket.on("user-image-send", data => {
    var isOnline = false;
    for (var i = 0; i < userPoolTemp.length; i++) {
      if (userPoolTemp[i]["userId"] === data.receiver) {
        var receiverSocketId = userPoolTemp[i].socketId;
        isOnline = true;
      }
    }
    var messageBody = {};
    if (isOnline === true) {
      messageBody = {
        "message": data.message,
        "receiver": data.receiver, //Unique Identity
        "from": data.from,
        "datetime": new Date(),
        "online": isOnline,
        "receiverSocketId": receiverSocketId, //For Instant message
        "isGroup": false,
        "isImage" : true
      }
    }
    else {
      messageBody = {
        "message": data.message,
        "receiver": data.receiver,  //Unique Identity
        "from": data.from,
        "datetime": new Date(),
        "online": isOnline,
        "receiverSocketId": "n/a",  //Sign for saving data to remote storage
        "isGroup": false,
        "isImage" : true
      }
    }



    var msg = JSON.stringify(messageBody);

    payloads = [{ topic: constants.TOPIC_CHAT, messages: msg, partition: 0 }];
    producer.send(payloads, function (err, data) {
      console.log("Producer received the pay load!");
    });

  })


  socket.on("send-message-group", data => {
    var messageBody = {};
    messageBody = {
      "message": data.messageGroup,
      "receiver": data.receiverGroup,
      "from": data.from,
      "datetime": new Date(),
      "isGroup": true
    }

    var msg = JSON.stringify(messageBody);
    payloads = [{ topic: constants.TOPIC_CHAT, messages: msg, partition: 0 }];
    
    producer.send(payloads, function (err, data) {
      console.log("Producer received the pay load for Group chat!");
    });


    //If not to use Kafka
    //io.to(messageBody.receiver).emit('Send-to-group', messageBody);

  })


  socket.on("user-image-send-group", data => {
    var messageBody = {};
    messageBody = {
      "message": data.message,
      "receiver": data.receiver,
      "from": data.from,
      "datetime": new Date(),
      "isGroup": true,
      "isImage" : true
    }

    var msg = JSON.stringify(messageBody);
    payloads = [{ topic: constants.TOPIC_CHAT, messages: msg, partition: 0 }];
    
    producer.send(payloads, function (err, data) {
      console.log("Producer received the pay load for Group chat!");
    });


    //If not to use Kafka
    //io.to(messageBody.receiver).emit('Send-to-group', messageBody);

  })


  //missing message getting from redis
  socket.on("missed-message", (userId)=>{

    console.log(userPool)
    console.log(userPoolTemp)
    console.log("requester socket id : " + socket.id)

    clientRedis.send_command("SCAN", [0,"MATCH", userId+":*" ], function(err, reply) {
      for (var i = 0; i < reply.length; i++) 
      {
          for(var j=0;j<reply[i].length;j++)
          {
            
            var key = reply[i][j];
            clientRedis.hgetall(reply[i][j], function(err, object) {
              console.log(object);
              io.sockets.to(socket.id).emit('sending-missed-message', object);
              clientRedis.del(key);
            });
            
          }
      }
  
   });



  })


});


/*-----------------------------------------Redis------------------------------------------*/
clientRedis.on('error', function (err) {
  console.log('Error ' + err);
}); 

clientRedis.on('connect', function() {
  console.log('Connected to Redis');
});



/*-----------------------------------------Consumer---------------------------------------*/

setTimeout(function () {
  var Consumer = kafka.Consumer;
  var Offset = kafka.Offset;
  var topic = constants.TOPIC_CHAT;

  var client = new kafka.KafkaClient('localhost:2181');//'localhost:2181'
  var topics = [{ topic: topic, partition: 0 }];
  var options = { autoCommit: false };//, fetchMaxWaitMs: 1000, fetchMaxBytes: 1024 * 1024

  var consumer = new Consumer(client, topics, options);
  var offset = new Offset(client);


  consumer.on('message', function (message) {
    var msgMakeStr = message.value;
    var msg = JSON.parse(msgMakeStr);
    var messageBody = {};
    if (msg.isGroup === true) //For Group Message
    {
      messageBody = {
        "message": msg.message,
        "receiver": msg.receiver,
        "from": msg.from,
        "datetime": msg.datetime,
        "isGroup": msg.isGroup,
      }
    }
    else  // For one to one message 
    {
      messageBody = {
        "message": msg.message,
        "receiver": msg.receiver,
        "from": msg.from,
        "datetime": msg.datetime,
        "isGroup": msg.isGroup,
        "online": msg.online,
        "receiverSocketId": msg.receiverSocketId
      }

    }


    if (messageBody.isGroup === true) 
    { 
      if(msg.isImage === true)
      {
        io.sockets.to(messageBody.receiver).emit('Send-to-group', msg);
      }
      else
      {
        io.sockets.to(messageBody.receiver).emit('Send-to-group', messageBody);
      }
      
    }

    if (messageBody.isGroup === false) {
      if (messageBody.online === true) {
        if(msg.isImage === true)
        {
          io.sockets.to(messageBody.receiverSocketId).emit("message-receive-img", msg);
        }
        else
        {
          io.sockets.to(messageBody.receiverSocketId).emit("message-receive", messageBody);
        }
        
      }
      else 
      {
        //console.log("Not sending msg.storing in kafka.")
        clientRedis.hmset(msg.receiver+":"+msg.datetime , msg);
        
      }

    }

    //console.log("data received to Kafka end!");

  });

  consumer.on('error', function (err) {
    console.log('error', err);
  });
  consumer.on('offsetOutOfRange', function (topic) {
    topic.maxNum = 2;
    offset.fetch([topic], function (err, offsets) {
      if (err) {
        return console.error(err);
      }
      var min = Math.min.apply(null, offsets[topic.topic][topic.partition]);
      consumer.setOffset(topic.topic, topic.partition, min);
    });
  });



}, 1000);



//starting server
/*
set PORT=ANY EMPTY PORT
*/
const port = process.env.PORT || 4000;
/* Chat & Zapplite backend Both at a time  on the same port */
http.listen(port, function () {
    console.log(`App is running on ${port} Port`)
});


/***********  To run test open this***************
const server = app.listen(port,function(){
    console.log(`App is running on ${port} Port`)
})
module.exports = server;
**************************************************/ 
