const electron = require('electron');
const ChessBoard = require('chessboardjs');

const {app, BrowserWindow} = require('electron')
  
  function createWindow () {
    // Create the browser window.
    win = new BrowserWindow({width: 1280, height: 860})
    // var board = ChessBoard('board')
  
    // and load the index.html of the app.
    win.loadFile('index.html')

    win.webContents.openDevTools()

  }
  
  app.on('ready', createWindow)