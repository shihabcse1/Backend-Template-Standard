var client = require('./connection.js');

client.indices.create({
  index: 'useraccount'
}, function (err, resp, status) {
  if (err) {
    console.log(err);
  }
  else {
    console.log("create", resp);
  }
});

client.indices.create({
  index: 'purchase'
}, function (err, resp, status) {
  if (err) {
    console.log(err);
  }
  else {
    console.log("create", resp);
  }
});



