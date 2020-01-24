//langtons Ant App

var cstep = 0;

var gridCols;
var gridRows;
var grid;
var cDraw = 0;
var drawDelay = 3;
var res = 20;
var canvas;
var cWidth = 600;
var cHeight = 400;
var cellSize;

var ants = [];
var antsPos = [];
var antsRdy = [];
var last;
var boot = true;
var speedCalled = false;
var paused = true;
var allowRepeat = false;

var endOfGen = false;
var showGrid = false;
var bgonce = true;

var code = "RL";

var colorCodes = [
	"#FFFFFF",
	"#000000",
	"#FF4D4D",
	"#668CFF",
	"#70DB70",
	"#FFA64D",
	"#FFFF66",
	"#80FFFF",
	"#FF1AFF",
];

//Setup Function
function setup() {
	canvas = createCanvas(cWidth, cHeight);
	canvas.parent("cell_canvas");

	gridCols = round(width / res);
	gridRows = round(height / res);
	cellSize = cHeight / gridRows;

	grid = gridCreate(gridCols, gridRows);
	if (boot) {
		bgonce = true;
		boot = false;
		handlers.init();
		setTimeout(function(){
			setDim(80);
			applyCode(code);
			spawnAnt(Math.floor(gridCols / 2),Math.floor(gridRows / 2));
		},1);
	}
}

//Create a new empty Grid
function gridCreate(cols, rows) {
	var arr = new Array(cols);
	for (var i = 0; i < arr.length; i++) {
		arr[i] = new Array(rows);
		for (var j = 0; j < arr[i].length; j++) {
			arr[i][j] = -1;
		}
	}
	return arr;
}

//Main Draw function
function draw() {
	if (bgonce) { background(180); bgonce = false; }
	cDraw++;

	//Draw all Tiles
	for (var i = 0; i < gridCols; i++) {
    	for (var j = 0; j < gridRows; j++) {
      		var x = i * res;
      		var y = j * res;
      		var co = grid[i][j];
      		if (co != -1) {
	      		co = (co + 9) % 9;
	      		fill(colorCodes[co]);
	  			stroke(0);
	  			rect(x, y, res - 1, res - 1);
	  		}
    	}
  	}

  	//If all Ants moved and ready for next command, then update grid and send command
  	var rdy = true;
  	for (var i = 0; i < antsRdy.length; i++) {
  		if (ants[i] == null) antsRdy[i] = true;
		if (antsRdy[i] == false) rdy = false;
	}
	if (cDraw >= drawDelay && !paused && !endOfGen && rdy) {
		for (var i = 0; i < antsRdy.length; i++) {
			antsRdy[i] = false
		}
		cDraw = 0;
		for (var i = 0; i < ants.length; i++) {
			if (ants[i] == null) continue;
			ants[i].postMessage(["MOVE", grid]);
		}
		cstep++;
	}
	document.getElementById("genDisp").innerHTML = cstep;
	document.getElementById("codeDisp").innerHTML = code;
	document.getElementById("inputSpeed").value = drawDelay;
}

//Change Window Dimension from DOM Input
function changeDim() {
	var h = document.getElementById("inputDim").value;
	setDim(h);
	paused = true;
}

//Set new Window Dimension
function setDim(dim) {
	h = dim;
	if (h >= 3 && h <= 200) {
		if (h >= 100) {
			handlers.errorHandler("Dimensions above 100 will use a lot of processing power!", "warn");
			msg.send("Dimensions above 100 will use a lot of processing power!");
		}
		h = floor(cHeight / dim);
		res = h;
		setup();
	} else {
		handlers.errorHandler("Invalid Dimension on setDim(" + dim + ")!");
	}
}

//Start / Pause
function gridStart() {
	if (paused) {
		paused = false;
	} else {
		paused = true;
	}
}

//Clear complete Grid
function gridClear() {
	setup();
	paused = true;
	cstep = 0;
	msg.clear();
	ants = [];
	bgonce = true;
	console.log("killAnt(*);");
	spawnAnt(Math.floor(gridCols / 2),Math.floor(gridRows / 2));
}

//Change Tick Speed
function changeSpeed() {
	var newSpd = document.getElementById("inputSpeed").value;
	if (newSpd >= 0 || newSpd == "") {
		drawDelay = newSpd;
	} else {
		handlers.errorHandler("Invalid Speed on changeSpeed(" + newSpd + ")!");
	}
}

