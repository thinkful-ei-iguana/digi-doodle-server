const uuid = require('uuid');

const GameServices = {
  createGame(db, player_id) {
    const game = {
      id: uuid(),
      canvas: '',
      current_drawer: null,
      current_answer: null,
      time_limit: 6000
    };

    return db('game')
      .insert(game)
      .returning('*');
  }
};

module.exports = GameServices;