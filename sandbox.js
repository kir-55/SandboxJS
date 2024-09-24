var canvas = document.getElementById("canvas")
var ctx = canvas.getContext("2d");

var h = document.getElementById("height");
var w = document.getElementById("width");
var m = document.getElementById("mines_amount");

var cell_size = 20;
var normal_brush_size = 2;

var current_grain = 1;

//add type here!

grainTypes = []

//grains
class Grain{
    static gravity = true;
    static surroundingFormat = 0;
    constructor(gravity, surroundingFormat) {
        this.gravity = gravity;
        this.surroundingFormat = surroundingFormat
    }

    static getGrainInt(){
        var realI = 0;
        for(let i in grainTypes){
            if(grainTypes[i].type == this){
                return getRandom(realI+1, realI+grainTypes[i].amount+1);
            }
            realI += grainTypes[i].amount;
            console.log("amount: " + grainTypes[i].amount)
        }
        return 0;
    }

    static applyPhisics(surrounding){
        if(this.gravity == true){
            var newSurrounding = surrounding;
            var self = surrounding[1][1];
            if(surrounding[1][2] == 0){
                newSurrounding[1][2] = self;
                newSurrounding[1][1] = 0;
            }
            else if(surrounding[0][2] == 0 && surrounding[2][2] == 0){
                if (getRandom(0,2) == 0){
                    newSurrounding[0][2] = self;
                    newSurrounding[1][1] = 0;
                }
                else{
                    newSurrounding[2][2] = self;
                    newSurrounding[1][1] = 0;
                }
            } 
            else if(surrounding[0][2] == 0){
                newSurrounding[0][2] = self;
                newSurrounding[1][1] = 0;
            }
            else if(surrounding[2][2] == 0){
                newSurrounding[2][2] = self;
                newSurrounding[1][1] = 0;
            }
            return newSurrounding;
        }
        return surrounding;
    }
}

class WaterAffectable extends Grain{
    maxAffectionLevel;
    affectionLevel = 0;
    constructor(maxAffectionLevel, graity, surroundingFormat){
        super(graity, surroundingFormat);
        this.maxAffectionLevel = maxAffectionLevel;
    }
    setToMaxLevel(){
        this.affectionLevel = this.maxAffectionLevel;
    }

    static applyPhisics(surrounding){
        return super.applyPhisics(surrounding);
    }
}

const sand = class Sand extends Grain{
    constructor(){
        super(true, 0);
    }

    static applyPhisics(surrounding){
        return super.applyPhisics(surrounding);
    }

    static getGrainInt(){
        return 1;
    }
}

const water = class Water extends Grain{
    constructor(){
        super(false, 0);
    }

    static applyPhisics(surrounding){
        return super.applyPhisics(surrounding)
    }

}


//sourrounding formats:
// format 0
//  0|1|2
//  3|4|5
//  6|7|8

// format 1
// 0 |1 |2 |3 |5
// 4 |5 |6 |7 |8
// 9 |10|11|12|13
// 14|15|16|17|18
// 20|21|22|23|24

class GrainType{
    int = 0;
    color = "";
    type = new Grain(true, 0);
    constructor(int, color, type){
        this.int = int;
        this.color = color;
        this.type = type;
        
    }


}


grains = [
    new GrainType(1, "#eae1b0", sand),
    new GrainType(2, "#e5d890", sand),
    new GrainType(3, "#c3b87c", sand),
    new GrainType(4, "#5d9798", water)
]


class GrainVariety {
    amount = 1;
    type = grain;

    constructor(amount, type){
        this.amount = amount;
        this.type = type;
    }
}

function getGrainTypes(){
    var lastGrain
    var i = 0
    for(grain of grains){
        if (lastGrain == grain.type){
            grainTypes[i-1].amount++;
        }
        else{
            grainTypes.push(new GrainVariety(1, grain.type));
            lastGrain = grain.type;
            i++;
        }
        
    }
}


var mousePos = {
    'x' : 0,
    'y' : 0
}

const unexistingGrain = 9999;

const height = 100;
const width = 100;
const pixelHight = height * cell_size;
const pixelWidth = width * cell_size;

canvas.width = pixelHight;
canvas.height = pixelWidth;

var screen = new Array(height).fill(0).map(() => new Array(width).fill(0));

getGrainTypes();
start()

