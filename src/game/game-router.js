const express = require('express');
const GameServices = require('./game-services');

const GameRouter = express.Router();
const BodyParser = express.json();

GameRouter
  .use(BodyParser);

GameRouter
  .post('/', async (req, res, next) => {
    try{
        const game = await GameServices.createGame(req.app.get('db'))

      if (!game)
      return res.status(404).json({
        error: `No game found!`
      })
      res.send(game);
    } catch(error) {
      next(error)
    }
  });

  module.exports = GameRouter;