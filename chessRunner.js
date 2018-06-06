const request = require('request');
const moment = require('moment');

var javy = { name: 'javys bot', url: 'http://localhost:8000/move' }; // Javy
var gab = { name: 'gabs bot', url: 'http://localhost:3000/v1/chess' }; // Gab

var middleman = 'http://localhost:3001/api';

var board1 = ChessBoard('board1', 'start');
const randomNumber = Math.random() * 100;

var whiteBot = null;
var blackBot = null;
var currentTurn = null;

const initiateBotPlay = function() {
  initializeGame()
    .then(result => {
      console.log(`White: ${whiteBot.name}`);
      console.log(`Black: ${blackBot.name}`);
      currentTurn = whiteBot;
      getMoveFromBot(result);
    })
    .catch(err => {
      throw err;
    });
};

const startGame = (white, black, fen) => {
  makeMove();
};

const getMoveFromBot = gameInfo => {
  var options = {
    url: currentTurn.url,
    method: 'POST',
    body: { Fen: gameInfo.fen },
    json: true
  };

  var startTime = moment();
  request(options, (err, response, body) => {
    if (err) {
      throw err;
    }
    var endTime = moment();
    var duration = moment.duration(endTime.diff(startTime)).asSeconds();

    console.log(`[${currentTurn.name}] Move Duration: ${duration} seconds`);

    var move = '';
    if (body.move != null) {
      move = body.move;
    } else {
      move = body;
    }

    currentTurn = currentTurn === whiteBot ? blackBot : whiteBot;

    verifyMoveWithMiddleMan(move, gameInfo);
  });
};

const verifyMoveWithMiddleMan = (move, gameInfo) => {
  var options = {
    url: `${middleman}/executemove/${gameInfo.gameId}`,
    method: 'POST',
    body: { move: move },
    json: true
  };

  request(options, (err, response, body) => {
    if (err) {
      throw err;
    }

    var statusCode = response.statusCode;
    var fen = body.data.message.fen;

    if (statusCode === 200 && fen) {
      board1.move(move);
      getMoveFromBot({ fen: fen, gameId: gameInfo.gameId });
    } else {
      throw new Error('Something went wrong with middleman: ' + statusCode);
    }
  });
};

const initializeGame = () => {
  return new Promise((resolve, reject) => {
    console.log('Initializing game');
    request.post(`${middleman}/initgame`, function(err, response, body) {
      if (err) {
        console.log(`Error initializing game with middle man: ${err}`);
        reject(err);
      }

      var body = JSON.parse(body);
      var gameId = body.data.message._id;
      var fen = body.data.message.fen;

      if (randomNumber > 50) {
        whiteBot = javy;
        blackBot = gab;
      } else {
        whiteBot = gab;
        blackBot = javy;
      }

      resolve({ gameId, fen });
    });
  });
};

module.exports = { initiateBotPlay };
