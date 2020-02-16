require('dotenv').config();
const app = require('./app');
const knex = require('knex');
const server = require('http').Server(app);
const io = require('socket.io')(server);

const { PORT, DATABASE_URL } = require('./config');


const db = knex({
  client: 'pg',
  connection: DATABASE_URL,
});

app.set('db', db);

server.listen(PORT, () => {
  console.log('Database URL:', DATABASE_URL);
  console.log(`Server listening at http://localhost:${PORT}`);
});

var chat = io
  .of('/game')
  .on('connection', (socket) => {
    socket.emit('lookie here!');
  });