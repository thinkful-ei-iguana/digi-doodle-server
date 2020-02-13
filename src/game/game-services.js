const uuid = require('uuid');

const GameServices = {
  createGame(db) {
    const game = {
      id: uuid(),
      canvas: '',
      current_drawer: null,
      current_answer: null,
      time_limit: 6000
    };

    return db
      .insert(game)
      .into('game')
      .returning('*');
  },

  getAllGames(db) {
    return db
      .from('game')
      .select('*');
  },

  getPlayers(db, gameId) {
    return db
      .from('game_players')
      .select('*')
      .where('game_id', gameId);
  },

  getCurrentAnswer(db, gameId) {
    return db
      .from('game')
      .select('current_answer')
      .where('id', gameId);
  },

  async addGamePlayer(db, gameId, playerId, username){
    const players = await this.getPlayers(db, gameId);
    console.log(players);
    let gamePlayer;

    if (players.length < 1) {
      console.log("first player");
      gamePlayer = {
        player_id: playerId,
        username: username,
        game_id: gameId,
        score: 0,
        next_player: playerId
      };
    } else {
      console.log("second player");
      gamePlayer = {
        player_id: playerId,
        username: username,
        game_id: gameId,
        score: 0,
        next_player: players[0].next_player
      };
      await db('game_players')
        .where('player_id', players[0].player_id)
        .update({
          next_player: playerId
        });
    }
    return db
      .insert(gamePlayer)
      .into('game_players');
  },

  postGuess(db, gameId, playerId, guess) {
    let guessToPost = {
      guess: guess,
      player_id: playerId,
      game_id: gameId
    };

    return db
      .insert(guessToPost)
      .into('guesses')
      .returning('*');
  },

  deleteGame(db, gameId) {
    return db
      .from('game')
      .where('id', gameId)
      .delete();
  },

  makePlayerQueue(db,gameId){

  },

  changeGame(db, change){
    //change to database will go in here.

  }


};

module.exports = GameServices;