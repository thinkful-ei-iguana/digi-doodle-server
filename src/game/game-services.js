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
  }
};

module.exports = GameServices;