const uuid = require('uuid');

const PlayerServices = {
  createPlayer(db, username) {
    let playerUUID = uuid();
    return db
      .insert({
        id: playerUUID,
        username: username
      })
      .into('player')
      .returning('id');
  },

  deletePlayer(db, playerId) {
    return db('player')
      .where('id', playerId)
      .delete();
  },

  checkForUsername(db, username) {
    return db
      .from('player')
      .select('*')
      .where('username', username);
  }
};

module.exports = PlayerServices;