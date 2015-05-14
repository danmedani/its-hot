var express = require('express')
var app = express()
var moment = require('moment')

app.set('view engine', 'ejs')

var bodyParser = require('body-parser')
app.use(bodyParser())

var MongoClient = require('mongodb').MongoClient

var dbConnect = function(then) { 
  MongoClient.connect('mongodb://localhost:27017/posts', then) 
}

var getRenderedPosts = function(then) {
  dbConnect(function (err, db) {
    var posts = db.collection('post')
    var retPosts = []
    posts.find().sort({ moment: -1 }).toArray(function(err, items) {
      var numToShow = 6
      if (items.length < 6) {
        numToShow = items.length
      }
      for (var i = 0; i < numToShow; i ++) {
        items[i].style = 'font-size:' + (400 - (i * 70)) + '%;color:' + randomHexColor()
        retPosts.push(items[i])
      }
      then(retPosts)
    })
  })
}

var randomHexColor = function() {
  return '#'+Math.floor(Math.random()*16777215).toString(16);
}

app.get('/', function (req, res) {
  getRenderedPosts(function(renderedItems) {
    res.render('layout', { posts: renderedItems, bgColor: "#66F0A8" })
  })
})

var insertPost = function (db, inPost, then) {
  db.createCollection('post', function (err, collection) {
    var testPost = {'user': inPost.user, 'post': inPost.post, 'moment': moment()}
    collection.insert(testPost, {w:1}, function(err, result) {
      if (err) {
        then('database insertion error')
      }

      if (result.result.ok && result.result.n == 1) {
        then(null)
      } else {
        then('db insert did not work')  
      }
    })
  })
}

app.post('/', function (req, res) {
  var inPost = req.body
  if (inPost && inPost.user) {
    dbConnect(function(err, db) {
      if (err) res.send('database connection errror')

      insertPost(db, inPost, function(err) {
        if (err) res.send(err)
        
        getRenderedPosts(function(renderedItems) {
          res.render('layout', { posts: renderedItems, bgColor: "#66F0A8" })
        })
      })
    })
  } else {
    res.send('invalid request')
  }
})

var server = app.listen(8080, function () {
 var host = server.address().address
 var port = server.address().port

 console.log('Damn... It is HOT')

})

