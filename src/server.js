require('dotenv').config();
const app = require('./app');
const knex = require('knex');
const http = require('http');
const server = http.createServer(app);
const io = require('socket.io')(server);
const { PORT, DATABASE_URL } = require('./config');


const db = knex({
  client: 'pg',
  connection: DATABASE_URL,
});

app.set('db', db);

io
  .on('connection', (socket) => {
    socket.on('sendRoom', (room) => {

      socket.join(room);
      io.to(room).emit('chat message', `joined room ${room}`);

      socket.on('guess', (guess) => {
        
        console.log('guess here: ', guess);
        
        io.to(room).emit('chat response', { player: guess.player, message: guess.message });
        //function to check guess?
        socket.emit('announcement', `got it correct. it's a ${guess}`);

      });

      socket.on('sketch', (data) => {
        console.log(data.objects);
        io.to(room).emit('sketch', data);
      });
    });

    socket.on('chat message', (msg) => {
      io.emit('chat message', msg);
    });

  });



server.listen(PORT, function() {
  console.log(`Server listening at http://localhost:${PORT}`);
});
  