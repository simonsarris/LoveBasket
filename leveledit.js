/*
By Simon Sarris
Art by Betsy Green, Sean DeVarney and Simon Sarris

Based on the old PC game Heartlight
This project will be given an open source license when complete
*/

// Level editor!
// Hold the state we need to make levels and test them
// All of this could be rolled into Game, but I wanted to keep them
// separate in case someone wanted to focus on just one or the other
function LevelEditor(game) {
  this.game = game;
  this.chosenTile = new Tile('G');
  
  var editor = this;
  
  this.editorClickEvent = function(e) { editor.editorClick(e) };
  this.editorMouseMoveEvent = function(e) { editor.editorMouseMove(e) };
  
  this.lastMouse = null;
  
  var tiles = ['O', 'X', 'Y', 'V', 'G', 'B', 'R', 'H', 'P', 'D'];
  var tileset = [];
  var l = tiles.length;
  for (var i = 0; i < l; i++) {
    tileset.push(new Tile(tiles[i]));
  }
  this.tileset = tileset;
  
  if (game.currentLevel === null) {
    // Start with something blank
    game.currentLevel =
    'OOOOOOOOOOOOOOOOOOOO' +
    'OOOOOOOOOOOOOOOOOOOO' +
    'OOOOOOOOOOOOOOOOOOOO' +
    'OOOOOOOOOOOOOOOOOOOO' +
    'OOOOOOOOOOOOOOOOOOOO' +
    'OOOOOOOOOOOOOOOOOOOO' +
    'OOOOOOOOOOOOOOOOOOOO' +
    'OOOOOOOOOOOOOOOOOOOO' +
    'OOOOOOOOOOOOOOOOOOOO' +
    'OOOOOOOOOOOOOOOOOOOO' +
    'OOOOOOOOOOOOOOOOOOOO' +
    'OOOOOOOOOOOOOOOOOOOO';
  }
  
  var level = game.currentLevel;
  var tiles = [];  // we want a 12x20 array
  var k = 0;
  for (var i = 0; i < 12; i++) {
    tiles[i] = [];
    for (var j = 0; j < 20; j++) {
      var tile = new Tile(level[k++]);
      tiles[i][j] = tile;
    }
  }
  game.tiles = tiles;
  
}

// NYI
LevelEditor.prototype.save = function() {
  var input = document.createElement("textarea");
  input.style.position = "absolute";
  input.style.zIndex = 100; // put it all the way to the front
  input.style.width = '300px';
  input.style.height = '200px';
  input.style.fontFamily = 'monospace';
  var level = this.game.currentLevel;
  var result = '';
  // lazy, too late at night to deal with regular expressions!
  while (level.length > 0) {
    result += level.substring(0, 20) + '\n';
    level = level.substring(20);
  }
  input.value = result;
  
  var div = document.getElementById('gameContainer');
  div.appendChild(input); // NYI: some div to hold the level editor
  input.addEventListener('blur', function(e) {
    input.style.display = 'none';
  }, false);
  input.style.display = 'block';
  input.focus();
}

// NYI
LevelEditor.prototype.load = function() {
  
}

// NYI
LevelEditor.prototype.test = function() {
  
}

LevelEditor.prototype.draw = function() {
  var game = this.game; // kind of a weird way to do it but whatever
  
  // The tiles take up 640x384
  var ctx = game.ctx;
  var can = game.canvas;
  ctx.clearRect(0, 0, can.width, can.height);
  
  // Draw the tiles
  var tiles = game.tiles;
  // we draw column by column
  var rlen = tiles.length;
  for (var row = 0; row < rlen; row++) {
    var clen = tiles[row].length;
    for (var col = 0; col < clen; col++) {
      var e = tiles[row][col];
      // rows represent y values
      // columns represent x values
      e.draw(ctx, col, row);
    }
  }
  
  // gridlines to better see the level
  ctx.fillStyle = 'rgba(255,255,255,.2)';
  for (var row = 0; row < rlen; row++) {
    ctx.fillRect(0, row*32, 640, 1);
  }
    for (var col = 0; col < clen; col++) {
    ctx.fillRect(col*32, 0, 1, 384);
  }
  
  // Draw menu bar from 384 onwards
  ctx.fillStyle = 'black';
  ctx.fillRect(0,384, 640, 480-384);
  
  ctx.fillStyle = 'rgb(158, 57, 50)';
  ctx.font = '10px sans-serif';
  ctx.fillText('Hearts left: ' + game.hearts, 10, 400);
  
  var x = 0;
  var tileset = this.tileset;
  var l = tileset.length;
  for (var i = 0; i < l; i++) {
    tileset[i].drawXY(ctx, x, 420);
    x += 32;
  }
  
  // If the mouse is over the game level we want to draw
  // The currently selected tile with half transparency
  var mouse = this.lastMouse;
  if (mouse !== null && mouse.y < 384) {
    ctx.save();
    ctx.globalAlpha = 0.7;
    this.chosenTile.drawXY(ctx, mouse.x - 16, mouse.y - 16);
    ctx.restore();
  }
};

LevelEditor.prototype.editorClick = function(e) {
  var game = this.game;
  if (e.targetTouches) e = e.targetTouches[0];
  e.preventDefault();
  e.stopPropagation();
  var mouse = game.getMouse(e);
  if (Debug) console.log('menu' + mouse.x + ',' + mouse.y + ' click!');
  var chosen = this.chosenTile.type;
  
  // See if we are picking a tile or placing it
  if (mouse.y < 384) {
    var x = Math.floor(mouse.x / 32);
    var y = Math.floor(mouse.y / 32);
    if (chosen === 'P' || chosen === 'D') {
      // find and destroy any old players
      var tiles = game.tiles;
      var rlen = tiles.length;
      for (var row = 0; row < rlen; row++) {
        var clen = tiles[row].length;
        for (var col = 0; col < clen; col++) {
          if (chosen === 'P' && tiles[row][col].type === 'P')
            tiles[row][col].type = 'O';
          else if (chosen === 'D' && tiles[row][col].type === 'D')
            tiles[row][col].type = 'O'
        }
      }
    }
    game.tiles[y][x].type = chosen;
  } else {
    // see if its over a tile
    var x = 0;
    var y = 420;
    var tileset = this.tileset;
    var l = tileset.length;
    for (var i = 0; i < l; i++) {
      if (Game.intersects(x, y, 32, 32, mouse.x, mouse.y)) {
        this.chosenTile = tileset[i];
        break;
      }
      x += 32;
    }
  }
};

LevelEditor.prototype.editorMouseMove = function(e) {
  var game = this.game;
  this.lastMouse = game.getMouse(e);
};
