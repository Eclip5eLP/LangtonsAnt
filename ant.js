//Ant Logic

var grid = null;
var state = 0;
var pos = [0,0];
var gridCols;
var gridRows;
var res;
var colors;
var id = 0;
var code = "";
var dead = false;

//Constants
const UP = 0;
const RIGHT = 1;
const DOWN = 2;
const LEFT = 3;

var dir = DOWN;

//Main Script Communication
onmessage = function(e) {
	//Command: Setup all vars
	if (e.data[0] == "setup") {
		grid = e.data[1];
		gridCols = e.data[2];
		gridRows = e.data[3];
		pos = e.data[6];
		res = e.data[4];
		colors = e.data[5];
		id = e.data[7];
		code = e.data[8];
	}

	//Command: Receive new Grid
	if (e.data[0] == "GRID_SEND") {
		grid = e.data[1];
	}

	//Command: Move and send back Data
	if (e.data[0] == "MOVE") {
		grid = e.data[1];
		if (!dead) algorithm();
		if (!dead) postMessage(["sendPos", pos, grid]);
	}

	//Command: Apply new Code to self
	if (e.data[0] == "applyCode") {
		code = e.data[1];
	}
}

//Main Movement Algorithm
function algorithm() {
	var x = pos[0];
	var y = pos[1];

	//Turn Direction
	for (var i = 0; i < code.length; i++) {
		if (x >= gridCols || x <= -1) continue;
		if (y >= gridRows || y <= -1) continue;
		if (grid[x][y] == i) {
			var sub = code.substring(i,i+1);
			if (sub == "R") turnRight();
			if (sub == "L") turnLeft();
			var nextCol = (i + 1 + code.length) % code.length;
			colorChangeTo(x, y, nextCol);
			break;
		}
		if (grid[x][y] == -1) {
			var sub = code.substring(i,i+1);
			if (sub == "R") turnRight();
			if (sub == "L") turnLeft();
			var nextCol = (i + 1 + code.length) % code.length;
			colorChangeTo(x, y, nextCol);
			break;
		}
	}

	//Move to next
	moveForward();

	//Check for Bounds
	if ((pos[0] > gridCols || pos[0] < 0) || (pos[1] > gridRows || pos[1] < 0)) {
		dead = true;
		postMessage(["KILL", "OutOfBounds"]);
	}
}

//Change Color
function colorChangeTo(x, y, color) {
	grid[x][y] = color;
}

//Move Ant 1 Cell forward
function moveForward() {
	if (dir == UP) pos[1] -= 1;
	if (dir == RIGHT) pos[0] += 1;
	if (dir == DOWN) pos[1] += 1;
	if (dir == LEFT) pos[0] -= 1;
}

//Turn Ant to the Right
function turnRight() {
	dir = (dir + 1 + 4) % 4;
}

//Turn Ant to the Left
function turnLeft() {
	dir = (dir - 1 + 4) % 4;
}