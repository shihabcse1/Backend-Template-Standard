var client = require('./connection.js');

//Checking Health
client.cluster.health({},function(err,resp,status) {  
  console.log("-- Client Health --",resp);
});


//Checking count of docs
client.count({index: 'purchase', type: 'constituencies'},function(err,resp,status) {  
  console.log("constituencies",resp);
});