/*
By Simon Sarris
Art by Betsy Green, Sean DeVarney and Simon Sarris

Based on the old PC game Heartlight
This project will be given an open source license when complete
*/



// @@@ TODO:
/*
-sound
-missing parts
-level editor
-things that I am forgetting
-I guess I'm just bad at TODO lists really
-buttons as an object
*/



var Debug = false;

var Resources = {
  // Textures
  'X' : 'art/brick.png',    // impassible brick
  'Y' : 'art/brick2.png',   // impassible brick2
  //'V' : 'white',          // void
  'G' : 'art/grass2.png',    // grass @@@ temporary testing
  'B' : 'art/bomb.png',           // bomb
  'R' : 'art/rock.png',     // rock
  'H' : 'art/heart.png',    // heart
  //'P' : 'art/player-left.png',   // player


  'PL'  : 'art/player-left.png',
  'PLM' : 'art/player-left-move.png',
  'PR'  : 'art/player-right.png',
  'PRM' : 'art/player-right-move.png',

  'D' : 'art/door.png',      // door
  'F' : 'art/door-open.png',      // door open
  
  '1' : 'art/explosion1.png',      // explosion frame
  '2' : 'art/explosion2.png',      // explosion frame
  '3' : 'art/explosion3.png',      // explosion frame
  '4' : 'art/explosion4.png',      // explosion frame
  '5' : 'art/explosion3.png',      // explosion frame
  '6' : 'art/explosion2.png',      // explosion frame
  '7' : 'art/explosion1.png',      // explosion frame
  
  // Animated things
  'leaf1' : 'art/grass-gib1.png',
  'leaf2' : 'art/grass-gib2.png',
  
  // Menu screen
  'title' : 'art/title.png',
  'newgame' : 'art/newgame.png',
  'continue' : 'art/continue.png',
  'options' : 'art/options.png',
  'leveledit' : 'art/leveledit.png',
  
  // Splash thingy
  'stork' : 'art/stork.png'
}

/*
 * A Game is associated with a HTML div element.
 * A new Canvas is created and placed inside the div upon creation Upon Game creation
 * an HTML canvas element is made and placed inside of the
 * specified div. The Game retains a reference to both of these elements.
 */
function Game(can) {
  
  // *** Init ***
  
  this.canvas = can;
  this.ctx = can.getContext('2d');
  // 640x480 for now
  this.width = can.width;
  this.height = can.height;
  can._game = this;
  can.tabIndex = 0;
  
  // note: also defined in tile.js
  //can.style.backgroundColor = '#718067';
  //can.style.backgroundColor = '#616161'; // normal
  //can.style.backgroundColor = '#48613b'; // experimental
  can.style.backgroundColor = '#a2cafb'; // experimental blue
  
  this._stylePaddingLeft = parseInt(document.defaultView.getComputedStyle(can, null)['paddingLeft'], 10)      || 0;
  this._stylePaddingTop  = parseInt(document.defaultView.getComputedStyle(can, null)['paddingTop'], 10)       || 0;
  this._styleBorderLeft  = parseInt(document.defaultView.getComputedStyle(can, null)['borderLeftWidth'], 10)  || 0;
  this._styleBorderTop   = parseInt(document.defaultView.getComputedStyle(can, null)['borderTopWidth'], 10)   || 0;
  // <html> can have a margin (typically seen with position:fixed bars)
  var html = document.body.parentNode;
  this._htmlTop = html.offsetTop;
  this._htmlLeft = html.offsetLeft;
  
  // avoid highlight on touch in android
  can.style['-webkit-tap-highlight-color'] = 'transparent';

  var game = this;

  // *** Events ***
  
  //fixes a problem where double clicking causes text to get selected on the canvas
  can.addEventListener('selectstart', function(e) { e.preventDefault(); return false; }, false);
  
  // We will register and unregister these at various times
  this.gameClickEvent = function(e) { game.gameClick(e) };
  this.gameKeyDownEvent = function(e) { game.gameKeyDown(e) };
  
  this.menuClickEvent = function(e) { game.menuClick(e) };

  // *** Properties ***
  
  this.tiles = []; // To be a 12x20 array
  this.started = false;
  this.player = null; // populated during the map load
  this.door = null;
  this.entities = [];
  this.tickCount = 0;
  this.currentLevel = null;
  this.queued = null; // the last move queued up
  this.imagesLoading = 0;

  this.facing = 'right'; // set during move and used in draw, tells the direction of the player
  this.lastMoved = false; // set during move and used in draw, tells if the player just moved

  this.levelEditor = null;
  
  can.focus();
  this.loadGame();
};

