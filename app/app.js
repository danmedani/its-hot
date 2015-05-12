var express = require('express');
var app = express();

var bodyParser = require('body-parser')
app.use(bodyParser());

var MongoClient = require('mongodb').MongoClient;

var dbConnect = function(then) { 
  MongoClient.connect('mongodb://localhost:27017/posts', then); 
}

app.get('/', function (req, res) {
  dbConnect(function (err, db) {
    var posts = db.collection('post');
    posts.find().toArray(function(err, items) {
      res.send(items);

    });
  });
});

var insertPost = function (db, inPost, then) {
  db.createCollection('post', function (err, collection) {
    var testPost = {'user': inPost.user, 'post': inPost.post};
    collection.insert(testPost, {w:1}, function(err, result) {
      if (err) {
        then('database insertion error');
      }

      if (result.result.ok && result.result.n == 1) {
        then(null, '<html><body>ayoooo</body></html>');
      } else {
        then('db insert did not work');  
      }
    });
  });
};

app.post('/', function (req, res) {
  var inPost = req.body;
  if (inPost && inPost.user && inPost.post) {
    dbConnect(function(err, db) {
      if (err) {
        res.send('database connection errror');
      }

      insertPost(db, inPost, function(err, result) {
        if (err) {
          res.send(err);
        }
        
        res.send(result);
      })
    });
  } else {
    res.send('invalid request');
  }
});

var server = app.listen(3000, function () {
 var host = server.address().address;
 var port = server.address().port;

 console.log('Damn... It is HOT');

});


