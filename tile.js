/*
By Simon Sarris
Art by Betsy Green, Sean DeVarney and Simon Sarris

Based on the old PC game Heartlight
This project will be given an open source license when complete
*/

/**
 * @constructor
 * @class
 * A Tile is any square of the game
 */
function Tile(type) {
  this.type = type;
  this.color = 'wheat';
}

Tile.prototype.draw = function(ctx, row, col, game) {
  var type = this.type;
  if (type === 'O') return; // don't draw void!
  if (type === 'P') {
    if (game.facing === 'left' && !game.lastMoved) type = 'PL';
    if (game.facing === 'left' && game.lastMoved) type = 'PLM';
    if (game.facing === 'right' && !game.lastMoved) type = 'PR';
    if (game.facing === 'right' && game.lastMoved) type = 'PRM';
  }
  
  if (Resources[type]) {
    ctx.drawImage(Resources[type], row*32, col*32);
  } else {
    ctx.fillStyle = Tile.fills[type];
    ctx.fillRect(row*32, col*32, 32, 32);
  }
};

Tile.prototype.drawXY = function(ctx, x, y) {
  if (Resources[this.type]) {
    ctx.drawImage(Resources[this.type], x, y);
  } else {
    ctx.fillStyle = Tile.fills[this.type];
    ctx.fillRect(x, y, 32, 32);
  }
};

Tile.fills = {
  'O' : '#48613b',    // nothing
  'X' : 'gray',     // impassible brick
  'Y' : 'gray',     // impassible brick2
  'V' : 'white',    // void
  'G' : 'green',    // grass

  'B' : 'gray',     // bomb
  'R' : 'blue',     // rock
  'H' : 'red',      // heart

  'P' : 'orange',   // player
  'D' : 'yellow'    // door
}
