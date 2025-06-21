var canvas = document.getElementById("canvas")
var ctx = canvas.getContext("2d");

var h = document.getElementById("height");
var w = document.getElementById("width");
var m = document.getElementById("mines_amount");

var cell_size = 8;
var normal_brush_size = 3;

var current_grain = 1;


grainTypes = []

//grains
class Grain{
    gravity = true;
    density = 1;
    normalInt;
    static surroundingFormat = 0;
    constructor(gravity, surroundingFormat, density) {
        this.gravity = gravity;
        this.surroundingFormat = surroundingFormat;
        this.density = density;
    }


    findNormalInt(type){
        var realI = 0;
        for(let i in grainTypes){
            if(grainTypes[i].type === type){
                this.normalInt = realI+1
                return;
            }
            realI += grainTypes[i].amount;
        }
    }
    

    getGrainInt(){
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

    applyPhisics(surrounding){
        if(this.gravity == true){
            var newSurrounding = JSON.parse(JSON.stringify(surrounding)); ;
            var self = surrounding[1][1];
            if(surrounding[1][2] == 0){
                newSurrounding[1][2] = self;
                newSurrounding[1][1] = 0;
            }
            else if(surrounding[0][2] == 0 && surrounding[2][2] == 0){
                if (getRandom(0,2) == 0){
                    newSurrounding[0][2] = self;
                }
                else{
                    newSurrounding[2][2] = self;
                }
                newSurrounding[1][1] = 0;
            } 
            else if(surrounding[0][2] == 0){
                newSurrounding[0][2] = self;
                newSurrounding[1][1] = 0;
            }
            else if(surrounding[2][2] == 0){
                newSurrounding[2][2] = self;
                newSurrounding[1][1] = 0;
            }
            if(!arraysEqual(surrounding, newSurrounding))
                console.log("gravitacja działa!!");
            return newSurrounding;
        }
        return surrounding;
    }
}

class Liquid extends Grain{
    constructor(density = 1){
        super(true, 0, density);
    }

    applyPhisics(surrounding){
        var result = super.applyPhisics(surrounding)
        if(arraysEqual(surrounding, result)){
            
            var self = result[1][1]; 
            //drowning grains with higher density
            for(var i = 0; i < 3; i++){
                var higherGrain = result[i][0];
                if(higherGrain != 0 && higherGrain != unexistingGrain){
                    var grainType = grains[higherGrain-1].type
                    if(grainType.gravity && grainType.density > this.density){
                        result[i][0] = self;
                        result[1][1] = higherGrain;
                        return result;
                    }
                }
            }
            
            var left = result[0][1];
            var right = result[2][1];

            

            if(left == 0 && right == 0){
                result[getRandom(0,2)*2][1] = self;
                result[1][1] = 0;
                return result;
            }
            else if(left == 0){
                result[0][1] = self;
                result[1][1] = 0;
                return result;
            }
            else if(right == 0){
                result[2][1] = self;
                result[1][1] = 0;
                return result;
            }

            var leftIsLiquid = left != unexistingGrain && left != 0 && !(grains[left-1].type === grains[this.normalInt].type) && grains[left-1].type instanceof Liquid; 
            var rightIsLiquid = right != unexistingGrain && right != 0 && !(grains[right-1].type === grains[this.normalInt].type) && grains[right-1].type instanceof Liquid; 

            if(leftIsLiquid && rightIsLiquid){
                var rnd = getRandom(0,2)*2;
                result[1][1] = result[rnd][1];
                result[rnd][1] = self;
            }
            else if(leftIsLiquid){
                result[0][1] = self;
                result[1][1] = left;
            }
            else if(rightIsLiquid){
                result[0][1] = self;
                result[1][1] = right;
            }

        }
        return result;
    }
}

class LiquidAffectable extends Grain{

    normalInt
    maxAffectionLevel;
    constructor(graity, surroundingFormat, density, normalInt, maxAffectionLevel){
        super(graity, surroundingFormat, density);
        this.maxAffectionLevel = maxAffectionLevel;
        this.normalInt = normalInt;
    }

