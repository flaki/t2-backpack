var tessel = require("tessel");
var backpack = require('backpack-ht16k33').use(tessel.port['B']);

var bitmap = [
  [0,0,1,1,1,1,0,0],
  [0,1,0,0,0,0,1,0],
  [1,0,1,0,0,1,0,1],
  [1,0,0,0,0,0,0,1],
  [1,0,1,0,0,1,0,1],
  [1,0,0,1,1,0,0,1],
  [0,1,0,0,0,0,1,0],
  [0,0,1,1,1,1,0,0],
];

var backpackready = false;
backpack.on('ready', function() {
  backpackready = true;
  backpack.clear();
});

function updateBackpack () {
  if (!backpackready) setTimeout(updateBackpack, 100);
  backpack.writeBitmap(bitmap);
}


var http = require("http");
var fs = require("fs");
var ui = fs.readFileSync("ui.html").toString();
var url = require("url");
var path = require("path");


http.createServer(function (req, res) {
  console.log("incoming: ", req.url);
  var uri = url.parse(req.url).pathname;

  if (uri === '/favicon.ico') return;
  if (uri.length>1) {
    if (uri.length<65) uri += "0".repeat(65-uri.length);
    bitmap = uri.substring(1,65).match(/.{1,8}/g).reduce(function(a,b) { a.push(b.split("").map(function(v){ return parseInt(v,10); })); return a; },[]);
    console.log(bitmap);
    updateBackpack();
  }

  res.writeHead(200, {"Content-Type": "text/html"});
  res.end(uri.length>1 ? uri : ui.replace("= window.bitmap","="+JSON.stringify(bitmap)));
}).listen(80);


/*
var WebSocketServer = require('websocket').server;
var http = require('http');

var server = http.createServer(function(request, response) {
    // process HTTP request. Since we're writing just WebSockets server
    // we don't have to implement anything.
});
server.listen(1337, function() { });

// create the server
wsServer = new WebSocketServer({
    httpServer: server
});

// WebSocket server
wsServer.on('request', function(request) {
    var connection = request.accept(null, request.origin);

    // This is the most important callback for us, we'll handle
    // all messages from users here.
    connection.on('message', function(message) {
        if (message.type === 'utf8') {
            // process WebSocket message
        }
    });

    connection.on('close', function(connection) {
        // close user connection
    });
});
*/
