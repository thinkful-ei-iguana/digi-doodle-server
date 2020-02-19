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
      socket.userId = userId;
      socket.username = username;
      socket.join(room);
    
      io.to(room).emit('chat message', `joined room ${room}`);
      const players = await GameServices.getPlayers(db, room);
      io.to(room).emit('send players', players);

      // when a player submits a guess
      socket.on('guess', async (guess) => {
        io.to(room).emit('chat response', { player: guess.player, message: guess.message });
        const isCorrect = await GameHelpers.checkGuess(db, room, guess);

        if (isCorrect) {
          const game = await GameServices.getGame(db, room);
          // give two points to drawer
          await GameHelpers.givePoint(db, room, game.current_drawer, 2);
          // give one point to guesser
          await GameHelpers.givePoint(db, room, socket.userId, 1);
          // send game with new player scores?
          const players = await GameServices.getPlayers(db, room);
          io.to(room).emit('send players', players);

          // See if a player won the game
          const isWinner = await GameHelpers.checkForWinner(db, room);

          if (isWinner) { // ends turn, populates the winner column and sends it to clients
            await GameHelpers.endTurn(db, room);
            await GameServices.updateGame(db, room, {winner: isWinner});
            const endedGame = await GameServices.getGame(db, room);
            io.to(room).emit('send game', endedGame);
          } else {
            await GameHelpers.endTurn(db, room);
            let seconds = 10;
            let interval = setInterval( async () => {
              if (seconds > 0) {
                console.log(seconds);
                io.to(room).emit('timer', seconds);
                io.to(room).emit('chat response', { player: 'Countdown!', message: `${seconds}`});
                seconds--;
              } else {
                clearInterval(interval);
                await GameHelpers.startTurn(db, room);
                const startedGameTurn = await GameServices.getGame(db, room);
                io.to(room).emit('send game', startedGameTurn);
              }
            }, 1000);
          }
        }
      });

      // submitting chat without being able to guess the answer
      socket.on('chat message', (msg) => {
        io.to(room).emit('chat message', { player: msg.player, message: msg.message });
      });

      // updating canvas
      socket.on('sketch', (data) => {
        // console.log(data.objects);
        socket.to(room).broadcast.emit('sketch return', data);
      });

      // send a game when client requests
      socket.on('get game', async () => {
        const game = await GameServices.getGame(db, room);
        io.to(room).emit('send game', game);
      });

      // starting the game
      socket.on('start check', async (msg) => {
        console.log(msg);
        const players = await GameServices.getPlayers(db, room);
        const numPlayers = players.length;
        console.log('numplayers: ', numPlayers);

        if (numPlayers === 2) {
          const game = await GameHelpers.startGame(db, room);
          io.to(room).emit('send game', game);
          let seconds = 10;
          let interval = setInterval( async () => {
            if (seconds > 0) {
              console.log(seconds);
              io.to(room).emit('timer', seconds);
              io.to(room).emit('chat response', { player: 'Countdown!', message: `${seconds}`});
              seconds--;
            } else {
              clearInterval(interval);
              await GameHelpers.startTurn(db, room);
              const startedGame = await GameServices.getGame(db, room);
              io.to(room).emit('send game', startedGame);
            }
          }, 1000);          
        }

      });

      socket.on('disconnect', async () => {
        const players = await GameServices.getPlayers(db, room);
        io.to(room).emit('send players', players);
      });


    });

  });

server.listen(PORT, function() {
  console.log(`Server listening at http://localhost:${PORT}`);
});
  