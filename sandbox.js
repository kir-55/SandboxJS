 var canvas = document.getElementById("canvas")
var ctx = canvas.getContext("2d");

var h = document.getElementById("height");
var w = document.getElementById("width");
var m = document.getElementById("mines_amount");

var cell_size = 8;
var normal_brush_size = 3;

var current_grain = 1;


grainTypes = []


//gravity types
// 0 - no gravity
// 1 - full gravity
// 2 - gravity only down


//grains
class Grain{
    gravity = 1;
    density = 1;
    normalInt;
    surroundingFormat = 0;
    constructor(gravity = 1, surroundingFormat = 0, density = 1) {
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
                return getRandomInt(realI+1, realI+grainTypes[i].amount+1);
            }
            realI += grainTypes[i].amount;
        }
        return 0;
    }
    // GRAVITY
    // 0 - no gravity
    // 1 - full gravity
    // 2 - gravity only down
    // 3 - gravity full up (gas gravity)
    applyPhisics(surrounding){
        if(this.gravity == 1 || this.gravity == 2){
            var newSurrounding = JSON.parse(JSON.stringify(surrounding));
            var self = surrounding[1][1];
            if(surrounding[1][2] == 0){
                newSurrounding[1][2] = self;
                newSurrounding[1][1] = 0;
            }
            else if(surrounding[0][2] == 0 && surrounding[2][2] == 0 && this.gravity == 1){
                if (getRandomInt(0,2) == 0){
                    newSurrounding[0][2] = self;
                }
                else{
                    newSurrounding[2][2] = self;
                }
                newSurrounding[1][1] = 0;
            } 
            else if(surrounding[0][2] == 0 && this.gravity == 1){
                newSurrounding[0][2] = self;
                newSurrounding[1][1] = 0;
            }
            else if(surrounding[2][2] == 0 && this.gravity == 1){
                newSurrounding[2][2] = self;
                newSurrounding[1][1] = 0;
            }
            return newSurrounding;
        }
        else if(this.gravity == 3){
            var newSurrounding = JSON.parse(JSON.stringify(surrounding));
            var self = surrounding[1][1];

            // it has a chance to move up or to the sides
            if (getRandom(0, 100) < 30) {
                if(surrounding[1][0] == 0){
                    newSurrounding[1][0] = self;
                    newSurrounding[1][1] = 0;
                }
            }
            else if (getRandom(0, 100) < 30) {
                if(surrounding[0][0] == 0 && surrounding[2][0] == 0){
                    if (getRandomInt(0,2) == 0){
                        newSurrounding[0][0] = self;
                    }
                    else{
                        newSurrounding[2][0] = self;
                    }
                    newSurrounding[1][1] = 0;
                } 
                else if(surrounding[0][0] == 0){
                    newSurrounding[0][0] = self;
                    newSurrounding[1][1] = 0;
                }
                else if(surrounding[2][0] == 0){
                    newSurrounding[2][0] = self;
                    newSurrounding[1][1] = 0;
                }
            }
            return newSurrounding;
        }

        return surrounding;
    }
}

class Fire extends Grain {
    chanceToDie = 5; // Percentage chance to die each step
    constructor() { 
        super(3, 0, 0);
    }
    applyPhisics(surrounding) {
        var result = super.applyPhisics(surrounding);

        if (arraysEqual(surrounding, result)) {
            // Check for flammable grains around
            for (var x = 0; x < 3; x++) {
                for (var y = 0; y < 3; y++) {
                    if ((x + y) % 2 === 1) { // Only check sides
                        var sideGrain = result[x][y];
                        if (sideGrain !== 0 && sideGrain !== unexistingGrain) {
                            var grainObj = grains[sideGrain - 1];
                            if (grainObj.type instanceof FlamableGrain) {
                                //result[1][1] = 0; // Burn this grain
                                return result;
                            }
                        }
                    }
                }
            }

                    // has a chance to die
            if (getRandom(0, 100) < this.chanceToDie) {
                result[1][1] = 0; // Burn this grain
            }
            else {
                result[1][1] = normal_fire.getGrainInt(); // Burn this grain
            }

        }


        return result;
    }
}




class FlamableGrain extends Grain {
    flammability = 50; // Default flammability percentage
    surroundingFormat = 0; // Default surrounding format
    constructor(gravity, surroundingFormat, density, flammability = 50) {
        super(gravity, surroundingFormat, density);
        this.flammability = flammability;
    }

    applyPhisics(surrounding) {
        var result = super.applyPhisics(surrounding);

        if (arraysEqual(surrounding, result)) {
            // Check for fire around
            for (var x = 0; x < 3; x++) {
                for (var y = 0; y < 3; y++) {
                    if ((x + y) % 2 === 1) { // Only check sides
                        var sideGrain = result[x][y];
                        if (sideGrain !== 0 && sideGrain !== unexistingGrain) {
                            var grainObj = grains[sideGrain - 1];
                            // flamibility is not defined 

                            if (grainObj.type instanceof Fire) {
                                if (this.flammability > 0 && getRandom(0, 100) < this.flammability) {
                                    result[1][1] = normal_fire.getGrainInt(); // Burn this grain
                                    return result;
                                }
                            }
                        }
                    }
                }
            }
        }
        return result;
    }


}

class ExplosiveGrain extends Grain {
    explosionChance = 10; // Percentage chance to explode when burning
    chanceToDuplicate = 0.1; // Percentage chance to duplicate when burning
    constructor(gravity, density, explosionChance = 100, power = 100, chanceToDuplicate = 0.3) {
        super(gravity, 0, density);
        this.explosionChance = explosionChance;
        this.power = power;
        this.chanceToDuplicate = chanceToDuplicate;
    }

    applyPhisics(surrounding) {
        var result = super.applyPhisics(surrounding);

        if (arraysEqual(surrounding, result)) {

            for (var x = 0; x < 3; x++) {
                for (var y = 0; y < 3; y++) {
                    if ((x + y) % 2 === 1) { // Only check sides
                        var sideGrain = result[x][y];
                        if (sideGrain !== 0 && sideGrain !== unexistingGrain) {
                            var grainObj = grains[sideGrain - 1];
                            if (grainObj.type instanceof Fire || grainObj.type instanceof Lava) {
                                if (getRandom(0, 100) < this.explosionChance ) {
                                    // change near grains to fire if their density is lower than the power of the explosion
                                    for (var i = 0; i < 3; i++) {
                                        for (var j = 0; j < 3; j++) {
                                            if ((i + j) % 2 === 1) { // Only check sides
                                                var nearGrain = result[i][j];
                                                if (nearGrain !== 0 && nearGrain !== unexistingGrain) {
                                                    var nearGrainObj = grains[nearGrain - 1];
                                                    if (nearGrainObj.type.density <= this.power) {
                                                        var rnd = getRandom(0, 100);
                                                        if (rnd < this.chanceToDuplicate * 100) {
                                                            // Duplicate the explosive grain
                                                            result[i][j] = this.getGrainInt(); // Change to explosive grain
                                                        } else {
                                                            result[i][j] = normal_fire.getGrainInt(); // Change to fire
                                                        }
                                                        
                                                    }

                                                }
                                                else if (nearGrain === 0) {
                                                    // If the grain is empty, it can be filled with fire
                                                    var rnd = getRandom(0, 100);
                                                    if (rnd < this.chanceToDuplicate * 100) {
                                                        result[i][j] = this.getGrainInt(); // Change to explosive grain
                                                    } else {
                                                        result[i][j] = normal_fire.getGrainInt(); // Change to fire
                                                    }
                                                }
                                            }
                                        }
                                    }
                                    result[1][1] = normal_fire.getGrainInt(); // Remove the explosive grain
                                    return result;
                                    
                                }
                            }
                        }
                    }
                }
            }
            
            
        }
        return result;
    }
}

class Liquid extends Grain {
    killsFire = true; // Whether this liquid can extinguish fire
    breaksWires = true; // Whether this liquid can break wires
    gasForm = null; // Gas form of this liquid, if any


    constructor(density = 1, killsFire = true, gasForm = null, breaksWires = true) {
        super(1, 0, density);
        this.killsFire = killsFire;
        this.gasForm = gasForm;
        this.breaksWires = breaksWires;
    }

