var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var usernames = [];

http.listen(3000, function(){
  console.log('Listening on Port 3000');
});

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});  

io.on('connection', function(socket){
  console.log('a user connected');
  
  socket.on('new user', function(data, callback) {
    if (usernames.indexOf(data) != -1){
      callback(false);
    } else{
      callback(true);
      socket.username = data;
      usernames.push(socket.username);
      io.emit('usernames', usernames);
    }
  });

  socket.on('send message', function(msg){
    console.log('message: ' + msg);
    io.emit('send message', msg);
  });
});