//Message Service
var msg = {
	send: function(msgs) {
		document.getElementById("msgService").innerHTML = msgs;
	},

	clear: function() {
		document.getElementById("msgService").innerHTML = "";
	}
}

//All Handlers (Mouse, Error)
var handlers = {
	mousedown: false,
    lastX: 0,
    lastY: 0,

    init: function() {
    	setTimeout(function(){
    		var c = document.getElementById("cell_canvas");
			handlers.registerEvent(c, 'mousedown', handlers.canvasMouseDown, false);
	        handlers.registerEvent(document, 'mouseup', handlers.canvasMouseUp, false);
    	}, 5);
    },

    errorHandler: function(e = "Unknown Error", t = "error") {
		if (t == "log") console.log(e);
		if (t == "info") console.info("INFO: " + e);
		if (t == "warn") console.warn("WARN: " + e);
		if (t == "error") console.error("ERROR: " + e);
	},

  	canvasMouseDown: function(event) {
        var position = handlers.mousePosition(event);
        spawnAnt(position[0], position[1]);
        handlers.lastX = position[0];
        handlers.lastY = position[1];
        handlers.mouseDown = true;
  	},

  	canvasMouseUp: function() {
    	handlers.mouseDown = false;
  	},

  	mousePosition: function (e) {
        var event, x, y, domObject, posx = 0, posy = 0, top = 0, left = 0;

        event = e;
        if (!event) {
          	event = window.event;
        }
      
        if (event.pageX || event.pageY) 	{
          	posx = event.pageX;
          	posy = event.pageY;
        } else if (event.clientX || event.clientY) 	{
          	posx = event.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
          	posy = event.clientY + document.body.scrollTop + document.documentElement.scrollTop;
        }

        domObject = event.target || event.srcElement;

        while ( domObject.offsetParent ) {
          	left += domObject.offsetLeft;
          	top += domObject.offsetTop;
          	domObject = domObject.offsetParent;
        }

        domObject.pageTop = top;
        domObject.pageLeft = left;

        x = Math.ceil(((posx - domObject.pageLeft)/cellSize) - 1);
        y = Math.ceil(((posy - domObject.pageTop)/cellSize) - 1);

        return [x, y];
    },

    registerEvent: function (element, event, handler, capture) {
        element.addEventListener(event, handler, capture);
    }
}

//Spawn a new Ant
function spawnAnt(x, y) {
	var a = ants.length;
	console.log("spawnAnt(" + a + ");");
	ants[a] = new Worker("ant.js");
	antsPos[a] = [x, y];
	antsRdy[a] = true;
	grid[x][y] = 0;
	ants[a].postMessage(["setup", grid, gridCols, gridRows, res, null, antsPos[a], a, code]);
	ants[a].onmessage = function(e) {
		if (e.data[0] == "sendPos") {
			if (ants[a] == null) return;
			antsPos[a][0] = e.data[1][0];
			antsPos[a][1] = e.data[1][1];
			//grid = e.data[2];
			var g = e.data[2];

			//Apply to Grid
			for (var i = 0; i < 3; i++) {
				for (var j = 0; j < 3; j++) {
					var xx = (antsPos[a][0] - 1 + i);
					var yy = (antsPos[a][1] - 1 + j);
					if (xx >= gridCols || xx <= -1) continue;
					if (yy >= gridRows || yy <= -1) continue;
					grid[xx][yy] = g[xx][yy];
				}
			}
			antsRdy[a] = true;
		}

		if (e.data[0] == "KILL") {
			ants[a] = null;
			console.log("Killed Ant(" + a + ")\nReason: " + e.data[1]);
		}
	}
}

//Apply a new Code
function applyCode(c = document.getElementById("inputCode").value) {
	var nc = "";
	for (var i = 0; i < c.length; i++) {
		var sub = c.substring(i,i + 1).toUpperCase();
		if (sub == "L" || sub == "R") {
			nc = nc + sub;
		}
	}
	code = nc.toUpperCase();
	document.getElementById("inputCode").value = code;

	for (var i = 0; i < ants.length; i++) {
		ants[i].postMessage(["applyCode", code]);
	}
}