Game.prototype.loadMenu = function() {
  var game = this;
  var can = this.canvas;
  
  // now we can use the mouse for the menu
  can.addEventListener('click', game.menuClickEvent, false);
  can.addEventListener('touchstart', game.menuClickEvent, false);
  
  // draw menu
  this.loop = setInterval(function() { game.drawMenu() }, 30);
};

Game.prototype.loadGame = function() {
  var game = this;
  var ctx = this.ctx;
  var can = this.canvas;

  // load images
  for (var i in Resources) {
    var img = new Image();
    this.imagesLoading++;
    img.onload = function() {
      game.imagesLoading--;
    };
    img.src = Resources[i];
    Resources[i] = img;
  }
  
  this.loadInterval = setInterval(function() {
    if (game.imagesLoading === 0) {
      clearInterval(game.loadInterval);
      // show studio screen for 800 ms
      ctx.drawImage(Resources['stork'], 0, 0);
      setTimeout(function() {
        // finally, load the menu
        game.loadMenu();
      }, 800);
    }
  },100);
};

Game.prototype.loadLevelEditor = function() {
  // unload menu
  var can = this.canvas;
  var game = this;
  
  if (this.levelEditor === null) this.levelEditor = new LevelEditor(game);
  var editor = this.levelEditor;
  
  can.removeEventListener('click', game.menuClickEvent, false);
  can.removeEventListener('touchstart', game.menuClickEvent, false);
  
  // now we can use the mouse for the menu
  can.addEventListener('click', editor.editorClickEvent, false);
  can.addEventListener('mousemove', editor.editorMouseMoveEvent, false);
  
  // stop the menu from drawing
  if (this.loop) clearInterval(this.loop);
  // draw editor
  this.loop = setInterval(function() { editor.draw() }, 30);
}



Game.prototype.startNewGame = function() {
  // stop the menu from drawing
  if (this.loop) clearInterval(this.loop);
  
  this.loadLevel(); // NYI load level one
  this.startLevel();
};

Game.prototype.continueGame = function() {
  // stop the menu from drawing
  if (this.loop) clearInterval(this.loop);
  // NYI
};