//mouse handling
var mouseInterval;

document.addEventListener("mousemove", function(event){
    var rect = canvas.getBoundingClientRect();
    mousePos.x = Math.floor((event.clientX - rect.left)/cell_size);
    mousePos.y = Math.floor((event.clientY - rect.top)/cell_size);
});

document.addEventListener("mousedown", function(event) {
    // Clear any existing interval before setting a new one
    if (mouseInterval) clearInterval(mouseInterval);
    mouseInterval = setInterval(handleMouse, 20);
});

document.addEventListener("mouseup", function(event) {
    // Clear the interval on mouse release
    clearInterval(mouseInterval);
    mouseInterval = null; // Reset the interval to avoid future conflicts
});

// Optionally handle the scenario where the mouse leaves the canvas
document.addEventListener("mouseleave", function(event) {
    if (mouseInterval) clearInterval(mouseInterval);
});



function handleMouse(){
    placeBrush(mousePos.x, mousePos.y);
}

function start(){
    intervalID = window.setInterval(gameLoop, 1);
}


function nextGrain(){
    if(current_grain < grainTypes.length){
        current_grain++;
    }

}

function gameLoop(){
    runPhysics();
    drawStep();
}

function findGrain(int){
    if(int == 0)
        return
    for(let grain of grains)
        if(grain.int == int)
            return grain;
    
}

function getSurrounding(surroundingFormat, x, y, screen){
    var sideLength = surroundingFormat*2 + 3;
    var surrounding = new Array(sideLength).fill(0).map(() => new Array(sideLength).fill(0));;

    for(x1 = -sideLength/2; x1 < sideLength/2; x1++){
        for(y1 = -sideLength/2; y1 < sideLength/2; y1++){
            var globalX = x+Math.round(x1);
            var globalY = y+Math.round(y1);
            if(globalX >= 0 && globalX < width && globalY >= 0 && globalY < height){
                surrounding[Math.floor(sideLength/2+x1)][Math.floor(sideLength/2+y1)] = screen[globalX][globalY];
            }
            else
                surrounding[Math.floor(sideLength/2+x1)][Math.floor(sideLength/2+y1)] = unexistingGrain;
        }
    }

    return surrounding;
}


function runPhysics(){
    var newScreen = JSON.parse(JSON.stringify(screen)); 
    for(y = 0; y < height; y++){
        for(x = 0; x < width; x++){
            var currentGrainInt = screen[x][y];
            if(currentGrainInt != 0 && currentGrainInt != 9999){
                var currentGrainType = findGrain(currentGrainInt);
                var currentGrain = currentGrainType.type;
                var newSurrounding = currentGrain.applyPhisics(getSurrounding(currentGrain.surroundingFormat, x, y, newScreen))
                var sideLength = currentGrain.surroundingFormat * 2 + 3

                //applying the new surrounding
                for(x1 = -sideLength/2; x1 < sideLength/2; x1++){
                    for(y1 = -sideLength/2; y1 < sideLength/2; y1++){
                        var globalX = x+Math.round(x1);
                        var globalY = y+Math.round(y1);
                        if(globalX >= 0 && globalX < width && globalY >= 0 && globalY < height){
                            newScreen[globalX][globalY] = newSurrounding[Math.floor(sideLength/2+x1)][Math.floor(sideLength/2+y1)];
                        }
                    }
                }
            }
        }
    }
    screen = newScreen
}

function placeBrush(x, y, brush_size = normal_brush_size){
    ctx.fillStyle = "#eeaa00"; 
    for(x1 = -brush_size/2; x1 < brush_size/2; x1++){
        for(y1 = -brush_size/2; y1 < brush_size/2; y1++){
            var globalX = x+Math.round(x1);
            var globalY = y+Math.round(y1);
            if(globalX >= 0 && globalX < width && globalY >= 0 && globalY < height)
                screen[x+Math.round(x1)][y+Math.round(y1)] = grainTypes[current_grain-1].type.getGrainInt();          
        }
    }
    
}

function drawStep(){
    for(y = 0; y < height; y++){
        for(x = 0; x < width; x++){
            var grain = findGrain(screen[x][y])
            ctx.fillStyle = grain? grain.color : "#242926";
            ctx.fillRect(x * cell_size, y * cell_size, cell_size, cell_size);
        }
    }
}

function getRandom(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
}








