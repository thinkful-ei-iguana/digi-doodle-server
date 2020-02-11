const uuid = require('uuid');

const PlayerServices = {
  createPlayer(db, username) {
    return db('player')
      .insert({
        id: uuid(),
        username: username
      })
      .returning('id');
  }
};

module.exports = PlayerServices;