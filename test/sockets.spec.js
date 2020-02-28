const should = require('should');
const io = require('socket.io-client');


const socketURL = 'http://localhost:8000';

const options = {
  transports: ['websocket'],
  'force new connection': true
};


describe('websocket', () => {
  let player0, player1, player2;

  before( () => {
    player0 = io.connect(socketURL, options);
    player1 = io.connect(socketURL, options);
    player2 = io.connect(socketURL, options);
  });


  it('sends a chat response when a player connects and joins a room', () => {

    player0.emit('sendRoom', {gameId: 'newGame', userId: '1', username: 'player0'});

    player0.on('chat message', (message) => {
      message.should.equal('player0 joined room newGame');
    });

  });


  it('sends a response when a player submits a guess', () => {
    player0.emit('guess', { player: 'player0', message: 'its a guess'});

    player0.on('chat response', message => {
      message.message.should.equal('its a guess');
    });

    player1.on('chat response', message => {
      message.message.should.equal('its a guess');
    });

    player2.on('chat response', message => {
      message.message.should.equal('its a guess');
    });

  });


  it('sends sketch data to other players when a player draws', () => {

    player0.emit('sketch', 'test data here');

    player1.on('sketch return', data => {
      data.should.equal('test data here');
    });

  });


});