    applyPhisics(surrounding) {
        var result = super.applyPhisics(surrounding);

        if (arraysEqual(surrounding, result)) {
            var self = result[1][1];


            // 1. Try to move under a lower-density liquid (swap places)
            var below = result[1][2];
            if (below !== 0 && below !== unexistingGrain) {
                var belowGrainObj = grains[below - 1];
                if (
                    belowGrainObj.type instanceof Liquid &&
                    belowGrainObj.type.density < this.density
                ) {
                    // Swap with the lower density liquid below
                    result[1][2] = self;
                    result[1][1] = below;
                    return result;
                }
                
            }

            // 2. Drown grains with higher density (above)
            for (var i = 0; i < 3; i++) {
                var aboveGrain = result[i][0];
                if (aboveGrain !== 0 && aboveGrain !== unexistingGrain) {
                    var aboveGrainObj = grains[aboveGrain - 1];
                    if ((aboveGrainObj.type.gravity == 1 || (aboveGrainObj.type.gravity == 2 && i == 1)) && aboveGrainObj.type.density > this.density) {
                        result[i][0] = self;
                        result[1][1] = aboveGrain;
                        return result;
                    }
                }
            }





            

            // 3. Move sideways if possible
            var left = result[0][1];
            var right = result[2][1];

            if (left === 0 && right === 0) {
                result[getRandomInt(0, 2) * 2][1] = self;
                result[1][1] = 0;
                return result;
            } else if (left === 0) {
                result[0][1] = self;
                result[1][1] = 0;
                return result;
            } else if (right === 0) {
                result[2][1] = self;
                result[1][1] = 0;
                return result;
            }


            // 4. Swap with other liquids of lower density to the sides
            function isOtherLiquid(grainIdx) {
                if (grainIdx === 0 || grainIdx === unexistingGrain) return false;
                var grainObj = grains[grainIdx - 1];
                return (grainObj.type instanceof Liquid) && (grainObj.type.density < this.density);
            }

            var leftIsOtherLiquid = isOtherLiquid.call(this, left);
            var rightIsOtherLiquid = isOtherLiquid.call(this, right);

            if (leftIsOtherLiquid && rightIsOtherLiquid) {
                var rnd = getRandomInt(0, 2) * 2;
                result[1][1] = result[rnd][1];
                result[rnd][1] = self;
            } else if (leftIsOtherLiquid) {
                result[0][1] = self;
                result[1][1] = left;
            } else if (rightIsOtherLiquid) {
                result[2][1] = self;
                result[1][1] = right;
            }


            for (var x = 0; x < 3; x++) {
                for (var y = 0; y < 3; y++) {
                    if ((x + y) % 2 === 1) { // Only check sides
                        var sideGrain = result[x][y];
                        if (sideGrain !== 0 && sideGrain !== unexistingGrain) {
                            var grainObj = grains[sideGrain - 1];
                            if (this.killsFire && (grainObj.type instanceof Fire || grainObj.type instanceof Lava)) {
                                if (this.gasForm)  {
                                    result[1][1] = this.gasForm.getGrainInt(); // Change to gas form
                                }
                                else {
                                    result[1][1] = 0; // Remove fire
                                }
                                result[x][y] = 0; // Remove fire
                                return result;
                            }
                            else if (this.breaksWires && grainObj.type instanceof WireGrain) {
                                // Break the wire
                                var rnd = getRandom(0.0, 100.0);
                                if (rnd < 0.01) { // 50% chance to break the wire
                                    result[x][y] = 0; // Remove wire
                                }
                                return result;
                            }
                            else if (grainObj.type instanceof Uran && this.gasForm) {
                                // If the grain is Uran and this liquid has a gas form, change to gas form
                                result[1][1] = this.gasForm.getGrainInt(); // Change to gas form
                                return result;
                            }
                        }
                    }
                }
            }


        }
        return result;
    }
}

class LiquidAffectable extends Grain{
    wetGrain;
    dryGrain;
    isWet = false; // Whether this grain is wet
    constructor(graity, surroundingFormat, density, wetGrain, dryGrain, chanceToAffect = 100, chanceFroliquidAffectableToAffect = 0.01, absorbsLiquid = false, isWet = false, chanceToDry = 0.01) {
        super(graity, surroundingFormat, density);
        this.wetGrain = wetGrain;
        this.dryGrain = dryGrain;
        this.chanceToAffect = chanceToAffect;
        this.chanceFroliquidAffectableToAffect = chanceFroliquidAffectableToAffect;
        this.absorbsLiquid = absorbsLiquid;
        this.isWet = isWet; // Whether this grain is wet
        this.chanceToDry = chanceToDry; // Chance to dry out
    }

    applyPhisics(surrounding){
        var result = super.applyPhisics(surrounding);
        if(arraysEqual(result,surrounding)){ 
            var touchsLiquid = false;
            for(var x = 0; x < 3; x++){
                for(var y = 0; y < 3; y++){
                    if((x+y)%2 == 1){
                        var side = result[x][y];
                        if(side != 0 && side != unexistingGrain){
                            var grain_type = grains[side-1].type;

                            if(grain_type instanceof Liquid){
                                var rnd = getRandom(0.0, 100.0);
                                if(rnd < this.chanceToAffect && this.wetGrain){
                                    //this returns zero
                                    // check if wet grain is array or not
                                    if (Array.isArray(this.wetGrain)) {
                                        result[1][1] = this.wetGrain[getRandomInt(0, this.wetGrain.length)].getGrainInt();
                                    } else {
                                        result[1][1] = this.wetGrain.getGrainInt();
                                    }


                                    if(this.absorbsLiquid){
                                        result[x][y] = 0; // Absorb the liquid
                                    }
                                }
                                touchsLiquid = true;
                            }
                            else if(grain_type instanceof LiquidAffectable){
                                if (grain_type.isWet) {
                                    var rnd = getRandom(0.0, 100.0);
                                    if(rnd < this.chanceFroliquidAffectableToAffect && this.dryGrain){
                                        if (Array.isArray(this.dryGrain)) {
                                            result[1][1] = this.dryGrain[getRandomInt(0, this.dryGrain.length)].getGrainInt();
                                        } else {
                                            result[1][1] = this.dryGrain.getGrainInt();
                                        }
                                    }
                                }
                            }
                            else if (grain_type instanceof Fire) {
                                // If the grain is fire, it can turn this grain wet
                                if (this.isWet && this.dryGrain) {
                                    if (Array.isArray(this.dryGrain)) {
                                        result[1][1] = this.dryGrain[getRandomInt(0, this.dryGrain.length)].getGrainInt();
                                    } else {
                                        result[1][1] = this.dryGrain.getGrainInt();
                                    }
                                }
                            }

                            
                            
                        }
                        else if (this.isWet && side == 0 && this.dryGrain) {
                            // If this grain is wet and absorbs liquid, it can dry out
                            var rnd = getRandom(0.0, 100.0);
                            if (rnd < this.chanceToDry && this.dryGrain) {
                                if (Array.isArray(this.dryGrain)) {
                                    result[1][1] = this.dryGrain[getRandomInt(0, this.dryGrain.length)].getGrainInt();
                                } else {
                                    result[1][1] = this.dryGrain.getGrainInt();
                                }
                            }
                        }
                        
                    }
                }
            }

            
        }
        return result;
    }
}

class ElectricalProducer extends Grain {
    constructor(gravity = 1, surroundingFormat = 0, density = 1, chanceToProduce = 10) {
        super(gravity, surroundingFormat, density);
        this.chanceToProduce = chanceToProduce;
    }

    applyPhisics(surrounding) {
        var result = super.applyPhisics(surrounding);

        if (arraysEqual(surrounding, result)) {
            // Check for fire around
            for (var x = 0; x < 3; x++) {
                for (var y = 0; y < 3; y++) {
                    if ((x + y) % 2 === 1) { // Only check sides
                        var sideGrain = result[x][y];
                        if (sideGrain !== 0 && sideGrain !== unexistingGrain) {
                            var grainObj = grains[sideGrain - 1];
                            if (grainObj.type instanceof WireGrain) { 
                                if  (sideGrain < grainObj.type.normalInt + grainObj.type.maxCharge - 1 && getRandom(0, 100) < this.chanceToProduce) {
                                    result[x][y] = grainObj.type.normalInt + grainObj.type.maxCharge - 1;

                                }
                            }

                        }
                    }
                }
            }
        }
        return result;
    }
}

class WireGrain extends FlamableGrain{
    maxCharge = 5; // Maximum charge this wire can hold
    constructor(maxCharge = 5){
        super(0, 0, 5, 1);
        this.maxCharge = maxCharge;
    }
    // if collides with weaker charged grain, it will transfer charge to it
    applyPhisics(surrounding){
        var result = super.applyPhisics(surrounding);
        if(arraysEqual(result, surrounding)){
            // Check for fire around
            for(var x = 0; x < 3; x++){
                for(var y = 0; y < 3; y++){
                    if((x+y)%2 == 1){ // Only check sides
                        var sideGrain = result[x][y];
                        if(sideGrain !== 0 && sideGrain !== unexistingGrain){
                            var grainObj = grains[sideGrain - 1];
                            if (grainObj.type instanceof WireGrain) {
                                // If the wire is charged, transfer charge to the side grain
                                if (sideGrain < surrounding[1][1]) {
                                    result[x][y] += 1; // Increase charge of the side grain
                                    result[1][1] -= 1; // Decrease charge of the wire grain
                                }
                            }
                        }
                    }
                }
            }
        }
        return result;
    }

