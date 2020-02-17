require('dotenv').config();
const app = require('./app');
const knex = require('knex');
const io = require('socket.io');
const http = require('http');
const server = http.createServer(app);
const { PORT, DATABASE_URL } = require('./config');


const db = knex({
  client: 'pg',
  connection: DATABASE_URL,
});

app.set('db', db);

io(server)
  .of('/socket/')
  .on('connection', (socket) => {
    // console.log('socket appears to be working');

    var room = socket.handshake['query']['gameId'];
    console.log(socket.handshake);

    socket.join(room);
    console.log('socket after join: ', socket);
    console.log('user joined room ' + room);
    
    socket.on('disconnect', () => {
      socket.leave(room);
      console.log('user disconnected');
    });

    socket.on('chat message', (msg) => {
      io(server).to(room).emit('chat message: ', msg);
    });

  });

server.listen(PORT, function() {
  console.log(`Server listening at http://localhost:${PORT}`);
});
  