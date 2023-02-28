var client = require('./connection.js');

client.indices.delete({index: 'useraccount'},function(err,resp,status) {  
  console.log("useraccount indices delete",resp);
});

client.indices.delete({index: 'purchase'},function(err,resp,status) {  
  console.log("purchase indices delete",resp);
});