Game.prototype.loadLevel = function(levelstring) {
  // unload menu
  var can = this.canvas;
  var game = this;
  can.removeEventListener('click', game.menuClickEvent, false);
  can.removeEventListener('touchstart', game.menuClickEvent, false);
  
  if (this.loop) clearInterval(this.loop);
  this.hearts = 0;
  // NYI: make sure levelstring is actually value (right now it just assumes so
  // levelstrings need at least one door and only one player

  levelstring =
  'OOBOOOOROOOOOOOHOOOO' +
  'OXXXRXXXXOOYYYYYYYYO' +
  'OXGGGGGGGOOGGGGGRGYO' +
  'OXGGHGGGGOOGRGGGGGYO' +
  'OXGGGGGGGOBGGGGGGGYR' +
  'OXGRGGGGGOPGGGHGGRYO' +
  'HXGGGHGGGOOGGGGGRGYO' +
  'OXGGGGGRGOOGHGGRGGYO' +
  'OXGGRGGGGOOGGGRGDGYO' +
  'OXGGGGRGGOOGGRGGGRYO' +
  'OXXXXXXXXOOYYYYYYYYO' +
  'OOOOOOOOOOOOOROOOOOO';  // level 22

/*
levelstring =
  'OOOOOOOOOOOOOOOOOOOO' +
  'OOOOOOOOOROOOOOOOOOO' +
  'OOOOOOOOOOOOOROOOOOO' +
  'OOOOOOOPOBOOOOOOOOOO' +
  'OODOOOOOOGGGGOGOOOOO' +
  'OOOOOOOOOOOOOGGOOOOO' +
  'OOOOOOOOOOOOOOOOOOOO' +
  'OOOOOOOOOOOOOOOOOOOO' +
  'OOOOOOOOOOOOOOOOOOOO' +
  'OOOOOOOOOOOOOOOOOOOO' +
  'OOOOOOOOOOOOOOOOOOOO' +
  'OOOOOOOOOOOOOOOOOOOO'; // test level
*/

  /* level 1
    'XXXXXXXXXXXXXXXXXXXX' +
    'XGGGGRGGGGGRGHGGGGGX' +
    'XGPGGRHGGGRRRRGGGRGX' +
    'XGGGGRGGGHGGGGGGGRGX' +
    'XXXXXXXXXXXXXXXXGHGX' +
    'XGGGGRRGGGRGGGGRGGGX' +
    'XGRGGGHGGRGGGHGRGGGX' +
    'XGRGXXXXXXXXXXXXXXXX' +
    'XHGRGGGRGRGGGHRGGGGX' +
    'XGGGGRRGGRHGGGRHGGRD' +
    'XGHGGGGRGRGGRGGHGGRX' +
    'XXXXXXXXXXXXXXXXXXXX';
  */
  
  var level = levelstring
  this.currentLevel = level;
  var tiles = [];  // we want a 12x20 array
  var k = 0;
  for (var i = 0; i < 12; i++) {
    tiles[i] = [];
    for (var j = 0; j < 20; j++) {
      // If we found the player tile save his position
      // player X is column count, player Y is row count
      if (level[k] === 'P') this.player = { x: j, y: i };
      if (level[k] === 'D') this.door = { x: j, y: i };
      if (level[k] === 'H') this.hearts++;
      var tile = new Tile(level[k++]);
      tiles[i][j] = tile;
    }
  }
  this.tiles = tiles;
  var game = this;
  this.draw(true);
  this.started = true;
};

Game.prototype.startLevel = function() {
  var game = this;
  var can = this.canvas;
  // now we can press keys for the game
  can.addEventListener('touchstart', game.gameClickEvent, false);
  can.addEventListener('keydown', game.gameKeyDownEvent, false);
  this.loop = setInterval(function() { game.tick() }, 30);
};

// Draw the running game
Game.prototype.draw = function(advanceFrame) {
  // The tiles take up 640x384
  var ctx = this.ctx;
  var can = this.canvas;
  ctx.clearRect(0, 0, can.width, can.height);
  
  // Draw the tiles
  var tiles = this.tiles;
  // we draw column by column
  var rlen = tiles.length;
  for (var row = 0; row < rlen; row++) {
    var clen = tiles[row].length;
    for (var col = 0; col < clen; col++) {
      var tile = tiles[row][col];
      // rows represent y values
      // columns represent x values
      tile.draw(ctx, col, row, this);
    }
  }
  
  // Draw menu bar from 384 onwards
  ctx.fillStyle = 'black';
  ctx.fillRect(0,384, 640, 480-384);
  
  ctx.fillStyle = 'rgb(158, 57, 50)';
  ctx.font = '10px sans-serif';
  ctx.fillText('Hearts left: ' + this.hearts, 10, 400);
  
  // draw animated things atop everything
  var entities = this.entities;
  var l = entities.length;
  // go backwards to avoid conflicts while deleting
  for (var i = l-1; i >=0; i--) {
    entities[i].draw(ctx, advanceFrame);
    if (entities[i].finished) entities.splice(i, 1);
  }
  
  if (Debug) {
    ctx.fillStyle = 'rgba(255,0,0,.5)';
    // left right
    ctx.fillRect(0, 100, 200, 180)//, mouse.x, mouse.y, 0, 0)) {
    ctx.fillRect(440, 100, 200, 180)//, mouse.x, mouse.y, 0, 0)) {
    // top bottom
    ctx.fillRect(100, 0, 440, 120,0)// mouse.x, mouse.y, 0, 0)) {
    ctx.fillRect(100, 260, 440, 124)//, mouse.x, mouse.y, 0, 0)) {
  }
};

