var express = require('express');
var app = express();

app.get('/', function (req, res) {
 res.send('IT IS HOT');
});

app.post('/', function (req, res) {
 res.send('YOU JUST POSTED');
});

var server = app.listen(3000, function () {
 var host = server.address().address;
 var port = server.address().port;

 console.log('Damn... It is HOT');

});

