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

module.exports = PlayerRouter;