Game.prototype.drawMenu = function() {
  var can = this.canvas;
  var ctx = this.ctx;
  
  // this is a silly way of constructing the menu, this could all be one PNG
  // but I might have some things animate in the future
  
  // menu background color
  ctx.fillStyle = '#fdffd9';
  ctx.fillRect(0, 0, can.width, can.height);
  // title:
  ctx.drawImage(Resources['title'], 0, 0);
  // buttons:
  ctx.drawImage(Resources['newgame'], 192, 160);
  ctx.drawImage(Resources['continue'], 192, 240);
  // Gray it out since its NYI:
  ctx.fillStyle = 'rgba(0,0,0,.5)';
  ctx.fillRect(192, 240, 256, 64);
  // NYI options menu
  ctx.drawImage(Resources['options'], 192, 320);
  // Gray it out since its NYI:
  ctx.fillStyle = 'rgba(0,0,0,.5)';
  ctx.fillRect(192, 320, 256, 64);
  ctx.drawImage(Resources['leveledit'], 192, 400);  
};

// We don't want the girl to move instantly, she has to move inside the bounds of time.
Game.prototype.queueMove = function(dir) {
  if (this.queued === null) this.queued = dir;
}

// Attempt to move the player
// dir is the direction - 'up' 'down' 'left' or 'right'
// returns true if the move occured, false if it was blocked
Game.prototype.move = function(dir) {
  if (!this.started) return;
  var pos = this.player;
  var tiles = this.tiles;
  var x = pos.x;
  var y = pos.y;
  switch (dir) {
    case 'up':
      y--; break;
    case 'down':
      y++; break;
    case 'left':
      x--; break;
    case 'right':
      x++; break;
  }
  // Is the new pos even valid?
  if (Debug) console.log("Propose move to", x, y);
  if (x > 19 || x < 0 || y > 11 || y < 0) return false;
  
  var prop = tiles[y][x].type; // proposed tile
  
  if ((dir === 'left' || dir === 'right') && 'BR'.indexOf(prop) !== -1) {
    // Maybe we can push a rock or bomb left or right
    if (dir === 'left' && x > 0 && tiles[y][x-1].type == 'O') {
      tiles[y][x-1].type = prop;
    } else if (dir === 'right' && x < 19 && tiles[y][x+1].type == 'O') {
      tiles[y][x+1].type = prop;
    } else {
      // can't move
      return false;
    }
  } else if ('XYBRDV1234567'.indexOf(prop) !== -1) {
    // Otherwise, see if the new location contains a type of tile that we cannot walk onto
    return false;
  } else if (prop === 'H') {
    this.hearts--;
    if (this.hearts === 0) {
      tiles[this.door.y][this.door.x].type = 'F'; // open the door
    }
    // NYI: begin door open animation
  } else if (prop === 'G') {
    // we break the grass
    this.entities.push(new Leaf(x*32, y*32, Resources['leaf1'], LEAF1));
    this.entities.push(new Leaf(x*32+5, y*32+10, Resources['leaf2'], LEAF2));
    this.entities.push(new Leaf(x*32+10, y*32+5, Resources['leaf1'], LEAF3));
    this.entities.push(new Leaf(x*32+10, y*32+15, Resources['leaf2'], LEAF4));
  }
  
  tiles[pos.y][pos.x].type = 'O'; // its now empty where the player used to be
  // place player and update position
  tiles[y][x].type = 'P';
  pos.x = x;
  pos.y = y;
  
  if (prop === 'F') {
    this.gameOver(true);
  }
  
  return dir;
}

