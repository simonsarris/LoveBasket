/*
By Simon Sarris
Art by Betsy Green, Sean DeVarney and Simon Sarris

Based on the old PC game Heartlight
This project will be given an open source license when complete
*/


// For entities that

/**
 * @constructor
 * @class
 * A leaf is an animated entity that does not interact with the game
 */
function Leaf(xpos, ypos, image, locs, list) {
  this.pos = { x: xpos, y: ypos };
  this.image = image;
  this.locs = locs; // list of locations
  this.currentFrame = 0;
  this.loop = false;
  
  this.finished = false;
  
  // They can't ALL be the same
  this.offsetX = Math.random() * 35 - 15 | 0;
  this.offsetY = Math.random() * 35 - 15 | 0;
}

// sometimes we want to redraw the whole scene without advancing the frame of animations
Leaf.prototype.draw = function(ctx, advanceFrame) {
  if (this.finished) return;
  var pos = this.pos;
  var pt = this.locs[this.currentFrame];
  ctx.drawImage(this.image, pt[0] + pos.x + this.offsetX, pt[1] + pos.y + this.offsetY); // NYI more than one image
  if (advanceFrame) this.currentFrame++;
  if (this.currentFrame >= this.locs.length) this.finished = true;
}


var LEAF1 = [[1,4], [4,13], [7,20], [11,27], [15,33], [20,39], [24,44], [30,48], [35,52], [41,55],
[48,58], [55,59], [62,61], [69,61], [77,61], [86,61], [81,65], [66,73], [52,80], [40,86], [30,89],
[22,92], [16,92], [12,91], [11,91], [13,92], [20,96], [26,102], [32,109], [37,118], [43,128], [47,139],
[52,152], [56,166], [59,182], [63,199], [66,217], [69,237], [71,258], [74,292], [76,343], [77,399],
[77,461], [75,528], [72,601], [68,679], [62,763], [54,853]];

var LEAF2 = [[20,13], [15,19], [10,24], [5,29], [-1,32], [-8,34], [-15,36], [-23,37], [-24,39],
[-19,43], [-13,46], [-7,49], [0,51], [7,52], [15,53], [23,53], [26,61], [22,77], [18,91], [13,104],
[7,116], [2,124], [-2,129], [-6,133], [-10,138], [-14,142], [-19,145], [-20,148], [-17,152], [-15,157],
[-13,163], [-9,175], [-5,196], [-2,222], [2,253], [5,289], [8,331], [10,378], [12,431], [14,488], [16,551],
[18,653], [19,811]];

var LEAF3 = [[6,26], [9,28], [12,29], [16,31], [21,32], [26,33], [35,35], [41,42], [37,56], [34,65],
[31,71], [28,76], [25,82], [22,86], [18,91], [14,95], [9,99], [5,103], [0,106], [-5,109], [-11,112],
[-10,115], [-2,121], [6,128], [14,136], [21,146], [28,157], [35,169], [41,182], [47,197], [53,213],
[59,230], [64,248], [70,268], [75,289], [79,311], [84,334], [88,359], [92,384], [95,411], [99,440],
[103,484], [109,548], [113,618], [116,692], [118,771], [119,855]];

var LEAF4 = [[9,22], [7,37], [5,50], [3,58], [1,63], [0,68], [-2,72], [-4,75], [-7,78], [-9,81],
[-12,83], [-14,85], [-17,87], [-17,89], [-13,91], [-8,94], [-3,97], [4,100], [15,104], [27,107],
[40,109], [54,111], [68,111], [77,113], [80,119], [82,126], [85,135], [88,149], [93,174], [97,203],
[101,237], [104,277], [107,321], [110,370], [112,425], [114,484], [116,548], [117,618], [118,692], [119,811]];
