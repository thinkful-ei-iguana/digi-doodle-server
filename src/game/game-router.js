const express = require('express');
const GameServices = require('./game-services');

const GameRouter = express.Router();
const BodyParser = express.json();

GameRouter
  .use(BodyParser);

GameRouter
  .route('/')
  .get(async (req, res, next) => {
    try{
      const allGames = await GameServices.getAllGames(req.app.get('db'));

      if (!allGames) 
        return res.status(404).json({
          error: 'No games found. Start a new game!'
        });
      
      res.send(allGames);
    } catch(error) {
      next(error);
    }
  })
  .post(async (req, res, next) => {
    try{
      const game = await GameServices.createGame(req.app.get('db'));

      if (!game)
        return res.status(404).json({
          error: 'No game found!'
        });
      res.send(game);
    } catch(error) {
      next(error);
    }
  });

GameRouter
  .post('/guess', async (req, res, next) => {
    const { gameId, playerId, guess } = req.body;

    try{
      const guessRes = await GameServices.postGuess(req.app.get('db'), gameId, playerId, guess);

      res.send(guessRes);

    } catch(error) {
      next(error);
    }
  });

GameRouter
  .route('/:gameId/player')
  .get(async (req, res, next) => {
    let id = req.params.gameId;
    console.log(id);
    try{
      const scores = await GameServices.getPlayers(req.app.get('db'), id);
      if(!scores){
        return res.status(404).json({
          error: 'There appear to be no players in this game.'
        });
      }
      console.log(scores);
      res.send(scores);

    } catch(error) {
      next(error);
    }
  });
GameRouter
  .route('/:gameId/join')
  .post(async (req, res, next) => {
    const { playerId } = req.body;
    const id = req.params.gameId;

    try{
      await GameServices.addGamePlayer(req.app.get('db'), id, playerId);

      res.send(204).end();
    } catch(error) {
      next(error);
    }
  });

GameRouter
  .route('/:gameId')
  .patch(async (req, res, next) => {
    //get next player
    //get next word
    const change = req.body;

    try {
      const changedGame = await GameServices.changeGame(req.app.get('db'), change);
      if(!changedGame){
        return res.status(400).json({
          error: 'Something when wrong when changing the game.'
        });
      }

      res.send(changedGame);
    } catch(error) {
      next(error);
    }
  })
  .delete(async (req, res, next) => {
    let id = req.params.gameId;
    try {

      await GameServices.deleteGame(req.app.get('db'), id);
      
      res.send(204).end();
    } catch(error) {
      next(error);
    }
  });

module.exports = GameRouter;