// Happens every X milliseconds
// Check for blocks that could fall: rocks, bombs and hearts
Game.prototype.tick = function() {
  if (this.tickCount === 2) {
    this.tickCount = 0;
  } else {  
    this.tickCount++;
    this.draw(true);
    return;
  }

  this.lastMoved = false;
  if (this.queued) {
    var move = this.move(this.queued);
    if (move === 'left' || move === 'right') {
      this.facing = move;
      this.lastMoved = true;
    }
    this.queued = null;
  }
  
  // ring the bells that still can ring (and move the objects, too!)
  var tiles = this.tiles;
  for (var row = 11; row >= 0; row--) {
    for (var col = 19; col >= 0; col--) {
      var tile = tiles[row][col];
      
      var idx = '1234567'.indexOf(tile.type);
      if (idx !== -1) {
        tile.type = idx === 6 ? 'O' : '1234567'[idx+1];
        continue;
      }
      
      if ('RBH'.indexOf(tile.type) === -1 || row === 11) {
        if (tile.type === 'B' && tile.wasFalling) // explode bombs that were falling
          this.explode(tiles, tile, row, col);
        tile.wasFalling = false;
        continue;
      }
      
      var beneath = tiles[row+1][col];
      if (beneath.type === 'O') {
        // Fall one block
        beneath.type = tile.type;
        tile.type = 'O';
        beneath.wasFalling = true;
      } else if (beneath.type === 'P' && tile.wasFalling === true) {
        // Crush the player
        this.gameOver(false);
        return;
      } else if (beneath.type === 'B' && tile.wasFalling === true) {
        this.explode(tiles, beneath, row+1, col); // Explode a bomb
      } else if (tile.type === 'B' && beneath.type !== 'G' && tile.wasFalling === true) {
        this.explode(tiles, tile, row, col); // Explode a bomb
      } else if ('RBHXY'.indexOf(beneath.type) !== -1) {
        // see if block can fall to the left or right
        // blocks prefer to fall to the left if both sides are options
        if (col > 0 && tiles[row][col-1].type === 'O' && tiles[row+1][col-1].type  === 'O') {
          // left and left row+1 are open
          tiles[row][col-1].type = tile.type;
          tile.type = 'O';
        } else if (col < 19 && tiles[row][col+1].type === 'O' && tiles[row+1][col+1].type  === 'O') {
          // otherwise right and right row+1 open
          tiles[row][col+1].type = tile.type;
          tile.type = 'O';
        } else {
          tile.wasFalling = false; // can't fall
        }
      } else {
        tile.wasFalling = false;
      }
    } // end cols
  } // end rows

  this.draw(true);
}

Game.prototype.explode = function(tiles, tile, row, col) {
  tile.type = '2';
  if (col < 19) {
    if (tiles[row][col+1].type == 'P') this.gameOver(false);
    tiles[row][col+1].type = '2';
  }
  if (col > 0) {
    if (tiles[row][col-1].type == 'P') this.gameOver(false);
    tiles[row][col-1].type = '1';
  }
  if (row < 11) {
    if (tiles[row+1][col].type == 'P') this.gameOver(false);
    tiles[row+1][col].type = '2';
  }
  if (row > 0) {
    if (tiles[row-1][col].type == 'P') this.gameOver(false);
    tiles[row-1][col].type = '1';
  }
}

Game.prototype.gameOver = function(win) {
  var can = this.canvas;
  var game = this;
  //can.removeEventListener('click', game.gameClickEvent, false);
  can.removeEventListener('touchstart', game.gameClickEvent, false);
  can.removeEventListener('keydown', game.gameKeyDownEvent, false);

  clearInterval(this.loop);
  
  this.started = false;
  var ctx = this.ctx;

  if (win) {
    this.draw(true);
    ctx.font = '72pt serif';
    ctx.fillStyle = 'red';
    ctx.fillText('yay!', this.canvas.width/2, this.canvas.height/2);
  } else {
    ctx.font = '72pt serif';
    ctx.fillStyle = 'red';
    ctx.fillText('dead', this.canvas.width/2, this.canvas.height/2);
    setTimeout(function() { 
      game.loadLevel();
      game.startLevel();
    }, 900);
  }
}

