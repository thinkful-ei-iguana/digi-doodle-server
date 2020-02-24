require('dotenv').config();
const app = require('./app');
const knex = require('knex');
const http = require('http');
const server = http.createServer(app);
const io = require('socket.io')(server);
const { PORT, DATABASE_URL } = require('./config');
const GameServices = require('./game/game-services');
const GameHelpers = require('./game/game-helpers');


const db = knex({
  client: 'pg',
  connection: DATABASE_URL,
});

app.set('db', db);

io
  .on('connection', (socket) => {
    
    socket.on('sendRoom', async (data) => {
      const {gameId, userId, username} = data;
      const room = gameId;
      
      socket.join(room);
      io.to(room).emit('chat message', `${username} joined room ${room}`);
      GameHelpers.sendPlayers(db, io, room);
      GameHelpers.sendGame(db, io, room);      

      // test function


      // when a player submits a guess
      socket.on('guess', async (guess) => {
        io.to(room).emit('chat response', { player: guess.player, message: guess.message });

        const isCorrect = await GameHelpers.checkGuess(db, room, guess.message);

        if (isCorrect) {
          const game = await GameServices.getGame(db, room);
          // give two points to drawer, and one point to guesser
          await GameHelpers.givePoint(db, room, game[0].current_drawer, 2);
          await GameHelpers.givePoint(db, room, userId, 1);
          const players = await GameHelpers.sendPlayers(db, io, room);

          // notify players of point assignment in chat
          const drawer = players.filter(p => p.player_id === game[0].current_drawer)[0].username;
          io.to(room).emit('chat response', { player: 'Lobby', message: `${drawer} gets two points for drawing.` });
          io.to(room).emit('chat response', { player: 'Lobby', message: `${guess.player} gets one point for guessing correctly.` });

          // Captures the winner if someone won
          const winner = await GameHelpers.checkForWinner(db, room);

          if (winner) { 
            // ends turn, populates the winner column and sends it to clients
            GameHelpers.endGame(db, io, room, winner);            
          } else { 
            //ends turn 
            await GameHelpers.endTurn(db, room);
            await GameHelpers.startStandby(db, io, room, guess);
          }
        }
      });

      // submitting chat without being able to guess the answer
      socket.on('chat message', (msg) => {
        io.to(room).emit('chat message', { player: msg.player, message: msg.message });
      });

      // updating canvas
      socket.on('sketch', (data) => {
        socket.to(room).broadcast.emit('sketch return', data);
      });

      // send a game when client requests
      socket.on('get game', async () => {
        GameHelpers.sendGame(db, io, room);
      });

      // starting the game
      socket.on('start check', async () => {
        const players = await GameServices.getPlayers(db, room);
        const numPlayers = players.length;
        const game = await GameServices.getGame(db, room);

        if (numPlayers >= 2 && game[0].status === 'waiting for players') {
          await GameHelpers.startGame(db, io, room);
        }

      });

      socket.on('disconnect', async () => {

        let players =  io.of('/').in(room).clients(async(error, clients) => {
          if (clients.length === 0) {
            console.log('deleting game');
            await GameHelpers.endGame(db, io, room, null);
          }
          console.log(clients);
          return clients;
        });

      });


    });

  });

server.listen(PORT, function() {
  console.log(`Server listening at http://localhost:${PORT}`);
});