    applyPhisics(surrounding){
        var result = super.applyPhisics(surrounding);
        if(arraysEqual(result,surrounding)){ 
            console.log("zawsze działa");
            if(result[1][1] != this.normalInt + this.maxAffectionLevel){
                for(var x = 0; x < 3; x++){
                    for(var y = 0; y < 3; y++){
                        if((x+y)%2 == 1){
                            var side = result[x][y];
                            if(side != 0 && side != unexistingGrain){
                                var grain_type = grains[side-1].type;
                                
                                if(grain_type instanceof Liquid){
                                    result[1][1] = this.normalInt + this.maxAffectionLevel;
                                }
                                else if(grain_type instanceof LiquidAffectable){
                                    if(side - grain_type.normalInt > 0){
                                        var rnd = getRandom(0, 500);
                                        if(rnd == 3)
                                            result[1][1] = this.normalInt + side - grain_type.normalInt;
                                        else
                                            result[1][1] = this.normalInt + side - grain_type.normalInt - 1; 
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }else{
            console.log("niezgodność");
        }
        return result;
    }
}

const sand = class Sand extends LiquidAffectable{
    constructor(normalInt){
        super(true, 0, 3, normalInt, 2);
    }

    getGrainInt(){
        return this.normalInt;
    }
}

const water = class Water extends Liquid{

}

const acid = class Acid extends Liquid{
    constructor(){
        super(2);
    }

    applyPhisics(surrounding){
        var result = super.applyPhisics(surrounding);
        if(arraysEqual(result, surrounding)){ 
            result = destroyNear(result, [iron], 40, true);
        }
        return result;
    }
    
}

const iron = class Iron extends Grain{
    constructor(){
        super(false, 0, 50);
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
    color = "";
    type = new Grain(true, 0);
    constructor(color, type){
        this.color = color;
        this.type = type;
        
    }


}

const normal_sand = new sand();
const normal_water = new water();
const normal_iron = new iron();
const normal_acid = new acid();

grains = [
    new GrainType("#eae1b0", normal_sand),
    new GrainType("#e5d890", normal_sand),
    new GrainType("#c3b87c", normal_sand),
    new GrainType("#0f5e9c", normal_water),
    new GrainType("#2389da", normal_water),
    new GrainType("#1ca3ec", normal_water),
    new GrainType("#0f5e9c", normal_water),
    new GrainType("#848482", normal_iron),
    new GrainType("#cbcdcd", normal_iron),
    new GrainType("#999e98", normal_iron),
    new GrainType("#343432", normal_iron),
    new GrainType("#696b5e", normal_iron),
    new GrainType("#f4ffd1", normal_acid),
    new GrainType("#f4ff9f", normal_acid),
    new GrainType("#f5ff62", normal_acid),
    new GrainType("#e7ff2c", normal_acid),
    new GrainType("#d2ff46", normal_acid),
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

    for(grainType of grainTypes){
        grainType.type.findNormalInt(grainType.type);
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

function arraysEqual(arr1, arr2) {
    if (arr1[1][1] != arr2[1][1]) 
        return false;
    return true;
}

function nextGrain(){
    if(current_grain < grainTypes.length)
        current_grain++;
    else 
        current_grain = 0;

}

function prevGrain(){
    if(current_grain > 0)
        current_grain--;
    else
        current_grain = grainTypes.length;
}

function gameLoop(){
    runPhysics();
    drawStep();
}

function findGrain(int){
    if(int == 0)
        return;
    for(let grainIndex in grains)
        if(grainIndex == int-1)
            return grains[grainIndex];
    
}
//this function is only of surrounding type 0
function destroyNear(surrounding, grainsToDestroy, chanceToSelfDestroy = 100, onlySides = true){
    for(var x = 0; x < 3; x++){
        for(var y = 0; y < 3; y++){
            if(!onlySides || (onlySides && (x+y)%2 == 1)){
                for(let grainToDestroy of grainsToDestroy){
                    var side = surrounding[x][y];
                    if (side != 0 && side != unexistingGrain){
                        if(grains[surrounding[x][y]-1].type instanceof grainToDestroy){
                            surrounding[x][y] = 0;
                            var chance = getRandom(0, 100);
                            if (chance < chanceToSelfDestroy){
                                surrounding[1][1] = 0;
                                return surrounding;
                            }
                            break;
                        }
                    }
                } 
            }
        }
    }
    return surrounding;
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
    for(x = 0; x < width; x++){
        for(y = 0; y < height; y++){
            var currentGrainInt = screen[x][y];
            if(currentGrainInt != 0 && currentGrainInt != unexistingGrain && currentGrainInt == newScreen[x][y]){
                
                var currentGrainType = grains[currentGrainInt-1];
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
                screen[x+Math.round(x1)][y+Math.round(y1)] = current_grain > 0? grainTypes[current_grain-1].type.getGrainInt() : 0;          
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








