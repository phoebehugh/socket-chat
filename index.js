var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var users = {};

http.listen(4000, function(){
  console.log('Listening on Port 4000');
});

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});  

io.on('connection', function(socket){
  console.log('a user connected');
  socket.on('new user', function(data, callback) {
    if (data in users) {
      callback(false);
    } else{
      callback(true);
      socket.username = data;
      users[socket.username] = socket;
      updateUsernames();
    }
  });

  function updateUsernames() {
    io.emit('usernames', Object.keys(users));
  };

  socket.on('send message', function(data, callback){
    var msg = data.trim();
    if(msg.substr(0,3) === '/w '){
      msg = msg.substr(3);
      var ind = msg.indexOf(' ');
      if(ind !== -1){
        var name = msg.substring(0, ind);
        var msg = msg.substring(ind + 1);
        if(name in users){
          users[name].emit('private message', {msg: msg, user: socket.username});
          console.log('Whisper');
        } else{
          callback('Error, enter a valid user');
        }
      } else{
        callback('Error! Please enter whisper message')
      } 
    } else{
        io.emit('new message', {msg: msg, user: socket.username});
      }
  });

  socket.on('disconnect', function(data) {
    if(!socket.username) return;
    delete users[socket.username]
    updateUsernames();
  });
});
