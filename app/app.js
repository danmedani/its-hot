var express = require('express')
var app = express()
var moment = require('moment')

var fs = require("fs")
var http = require("http")
var ws = require("nodejs-websocket")

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

http.createServer(function (req, res) {
  fs.createReadStream("views/index2.html").pipe(res)
}).listen(8080)

var numConnections = 0

var server = ws.createServer(function (connection) {
  connection.on("text", function (str) {
    var packet = JSON.parse(str);
    console.log(packet)

    if (packet.connect) {
      numConnections ++
      getRenderedPosts(function(renderedItems) {
        broadcast({posts: renderedItems, userCount: numConnections})
      }) 
    } else if (packet.user && packet.post) {
      dbConnect(function(err, db) {
        if (err) return
        insertPost(db, packet, function(err) {
          if (err) return

          getRenderedPosts(function(renderedItems) {
            broadcast({posts: renderedItems})
          })          
        })
      })
    }
  })
  connection.on("close", function () {
    numConnections --
    broadcast({userCount: numConnections})
  })
})
server.listen(8081)

function broadcast(packet) {
  server.connections.forEach(function (connection) {
    connection.sendText(JSON.stringify(packet))
  })
}





