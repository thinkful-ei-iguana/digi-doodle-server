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
  .on('connection', (socket) => {
    socket.on('sendRoom', (room) => {

      socket.join(room);
      socket.emit('chat message', `joined room ${room}`);
      socket.on('guess', (guess) => {
        console.log('guess here: ', guess);
        socket.emit('chat message', `${guess}`);
      });
    });

    socket.on('chat message', (msg) => {
      io.emit('chat message', msg);
    });

  });

server.listen(PORT, function() {
  console.log(`Server listening at http://localhost:${PORT}`);
});
  