// Editor.js
var canvas = document.getElementById("editorCanvas");
var ctx = canvas.getContext('2d');

var activeTile = 0;
var activeLayer = 0;
var map = {
	width: 800,
	height: 800,
	layerNames: ["default"],
	data: [],
	tileSize: 32,
	activeTileX_index: 0,
	activeTileY_index: 0,
	init: function() {
		this.data = [];
		var column_count = this.height / this.tileSize;
		var row_count = this.width / this.tileSize;

		for(var i = 0; i < this.layerNames.length; i++) {
			var layer = [];
			for(var y = 0; y < column_count; y++) {
				var row = [];
				for(var x = 0; x < row_count; x++) {
					row.push(0);
				}
				layer.push(row);
			}
			this.data.push(layer);
		}
	},
	render: function() {
		var column_count = this.height / this.tileSize;
		var row_count = this.width / this.tileSize;
		ctx.clearRect(0, 0, canvas.width, canvas.height);
		for(var i = 0; i < this.layerNames.length; i++) {
			for(var y = 0; y < column_count; y++) {
				for(var x = 0; x < row_count; x++) {
					var tile_type = this.data[i][y][x];
					ctx.drawImage(tile_images[tile_type], y*this.tileSize, x*this.tileSize);
				}
			}
		}
		ctx.strokeRect(this.activeTileX_index * this.tileSize, this.activeTileY_index * this.tileSize, this.tileSize, this.tileSize);
	}
};

canvas.width = map.width;
canvas.height = map.height;

var socket = new WebSocket("ws://127.0.0.1:8000/chat/");
socket.onmessage = function(e) {
    var msg = JSON.parse(e.data);
    switch(msg.event) {
    	case "change":
    		var layer = msg.layer;
    		var x = msg.tile_x;
    		var y = msg.tile_y;
    		var tile = msg.tile;
    		var oldTile = map.data[layer][x][y];
    		if(oldTile !== tile) {
				map.data[layer][x][y] = tile;
    			map.render();
    		}
    	break;
    	case "sync":
    		map.data = JSON.parse(msg.tiles);
    		map.render();
    	break;
    }
}
socket.onopen = function() {
    //socket.send("hello world");
}

// tiles
var tile_dom = document.getElementsByClassName("tileset-tile");
var tile_images = [].slice.call(tile_dom);
if(tile_images.length <= 0) {
	alert("No tiles were found...");
}
tile_images[activeTile].style.border ="3px solid gold";

// closure to preserve i
function tileOnClickFunc(i) {
	return function() {
		tile_images[activeTile].style.border ="none";
		activeTile = parseInt(i);
		tile_images[activeTile].style.border ="3px solid gold";
	};
}
for(var tile_index in tile_images) {
	var tile = tile_images[tile_index];

	tile.onclick = tileOnClickFunc(tile_index);
}

canvas.onclick = function(e) {
	e.preventDefault();
	var needsDraw = false;
	var rect = canvas.getBoundingClientRect();
	var new_x_index = Math.floor((e.pageX - rect.left) / map.tileSize);
	var new_y_index = Math.floor((e.pageY - rect.top) / map.tileSize);
	
	var oldTile = map.data[activeLayer][new_x_index][new_y_index];
	if(oldTile !== activeTile) {
		needsDraw = true;
		map.data[activeLayer][new_x_index][new_y_index] = activeTile;
		var msg = JSON.stringify({"layer": activeLayer, "tile_y": new_y_index, "tile_x": new_x_index, "tile": activeTile, "event": "change"});
		socket.send(msg);
	}
	if(new_x_index !== map.activeTileX_index || 
		new_y_index !== map.activeTileY_index){
		map.activeTileX_index = new_x_index;
		map.activeTileY_index = new_y_index;
		needsDraw = true;
	}
	if(needsDraw)
		map.render();
}
map.init();
map.render();