// ********************
// Events!
// ********************

Game.prototype.gameKeyDown = function(e) {
  var pressed = true;
  switch (e.keyCode) {
    case 37: // Left
    case 65: // A
      this.queueMove('left');
      break;
    case 38: // Up
    case 87: // W
      this.queueMove('up');
      break;
    case 39: // Right
    case 68: // D
      this.queueMove('right');
      break;
    case 40: // Down
    case 83: // S
      this.queueMove('down');
      break;
    case 27:
      this.loadLevel();
      this.startLevel();
      break;
    default:
      pressed = false;
  }
  
  if (pressed && this.started) { 
    e.preventDefault(); // only prevent default if its a relevant key
    // we redraw the scene to move the player but we don't want to make animations go faster because of it
    this.draw(false);
  }
};

Game.prototype.gameClick = function(e) {
  if (e.targetTouches) e = e.targetTouches[0];
  e.preventDefault();
  e.stopPropagation();
  var mouse = this.getMouse(e);
  
  if (Debug) console.log('game ' + mouse.x + ',' + mouse.y + ' click!');
  
  if (Game.intersects(0, 100, 200, 180, mouse.x, mouse.y, 0, 0)) {
    this.queueMove('left');
  } else if (Game.intersects(440, 100, 200, 180, mouse.x, mouse.y, 0, 0)) {
    this.queueMove('right');
  } else if (Game.intersects(100, 0, 440, 120, mouse.x, mouse.y, 0, 0)) {
    this.queueMove('up');
  } else if (Game.intersects(100, 260, 440, 124, mouse.x, mouse.y, 0, 0)) {
    this.queueMove('down');
  }
};

Game.prototype.menuClick = function(e) {
  if (e.targetTouches) e = e.targetTouches[0];
  e.preventDefault();
  e.stopPropagation();
  var mouse = this.getMouse(e);
  if (Debug) console.log('menu' + mouse.x + ',' + mouse.y + ' click!');
  
  // Three buttons located at:
  
  // newgame  192, 160
  if (Game.intersects(192, 160, 256, 64, mouse.x, mouse.y, 0, 0)) {
    this.startNewGame();
  }
  
  //NYI
  // buttons:
  //ctx.drawImage(Resources['continue'], 192, 240);
  //ctx.drawImage(Resources['options'], 192, 320);
  
  if (Game.intersects(192, 400, 256, 64, mouse.x, mouse.y, 0, 0)) {
    this.loadLevelEditor();
  }
};

// Put me somewhere more general maybe?
// returns true if there is any overlap
// params: x,y,w,h of two rectangles
Game.intersects = function(x1, y1, w1, h1, x2, y2, w2, h2) {
    w2 = w2 || 0;
    h2 = h2 || 0;
    
    w2 += x2;
    w1 += x1;
    if (x2 > w1 || x1 > w2) return false;
    h2 += y2;
    h1 += y1;
    if (y2 > h1 || y1 > h2) return false;
  return true;
}

// Get the mouse coords for an event
Game.prototype.getMouse = function(e) {
  var element = this.canvas, offsetX = 0, offsetY = 0, mx, my;
 
  // Compute the total offset
  if (element.offsetParent !== undefined) {
    do {
      offsetX += element.offsetLeft;
      offsetY += element.offsetTop;
    } while ((element = element.offsetParent));
  }
 
  // Add padding and border style widths to offset
  // Also add the <html> offsets in case there's a position:fixed bar
  offsetX += this._stylePaddingLeft + this._styleBorderLeft + this._htmlLeft;
  offsetY += this._stylePaddingTop + this._styleBorderTop + this._htmlTop;
 
  mx = e.pageX - offsetX;
  my = e.pageY - offsetY;
 
  return {x: mx, y: my};
};