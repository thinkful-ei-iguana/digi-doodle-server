const express = require('express');
const PlayerServices = require('./player-services');

const PlayerRouter = express.Router();
const BodyParser = express.json();

PlayerRouter
  .use(BodyParser);

PlayerRouter
  .post('/', async (req, res, next) => {
    const userName = req.body.username;
  
    if (!userName){
      return res.status(404).json({
        error: 'No username found!'
      });
    }
    try{
      let uniqueCheck = await PlayerServices.checkForUsername(req.app.get('db'), userName);

      if (uniqueCheck[0] !== undefined) {
        return res.status(400).json({ error: 'Duplicate usernames are not allowed' });
      }

      const playerId = await PlayerServices.createPlayer(
        req.app.get('db'),
        userName
      );
     
      res.send(playerId);

    } catch(error) {
      next(error);
    }
  });

PlayerRouter
  .delete('/:playerId', (req, res, next) => {
    PlayerServices.deletePlayer(req.app.get('db'), req.params.playerId)
      .then(() => 
        res.send(204)
      )
      .catch(next);
  });

module.exports = PlayerRouter;