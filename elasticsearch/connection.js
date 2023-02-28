var elasticsearch=require('elasticsearch');
const config = require('config');

var client = new elasticsearch.Client( {  
  hosts: [
    ''+config.get('app_elasticServer')
  ]
});

module.exports = client;  