    getGrainInt(){
        return this.normalInt;
    }
}

class HeatingElement extends Grain {
    constructor() {
        super(0, 0, 1);
    }

    applyPhisics(surrounding) {
        var result = super.applyPhisics(surrounding);

        if (arraysEqual(surrounding, result)) {
            // Check for flammable grains around
            for (var x = 0; x < 3; x++) {
                for (var y = 0; y < 3; y++) {
                    if ((x + y) % 2 === 1) { // Only check sides
                        var sideGrain = result[x][y];
                        if (sideGrain !== 0 && sideGrain !== unexistingGrain) {
                            var grainObj = grains[sideGrain - 1];
                            if (grainObj.type instanceof WireGrain) { 
                                if  (sideGrain > grainObj.type.normalInt) {
                                    // check the sides and if there is space place fire
                                    for (var i = 0; i < 3; i++) {
                                        for (var j = 0; j < 3; j++) {
                                            if ((i + j) % 2 === 1 && result[i][j] === 0) { // Only check sides
                                                result[i][j] = normal_fire.getGrainInt(); // Place fire
                                                result[x][y] -= 1; // Decrease charge of the wire grain
                                                return result;
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        return result;
    }
}

class ElectricalDispenser extends Grain {
    constructor() {
        super(0, 0, 1);
    }
    // only gives energy when wire is empty
    applyPhisics(surrounding) {
        var result = super.applyPhisics(surrounding);
        var chargeWires = [];

        if (arraysEqual(surrounding, result)) {
            // Check for wire around
            var emptyWires = [];
            for (var x = 0; x < 3; x++) {
                for (var y = 0; y < 3; y++) {
                    if ((x + y) % 2 === 1) { // Only check sides
                        var sideGrain = result[x][y];
                        if (sideGrain !== 0 && sideGrain !== unexistingGrain) {
                            var grainObj = grains[sideGrain - 1];
                            if (grainObj.type instanceof WireGrain) { 
                                if (sideGrain > grainObj.type.normalInt) {
                                    chargeWires.push({
                                        x: x,
                                        y: y
                                    });
                                }
                                else if (sideGrain === grainObj.type.normalInt) {
                                    emptyWires.push({
                                        x: x,
                                        y: y
                                    });
                                }
                            }
                        }
                    }
                }
            }
            if (chargeWires.length > 0 && emptyWires.length > 0) {
                // Place charge in a random empty wire
                var chargePosition = chargeWires[getRandomInt(0, chargeWires.length - 1)];
                var randomWire = emptyWires[getRandomInt(0, emptyWires.length - 1)];
                result[randomWire.x][randomWire.y] += 1; // Place charge
                result[chargePosition.x][chargePosition.y] -= 1; // Decrease charge of the dispenser
                return result;
                
            }
        }
        return result;
    }
}

class DuplicateElement extends Grain {

    constructor() {
        super(0, 0, 1);
    }

    applyPhisics(surrounding) {
        var result = super.applyPhisics(surrounding);
        var wireGrainPos = {
            x: -1,
            y: -1   
        }
        if (arraysEqual(surrounding, result)) {
            // Check for grains around
            var sideGrains = [];
            for (var x = 0; x < 3; x++) {
                for (var y = 0; y < 3; y++) {
                    if ((x + y) % 2 === 1 && result[x][y] != 0 && result[x][y] != unexistingGrain) { // Only check sides
                        
                        var sideGrain = result[x][y];
                        var grainObj = grains[sideGrain - 1];

                        if (grainObj.type instanceof WireGrain ) {
                            if (sideGrain > grainObj.type.normalInt) {
                                wireGrainPos.x = x;
                                wireGrainPos.y = y;
                            }
                        }else{
                            sideGrains.push(grainObj.type);
                        }
                        
                    }
                }
            }
            if (sideGrains.length > 0 && sideGrains.length < 4 && wireGrainPos.x != -1 && wireGrainPos.y != -1) { 

                var randomGrain = sideGrains[getRandomInt(0, sideGrains.length - 1)];
                var newGrainInt = randomGrain.getGrainInt();
                // Place the new grain in a random empty side position
                for (var i = 0; i < 3; i++) {
                    for (var j = 0; j < 3; j++) {
                        if ((i + j) % 2 === 1 && result[i][j] === 0) { // Only check sides
                            result[i][j] = newGrainInt; // Place the new grain
                            result[wireGrainPos.x][wireGrainPos.y] -= 1; // Decrease charge of the wire grain
                            return result;
                        }
                    }
                }
                
            }
        }
        return result;
    }
}
                        

class Gas extends Grain {
    chanceToReturnToNonGasForm = 0.01; // Percentage chance to return to liquid state
    nonGasForm = null;
    constructor(density = 1, chanceToReturnToNonGasForm = 0.01, nonGasForm = null) {
        super(3, 0, density);
        this.chanceToReturnToNonGasForm = chanceToReturnToNonGasForm;
        this.nonGasForm = nonGasForm;
    }

    applyPhisics(surrounding) {
        var result = super.applyPhisics(surrounding);
        // checks left and right if free then moves to the side
        if (arraysEqual(surrounding, result)) {
            var left = result[0][1];
            var right = result[2][1];
            var self = result[1][1];

            if (left === 0 && right === 0) {
                result[getRandomInt(0, 2) * 2][1] = self;
                result[1][1] = 0;
                return result;
            } else if (left === 0) {
                result[0][1] = self;
                result[1][1] = 0;
                return result;
            } else if (right === 0) {
                result[2][1] = self;
                result[1][1] = 0;
                return result;
            }

            var rnd = getRandom(0.0, 100.0);
            if (rnd < this.chanceToReturnToNonGasForm * 100) {
                result[1][1] = this.nonGasForm.getGrainInt();
                return result;
            }
        }
        return result;
    }
}


class Uran extends ElectricalProducer {
    chanceToFlame = 0.1;
    chanceToBlowup = 0.01;
    constructor(chanceToFlame = 0.1) {
        super(0, 0, 10, 55);
        this.chanceToFlame = chanceToFlame;
    }

    applyPhisics(surrounding) {
        var result = super.applyPhisics(surrounding);
        
        
        if (arraysEqual(surrounding, result)) {
           // can place flame around it only if there is no water touching it
            var canPlaceFlame = true;
            var touchesFire = 0;

            for (var x = 0; x < 3; x++) {
                for (var y = 0; y < 3; y++) {
                    
                    var surroundingGrain = surrounding[x][y];
                    if (surroundingGrain != 0 && surroundingGrain != unexistingGrain) {
                        var grainObj = grains[surroundingGrain - 1];
                        if (grainObj.type instanceof Liquid && grainObj.type.killsFire) {
                            canPlaceFlame = false;
                        }
                        if (grainObj.type instanceof Fire || grainObj.type instanceof Lava) {
                            touchesFire += 1;
                        }
                    } 
                    
                }
            }
            // randomly place flame around it
            if (canPlaceFlame) {
                var rnd = getRandom(0.0, 100.0);
                if (rnd < this.chanceToBlowup || touchesFire > 1){
                    var result = JSON.parse(JSON.stringify(surrounding));
                    for (var x = 0; x < 3; x++) {
                        for (var y = 0; y < 3; y++) {
                            result[x][y] = this.getGrainInt();
                        }
                    }
                    return result;
                }
                if (rnd < this.chanceToFlame) {
                    // place flame in a random side
                    var result = JSON.parse(JSON.stringify(surrounding));
                    result[getRandomInt(0, 2)*2][getRandomInt(0, 2)*2] = normal_fire.getGrainInt();
                    return result;
                }
                
            }
        }
        return result;
    }
}

class Sand extends LiquidAffectable{
    constructor(wetGrain = null, dryGrain = null){
        super(1, 0, 3, wetGrain, dryGrain, 3, 0.01, true, false, 0);
    }
}

class WetSand extends LiquidAffectable{
    constructor(wetGrain = null, dryGrain = null){
        super(0, 0, 3, wetGrain, dryGrain, 0, 0, false, true, 0.01);
    }
}

class Seed extends FlamableGrain {
    chanceToGrow = 0.01; // Percentage chance to grow into a plant
    needsWater = true; // Whether this seed needs water to grow
    needsDirt = true; // Whether this seed needs dirt to grow
    turnInto; // The grain type this seed turns into when it grows
    constructor(turnInto, chanceToGrow = 0.01, needsWater = true, needsDirt = true) {
        super(1, 0, 3, 10);
        this.chanceToGrow = chanceToGrow;
        this.needsWater = needsWater;
        this.needsDirt = needsDirt;
        this.turnInto = turnInto;
        
    }

    applyPhisics(surrounding) {
        var result = super.applyPhisics(surrounding);
        

        if (arraysEqual(surrounding, result)) {
            if (this.needsWater || this.needsDirt) {
                var hasWater = false;
                var hasDirt = false;
                // Check for water around
                for (var x = 0; x < 3; x++) {
                    for (var y = 0; y < 3; y++) {
                        if ((x + y) % 2 === 1) { // Only check sides
                            var sideGrain = result[x][y];
                            if (sideGrain !== 0 && sideGrain !== unexistingGrain) {
                                var grainObj = grains[sideGrain - 1];
                                if (grainObj.type instanceof Liquid) { // Check for water
                                    hasWater = true;
                                }

                                if (grainObj.type instanceof Sand) { // Check for dirt
                                    hasDirt = true;
                                }

                                if (grainObj.type instanceof WetSand) { // Check for wet Sand
                                    hasDirt = true;
                                    hasWater = true; // Wet Sand has water
                                }
                            }
                        }
                    }
                }
            }

            if ((!this.needsWater || hasWater) && (!this.needsDirt || hasDirt)) {
                // Check if it can grow
                var rnd = getRandom(0.0, 100.0);
                if (rnd < this.chanceToGrow * 100) {
                    // Turn into the grain type it grows into
                    result[1][1] = this.turnInto.getGrainInt();
                    return result;
                }
            }
        }
        return result;
    }
}


class Plant extends FlamableGrain {
    growthChance = 0.002; // Percentage chance to grow to the next stage
    chanceToStopGrowing = 0.001; // Percentage chance to stop growing
    chanceToGrowLeafs = 0.0001; // Percentage chance to grow leaves
    grownForm = null; // The grain type this plant grows into
    constructor(grownForm, leaf, growthChance = 0.002, chanceToStopGrowing = 0.001, chanceToGrowLeafs = 0.0001) {
        super(0, 0, 1, 25);
        this.growthChance = growthChance;
        this.chanceToStopGrowing = chanceToStopGrowing;
        this.grownForm = grownForm;
        this.chanceToGrowLeafs = chanceToGrowLeafs;
        this.leaf = leaf; // The leaf type this plant can grow
    }

    applyPhisics(surrounding) {
        var result = super.applyPhisics(surrounding);

        if (arraysEqual(surrounding, result)) {
            // Check if it can grow
            var rnd = getRandom(0.0, 100.0);
            if (rnd < this.chanceToStopGrowing * 100) {
                // Stop growing
                result[1][1] = this.grownForm.getGrainInt();    
                return result;
            }

            rnd = getRandom(0.0, 100.0);
            if (rnd < this.growthChance * 100) {
                if( surrounding[1][0] === 0 && (surrounding[0][1] === 0 && surrounding[0][2] === 0) && (surrounding[2][1] === 0 && surrounding[2][2] === 0))
                { 
                    
                    var s = getRandomInt(0, 3);
                    if (s == 0) {
                        result[1][0] = this.getGrainInt();
                    }
                    else if (s == 1) {
                        result[0][1] = this.getGrainInt();
                    }
                    else {
                        result[2][1] = this.getGrainInt();
                    }
                    result[1][1] = this.grownForm.getGrainInt();
                }
                else if (surrounding[1][0] === 0) {
                    var s = getRandomInt(0, 2);
                    if (s == 0) {
                        result[1][0] = this.getGrainInt();
                    }
                    else if (s == 1) {
                        if (surrounding[0][1] === 0 && surrounding[0][2] === 0) {
                            result[0][1] = this.getGrainInt();
                            result[1][1] = this.grownForm.getGrainInt();
                        }
                        else if (surrounding[2][1] === 0 && surrounding[2][2] === 0) {
                            result[2][1] = this.getGrainInt();
                            result[1][1] = this.grownForm.getGrainInt();
                        }
                    }

                }
                else{
                    result[1][1] = this.grownForm.getGrainInt();
                }



               

                return result;
            }
            // Chance to grow leaves
            rnd = getRandom(0.0, 100.0);
            if (rnd < this.chanceToGrowLeafs * 100) {
                // Grow leaves around
                for (var x = 0; x < 3; x++) {
                    for (var y = 0; y < 3; y++) {
                        if ((x + y) % 2 === 1 && result[x][y] === 0) { // Only check sides
                            result[x][y] = this.leaf.getGrainInt(); // Place leafs
                            return result;
                        }
                    }
                }
            }
        }
        return result;
    }

}

class Wood extends FlamableGrain {
    constructor() {
        super(0, 0, 10, 55);
    }
}

class Leaf extends FlamableGrain {
    constructor() {
        super(0, 0, 1, 25);
    }

    applyPhisics(surrounding) {
        var result = super.applyPhisics(surrounding);


        if (arraysEqual(surrounding, result)) {
            // if touches wood then spreads
            for (var x = 0; x < 3; x++) {
                for (var y = 0; y < 3; y++) {
                    if ((x + y) % 2 === 1) { // Only check sides
                        var sideGrain = result[x][y];
                        if (sideGrain !== 0 && sideGrain !== unexistingGrain) {
                            var grainObj = grains[sideGrain - 1];
                            if (grainObj.type instanceof Wood) {
                                for (var i = 0; i < 3; i++) {
                                    for (var j = 0; j < 3; j++) {
                                        //(i + j) % 2 === 1 &&
                                        if (result[i][j] === 0) { // Only check sides
                                            result[i][j] = this.getGrainInt(); // Place leafs
                                            return result;
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        return result;
    }
}


const WaterVapor = class WaterVapor extends Gas{
    constructor(normalForm) {
        super(0, 0.01, normalForm);
    }
}

const Water = class Water extends Liquid{
    constructor(gasForm){
        super(1, true, gasForm, true);
    }
}




class AcidVapor extends Gas{
    constructor(normalForm) {
        super(0, 0.01, normalForm);
    }
}

class Acid extends Liquid{
    constructor(gasForm){
        super(2, true, gasForm, true);
    }

    applyPhisics(surrounding){
        var result = super.applyPhisics(surrounding);
        if(arraysEqual(result, surrounding)){ 
            console.log("Acid applied phisics");
            result = destroyNear(result, [Iron], 40, true, 100, 1);
            result = destroyNear(result, [Stone], 40, true, 100, 1);
            result = destroyNear(result, [RustIron], 40, true, 100, 1);
            result = destroyNear(result, [WeakRustIron], 40, true, 100, 1);
            result = destroyNear(result, [Wood], 40, true, 100, 1);
            result = destroyNear(result, [Gunpowder], 40, true, 100, 1);
            result = destroyNear(result, [WireGrain], 40, true, 100, 1);
            result = destroyNear(result, [Uran], 40, true, 100, 1);
            result = destroyNear(result, [Leaf], 40, true, 100, 1);
            result = destroyNear(result, [TreeSeed], 40, true, 100, 1);
            result = destroyNear(result, [Plant], 40, true, 100, 1);
            result = destroyNear(result, [Meat], 40, true, 100, 1);
            result = destroyNear(result, [ElectricalDispenser], 40, true, 100, 1);
            result = destroyNear(result, [DuplicateElement], 40, true, 100, 1);
            result = destroyNear(result, [HeatingElement], 40, true, 100, 1);

        }
        return result;
    }
    
}


class Lava extends Liquid {
    stone = null; // The grain type this lava turns into when it cools down
    constructor(chanceToPlaceFire = 0.01, stone = null) {
        super(3, false, null, true);
        this.chanceToPlaceFire = chanceToPlaceFire; // Chance to place fire around
        this.stone = stone; // The grain type this lava turns into when it cools down
    }

    applyPhisics(surrounding) {
        var result = surrounding;
        for (var x = 0; x < 3; x++) {
                for (var y = 0; y < 3; y++) {
                    if ((x + y) % 2 === 1) { // Only check sides
                        if (result[x][y] === 0) {
                            if (getRandom(0.0, 100.0) < this.chanceToPlaceFire * 100) {
                                result[x][y] = normal_fire.getGrainInt(); // Place fire
                                return result;
                            }
                        }
                        else if (result[x][y] !== unexistingGrain) {
                            var sideGrain = result[x][y];
                            var grainObj = grains[sideGrain - 1];
                            if (grainObj.type instanceof Liquid && grainObj.type != this) {
                                result[x][y] = this.stone.getGrainInt(); // Turn into stone
                                return result; // Return the result after turning into stone
                                // Check if the stone can turn into a different type
                            }
                            if (grainObj.type instanceof FlamableGrain) {
                               
                                result[x][y] = normal_fire.getGrainInt(); // Place fire
                                return result;
                            }
                        }
                    }
                }
            }

        result = super.applyPhisics(surrounding);
        if (arraysEqual(surrounding, result)) {
            // if has fre space around places fire
            
        }
        return result;
    }

}

class FlamableLiquid extends Liquid {
    chanceToBurn = 1;
    constructor(chanceToBurn = 1) {
        super(3, false, null, true);
        this.chanceToBurn = chanceToBurn; // Chance to place fire around
    }
    applyPhisics(surrounding) {
        var result = surrounding
        var hasFire = false;
        var hasAir = false;
        for (var x = 0; x < 3; x++) {
            for (var y = 0; y < 3; y++) {
                if ((x + y) % 2 === 1) { // Only check sides
                    if (result[x][y] !== 0 && result[x][y] !== unexistingGrain) {
                        var sideGrain = result[x][y];
                        var grainObj = grains[sideGrain - 1];
                        if (grainObj.type instanceof Fire || grainObj.type instanceof Lava) {
                            hasFire = true; // There is fire around
                        }
                        
                    }
                    else if (result[x][y] === 0) {
                        hasAir = true; // There is air around
                    }
                }
            }
        }

        if (hasFire && hasAir) {
            // Check if it can burn
            var rnd = getRandom(0.0, 100.0);
            if (rnd < this.chanceToBurn * 100) {
                result[1][1] = normal_fire.getGrainInt(); // Turn into fire
                return result; // Return the result after turning into fire
            }
        }

        result = super.applyPhisics(surrounding);
        return result;
    }    
}

class Oil extends FlamableLiquid {
    constructor(chanceToBurn = 1) {
        super(chanceToBurn);
    }
}

class Stone extends Grain {
    constructor(chanceToTurnIntoLava = 0.01, chanceToTurnIntoLavaFromFire = 0.0009) {
        super(0, 0, 10);
        this.chanceToTurnIntoLava = chanceToTurnIntoLava; // Chance to turn into lava
        this.chanceToTurnIntoLavaFromFire = chanceToTurnIntoLavaFromFire; // Chance to turn into lava from fire
    }
    applyPhisics(surrounding) {
        var result = super.applyPhisics(surrounding);
        if (arraysEqual(surrounding, result)) {
            var hasWater = false;
            var hasFire
            var lavaPositions = [];
            // check if there if touches lava and water, if so turns lava into stone
            for (var x = 0; x < 3; x++) {
                for (var y = 0; y < 3; y++) {
                    if ((x + y) % 2 === 1) { // Only check sides
                        var sideGrain = result[x][y];
                        if (sideGrain !== 0 && sideGrain !== unexistingGrain) {
                            var grainObj = grains[sideGrain - 1];
                            if (grainObj.type instanceof Lava) {
                                lavaPositions.push({
                                    x: x,
                                    y: y
                                });
                            }
                            if (grainObj.type instanceof Liquid && grainObj.type != normal_lava) {
                                hasWater = true;
                            }
                            if (grainObj.type instanceof Fire) {
                                hasFire = true;
                            
                            }
                        }
                    }
                }
            }
            if (hasWater && lavaPositions.length > 0) {
                // Turn lava into stone
                for (var i = 0; i < lavaPositions.length; i++) {
                    var pos = lavaPositions[i];
                    result[pos.x][pos.y] = result[1][1];
                }
                return result;
            }
            else if (lavaPositions.length > 0) {
                // Turn into lava
                var rnd = getRandom(0.0, 100.0);
                if (rnd < this.chanceToTurnIntoLava * 100) {
                    result[1][1] = normal_lava.getGrainInt();
                    return result;
                }
            }
            else if (!hasWater && hasFire) {
                // Turn into lava from fire
                var rnd = getRandom(0.0, 100.0);
                if (rnd < this.chanceToTurnIntoLavaFromFire * 100) {
                    result[1][1] = normal_lava.getGrainInt();
                    return result;
                }
            }
        }
        return result;
    }
}

class Iron extends LiquidAffectable{
    constructor(wetGrain = null, dryGrain = null){
        super(0, 0, 55, wetGrain, dryGrain, 0.01, 0, false, false, 0);
    }
}

class RustIron extends Grain{
    constructor(){
        super(0, 0, 10);
    }
}

class WeakRustIron extends Grain{
    constructor(){
        super(2, 0, 5);
    }
}



class Gunpowder extends ExplosiveGrain {
    constructor() {
        super(1, 5, 100, 100, 0.36);
    }
}


class TreeSeed extends Seed {
    constructor(turnInto, needsWater = true, needsDirt = true) {
        super(turnInto, 0.01, needsWater, needsDirt);
    }
}

class TreeSprout extends Plant {
    constructor(grownForm, seed = null, leaf = null, chanceToDoble = 0.002, chanceToThrowSeed = 0.1, growthChance = 0.01, chanceToGrowLeafs = 0.0001) {
        super(grownForm, leaf, growthChance, 0, chanceToGrowLeafs);
        this.chanceToDoble = chanceToDoble; // Chance to double the size
        this.chanceToTrowSeed = chanceToThrowSeed; // Chance to trow a seed
        this.seed = seed; // The seed this sprout can trow
    }

    applyPhisics(surrounding) {
        var result = super.applyPhisics(surrounding);

        if (arraysEqual(surrounding, result)) {
            // Check for fire around

            // check if touches 3 wood grains then turns into wood
            var woodCount = 0;
            for (var x = 0; x < 3; x++) {
                for (var y = 0; y < 3; y++) {
                    var sideGrain = result[x][y];
                    if (sideGrain !== 0 && sideGrain !== unexistingGrain) {
                        var grainObj = grains[sideGrain - 1];
                        if (grainObj.type instanceof Wood) {
                            woodCount++;
                        }
                    }
                    
                }
            }
            if (woodCount >= 3) {
                result[1][1] = normal_wood.getGrainInt(); // Turn into
                return result;
            }

            var rnd = getRandom(0.0, 100.0);
            if (rnd < this.chanceToDoble * 100) {
                // Double the size of the plant
                for (var x = 0; x < 3; x++) {
                    for (var y = 0; y < 2; y++) {
                        if ((x + y) % 2 === 1) { // Only check sides
                            if (result[x][y] === 0) {
                                result[x][y] = this.getGrainInt();
                                return result;
                            }
                        }
                    }
                }
            }

            if (result[1][2] === 0){
                rnd = getRandom(0.0, 100.0);
                if (rnd < this.chanceToThrowSeed * 100) {
                    
                    result[1][2] = this.seed.getGrainInt(); // Trow a seed
                }
            }
           
        }
        return result;
    }
}

class FireTreeSprout extends TreeSprout {
    constructor(grownForm, seed = null, leaf = null, chanceToDoble = 0.02, chanceToThrowSeed = 0.1, chanceToBurn = 0.001) {
        super(grownForm, seed, leaf, chanceToDoble, chanceToThrowSeed, 0.1, 0.001);
        this.chanceToBurn = chanceToBurn; // Chance to burn
    }

    applyPhisics(surrounding) {
        var result = super.applyPhisics(surrounding);

        if (arraysEqual(surrounding, result)) {
            // has a chance to change into fire
            var rnd = getRandom(0.0, 100.0);
            if (rnd < this.chanceToBurn * 100) {
                // Change into fire
                result[1][1] = normal_fire.getGrainInt();
                return result;
            }
            
        }
        return result;
    }
}

class Meat extends FlamableGrain {
    maxRotLevel = 5;
    chanceToRot = 0.001; // Percentage chance to rot
    constructor(maxRotLevel = 5, chanceToRot = 0.001) {
        super(1, 0, 4, 1);
        this.maxRotLevel = maxRotLevel; // Maximum rot level
        this.chanceToRot = chanceToRot; // Chance to rot
    }
    applyPhisics(surrounding) {
        var result = super.applyPhisics(surrounding);
        if (arraysEqual(surrounding, result)) {
            if (result[1][1] + 1 < this.normalInt + this.maxRotLevel) {
                // Check if it can rot
                var rnd = getRandom(0.0, 100.0);
                if (rnd < this.chanceToRot * 100) {
                    result[1][1] += 1; // Increase rot level
                }
            }
        }

        return result;
    }

    getGrainInt() {
        return this.normalInt;
    }
}  

class Fly extends Grain {
    constructor(meat, chanceToEat = 0.1, eats = [], diesFrom = [], needsOxygen = true, chanceToDoble = 0.1) {
        super(0, 0, 4);   
        this.chanceToEat = chanceToEat; // Percentage chance to eat meat
        this.meat = meat; // The meat this fly can eat
        this.eats = eats; // The grains this fly can eat
        this.diesFrom = diesFrom; // The grains this fly dies from
        this.needsOxygen = needsOxygen; // Whether this fly needs oxygen to live
        this.chanceToDoble = chanceToDoble; // Chance to double the size
    }

    applyPhisics(surrounding) {
        var result = super.applyPhisics(surrounding);
        if (arraysEqual(surrounding, result)) {
            var hasSpace = false;
            // check if has space to move, if not then dies, and not touches water
            for (var x = 0; x < 3; x++) {
                for (var y = 0; y < 3; y++) {   
                    if ((x + y) % 2 === 1 && result[x][y] === 0) { // Only check sides
                        hasSpace = true; // Has space to move
                        // dies if touches water or Acid or fire
                        
                    }
                    else if ((x + y) % 2 === 1 && result[x][y] !== 0 && result[x][y] !== unexistingGrain) {
                        var sideGrain = result[x][y];
                        var grainObj = grains[sideGrain - 1];
                        //check if touches something from array diesFrom
                        if (this.diesFrom && this.diesFrom.length > 0) {
                            for (var i = 0; i < this.diesFrom.length; i++) {
                                if (grainObj.type instanceof this.diesFrom[i]) {
                                    result[1][1] = this.meat.getGrainInt(); // Turns into meat
                                }
                            }
                        }

                        // if has leafs around eats them
                        var rnd = getRandom(0.0, 100.0);
                        if (rnd < this.chanceToEat * 100) {
                            // Check if it can eat
                            if (this.eats && this.eats.length > 0) {
                                for (var i = 0; i < this.eats.length; i++) {
                                    if (grainObj.type instanceof this.eats[i]) {
                                        result[x][y] = 0; // Eats the grain

                                        rnd = getRandom(0.0, 100.0);
                                        if (rnd < this.chanceToDoble * 100) {
                                            // Chance to double the size
                                            for (var i = 0; i < 3; i++) {
                                                for (var j = 0; j < 3; j++) {
                                                    if ((i + j) % 2 === 1 && result[i][j] === 0) { // Only check sides
                                                        result[i][j] = this.getGrainInt(); // Place the new grain
                                                        return result;
                                                    }
                                                }
                                            }
                                        }
                                        break;
                                    }
                                }
                            }
                        }  
                    }
                }
            }



            if (hasSpace) {
                // Move to a random side
                var side = getRandomInt(0, 4);
                if (side === 0 && result[0][1] === 0) { // Up
                    result[0][1] = result[1][1];
                    result[1][1] = 0;
                } else if (side === 1 && result[2][1] === 0) { // Down
                    result[2][1] = result[1][1];
                    result[1][1] = 0;
                } else if (side === 2 && result[1][0] === 0) { // Left
                    result[1][0] = result[1][1];
                    result[1][1] = 0;
                } else if (side === 3 && result[1][2] === 0) { // Right
                    result[1][2] = result[1][1];
                    result[1][1] = 0;
                }
            }
            else if (this.needsOxygen){
                // No space to move, dies
                result[1][1] = this.meat.getGrainInt(); // Turns into meat
            }
        }
        return result;
    }
}


class FruitFly extends Fly {
    constructor(meat, radioactiveFly = null) {
        super(meat, 0.1, [Leaf, TreeSeed, TreeSprout], [Water, WaterVapor, Acid, AcidVapor, Fire], true, 0.1);
        this.radioactiveFly = radioactiveFly; // The radioactive fly this fruit fly can turn into
    }
    applyPhisics(surrounding) {
        var result = super.applyPhisics(surrounding);
        if (arraysEqual(surrounding, result)) {
            // see if there is uran near 
            for (var x = 0; x < 3; x++) {
                for (var y = 0; y < 3; y++) {
                    if ((x + y) % 2 === 1 && result[x][y] !== 0 && result[x][y] !== unexistingGrain) { // Only check sides
                        var sideGrain = result[x][y];
                        var grainObj = grains[sideGrain - 1];
                        if (grainObj.type instanceof Uran) {
                            // Eats the uran and turns into radioactive fly
                            result[x][y] = 0; // Eats the uran
                            result[1][1] = this.radioactiveFly.getGrainInt();
                            return result;
                        }
                    }
                }
            }
        }
        return result;
    }
}

class RadioactiveFly extends Fly {
    constructor(meat) {
        super(meat, 0.1, [Wood, Sand, Acid, AcidVapor, FruitFly, RustIron, WeakRustIron, Uran, Fire], [Water, WaterVapor, Lava], false, 0.1);
    }
}


class RadioactiveMeat extends Meat {
    constructor(chanceToRevive = 0.01, radioactiveFly = null) {
        super(5, 0.001); // Higher rot level and chance to rot
        this.chanceToRevive = chanceToRevive; // Chance to revive into a radioactive fly
        this.radioactiveFly = radioactiveFly; // The radioactive fly this meat can turn into
    }
    applyPhisics(surrounding) {
        var result = super.applyPhisics(surrounding);
        if (arraysEqual(surrounding, result)) {
            // Check for radioactive flies around
            for (var x = 0; x < 3; x++) {
                for (var y = 0; y < 3; y++) {
                    if ((x + y) % 2 === 1 && result[x][y] !== 0 && result[x][y] !== unexistingGrain) { // Only check sides
                        var sideGrain = result[x][y];
                        var grainObj = grains[sideGrain - 1];
                        if (grainObj.type instanceof WireGrain) {
                            if (sideGrain > grainObj.type.normalInt) {
                                // If it is a charged wire, then it can turn into a radioactive fly
                                result[x][y] -= 1; // Decrease charge of the wire

                                var rnd = getRandom(0.0, 100.0);
                                if (rnd < this.chanceToRevive * 100.0) { 
                                    
                                    result[1][1] = this.radioactiveFly.getGrainInt();
                                    return result;
                                }
                            }
                        }
                    }
                }
            }
        }
        return result;
    }
}

class FrozenGrain extends Grain {
    normalForm = null; // The normal grain type this frozen grain can thaw into
    constructor(gravity, normalForm) {
        super(gravity, 0, 10);
        this.normalForm = normalForm; // The normal grain type this frozen grain can thaw into
    }
    applyPhisics(surrounding) {
        var result = surrounding;
        for (var x = 0; x < 3; x++) {
            for (var y = 0; y < 3; y++) {
                if ((x + y) % 2 === 1 && result[x][y] !== 0 && result[x][y] !== unexistingGrain) { // Only check sides
                    var sideGrain = result[x][y];
                    var grainObj = grains[sideGrain - 1];
                    if (grainObj.type instanceof Fire || grainObj.type instanceof Lava || grainObj.type instanceof Uran) {
                        // If touches fire or lava, then thaws into the normal form
                        result[1][1] = this.normalForm.getGrainInt();
                        return result; // Return the result after thawing
                    }
                }
            }
        }

        result = super.applyPhisics(surrounding);
        return result;
    }
}


class Ice extends FrozenGrain {

    constructor(water = null) {
        super(0, water);
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
    type = new Grain(1, 0);
    constructor(color, type){
        this.color = color;
        this.type = type;
        
    }



}
const normal_wetSand = new WetSand(null, null);
const normal_sand = new Sand(normal_wetSand, null);
normal_wetSand.dryGrain = normal_sand;
normal_sand.wetGrain = normal_wetSand;


const normal_water = new Water(null);
const normal_waterVapor = new WaterVapor(normal_water);
normal_water.gasForm = normal_waterVapor;
const normal_ice = new Ice(normal_water);

const normal_rustIron = new RustIron();
const normal_weakRustIron = new WeakRustIron();
const normal_iron = new Iron([normal_rustIron, normal_weakRustIron], null);


const normal_acid = new Acid(null);
const normal_acidVapor = new AcidVapor(normal_acid);
normal_acid.gasForm = normal_acidVapor;


const normal_oil = new Oil(1);

const normal_stone = new Stone();

const normal_lava = new Lava(0.1, normal_stone);



const normal_wood = new Wood();
const normal_leaf = new Leaf();
const normal_treeSprout = new TreeSprout(normal_wood, null, normal_leaf, 0.002, 0.01);
const normal_treeSeed = new TreeSeed(normal_treeSprout);
normal_treeSprout.seed = normal_treeSeed;




const normal_fire = new Fire();

const normal_fireLeaf = new Leaf();
const normal_fireTreeSeed = new Seed(null, 0.01, false, true);
const normal_fireTreeSprout = new FireTreeSprout(normal_wood, normal_fireTreeSeed, normal_fireLeaf, 0.01, 1, 0.001);
normal_fireTreeSeed.turnInto = normal_fireTreeSprout;

const normal_gunpowder = new Gunpowder();


const normal_wire = new WireGrain(5);
const normal_electricalDispenser = new ElectricalDispenser();

const normal_uran = new Uran();
const normal_heatingElement = new HeatingElement();
const normal_duplicateElement = new DuplicateElement();

// Meat and Fly
const normal_meat = new Meat();
const normal_radioactiveMeat = new RadioactiveMeat(0.01, null);
const normal_radioactiveFly = new RadioactiveFly(normal_radioactiveMeat);
normal_radioactiveMeat.radioactiveFly = normal_radioactiveFly;
const normal_fly = new FruitFly(normal_meat, normal_radioactiveFly);



grains = [
    new GrainType("#f6d7b0", normal_sand),
    new GrainType("#f2d2a9", normal_sand),
    new GrainType("#eccca2", normal_sand),
    new GrainType("#e7c496", normal_wetSand),
    new GrainType("#e1bf92", normal_wetSand),
    new GrainType("#0f5e9c", normal_water),
    new GrainType("#2389da", normal_water),
    new GrainType("#1ca3ec", normal_water),
    new GrainType("#0f5e9c", normal_water),
    new GrainType("#ade1bb", normal_waterVapor),
    new GrainType("#ade1cc", normal_waterVapor),
    new GrainType("#ade1dd", normal_waterVapor),
    new GrainType("#b6e5ff", normal_waterVapor),
    new GrainType("#ade3ff", normal_waterVapor),
    new GrainType("#b9e8ea", normal_ice),
    new GrainType("#86d6d8", normal_ice),
    new GrainType("#3fd0d4", normal_ice),
    new GrainType("#20c3d0", normal_ice),


    new GrainType("#f4ffd1", normal_acid),
    new GrainType("#f4ff9f", normal_acid),
    new GrainType("#f5ff62", normal_acid),
    new GrainType("#e7ff2c", normal_acid),
    new GrainType("#d2ff46", normal_acid),
    new GrainType("#b8c9c6", normal_acidVapor),
    new GrainType("#b9d6cb", normal_acidVapor),
    new GrainType("#c4dbc7", normal_acidVapor),
    new GrainType("#d2e3c7", normal_acidVapor),
    new GrainType("#dceabd", normal_acidVapor),

    new GrainType("#e0ac69", normal_oil),
    new GrainType("#f1c27d", normal_oil),
    new GrainType("#ffdbac", normal_oil),

    new GrainType("#ed1f0a", normal_fire),
    new GrainType("#f8420b", normal_fire),
    new GrainType("#f95504", normal_fire),
    new GrainType("#f76f0b", normal_fire),
    new GrainType("#ff900a", normal_fire),





    new GrainType("#ffdb00", normal_lava), // Charged wire
    new GrainType("#ffa904", normal_lava),
    new GrainType("#ff6600", normal_lava),
    new GrainType("#ee7b06", normal_lava),


    new GrainType("#414a4c", normal_stone), // Charged wire
    new GrainType("#3b444b", normal_stone),
    new GrainType("#353839", normal_stone),
    new GrainType("#232b2b", normal_stone),
    new GrainType("#0e1111", normal_stone),

    new GrainType("#848482", normal_iron),
    new GrainType("#cbcdcd", normal_iron),
    new GrainType("#999e98", normal_iron),
    new GrainType("#696b5e", normal_iron),
    new GrainType("#522617", normal_rustIron),
    new GrainType("#903A19", normal_rustIron),
    new GrainType("#B8430F", normal_rustIron),
    new GrainType("#CD9671", normal_rustIron),
    new GrainType("#B25A27", normal_rustIron),
    new GrainType("#522617", normal_weakRustIron),
    new GrainType("#903A19", normal_weakRustIron),
    new GrainType("#B8430F", normal_weakRustIron),
    new GrainType("#CD9671", normal_weakRustIron),
    new GrainType("#B25A27", normal_weakRustIron),


    new GrainType("#f7f7f7", normal_gunpowder),
    new GrainType("#e0e0e0", normal_gunpowder),
    new GrainType("#c9c9c9", normal_gunpowder),
    new GrainType("#b2b2b2", normal_gunpowder),
    new GrainType("#9b9b9b", normal_gunpowder),

    new GrainType("#3cff49", normal_uran),
    new GrainType("#73ff7c", normal_uran),
    new GrainType("#a0ffa6", normal_uran),
    new GrainType("#360000", normal_wire),
    new GrainType("#6d0202", normal_wire),
    new GrainType("#a31818", normal_wire),
    new GrainType("#ee7272", normal_wire),
    new GrainType("#ffb9b9", normal_wire),
    new GrainType("#c2f8cb", normal_electricalDispenser),
    new GrainType("#bd370a", normal_heatingElement),
    new GrainType("#5a2e88", normal_duplicateElement),

    new GrainType("#cca463", normal_wood),
    new GrainType("#a57847", normal_wood),
    new GrainType("#7a5330", normal_wood),
    new GrainType("#604737", normal_wood), 
    new GrainType("#59392c", normal_wood),
    new GrainType("#ffc18c", normal_treeSeed),
    new GrainType("#e7cfb4", normal_treeSeed),
    new GrainType("#b1d182", normal_treeSprout),
    new GrainType("#688f4e", normal_treeSprout),
    new GrainType("#2b463c", normal_treeSprout),
    new GrainType("#c5e3af", normal_leaf),
    new GrainType("#9ac37b", normal_leaf),
    new GrainType("#72a24e", normal_leaf),    
    new GrainType("#54862e", normal_leaf),

    new GrainType("#bd4343", normal_fireTreeSeed),
    new GrainType("#ff6b6b", normal_fireTreeSeed),
    new GrainType("#ff8f8f", normal_fireTreeSeed),
    new GrainType("#ffb605", normal_fireTreeSprout),
    new GrainType("#ec5300", normal_fireLeaf),
    new GrainType("#f97d16", normal_fireLeaf),
    new GrainType("#ff9750", normal_fireLeaf),

    new GrainType("#ff7a7a", normal_meat),
    new GrainType("#742f35", normal_meat),// more rotten color
    new GrainType("#8b594c", normal_meat),
    new GrainType("#6f4c33", normal_meat), 
    new GrainType("#535a4a", normal_meat),

    new GrainType("#feffc0", normal_radioactiveMeat),
    new GrainType("#feff91", normal_radioactiveMeat), // more rotten color
    new GrainType("#9bd662", normal_radioactiveMeat),
    new GrainType("#508356", normal_radioactiveMeat),
    new GrainType("#3a313e", normal_radioactiveMeat),


    new GrainType("#f9d6d4", normal_fly),
    new GrainType("#e5b1b9", normal_fly),
    new GrainType("#a77680", normal_fly),
    new GrainType("#7f4c4f", normal_fly),


    new GrainType("#dcff00", normal_radioactiveFly),
    new GrainType("#c3ff00", normal_radioactiveFly),
    new GrainType("#88ff00", normal_radioactiveFly),
    new GrainType("#64ff00", normal_radioactiveFly),
    new GrainType("#1dff00", normal_radioactiveFly),







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
// Helper for both mouse and touch
function setPointerPos(x, y) {
    mousePos.x = x;
    mousePos.y = y;
}

// For canvas
// Existing mousemove handler
document.addEventListener("mousemove", function(event){
    var rect = canvas.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) {
        mousePos.x = -1;
        mousePos.y = -1;
        return;
    }
    mousePos.x = Math.floor((event.clientX - rect.left)/cell_size);
    mousePos.y = Math.floor((event.clientY - rect.top)/cell_size);
});

// Add touch handlers with matching calculation logic

canvas.addEventListener("touchstart", function(event) {
    event.preventDefault();
    var rect = canvas.getBoundingClientRect();
    var touch = event.touches[0];
    mousePos.x = Math.floor((touch.clientX - rect.left)/cell_size);
    mousePos.y = Math.floor((touch.clientY - rect.top)/cell_size);
    if (mouseInterval) clearInterval(mouseInterval);
    mouseInterval = setInterval(handleMouse, 20);
});

canvas.addEventListener("touchmove", function(event) {
    event.preventDefault();
    var rect = canvas.getBoundingClientRect();
    var touch = event.touches[0];
    mousePos.x = Math.floor((touch.clientX - rect.left)/cell_size);
    mousePos.y = Math.floor((touch.clientY - rect.top)/cell_size);
});

canvas.addEventListener("touchend", function(event) {
    clearInterval(mouseInterval);
    mouseInterval = null;
    mousePos.x = -1;
    mousePos.y = -1;
});

canvas.addEventListener("touchcancel", function(event) {
    clearInterval(mouseInterval);
    mouseInterval = null;
    mousePos.x = -1;
    mousePos.y = -1;
});

// For grainMenu (selection menu)
document.getElementById("grainMenu").addEventListener("touchstart", function(e) {
    e.preventDefault();
    const rect = this.getBoundingClientRect();
    const touch = e.touches[0];
    const y = touch.clientY - rect.top;
    const x = touch.clientX - rect.left;
    const cellSize = 9 * 5;
    const idx = Math.floor((Math.floor(y / cellSize) * rect.width/cellSize) + Math.floor(x / cellSize));
    if (idx >= 0 && idx < grainTypes.length) {
        current_grain = idx + 1;
        drawGrainMenu();
        drawMaterialPreview();
    }
    else{
        current_grain = 0;
        drawGrainMenu();
        drawMaterialPreview();
    }
});

document.addEventListener("mousemove", function(event){
    var rect = canvas.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right || event.clientY < rect.top || event.clientY > rect.bottom) {
        mousePos.x = -1;
        mousePos.y = -1;
        return;
    }
    mousePos.x = Math.floor((event.clientX - rect.left)/cell_size);
    mousePos.y = Math.floor((event.clientY - rect.top)/cell_size);
});

document.addEventListener("mousedown", function(event) {
    // Clear any existing interval before setting a new one
    if (mousePos.x < 0 || mousePos.y < 0) return; // Ignore if outside canvas
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

// Draws the grain menu on the side
function drawGrainMenu() {
    const menu = document.getElementById("grainMenu");
    if (!menu) return;
    const ctx = menu.getContext("2d");
    const cellSize = 9;
    menu.width = 9 * 25;

    // given in grains
    const grainsAmuount = grainTypes.length+1;
    const grainBoxWidth = menu.width / (cellSize * 5);
    const grainBoxHeight = grainsAmuount % grainBoxWidth == 0? grainsAmuount / grainBoxWidth  : Math.floor(grainsAmuount / grainBoxWidth) + 1

    menu.height = grainBoxHeight * cellSize * 5

    ctx.clearRect(0, 0, menu.width, menu.height);
    drawMaterialPreview();
    
    // currentGrainType
    let cgt = 0
    var g = current_grain - 1

    console.log("grainsAmount: " + grainsAmuount);
    console.log("grainWidth: " + grainBoxWidth);
    console.log("GrainHeight: " + grainBoxHeight);

    for(let j = 0; j < grainBoxHeight; j++){
        for(let i = 0; i < grainBoxWidth; i++){
            if (grainTypes.length <= cgt){
                ctx.strokeStyle = "red";
                ctx.lineWidth = 4;
                ctx.strokeRect((g % grainBoxWidth) * cellSize * 5, (Math.floor(g / grainBoxWidth)) * cellSize * 5, cellSize * 5, cellSize * 5);
                return;
            }
            for (let y = 0; y < 5; y++) {
                for (let x = 0; x < 5; x++) {
                    console.log("Drawing grain: " + grains[grainTypes[cgt].type.getGrainInt()-1]);
                    
                    ctx.fillStyle = grains[grainTypes[cgt].type.getGrainInt()-1].color;
                    ctx.fillRect(i * cellSize * 5 + x * cellSize, j * cellSize * 5 + y * cellSize, cellSize, cellSize);
                    //ctx.fillRect(i * cellSize * 5, j * cellSize * 5, cellSize, cellSize);

                    
                }
            }
           
            cgt += 1;
        }
    }
    

    
    ctx.strokeStyle = "red";
    ctx.lineWidth = 4;
    ctx.strokeRect((g % grainBoxWidth) * cellSize * 5, (g % grainBoxHeight) * cellSize * 5, cellSize * 5, cellSize * 5);
    


    // Draw border if selected
    // if (current_grain - 1 === i) {
    //     ctx.strokeStyle = "gold";
    //     ctx.lineWidth = 4;
    //     ctx.strokeRect(2, i * cellSize + 2, cellSize - 4, cellSize - 4);
    // }
    
    // Resize canvas to fit all grains
    
}



// Handle clicks on the grain menu
document.getElementById("grainMenu").addEventListener("click", function(e) {
    const rect = this.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const x = e.clientX - rect.left;
    const cellSize = 9 * 5;
    const idx = Math.floor((Math.floor(y / cellSize) * rect.width/cellSize) + Math.floor(x / cellSize));
    if (idx >= 0 && idx < grainTypes.length) {
        current_grain = idx + 1;
        drawGrainMenu();
        drawMaterialPreview();
    }
    else{
        current_grain = 0;
        drawGrainMenu();
        drawMaterialPreview();
    }
});
window.addEventListener('DOMContentLoaded', function() {
    var canvas = document.getElementById("canvas");
    if (!canvas) return;

    // Add touch handlers for canvas
    canvas.addEventListener("touchstart", function(event) {
        event.preventDefault();
        var rect = canvas.getBoundingClientRect();
        var touch = event.touches[0];
        mousePos.x = Math.floor((touch.clientX - rect.left)/cell_size);
        mousePos.y = Math.floor((touch.clientY - rect.top)/cell_size);
        if (mouseInterval) clearInterval(mouseInterval);
        mouseInterval = setInterval(handleMouse, 20);
    });

    canvas.addEventListener("touchmove", function(event) {
        event.preventDefault();
        var rect = canvas.getBoundingClientRect();
        var touch = event.touches[0];
        mousePos.x = Math.floor((touch.clientX - rect.left)/cell_size);
        mousePos.y = Math.floor((touch.clientY - rect.top)/cell_size);
    });

    canvas.addEventListener("touchend", function(event) {
        clearInterval(mouseInterval);
        mouseInterval = null;
        mousePos.x = -1;
        mousePos.y = -1;
    });

    canvas.addEventListener("touchcancel", function(event) {
        clearInterval(mouseInterval);
        mouseInterval = null;
        mousePos.x = -1;
        mousePos.y = -1;
    });
});
// Redraw menu when grain changes
function nextGrain(){
    if(current_grain < grainTypes.length)
        current_grain++;
    else 
        current_grain = 0;
    drawMaterialPreview();
    drawGrainMenu();
}

function prevGrain(){
    if(current_grain > 0)
        current_grain--;
    else
        current_grain = grainTypes.length;
    drawMaterialPreview();
    drawGrainMenu();
}

// Draw menu on load and when DOM is ready
window.addEventListener('DOMContentLoaded', drawGrainMenu);

function handleMouse(){
    if (mousePos.x < 0 || mousePos.y < 0) return; // Ignore if outside canvas
    placeBrush(mousePos.x, mousePos.y);
}

function start(){
    intervalID = window.setInterval(gameLoop, 1);
}

function arraysEqual(arr1, arr2) {
    for (let x = 0; x < 3; x++) {
        for (let y = 0; y < 3; y++) {
            if (arr1[x][y] !== arr2[x][y]) return false;
        }
    }
    return true;
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
function destroyNear(surrounding, grainsToDestroy, chanceToSelfDestroy = 100, onlySides = true, maxDensityToDestroy = 100, chanceToSelfDestroyOnSides = 100){
    for(var x = 0; x < 3; x++){
        for(var y = 0; y < 3; y++){
            if(!onlySides || (onlySides && (x+y)%2 == 1)){
                for(let grainToDestroy of grainsToDestroy){
                    var side = surrounding[x][y];
                    if (side != 0 && side != unexistingGrain){
                        if(grains[surrounding[x][y]-1].type instanceof grainToDestroy){
                            if (chanceToSelfDestroyOnSides < 100) {
                                var chance = getRandom(0, 100);
                                if (chance < chanceToSelfDestroyOnSides && grains[surrounding[x][y]-1].type.density <= maxDensityToDestroy) {
                                    surrounding[x][y] = 0;
                                    return surrounding;
                                }
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

function setBrushSize(val) {
    normal_brush_size = Math.max(1, Math.min(20, parseInt(val) || 1));
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
            ctx.fillStyle = grain? grain.color : "#262626ff";
            ctx.fillRect(x * cell_size, y * cell_size, cell_size, cell_size);
        }
    }
}

function drawMaterialPreview() {
    const preview = document.getElementById("materialPreview");
    if (!preview) return;
    const ctxPrev = preview.getContext("2d");
    ctxPrev.clearRect(0, 0, preview.width, preview.height);

    // 3x3 grid, each cell 16x16 px
    const cellSize = 16;
    let grainType = grainTypes[current_grain-1];
    if (!grainType) return;

    for (let y = 0; y < 3; y++) {
        for (let x = 0; x < 3; x++) {
            // Simulate random texture by picking a random color from the grains of this type
            let color = "#888";
            // Find all grains of this type
            let indices = [];
            let idx = 0;
            for (let g of grains) {
                if (g.type === grainType.type) indices.push(idx);
                idx++;
            }
            if (indices.length > 0) {
                let randIdx = indices[Math.floor(Math.random() * indices.length)];
                color = grains[randIdx].color;
            }
            ctxPrev.fillStyle = color;
            ctxPrev.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
        }
    }
}





function getRandom(min, max) {
    // this function should return a random float between min (inclusive) and max (exclusive)
    return Math.random() * (max - min) + min;
}

function getRandomInt(min, max) {
    // this function should return a random integer between min (inclusive) and max (exclusive)
    return Math.floor(Math.random() * (max - min)) + min;
}
