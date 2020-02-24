const GameServices = require('./game-services');
const PromptServices = require('../prompt/prompt-services');

const GameHelpers = {
  async startGame(db, io, gameId) {
    const players = await GameServices.getPlayers(db, gameId);
    
    const index = Math.floor(Math.random() * players.length);
    const firstDrawer = players[index].player_id;
    
    await GameServices.updateGame(db, gameId, {
      status: 'standby',
      current_drawer: firstDrawer
    });

    this.sendGame(db, io, gameId);

    const seconds = 10;
    this.useTimer(db, io, gameId, seconds, async () => {
      io.to(gameId).emit('clear canvas', 'do it');
      await this.startTurn(db, io, gameId);
      this.sendGame(db, io, gameId);
    });
  },

  async startTurn(db, io, gameId) {
    const prompt = await PromptServices.getRandomPrompt(db);
    await GameServices.updateGame(db, gameId, {
      status: 'drawing',
      current_answer: prompt[0].prompt
    });

    const seconds = 60;
    this.useTimer(db, io, gameId, seconds, async() => {
      await this.endTurn(db, gameId);
      await this.startStandby(db, io, gameId);
    });
  },

  async endTurn(db, gameId) {
    const game = await GameServices.getGame(db, gameId);
    const players = await GameServices.getPlayers(db, gameId);
    
    //add check to get current players

    const currentDrawer = players.filter(p => p.player_id === game[0].current_drawer);
    const nextDrawer = currentDrawer[0].next_player;
    
    await GameServices.updateGame(db, gameId, {
      status: 'standby', 
      current_drawer: nextDrawer,
    });
  },

  async startStandby(db, io, gameId, guess) {
    const room = gameId;
    let game = await GameServices.getGame(db, gameId);
    game = game[0];

    await GameHelpers.sendGame(db, io, gameId);
    if (guess) {
      io.to(room).emit('results', `${guess.player} guessed correctly with ${guess.message}`);
    } else {
      io.to(room).emit('results', `The answer was ${game.current_answer}`);
    }
    await this.wait(6);
    io.to(room).emit('results', null);
    io.to(room).emit('clear canvas', 'do it');
    await GameServices.updateGame(db, gameId, {
      current_answer: null, 
    });
    
    let seconds = 5;
    this.useTimer(db, io, room, seconds, async () => {
      await this.startTurn(db, io, room);
      this.sendGame(db, io, gameId);
    });
  },

  async checkGuess(db, gameId, guess) { 
    let answer = await GameServices.getGame(db, gameId);
    answer = answer[0].current_answer;
    if (guess.toLowerCase().trim() === answer.toLowerCase().trim()) {
      return true;
    } else {
      return false;
    }
  },

  async givePoint(db, gameId, playerId, numOfPoints) {
    const player = 
      await db('game_players')
        .where({
          game_id: gameId,
          player_id: playerId
        })
        .select('score');
    const score = player[0].score;

    await db('game_players')
      .where({
        game_id: gameId,
        player_id: playerId
      })
      .update('score', score + numOfPoints);
  },

  async checkForWinner(db, gameId) {
    // gets players from database and checks to see
    // if any score is over 15. If there is one, that player is the winner.
    // in cases of two players over 15 points the higher score wins.
    // If there is a tie, both players win.

    const players = await GameServices.getPlayers(db, gameId);
    let highestScore = Math.max(...players.map(p => p.score));
    const winningPlayers = players.filter(p => p.score === highestScore).map(e => e.username);
    if (winningPlayers.length === 0 || highestScore < 15) {
      return false;
    } else {
      return winningPlayers.join(' and ');
    }
  },

  async wait(seconds) {
    return new Promise(res => setTimeout(res, seconds * 1000));
  },

  async useTimer(db, io, room, seconds, func) {
    const orgGame = await GameServices.getGame(db, room);
    const orgStatus = orgGame[0].status;

    io.to(room).emit('timer', seconds--); // first second without delay

    let interval = setInterval(async () => {
      io.to(room).emit('timer', seconds);

      //if status changes, cancels interval
      const currentGame = await GameServices.getGame(db, room);
      if (!currentGame) clearInterval(interval);
      const currentStatus = currentGame[0].status;
      if (currentStatus !== orgStatus || currentGame[0].winner) {
        clearInterval(interval);
      }
      if (seconds > 0) {
        seconds--;
      } else {
        clearInterval(interval);
        func();
      }
    }, 1000);
    return interval;
  },

  async con(io, room, msg) {
    await io.to(room).emit('con', msg);
  },
  
  async sendPlayers(db, io, room) {
    const players = await GameServices.getPlayers(db, room);
    io.to(room).emit('send players', players);
    return players;
  },

  async endGame(db, io, gameId, winner) {
    await this.endTurn(db, gameId);
    await GameServices.updateGame(db, gameId, {winner: winner});
    await this.sendGame(db, io, gameId);
    await this.wait(5);
    let playerIds = await GameServices.getPlayerIds(db, gameId);
    await GameServices.deleteGame(db, gameId);
    playerIds.forEach(async(playerId) => await GameServices.deletePlayer(db, playerId.player_id));
  },

  async sendGame(db, io, gameId) {
    const game = await GameServices.getGame(db, gameId);
    io.to(gameId).emit('send game', game);
  }
};

module.exports = GameHelpers;