const express = require('express');
const PlayerServices = require('./player-services');

const PlayerRouter = express.Router();
const BodyParser = express.json();

PlayerRouter
  .use(BodyParser);

PlayerRouter
  .post('/', async (req, res, next) => {
    const userName = req.body.username;
  
    console.log(userName);
    if (!userName){
      return res.status(404).json({
        error: `No username found!`
      })
    }
    try{
      const playerId = await PlayerServices.createPlayer(
        req.app.get('db'),
        userName
      );
     
      console.log(playerId);
      res.send(playerId);
    } catch(error) {
      next(error);
    }
  })

PlayerRouter
  .delete('/:playerId', (req, res, next) => {
    console.log(req.params.playerId);
    PlayerServices.deletePlayer(req.app.get('db'), req.params.playerId)
      .then(() => 
        res.send(204)
      )
      .catch(next);
  })

module.exports = PlayerRouter;