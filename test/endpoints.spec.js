const knex = require('knex');
const app = require('../src/app');

let userId, gameId;

describe('Players', () => {
  let db;

  before('make knex', () => {

    db = knex({
      client: 'pg',
      connection: process.env.TEST_DATABASE_URL || 'postgresql://postgres@localhost/digi-doodle-test'
    });

    app.set('db', db);

  });


  beforeEach('clean db', () => {
    db('player').truncate();
  });

  afterEach('clean db', () => {
    db('player').truncate();
  });

  describe('POST /player', () => {

    context('no valid data', () => {
      it('should respond with a 404 error', () => {
        return supertest(app)
          .post('/api/player')
          .expect(404, '{"error":"Request must include a username"}');
      });
    });

    context('Given a valid username input', () => {

      it('returns the userId of the created username', () => {
        return supertest(app)
          .post('/api/player')
          .send({username:'testUser'})
          .set('accept', 'application/json')
          .expect(200)
          .then(res => res.body)
          .then(body => userId = body[0]);
      });
      
    });

  });

});

describe('Game', () => {
  let db;

  before('make knex', () => {

    db = knex({
      client: 'pg',
      connection: process.env.TEST_DATABASE_URL || 'postgresql://postgres@localhost/digi-doodle-test'
    });

    app.set('db', db);

  });

  after('disconnect', () => {
    db.destroy();
  });

  beforeEach('clean db', () => {
    db('game').truncate();
  });

  describe('POST /join', () => {

    context('no valid data', () => {
      it('should respond with a 404 error', () => {
        return supertest(app)
          .post('/api/game/join')
          .expect(404, '{"error":"Request must include a playerId"}');
      });
    });

    context('valid userId but not valid username', () => {

      it('shoud respond with a 404 error', () => {
        return supertest(app)
          .post('/api/game/join')
          .send({ playerId: userId })
          .expect(404, '{"error":"Request must include a username"}');   
      });

    });

    context('valid input of userId and username', () => {

      it('should return game data for the created game', () => {
        return supertest(app)
          .post('/api/game/join')
          .send({
            username: 'testUser',
            playerId: userId
          })
          .set('accept', 'application/json')
          .expect(200)
          .then(res => res.body)
          .then(body => gameId = body[0]);

      });
    });


  });

  describe('POST /test', () => {

    context('sends a 404 when checking for a winner without gameId', () => {
      return supertest(app)
        .post('/api/game/test')
        .expect(404, '{"error": "Request must include a game_id."}');
    });

    context('sends response when game checks for winner', () => {
      return supertest(app)
        .post('/api/game/test')
        .send({game_id: gameId})
        .expect(200);
    });

  });

});

