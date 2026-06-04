
//grains
class Grain {
	gravity = 1;
	density = 1;
	normalInt;
	surroundingFormat = 0;
	name = "Unknown";
	description = "This is basic grain, it may have gravity";
	exampleInstructions = [
        { time: 0, x: 30, y: 30, size: 4, grain: this }
    ];

	constructor(
		gravity = 1,
		surroundingFormat = 0,
		density = 1,
		name = "Unknown",
		description = "This is basic grain, it may have gravity"
	) {
		this.gravity = gravity;
		this.surroundingFormat = surroundingFormat;
		this.density = density;
		this.name = name;
		this.description = description;
	}

	findNormalInt(type) {
		var realI = 0;
		for (let i in grainTypes) {
			if (grainTypes[i].type === type) {
				this.normalInt = realI + 1;
				return;
			}
			realI += grainTypes[i].amount;
		}
	}

	getGrainInt() {
		var realI = 0;
		for (let i in grainTypes) {
			if (grainTypes[i].type == this) {
				return getRandomInt(
					realI + 1,
					realI + grainTypes[i].amount + 1,
				);
			}
			realI += grainTypes[i].amount;
		}
		return 0;
	}

	addExample(instructions){
		this.exampleInstructions = instructions;
	}
	// GRAVITY
	// 0 - no gravity
	// 1 - full gravity
	// 2 - gravity only down
	// 3 - gravity full up (gas gravity)
	applyPhisics(surrounding) {
		// check if touches honey if so, stop the grain
		for (var x = 0; x < 3; x++) {
			for (var y = 0; y < 3; y++) {
				var sideGrain = surrounding[x][y];
				if (sideGrain !== 0 && sideGrain !== unexistingGrain) {
					var grainObj = grains[sideGrain - 1];
					if (grainObj.type instanceof Honey) {
						return surrounding;
					}
				}
			}
		}
		if (this.gravity == 1 || this.gravity == 2) {
			var newSurrounding = JSON.parse(JSON.stringify(surrounding));
			var self = surrounding[1][1];
			if (surrounding[1][2] == 0) {
				newSurrounding[1][2] = self;
				newSurrounding[1][1] = 0;
			} else if (
				surrounding[0][2] == 0 &&
				surrounding[2][2] == 0 &&
				this.gravity == 1
			) {
				if (getRandomInt(0, 2) == 0) {
					newSurrounding[0][2] = self;
				} else {
					newSurrounding[2][2] = self;
				}
				newSurrounding[1][1] = 0;
			} else if (surrounding[0][2] == 0 && this.gravity == 1) {
				newSurrounding[0][2] = self;
				newSurrounding[1][1] = 0;
			} else if (surrounding[2][2] == 0 && this.gravity == 1) {
				newSurrounding[2][2] = self;
				newSurrounding[1][1] = 0;
			}
			return newSurrounding;
		} else if (this.gravity == 3) {
			var newSurrounding = JSON.parse(JSON.stringify(surrounding));
			var self = surrounding[1][1];

			// it has a chance to move up or to the sides
			if (getRandom(0, 100) < 30) {
				if (surrounding[1][0] == 0) {
					newSurrounding[1][0] = self;
					newSurrounding[1][1] = 0;
				}
			} else if (getRandom(0, 100) < 30) {
				if (surrounding[0][0] == 0 && surrounding[2][0] == 0) {
					if (getRandomInt(0, 2) == 0) {
						newSurrounding[0][0] = self;
					} else {
						newSurrounding[2][0] = self;
					}
					newSurrounding[1][1] = 0;
				} else if (surrounding[0][0] == 0) {
					newSurrounding[0][0] = self;
					newSurrounding[1][1] = 0;
				} else if (surrounding[2][0] == 0) {
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
		super(3, 0, 0, "Fire");
	}
	applyPhisics(surrounding) {
		var result = super.applyPhisics(surrounding);

		if (arraysEqual(surrounding, result)) {
			// Check for flammable grains around
			for (var x = 0; x < 3; x++) {
				for (var y = 0; y < 3; y++) {
					if ((x + y) % 2 === 1) {
						// Only check sides
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
			} else {
				result[1][1] = normal_fire.getGrainInt(); // Burn this grain
			}
		}

		return result;
	}
}

class FlamableGrain extends Grain {
	flammability = 50; // Default flammability percentage
	surroundingFormat = 0; // Default surrounding format
	constructor(
		gravity,
		surroundingFormat,
		density,
		flammability = 50,
		name = "Flamable Grain",
	) {
		super(gravity, surroundingFormat, density, name);
		this.flammability = flammability;
	}

	applyPhisics(surrounding) {
		var result = super.applyPhisics(surrounding);

		if (arraysEqual(surrounding, result)) {
			// Check for fire around
			for (var x = 0; x < 3; x++) {
				for (var y = 0; y < 3; y++) {
					if ((x + y) % 2 === 1) {
						// Only check sides
						var sideGrain = result[x][y];
						if (sideGrain !== 0 && sideGrain !== unexistingGrain) {
							var grainObj = grains[sideGrain - 1];
							// flamibility is not defined

							if (grainObj.type instanceof Fire || grainObj.type instanceof Lava || grainObj.type instanceof MoltenIron) {
								if (
									this.flammability > 0 &&
									getRandom(0, 100) < this.flammability
								) {
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

class Coal extends FlamableGrain {
	chanceToDie = 0.05;
	constructor (gravity = 0, name = "Coal", chanceToDie = 0.1, flames = 80){
		super(gravity, 0, 6, 0, name);
		this.chanceToDie = chanceToDie;
		this.flames = flames;

	}

	applyPhisics(surrounding){
		var result = super.applyPhisics(surrounding);

		if (arraysEqual(surrounding, result)) {
			for (var x = 0; x < 3; x++) {
				for (var y = 0; y < 3; y++) {
					var sideGrain = result[x][y];
					if (sideGrain !== 0 && sideGrain !== unexistingGrain) {

						var grainObj = grains[sideGrain - 1];
						
						if (
							grainObj.type instanceof Fire ||
							grainObj.type instanceof Lava
						) {
							// place fire all around it
							for (var x1 = 0; x1 < 3; x1++) {
								for (var y1 = 0; y1 < 3; y1++) {
									if (getRandom(0, 100) < this.flames && result[x1][y1] == 0){
										result[x1][y1] = normal_fire.getGrainInt();
									}
								}
							}

							if (getRandom(0, 100) < this.chanceToDie) {
								result[1][1] = normal_fire.getGrainInt(); // Burn this grain
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

class PowderCoal extends Coal {
	constructor (name="Powder Coal", chanceToDie = 0.1, flames = 20){
		super(1, name, chanceToDie, flames);
	}
}

class Brick extends Grain {
	constructor (name = "Brick"){
		super(0, 0, 10, name);

	}
}


class ExplosiveGrain extends Grain {
	explosionChance = 10; // Percentage chance to explode when burning
	chanceToDuplicate = 0.1; // Percentage chance to duplicate when burning
	constructor(
		gravity,
		density,
		explosionChance = 100,
		power = 100,
		chanceToDuplicate = 0.3,
		name = "Explosive Grain",
	) {
		super(gravity, 0, density, name);
		this.explosionChance = explosionChance;
		this.power = power;
		this.chanceToDuplicate = chanceToDuplicate;
	}

	applyPhisics(surrounding) {
		var result = super.applyPhisics(surrounding);

		if (arraysEqual(surrounding, result)) {
			for (var x = 0; x < 3; x++) {
				for (var y = 0; y < 3; y++) {
					if ((x + y) % 2 === 1) {
						// Only check sides
						var sideGrain = result[x][y];
						if (sideGrain !== 0 && sideGrain !== unexistingGrain) {
							var grainObj = grains[sideGrain - 1];
							if (
								grainObj.type instanceof Fire ||
								grainObj.type instanceof Lava ||
								grainObj.type instanceof MoltenIron
							) {
								if (getRandom(0, 100) < this.explosionChance) {
									// change near grains to fire if their density is lower than the power of the explosion
									for (var i = 0; i < 3; i++) {
										for (var j = 0; j < 3; j++) {
											if ((i + j) % 2 === 1) {
												// Only check sides
												var nearGrain = result[i][j];
												if (
													nearGrain !== 0 &&
													nearGrain !==
														unexistingGrain
												) {
													var nearGrainObj =
														grains[nearGrain - 1];
													if (
														nearGrainObj.type
															.density <=
														this.power
													) {
														var rnd = getRandom(
															0,
															100,
														);
														if (
															rnd <
															this
																.chanceToDuplicate *
																100
														) {
															// Duplicate the explosive grain
															result[i][j] =
																this.getGrainInt(); // Change to explosive grain
														} else {
															result[i][j] =
																normal_fire.getGrainInt(); // Change to fire
														}
													}
												} else if (nearGrain === 0) {
													// If the grain is empty, it can be filled with fire
													var rnd = getRandom(0, 100);
													if (
														rnd <
														this.chanceToDuplicate *
															100
													) {
														result[i][j] =
															this.getGrainInt(); // Change to explosive grain
													} else {
														result[i][j] =
															normal_fire.getGrainInt(); // Change to fire
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

	constructor(
		density = 1,
		killsFire = true,
		gasForm = null,
		breaksWires = true,
		name = "Liquid",
	) {
		super(1, 0, density, name);
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
					if (
						(aboveGrainObj.type.gravity == 1 ||
							(aboveGrainObj.type.gravity == 2 && i == 1)) &&
						aboveGrainObj.type.density > this.density
					) {
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
				if (grainIdx === 0 || grainIdx === unexistingGrain)
					return false;
				var grainObj = grains[grainIdx - 1];
				return (
					grainObj.type instanceof Liquid &&
					grainObj.type.density < this.density
				);
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
					if ((x + y) % 2 === 1) {
						// Only check sides
						var sideGrain = result[x][y];
						if (sideGrain !== 0 && sideGrain !== unexistingGrain) {
							var grainObj = grains[sideGrain - 1];
							if (
								this.killsFire &&
								(grainObj.type instanceof Fire ||
									grainObj.type instanceof Lava)
							) {
								if (this.gasForm) {
									result[1][1] = this.gasForm.getGrainInt(); // Change to gas form
								} else {
									result[1][1] = 0; // Remove fire
								}
								result[x][y] = 0; // Remove fire
								return result;
							} else if (
								this.breaksWires &&
								grainObj.type instanceof WireGrain
							) {
								// Break the wire
								var rnd = getRandom(0.0, 100.0);
								if (rnd < 0.01) {
									// 50% chance to break the wire
									result[x][y] = 0; // Remove wire
								}
								return result;
							} else if (
								grainObj.type instanceof Uran &&
								this.gasForm
							) {
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

class LiquidAffectable extends Grain {
	wetGrain;
	dryGrain;
	isWet = false; // Whether this grain is wet
	constructor(
		graity,
		surroundingFormat,
		density,
		wetGrain,
		dryGrain,
		chanceToAffect = 100,
		chanceFroliquidAffectableToAffect = 0.01,
		absorbsLiquid = false,
		isWet = false,
		chanceToDry = 0.01,
		name = "Liquid Affectable",
	) {
		super(graity, surroundingFormat, density, name);
		this.wetGrain = wetGrain;
		this.dryGrain = dryGrain;
		this.chanceToAffect = chanceToAffect;
		this.chanceFroliquidAffectableToAffect =
			chanceFroliquidAffectableToAffect;
		this.absorbsLiquid = absorbsLiquid;
		this.isWet = isWet; // Whether this grain is wet
		this.chanceToDry = chanceToDry; // Chance to dry out
	}

	applyPhisics(surrounding) {
		var result = super.applyPhisics(surrounding);
		if (arraysEqual(result, surrounding)) {
			var touchsLiquid = false;
			for (var x = 0; x < 3; x++) {
				for (var y = 0; y < 3; y++) {
					
					var side = result[x][y];
					if (side != 0 && side != unexistingGrain) {
						var grain_type = grains[side - 1].type;
						if (grain_type instanceof Liquid && !(grain_type instanceof Lava) && !(grain_type instanceof MoltenIron)) {
							var rnd = getRandom(0.0, 100.0);
							if (
								rnd < this.chanceToAffect &&
								this.wetGrain
							) {
								
								//this returns zero
								// check if wet grain is array or not
								if (Array.isArray(this.wetGrain)) {
									result[1][1] =
										this.wetGrain[
											getRandomInt(
												0,
												this.wetGrain.length,
											)
										].getGrainInt();
								} else {
									result[1][1] =
										this.wetGrain.getGrainInt();
								}

								if (this.absorbsLiquid) {
									result[x][y] = 0; // Absorb the liquid
								}
							}
							touchsLiquid = true;
						} else if (grain_type instanceof LiquidAffectable) {
							if (grain_type.isWet) {
								var rnd = getRandom(0.0, 100.0);
								if (
									rnd <
										this
											.chanceFroliquidAffectableToAffect &&
									this.dryGrain
								) {
									if (Array.isArray(this.dryGrain)) {
										result[1][1] =
											this.dryGrain[
												getRandomInt(
													0,
													this.dryGrain.length,
												)
											].getGrainInt();
									} else {
										result[1][1] =
											this.dryGrain.getGrainInt();
									}
								}
							}
						} else if (grain_type instanceof Fire) {
							// If the grain is fire, it can turn this grain wet
							if (this.isWet && this.dryGrain) {
								if (Array.isArray(this.dryGrain)) {
									result[1][1] =
										this.dryGrain[
											getRandomInt(
												0,
												this.dryGrain.length,
											)
										].getGrainInt();
								} else {
									result[1][1] =
										this.dryGrain.getGrainInt();
								}
							}
						}
					} else if (this.isWet && side == 0 && this.dryGrain) {
						// If this grain is wet and absorbs liquid, it can dry out
						var rnd = getRandom(0.0, 100.0);
						if (rnd < this.chanceToDry && this.dryGrain) {
							if (Array.isArray(this.dryGrain)) {
								result[1][1] =
									this.dryGrain[
										getRandomInt(
											0,
											this.dryGrain.length,
										)
									].getGrainInt();
							} else {
								result[1][1] = this.dryGrain.getGrainInt();
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
	constructor(
		gravity = 1,
		surroundingFormat = 0,
		density = 1,
		chanceToProduce = 10,
		name = "Electrical Producer",
	) {
		super(gravity, surroundingFormat, density, name);
		this.chanceToProduce = chanceToProduce;
	}

	applyPhisics(surrounding) {
		var result = super.applyPhisics(surrounding);

		if (arraysEqual(surrounding, result)) {
			// Check for fire around
			for (var x = 0; x < 3; x++) {
				for (var y = 0; y < 3; y++) {
					if ((x + y) % 2 === 1) {
						// Only check sides
						var sideGrain = result[x][y];
						if (sideGrain !== 0 && sideGrain !== unexistingGrain) {
							var grainObj = grains[sideGrain - 1];
							if (grainObj.type instanceof WireGrain) {
								if (
									sideGrain <
										grainObj.type.normalInt +
											grainObj.type.maxCharge -
											1 &&
									getRandom(0, 100) < this.chanceToProduce
								) {
									result[x][y] =
										grainObj.type.normalInt +
										grainObj.type.maxCharge -
										1;
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

class WireGrain extends FlamableGrain {
	maxCharge = 5; // Maximum charge this wire can hold
	constructor(maxCharge = 5, name = "Wire") {
		super(0, 0, 5, 1, name);
		this.maxCharge = maxCharge;


	}
	// if collides with weaker charged grain, it will transfer charge to it
	applyPhisics(surrounding) {
		var result = super.applyPhisics(surrounding);
		if (arraysEqual(result, surrounding)) {
			// Check for fire around
			for (var x = 0; x < 3; x++) {
				for (var y = 0; y < 3; y++) {
					if ((x + y) % 2 == 1) {
						// Only check sides
						var sideGrain = result[x][y];
						if (sideGrain !== 0 && sideGrain !== unexistingGrain) {
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

	getGrainInt() {
		return this.normalInt;
	}
}

class HeatingElement extends Grain {
	constructor(name = "Heating Element") {
		super(0, 0, 1, name);
	}

	applyPhisics(surrounding) {
		var result = super.applyPhisics(surrounding);

		if (arraysEqual(surrounding, result)) {
			// Check for flammable grains around
			for (var x = 0; x < 3; x++) {
				for (var y = 0; y < 3; y++) {
					if ((x + y) % 2 === 1) {
						// Only check sides
						var sideGrain = result[x][y];
						if (sideGrain !== 0 && sideGrain !== unexistingGrain) {
							var grainObj = grains[sideGrain - 1];
							if (grainObj.type instanceof WireGrain) {
								if (sideGrain > grainObj.type.normalInt) {
									// check the sides and if there is space place fire
									for (var i = 0; i < 3; i++) {
										for (var j = 0; j < 3; j++) {
											if (
												(i + j) % 2 === 1 &&
												result[i][j] === 0
											) {
												// Only check sides
												result[i][j] =
													normal_fire.getGrainInt(); // Place fire
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
	constructor(name = "Electrical Dispenser") {
		super(0, 0, 1, name);
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
					if ((x + y) % 2 === 1) {
						// Only check sides
						var sideGrain = result[x][y];
						if (sideGrain !== 0 && sideGrain !== unexistingGrain) {
							var grainObj = grains[sideGrain - 1];
							if (grainObj.type instanceof WireGrain) {
								if (sideGrain > grainObj.type.normalInt) {
									chargeWires.push({
										x: x,
										y: y,
									});
								} else if (
									sideGrain === grainObj.type.normalInt
								) {
									emptyWires.push({
										x: x,
										y: y,
									});
								}
							}
						}
					}
				}
			}
			if (chargeWires.length > 0 && emptyWires.length > 0) {
				// Place charge in a random empty wire
				var chargePosition =
					chargeWires[getRandomInt(0, chargeWires.length - 1)];
				var randomWire =
					emptyWires[getRandomInt(0, emptyWires.length - 1)];
				result[randomWire.x][randomWire.y] += 1; // Place charge
				result[chargePosition.x][chargePosition.y] -= 1; // Decrease charge of the dispenser
				return result;
			}
		}
		return result;
	}
}

class RandomElectricalDispenser extends ElectricalDispenser {
	chance = 1;
	constructor(chance = 1, name = "Random Electrical Dispenser") {
		super(name);
		this.chance = chance;
	}

	applyPhisics(surrounding) {
		var rnd = getRandomInt(0, 100);

		if (this.chance > rnd)
			return super.applyPhisics(surrounding);

		return surrounding;
	}
}

class DuplicateElement extends Grain {
	constructor(name = "Duplicate Element") {
		super(0, 0, 1, name);
	}

	applyPhisics(surrounding) {
		var result = super.applyPhisics(surrounding);
		var wireGrainPos = {
			x: -1,
			y: -1,
		};
		if (arraysEqual(surrounding, result)) {
			// Check for grains around
			var sideGrains = [];
			for (var x = 0; x < 3; x++) {
				for (var y = 0; y < 3; y++) {
					if (
						(x + y) % 2 === 1 &&
						result[x][y] != 0 &&
						result[x][y] != unexistingGrain
					) {
						// Only check sides

						var sideGrain = result[x][y];
						var grainObj = grains[sideGrain - 1];

						if (grainObj.type instanceof WireGrain) {
							if (sideGrain > grainObj.type.normalInt) {
								wireGrainPos.x = x;
								wireGrainPos.y = y;
							}
						} else {
							sideGrains.push(grainObj.type);
						}
					}
				}
			}
			if (
				sideGrains.length > 0 &&
				sideGrains.length < 4 &&
				wireGrainPos.x != -1 &&
				wireGrainPos.y != -1
			) {
				var randomGrain =
					sideGrains[getRandomInt(0, sideGrains.length - 1)];
				var newGrainInt = randomGrain.getGrainInt();
				// Place the new grain in a random empty side position
				for (var i = 0; i < 3; i++) {
					for (var j = 0; j < 3; j++) {
						if ((i + j) % 2 === 1 && result[i][j] === 0) {
							// Only check sides
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

class Sensor extends Grain {
	detect;
	constructor(name = "Sensor", detect = [Fire]) {
		super(0, 0, 1, name);
		this.detect = detect;
	}
	applyPhisics(surrounding) {
		var result = super.applyPhisics(surrounding);
		var wireGrainPos = {
			x: -1,
			y: -1,
		};

		var emptyWireGrainPos = {
			x: -1,
			y: -1,
		};

		if (arraysEqual(surrounding, result)) {
			// Check for grains around
			var sideGrains = [];
			for (var x = 0; x < 3; x++) {
				for (var y = 0; y < 3; y++) {
					if (
						(x + y) % 2 === 1 &&
						result[x][y] != 0 &&
						result[x][y] != unexistingGrain
					) {
						// Only check sides

						var sideGrain = result[x][y];
						var grainObj = grains[sideGrain - 1];

						if (grainObj.type instanceof WireGrain) {
							if (sideGrain > grainObj.type.normalInt) {
								wireGrainPos.x = x;
								wireGrainPos.y = y;
							} else {
								emptyWireGrainPos.x = x;
								emptyWireGrainPos.y = y;
							}
						} else {
							sideGrains.push(grainObj.type);
						}
					}
				}
			}
			if (
				sideGrains.length > 0 &&
				sideGrains.length < 4 &&
				wireGrainPos.x != -1 &&
				wireGrainPos.y != -1 &&
				emptyWireGrainPos.x != -1 &&
				emptyWireGrainPos.y != -1
			) {
				for (let sideGrain of sideGrains) {
					for (let d of this.detect) {
						if (sideGrain instanceof d) {
							result[emptyWireGrainPos.x][emptyWireGrainPos.y] +=
								1; // Place the new grain
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
	constructor(
		density = 1,
		chanceToReturnToNonGasForm = 0.01,
		nonGasForm = null,
		name = "Gas",
	) {
		super(3, 0, density, name);
		this.chanceToReturnToNonGasForm = chanceToReturnToNonGasForm;
		this.nonGasForm = nonGasForm;
	}

	applyPhisics(surrounding) {
		var result = super.applyPhisics(surrounding);

		if (arraysEqual(surrounding, result)) {

			var left = result[0][1];
			var right = result[2][1];
			var top = result[1][0];
			var self = result[1][1];

			var possibleMoves = [];

			// up empty
			if (top === 0) {
				possibleMoves.push([1, 2]);
			}
			// up density swap
			else if (top !== unexistingGrain) {
				var topGrain = grains[top - 1];
				if (topGrain && topGrain.type instanceof Liquid && topGrain.type.density > this.density) {
					possibleMoves.push([1, 0]);
				}
			}

			// left empty
			if (left === 0) {
				possibleMoves.push([0, 1]);
			}
			else if (left !== unexistingGrain) {
				var leftGrain = grains[left - 1];
				if (leftGrain && leftGrain.type instanceof Liquid && leftGrain.type.density > this.density) {
					possibleMoves.push([0, 1]);
				}
			}

			// right empty
			if (right === 0) {
				possibleMoves.push([2, 1]);
			}
			else if (right !== unexistingGrain) {
				var rightGrain = grains[right - 1];
				if (rightGrain && rightGrain.type instanceof Liquid && rightGrain.type.density > this.density) {
					possibleMoves.push([2, 1]);
				}
			}

			// if any move available, choose random
			while (possibleMoves.length > 0) {

				var randomIndex = getRandomInt(0, possibleMoves.length);
				var move = possibleMoves[randomIndex];
				var target = result[move[0]][move[1]];

				if (target && grains[target - 1]) {
					var targetGrain = grains[target - 1].type;

					if (targetGrain instanceof Liquid) {
						
						result[1][1] = target === 0 ? 0 : target;
						result[move[0]][move[1]] = self;
						// Remove this move from possibleMoves
						return result;
					}else{
						possibleMoves.splice(randomIndex, 1);
						continue;
					}

				} else {
					result[move[0]][move[1]] = self;
					result[1][1]=0;
					return result;
				}
			}

			// Condense
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
	
	constructor(chanceToFlame = 0.1, name = "Uran") {
		super(0, 0, 10, 55, name);
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
					if (
						surroundingGrain != 0 &&
						surroundingGrain != unexistingGrain
					) {
						var grainObj = grains[surroundingGrain - 1];
						if (
							grainObj.type instanceof Liquid &&
							grainObj.type.killsFire
						) {
							canPlaceFlame = false;
						}
						if (
							grainObj.type instanceof Fire ||
							grainObj.type instanceof Lava
						) {
							touchesFire += 1;
						}

						
					}
				}
			}
			// randomly place flame around it
			if (canPlaceFlame) {
				var rnd = getRandom(0.0, 100.0);
				if (rnd < this.chanceToBlowup || touchesFire > 1) {
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
					result[getRandomInt(0, 2) * 2][getRandomInt(0, 2) * 2] =
						normal_fire.getGrainInt();
					return result;
				}
			}
		}
		return result;
	}
}

class HeatSensor extends Sensor {
	constructor() {
		super("HeatSensor", [Fire, Lava]);
	}
}

class Sand extends LiquidAffectable {
	constructor(wetGrain = null, dryGrain = null, name = "Sand") {
		super(1, 0, 3, wetGrain, dryGrain, 3, 0.01, true, false, 0, name);
	}
}

class WetSand extends LiquidAffectable {
	constructor(wetGrain = null, dryGrain = null, name = "Wet Sand") {
		super(0, 0, 3, wetGrain, dryGrain, 0, 0, false, true, 0.01, name);
	}
}

class Dirt extends LiquidAffectable {
	constructor(wetGrain = null, dryGrain = null, name = "Dirt") {
		super(1, 0, 3, wetGrain, dryGrain, 3, 0.1, true, false, 0, name);
	}
}

class WetDirt extends LiquidAffectable {
	constructor(wetGrain = null, dryGrain = null, name = "Wet Dirt") {
		super(0, 0, 3, wetGrain, dryGrain, 0, 0, false, true, 0.01, name);
	}
}

class Seed extends FlamableGrain {
	chanceToGrow = 0.01; // Percentage chance to grow into a plant
	needsWater = true; // Whether this seed needs water to grow
	needsDirt = true; // Whether this seed needs dirt to grow
	turnInto; // The grain type this seed turns into when it grows
	constructor(
		turnInto,
		chanceToGrow = 0.01,
		needsWater = true,
		needsDirt = true,
		name = "Seed",
	) {
		super(1, 0, 5, 10, name);
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
						if ((x + y) % 2 === 1) {
							// Only check sides
							var sideGrain = result[x][y];
							if (
								sideGrain !== 0 &&
								sideGrain !== unexistingGrain
							) {
								var grainObj = grains[sideGrain - 1];
								if (grainObj.type instanceof Liquid) {
									// Check for water
									hasWater = true;
								}

								if (grainObj.type instanceof Sand || grainObj.type instanceof Dirt) {
									// Check for dirt
									hasDirt = true;
								}

								if (grainObj.type instanceof WetSand || grainObj.type instanceof WetDirt || grainObj.type instanceof Grass) {
									// Check for wet Sand
									hasDirt = true;
									hasWater = true; // Wet Sand has water
								}
							}
						}
					}
				}
			}

			if (
				(!this.needsWater || hasWater) &&
				(!this.needsDirt || hasDirt)
			) {
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
	constructor(
		grownForm,
		leaf,
		growthChance = 0.002,
		chanceToStopGrowing = 0.001,
		chanceToGrowLeafs = 0.0001,
		name = "Plant",
	) {
		super(0, 0, 1, 25, name);
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
				if (
					surrounding[1][0] === 0 &&
					surrounding[0][1] === 0 &&
					surrounding[0][2] === 0 &&
					surrounding[2][1] === 0 &&
					surrounding[2][2] === 0
				) {
					var s = getRandomInt(0, 3);
					if (s == 0) {
						result[1][0] = this.getGrainInt();
					} else if (s == 1) {
						result[0][1] = this.getGrainInt();
					} else {
						result[2][1] = this.getGrainInt();
					}
					result[1][1] = this.grownForm.getGrainInt();
				} else if (surrounding[1][0] === 0) {
					var s = getRandomInt(0, 2);
					if (s == 0) {
						result[1][0] = this.getGrainInt();
					} else if (s == 1) {
						if (
							surrounding[0][1] === 0 &&
							surrounding[0][2] === 0
						) {
							result[0][1] = this.getGrainInt();
							result[1][1] = this.grownForm.getGrainInt();
						} else if (
							surrounding[2][1] === 0 &&
							surrounding[2][2] === 0
						) {
							result[2][1] = this.getGrainInt();
							result[1][1] = this.grownForm.getGrainInt();
						}
					}
				} else {
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
						if ((x + y) % 2 === 1 && result[x][y] === 0) {
							// Only check sides
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
	constructor(name = "Wood") {
		super(0, 0, 10, 55, name);
	}

	
	applyPhisics(surrounding) {
		var result = surrounding;

		for (var x = 0; x < 3; x++) {
			for (var y = 0; y < 3; y++) {
				if ((x + y) % 2 === 1) {
					// Only check sides
					var sideGrain = result[x][y];
					if (sideGrain !== 0 && sideGrain !== unexistingGrain) {
						var grainObj = grains[sideGrain - 1];
						// flamibility is not defined

						if (grainObj.type instanceof Fire) {
							if (getRandom(0, 100) < 4) {
								result[1][1] = normal_coal.getGrainInt(); // Burn this grain
								return result;
							}
						}
					}
				}
			}
		}
		
		return super.applyPhisics(surrounding);
	}
}

class Leaf extends FlamableGrain {
	constructor(name = "Leaf") {
		super(0, 0, 1, 25, name);
	}

	applyPhisics(surrounding) {
		var result = super.applyPhisics(surrounding);

		if (arraysEqual(surrounding, result)) {
			// if touches wood then spreads
			for (var x = 0; x < 3; x++) {
				for (var y = 0; y < 3; y++) {
					if ((x + y) % 2 === 1) {
						// Only check sides
						var sideGrain = result[x][y];
						if (sideGrain !== 0 && sideGrain !== unexistingGrain) {
							var grainObj = grains[sideGrain - 1];
							if (grainObj.type instanceof Wood) {
								for (var i = 0; i < 3; i++) {
									for (var j = 0; j < 3; j++) {
										//(i + j) % 2 === 1 &&
										if (result[i][j] === 0) {
											// Only check sides
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

const WaterVapor = class WaterVapor extends Gas {
	constructor(normalForm, name = "Water Vapor") {
		super(-1, 0.01, normalForm, name);
	}

	applyPhisics(surrounding) {
		var result = surrounding
		for (var x = 0; x < 3; x++) {
			for (var y = 0; y < 3; y++) {
				var surroundingGrain = surrounding[x][y];
				if (
					surroundingGrain != 0 &&
					surroundingGrain != unexistingGrain
				) {
					var grainObj = grains[surroundingGrain - 1];
					if (
						grainObj.type instanceof Ice
					) {
						if (getRandom(0, 100) < 20){
							result[1][1] = normal_water.getGrainInt();
							return result;
						}
					}	
				}
			}
		}
		

		if (arraysEqual(surrounding, result)) {
			
			return super.applyPhisics(surrounding);
			
		}
		return result;
	}
};

const Water = class Water extends Liquid {
	constructor(gasForm, name = "Water") {
		super(1, true, gasForm, true, name);
	}

	applyPhisics(surrounding) {
		var result = surrounding;
		var touchesIce = 0;
			

		for (var x = 0; x < 3; x++) {
			for (var y = 0; y < 3; y++) {
				var surroundingGrain = surrounding[x][y];
				if (
					surroundingGrain != 0 &&
					surroundingGrain != unexistingGrain
				) {
					var grainObj = grains[surroundingGrain - 1];
					if (
						grainObj.type instanceof FrozenGrain
					) {
						touchesIce+=1;
					}	
				}
			}
		}
		if (touchesIce > 0 && getRandom(0, 100) < 1){
			result[1][1] = normal_ice.getGrainInt();
			return result;
		}

		if (arraysEqual(surrounding, result)) {
			return super.applyPhisics(surrounding);

		}
		return result;
	}
};

class AcidVapor extends Gas {
	constructor(normalForm, name = "Acid Vapor") {
		super(0, 0.01, normalForm, name);
	}
}

class Acid extends Liquid {
	constructor(gasForm, name = "Acid") {
		super(2, true, gasForm, true, name);
	}

	applyPhisics(surrounding) {
		var result = super.applyPhisics(surrounding);
		var touchesIce = 0;

		for (var x = 0; x < 3; x++) {
			for (var y = 0; y < 3; y++) {
				var surroundingGrain = surrounding[x][y];
				if (
					surroundingGrain != 0 &&
					surroundingGrain != unexistingGrain
				) {
					var grainObj = grains[surroundingGrain - 1];
					if (
						grainObj.type instanceof FrozenGrain
					) {
						touchesIce+=1;
					}	
				}
			}
		}
		if (touchesIce > 0 && getRandom(0, 100) < 1){
			result[1][1] = normal_acidIce.getGrainInt();
			return result;
		}

		if (arraysEqual(result, surrounding)) {
			console.log("Acid applied phisics");
			result = destroyNear(result, [Iron], 40, true, 100, 1);
			result = destroyNear(result, [Stone], 40, true, 100, 1);
			result = destroyNear(result, [Dirt], 40, true, 100, 1);
			result = destroyNear(result, [WetDirt], 40, true, 100, 1);
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
			result = destroyNear(result, [Grass], 40, true, 100, 1);
			result = destroyNear(result, [GrassSeed], 40, true, 100, 1);
			result = destroyNear(result, [GrassSprout], 40, true, 100, 1);
			result = destroyNear(result, [Brick], 40, true, 100, 1);
			
			result = destroyNear(
				result,
				[ElectricalDispenser],
				40,
				true,
				100,
				1,
			);
			result = destroyNear(result, [DuplicateElement], 40, true, 100, 1);
			result = destroyNear(result, [HeatingElement], 40, true, 100, 1);
			result = destroyNear(result, [HeatSensor], 40, true, 100, 1);
		}
		return result;
	}
}

class Lava extends Liquid {
	stone = null; // The grain type this lava turns into when it cools down
	constructor(chanceToPlaceFire = 0.001, stone = null, name = "Lava") {
		super(3, false, null, true, name);
		this.chanceToPlaceFire = chanceToPlaceFire; // Chance to place fire around
		this.stone = stone; // The grain type this lava turns into when it cools down
	}

	applyPhisics(surrounding) {
		var result = surrounding;
		for (var x = 0; x < 3; x++) {
			for (var y = 0; y < 3; y++) {
				if ((x + y) % 2 === 1) {
					// Only check sides
					if (result[x][y] === 0) {
						if (
							getRandom(0.0, 100.0) <
							this.chanceToPlaceFire * 100
						) {
							result[x][y] = normal_fire.getGrainInt(); // Place fire
							return result;
						}
					} else if (result[x][y] !== unexistingGrain) {
						var sideGrain = result[x][y];
						var grainObj = grains[sideGrain - 1];
						if (
							grainObj.type instanceof Liquid &&
							grainObj.type != this &&
							!(grainObj.type instanceof Oil) &&
							!(grainObj.type instanceof FlamableLiquid) &&
							!(grainObj.type instanceof MoltenIron)
						) {
							result[1][1] = this.stone.getGrainInt(); // Turn into stone
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
	constructor(chanceToBurn = 1, name = "Flamable Liquid") {
		super(0, false, null, true, name);
		this.chanceToBurn = chanceToBurn; // Chance to place fire around
	}
	applyPhisics(surrounding) {
		var result = surrounding;
		var hasFire = false;
		var hasAir = false;
		for (var x = 0; x < 3; x++) {
			for (var y = 0; y < 3; y++) {
				if (result[x][y] !== 0 && result[x][y] !== unexistingGrain) {
					var sideGrain = result[x][y];
					var grainObj = grains[sideGrain - 1];
					if (
						grainObj.type instanceof Fire ||
						grainObj.type instanceof Lava ||
						grainObj.type instanceof MoltenIron

					) {
						hasFire = true; // There is fire around
					}
				} else if (result[x][y] === 0) {
					hasAir = true; // There is air around
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
	constructor(chanceToBurn = 1, name = "Oil") {
		super(chanceToBurn, name);
	}
}

class Stone extends Grain {
	constructor(
		chanceToTurnIntoLava = 0.01,
		chanceToTurnIntoLavaFromFire = 0.0009,
		name = "Lava Rock",
	) {
		super(0, 0, 10, name);
		this.chanceToTurnIntoLava = chanceToTurnIntoLava; // Chance to turn into lava
		this.chanceToTurnIntoLavaFromFire = chanceToTurnIntoLavaFromFire; // Chance to turn into lava from fire
	}
	applyPhisics(surrounding) {
		var result = super.applyPhisics(surrounding);
		if (arraysEqual(surrounding, result)) {
			var hasWater = false;
			var hasFire;
			var lavaPositions = [];
			// check if there if touches lava and water, if so turns lava into stone
			for (var x = 0; x < 3; x++) {
				for (var y = 0; y < 3; y++) {
					if ((x + y) % 2 === 1) {
						// Only check sides
						var sideGrain = result[x][y];
						if (sideGrain !== 0 && sideGrain !== unexistingGrain) {
							var grainObj = grains[sideGrain - 1];
							if (grainObj.type instanceof Lava || grainObj.type instanceof MoltenIron) {
								lavaPositions.push({
									x: x,
									y: y,
								});
							}
							if (
								grainObj.type instanceof Liquid &&
								grainObj.type != normal_lava &&
								!(grainObj.type instanceof Oil) &&
								!(grainObj.type instanceof FlamableLiquid) &&
								!(grainObj.type instanceof MoltenIron)
							) {
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
			} else if (lavaPositions.length > 0) {
				// Turn into lava
				var rnd = getRandom(0.0, 100.0);
				if (rnd < this.chanceToTurnIntoLava * 100) {
					result[1][1] = normal_lava.getGrainInt();
					return result;
				}
			} else if (!hasWater && hasFire) {
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


class MoltenIron extends Liquid {
    constructor() {
        super(2, false, null, true, "Molten Iron");  // density 2, does not kill fire, no gas form
        this.chanceToSolidify = 0.5;  // 0.5% chance per step to solidify if not touching lava
    }

    applyPhisics(surrounding) {
        // First, check for solidification triggers on the current state (before any movement)
        let touchingLava = false;
        let touchingOtherLiquid = false;

        for (let x = 0; x < 3; x++) {
            for (let y = 0; y < 3; y++) {
                if ((x + y) % 2 === 1) { // cardinal directions only
                    let neighbor = surrounding[x][y];
                    if (neighbor !== 0 && neighbor !== unexistingGrain) {
                        let grainObj = grains[neighbor - 1];
                        if (grainObj.type instanceof Lava) {
                            touchingLava = true;
                        }
                        if ((grainObj.type instanceof Liquid &&
                            !(grainObj.type instanceof Lava) &&
                            !(grainObj.type instanceof MoltenIron)) ||
                            grainObj.type instanceof Ice) {
                            touchingOtherLiquid = true;
                        }
                    }
                }
            }
        }

        // If touching any liquid other than lava/ice/itself → solidify into iron
        if (touchingOtherLiquid) {
            let result = JSON.parse(JSON.stringify(surrounding));
            result[1][1] = normal_iron.getGrainInt();
            return result;
        }

        // If not touching lava, small chance to solidify over time
        if (!touchingLava && getRandom(0, 100) < this.chanceToSolidify) {
            let result = JSON.parse(JSON.stringify(surrounding));
            result[1][1] = normal_iron.getGrainInt();
            return result;
        }

        // No solidification happened → perform normal liquid physics
        return super.applyPhisics(surrounding);
    }
}

class Iron extends LiquidAffectable {
    constructor(wetGrain = null, dryGrain = null, name = "Iron") {
        super(0, 0, 55, wetGrain, dryGrain, 0.01, 0, false, false, 0, name);
    }

    applyPhisics(surrounding) {
        let result = super.applyPhisics(surrounding);
        // Only proceed if still iron after parent logic
        if (result[1][1] === this.getGrainInt()) {
            for (let x = 0; x < 3; x++) {
                for (let y = 0; y < 3; y++) {
                    if ((x + y) % 2 === 1) {
                        let neighbor = result[x][y];
                        if (neighbor !== 0 && neighbor !== unexistingGrain) {
                            let grainObj = grains[neighbor - 1];
                            if (grainObj.type instanceof Lava) {
                                // 2% chance to melt into molten iron
                                if (getRandom(0, 100) < 2) {
                                    result[1][1] = normal_moltenIron.getGrainInt();
                                    return result;
                                }
                            }else if (grainObj.type instanceof Fire){
								if (getRandom(0, 10000) < 1) {
                                    result[1][1] = normal_moltenIron.getGrainInt();
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

class RustIron extends LiquidAffectable {
    constructor(wetGrain = null, dryGrain = null, name = "Rusty Iron") {
        super(0, 0, 10, wetGrain, dryGrain, 0.005, 0.01, false, false, 0, name);
    }

    applyPhisics(surrounding) {
        let result = super.applyPhisics(surrounding);
        if (result[1][1] === this.getGrainInt()) {
            for (let x = 0; x < 3; x++) {
                for (let y = 0; y < 3; y++) {
                    if ((x + y) % 2 === 1) {
                        let neighbor = result[x][y];
                        if (neighbor !== 0 && neighbor !== unexistingGrain) {
                            let grainObj = grains[neighbor - 1];
                            if (grainObj.type instanceof Lava && getRandom(0, 100) < 2) {
                                result[1][1] = normal_moltenIron.getGrainInt();
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
class WeakRustIron extends Grain {
    constructor(name = "Weak Rusty Iron") {
        super(2, 0, 5, name);  // gravity 2 = only down
    }

    applyPhisics(surrounding) {
        // First do normal gravity movement (since it's a falling solid)
        let result = super.applyPhisics(surrounding);
        if (arraysEqual(surrounding, result)) {
            // Check for lava contact to melt
            for (let x = 0; x < 3; x++) {
                for (let y = 0; y < 3; y++) {
                    if ((x + y) % 2 === 1) {
                        let neighbor = result[x][y];
                        if (neighbor !== 0 && neighbor !== unexistingGrain) {
                            let grainObj = grains[neighbor - 1];
                            if (grainObj.type instanceof Lava && getRandom(0, 100) < 2) {
                                result[1][1] = normal_moltenIron.getGrainInt();
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

class Gunpowder extends ExplosiveGrain {
	constructor(name = "Gunpowder") {
		super(1, 5, 100, 100, 0.36, name);
	}
}

class TreeSeed extends Seed {
	constructor(
		turnInto,
		needsWater = true,
		needsDirt = true,
		name = "Tree Seed",
	) {
		super(turnInto, 0.01, needsWater, needsDirt, name);
	}
}

class GrassSeed extends Seed{
		constructor(
		turnInto,
		needsWater = true,
		needsDirt = true,
		name = "Grass Seed",
	) {
		super(turnInto, 0.002, needsWater, needsDirt, name);
	}
}



class TreeSprout extends Plant {
	constructor(
		grownForm,
		seed = null,
		leaf = null,
		chanceToDoble = 0.002,
		chanceToThrowSeed = 0.1,
		growthChance = 0.01,
		chanceToGrowLeafs = 0.0001,
		name = "Tree Sprout",
		turnInto = normal_wood,
		chanceToDie = 0.0001
	) {
		super(grownForm, leaf, growthChance, 0, chanceToGrowLeafs, name);
		this.chanceToDoble = chanceToDoble; // Chance to double the size
		this.chanceToTrowSeed = chanceToThrowSeed; // Chance to trow a seed
		this.seed = seed; // The seed this sprout can trow
		this.turnInto = turnInto;
		this.chanceToDie = chanceToDie;
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
						if (grainObj.type == this.turnInto) {
							woodCount++;
						}
					}
				}
			}
			if (woodCount >= 3) {
				result[1][1] = this.turnInto.getGrainInt(); // Turn into
				return result;
			}

			if (result[1][2] === 0) {
				rnd = getRandom(0.0, 100.0);
				if (rnd < this.chanceToThrowSeed * 100) {
					result[1][2] = this.seed.getGrainInt(); // Trow a seed
				}
			}



			

			var rnd = getRandom(0.0, 100.0);
			if (rnd < this.chanceToDoble * 100) {
				// Double the size of the plant
				for (var x = 0; x < 3; x++) {
					for (var y = 0; y < 2; y++) {
						if ((x + y) % 2 === 1) {
							// Only check sides
							if (result[x][y] === 0) {
								result[x][y] = this.getGrainInt();
								return result;
							}
						}
					}
				}
			}

			rnd = getRandom(0.0, 100.0);
			if (rnd < this.chanceToDie * 100) {
				result[1][2] = 0; // Trow a seed
			}


			
		}
		return result;
	}
}

class GrassSprout extends Plant {
	constructor(		
		grownForm,
		seed = null,
		chanceToThrowSeed = 0.1,
		growthChance = 0.01,
		turnInto = null,
		chanceToDie = 0.03,
		name = "Grass Sprout"
	) {
		super(grownForm, null, growthChance, 0, 0, name);
		this.seed = seed;
		this.chanceToThrowSeed = chanceToThrowSeed;
		this.turnInto = turnInto;
		this.chanceToDie = chanceToDie;
	}

	applyPhisics(surrounding) {
		// Clone surrounding
		var result = surrounding.map(row => row.slice());

		// =========================
		// 🌱 Grow into full grass
		// =========================
		var rnd = getRandom(0.0, 100.0);
		if (rnd < this.growthChance * 100) {
			result[1][1] = this.grownForm.getGrainInt();
			return result;
		}

		// =========================
		// 🌾 Spread sideways
		// =========================
		rnd = getRandom(0.0, 100.0);
		if (rnd < this.growthChance * 50) {
			let sides = [
				[0,1], // left
				[2,1]  // right
			];

			let s = getRandomInt(0, sides.length);
			let x = sides[s][0];
			let y = sides[s][1];

			if (result[x][y] === 0) {
				result[x][y] = this.getGrainInt();
				return result;
			}
		}

		// =========================
		// 🌰 Throw seed downward
		// =========================
		if (this.seed && result[1][2] === 0) {
			rnd = getRandom(0.0, 100.0);
			if (rnd < this.chanceToThrowSeed * 100) {
				result[1][2] = this.seed.getGrainInt();
				return result;
			}
		}

		// =========================
		// 🪵 Turn into another type if surrounded
		// =========================
		if (this.turnInto) {
			let count = 0;
			for (let x = 0; x < 3; x++) {
				for (let y = 0; y < 3; y++) {
					if (x === 1 && y === 1) continue;
					if (result[x][y] === this.turnInto.getGrainInt()) {
						count++;
					}
				}
			}
			if (count >= 3) {
				result[1][1] = this.turnInto.getGrainInt();
				return result;
			}
		}

		// =========================
		// 💀 Chance to die
		// =========================
		rnd = getRandom(0.0, 100.0);
		if (rnd < this.chanceToDie * 100) {
			result[1][1] = 0;
			return result;
		}

		return result;
	}
}


class Grass extends FlamableGrain{
	constructor (name = "Grass"){
		super(0, 0, 10, 55, name);
	}
}

class FireTreeSprout extends TreeSprout {
	constructor(
		grownForm,
		seed = null,
		leaf = null,
		chanceToDoble = 0.02,
		chanceToThrowSeed = 0.1,
		chanceToBurn = 0.001,
		name = "Fire Tree Sprout",
	) {
		super(
			grownForm,
			seed,
			leaf,
			chanceToDoble,
			chanceToThrowSeed,
			0.1,
			0.001,
			name,
		);
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
	constructor(maxRotLevel = 5, chanceToRot = 0.001, name = "Meat") {
		super(1, 0, 4, 1, name);
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
	constructor(
		meat,
		chanceToEat = 0.1,
		eats = [],
		diesFrom = [],
		needsOxygen = true,
		chanceToDoble = 0.1,
		name = "Fly",
	) {
		super(0, 0, 4, name);
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
					if ((x + y) % 2 === 1 && result[x][y] === 0) {
						// Only check sides
						hasSpace = true; // Has space to move
						// dies if touches water or Acid or fire
					} else if (
						(x + y) % 2 === 1 &&
						result[x][y] !== 0 &&
						result[x][y] !== unexistingGrain
					) {
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
													if (
														(i + j) % 2 === 1 &&
														result[i][j] === 0
													) {
														// Only check sides
														result[i][j] =
															this.getGrainInt(); // Place the new grain
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
				if (side === 0 && result[0][1] === 0) {
					// Up
					result[0][1] = result[1][1];
					result[1][1] = 0;
				} else if (side === 1 && result[2][1] === 0) {
					// Down
					result[2][1] = result[1][1];
					result[1][1] = 0;
				} else if (side === 2 && result[1][0] === 0) {
					// Left
					result[1][0] = result[1][1];
					result[1][1] = 0;
				} else if (side === 3 && result[1][2] === 0) {
					// Right
					result[1][2] = result[1][1];
					result[1][1] = 0;
				}
			} else if (this.needsOxygen) {
				// No space to move, dies
				result[1][1] = this.meat.getGrainInt(); // Turns into meat
			}
		}
		return result;
	}
}



class FruitFly extends Fly {
	constructor(meat, radioactiveFly = null, name = "Fruit Fly") {
		super(
			meat,
			0.1,
			[Leaf, TreeSeed, TreeSprout],
			[Water, WaterVapor, Acid, AcidVapor, Fire, Lava, MoltenIron],
			true,
			0.1,
			name,
		);
		this.radioactiveFly = radioactiveFly; // The radioactive fly this fruit fly can turn into
	}
	applyPhisics(surrounding) {
		var result = super.applyPhisics(surrounding);
		if (arraysEqual(surrounding, result)) {
			// see if there is uran near
			for (var x = 0; x < 3; x++) {
				for (var y = 0; y < 3; y++) {
					if (
						(x + y) % 2 === 1 &&
						result[x][y] !== 0 &&
						result[x][y] !== unexistingGrain
					) {
						// Only check sides
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
	constructor(meat, name = "Radioactive Fly") {
		super(
			meat,
			0.1,
			[
				Wood,
				Sand,
				Dirt,
				Acid,
				AcidVapor,
				FruitFly,
				RustIron,
				WeakRustIron,
				Uran,
				Fire,
			],
			[Water, WaterVapor, Lava],
			false,
			0.1,
			name,
		);
	}
	applyPhisics(surrounding) {
		var result = super.applyPhisics(surrounding);
		if (arraysEqual(surrounding, result)) {
			// has a small chance to any flamable grains around into fire
			for (var x = 0; x < 3; x++) {
				for (var y = 0; y < 3; y++) {
					if ((x + y) % 2 === 1 && result[x][y] !== 0 && result[x][y] !== unexistingGrain) {
						var sideGrain = result[x][y];
						var grainObj = grains[sideGrain - 1];
						if (grainObj.type instanceof FlamableGrain) {
							var rnd = getRandom(0.0, 100.0);
							if (rnd < 0.1 * 100) {
								result[x][y] = normal_fire.getGrainInt(); // Place fire
							}
						}
					}
				}
			}
		}
		return result;
	}
}

class Bee extends Fly {
	constructor(meat, name = "Bee") {
		super(
			meat,
			0.1,
			[Leaf, TreeSeed, TreeSprout],
			[Uran, Water, WaterVapor, Acid, AcidVapor, Fire, Lava, MoltenIron],
			true,
			0.1,
			name,
		);
	}
}

class RadioactiveMeat extends Meat {
	constructor(
		chanceToRevive = 0.01,
		radioactiveFly = null,
		name = "Radioactive Meat",
	) {
		super(5, 0.001, name); // Higher rot level and chance to rot
		this.chanceToRevive = chanceToRevive; // Chance to revive into a radioactive fly
		this.radioactiveFly = radioactiveFly; // The radioactive fly this meat can turn into
	}
	applyPhisics(surrounding) {
		var result = super.applyPhisics(surrounding);
		if (arraysEqual(surrounding, result)) {
			// Check for radioactive flies around
			for (var x = 0; x < 3; x++) {
				for (var y = 0; y < 3; y++) {
					if (
						(x + y) % 2 === 1 &&
						result[x][y] !== 0 &&
						result[x][y] !== unexistingGrain
					) {
						// Only check sides
						var sideGrain = result[x][y];
						var grainObj = grains[sideGrain - 1];
						if (grainObj.type instanceof WireGrain) {
							if (sideGrain > grainObj.type.normalInt) {
								// If it is a charged wire, then it can turn into a radioactive fly
								result[x][y] -= 1; // Decrease charge of the wire

								var rnd = getRandom(0.0, 100.0);
								if (rnd < this.chanceToRevive * 100.0) {
									result[1][1] =
										this.radioactiveFly.getGrainInt();
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
	constructor(gravity, normalForm, name = "Frozen Grain") {
		super(gravity, 0, 10, name);
		this.normalForm = normalForm; // The normal grain type this frozen grain can thaw into
	}
	applyPhisics(surrounding) {
		var result = surrounding;
		for (var x = 0; x < 3; x++) {
			for (var y = 0; y < 3; y++) {
				if (
					(x + y) % 2 === 1 &&
					result[x][y] !== 0 &&
					result[x][y] !== unexistingGrain
				) {
					// Only check sides
					var sideGrain = result[x][y];
					var grainObj = grains[sideGrain - 1];
					if (
						grainObj.type instanceof Fire ||
						grainObj.type instanceof Lava ||
						grainObj.type instanceof Uran ||
						grainObj.type instanceof MoltenIron
					) {
						// If touches fire or lava, then thaws into the normal form
						result[1][1] = this.normalForm.getGrainInt();
						return result; // Return the result after thawing
					}
					if (
						grainObj.type instanceof Gas
					) {
						if (getRandom(0, 100) < 1){
							result[1][1] = normal_water.getGrainInt();
							return result;
						}
					}	
				}
			}
		}

		result = super.applyPhisics(surrounding);
		return result;
	}
}

class Ice extends FrozenGrain {
	constructor(water = null, name = "Ice") {
		super(0, water, name);
	}
}

class AcidIce extends FrozenGrain {
	constructor(acid = null, name = "Acid Ice") {
		super(0, acid, name);
	}
}

class Honey extends Grain {
	constructor(name = "Honey") {
		super(1, 0, 10, name); // Very sticky grain with low gravity
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

class GrainType {
	color = "";
	type = new Grain(1, 0);
	constructor(color, type) {
		this.color = color;
		this.type = type;
	}
}
const normal_wetSand = new WetSand(null, null);
const normal_sand = new Sand(normal_wetSand, null);
normal_wetSand.dryGrain = normal_sand;
normal_sand.wetGrain = normal_wetSand;

const normal_wetDirt = new WetDirt(null, null);
const normal_dirt = new Dirt(normal_wetDirt, null);
normal_wetDirt.dryGrain = normal_dirt;
normal_dirt.wetGrain = normal_wetDirt;

const normal_water = new Water(null);
const normal_waterVapor = new WaterVapor(normal_water);
normal_water.gasForm = normal_waterVapor;
const normal_ice = new Ice(normal_water);

const normal_weakRustIron = new WeakRustIron();

const normal_rustIron = new RustIron(null, null);
normal_rustIron.dryGrain = normal_rustIron;
normal_rustIron.wetGrain = normal_weakRustIron;


const normal_moltenIron = new MoltenIron();
const normal_iron = new Iron([normal_rustIron], null);

const normal_acid = new Acid(null);
const normal_acidVapor = new AcidVapor(normal_acid);
normal_acid.gasForm = normal_acidVapor;
const normal_acidIce = new AcidIce(normal_acid);

const normal_oil = new Oil(1);

const normal_stone = new Stone();
const normal_brick = new Brick();

const normal_lava = new Lava(0.001, normal_stone);

const normal_wood = new Wood();
const normal_leaf = new Leaf();
const normal_treeSprout = new TreeSprout(
	normal_wood,
	null,
	normal_leaf,
	0.002,
	0.01,
);
const normal_treeSeed = new TreeSeed(normal_treeSprout);
normal_treeSprout.seed = normal_treeSeed;

const normal_grass = new Grass();
const normal_grassSprout = new GrassSprout(
	normal_grass,
	null,
	0.01,
	0.01,
	null,
	0.003
)
const normal_grassSeed = new GrassSeed(normal_grassSprout);
normal_grassSprout.seed = normal_grassSeed;

const normal_fire = new Fire();

const normal_fireLeaf = new Leaf();
const normal_fireTreeSeed = new Seed(null, 0.01, false, true);
const normal_fireTreeSprout = new FireTreeSprout(
	normal_wood,
	normal_fireTreeSeed,
	normal_fireLeaf,
	0.01,
	1,
	0.001,
);
normal_fireTreeSeed.turnInto = normal_fireTreeSprout;

const normal_gunpowder = new Gunpowder();

const normal_wire = new WireGrain(5);
const normal_electricalDispenser = new ElectricalDispenser();
const normal_randomElectricalDispenser = new RandomElectricalDispenser();

const normal_uran = new Uran();
const normal_heatingElement = new HeatingElement();
const normal_duplicateElement = new DuplicateElement();
const normal_heatSensor = new HeatSensor();

// Meat and Fly
const normal_meat = new Meat();
const normal_radioactiveMeat = new RadioactiveMeat(0.01, null);
const normal_radioactiveFly = new RadioactiveFly(normal_radioactiveMeat);
normal_radioactiveMeat.radioactiveFly = normal_radioactiveFly;
const normal_fly = new FruitFly(normal_meat, normal_radioactiveFly);


const normal_honey = new Honey();
const normal_bee = new Bee(normal_honey);

const normal_coal = new Coal();
const normal_powder_coal = new PowderCoal();



grains = [
	new GrainType("#f6d7b0", normal_sand),
	new GrainType("#f2d2a9", normal_sand),
	new GrainType("#eccca2", normal_sand),
	new GrainType("#e7c496", normal_wetSand),
	new GrainType("#e1bf92", normal_wetSand),


	new GrainType("#a6786b", normal_dirt),
	new GrainType("#8b6154ff", normal_dirt),
	new GrainType("#7e584dff", normal_dirt),
	new GrainType("#8f6458", normal_dirt),

	new GrainType("#6d4639", normal_wetDirt),
	new GrainType("#5b3a2d", normal_wetDirt),

	new GrainType("#0b4470ff", normal_water),
	new GrainType("#0f5e9c", normal_water),
	new GrainType("#2389da", normal_water),
	new GrainType("#1ca3ec", normal_water),

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
	new GrainType("#d6e79eff", normal_acidIce),
	new GrainType("#ebf2aeff", normal_acidIce),
	new GrainType("#ebefb0ff", normal_acidIce),
	new GrainType("#d9e95fff", normal_acidIce),
	new GrainType("#d6f677ff", normal_acidIce),

	new GrainType("#e0ac69", normal_oil),
	new GrainType("#f1c27d", normal_oil),
	new GrainType("#ffdbac", normal_oil),

	new GrainType("#ed1f0a", normal_fire),
	new GrainType("#f8420b", normal_fire),
	new GrainType("#f95504", normal_fire),
	new GrainType("#f76f0b", normal_fire),
	new GrainType("#ff900a", normal_fire),

	new GrainType("#ff6600", normal_lava),
	new GrainType("#ee7b06", normal_lava),
	new GrainType("#ffa904", normal_lava),
	new GrainType("#ffdb00", normal_lava),

	new GrainType("#414a4c", normal_stone), 
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
		
	new GrainType("#e78a20ff", normal_moltenIron),
	new GrainType("#eca10cff", normal_moltenIron),
	new GrainType("#f1bb09ff", normal_moltenIron),
	new GrainType("#ff8e4d", normal_moltenIron),

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
	new GrainType("#fff27dff", normal_randomElectricalDispenser),
	new GrainType("#bd370a", normal_heatingElement),
	new GrainType("#5a2e88", normal_duplicateElement),
	new GrainType("#243b73", normal_heatSensor),

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


	new GrainType("#136d15", normal_grass),
	new GrainType("#117c13", normal_grass),
	new GrainType("#138510", normal_grass),
	new GrainType("#268b07", normal_grass),
	new GrainType("#41980a", normal_grass),
	new GrainType("#eacdabff", normal_grassSeed),
	new GrainType("#e7cfb4", normal_grassSeed),
	new GrainType("#b5eaabff", normal_grassSprout),
	new GrainType("#98c778ff", normal_grassSprout),
	new GrainType("#5f886eff", normal_grassSprout),

	new GrainType("#bd4343", normal_fireTreeSeed),
	new GrainType("#ff6b6b", normal_fireTreeSeed),
	new GrainType("#ff8f8f", normal_fireTreeSeed),
	new GrainType("#ffb605", normal_fireTreeSprout),
	new GrainType("#ec5300", normal_fireLeaf),
	new GrainType("#f97d16", normal_fireLeaf),
	new GrainType("#ff9750", normal_fireLeaf),


	new GrainType("#161616", normal_coal),
	new GrainType("#414141", normal_coal),
	new GrainType("#575757", normal_coal),
	new GrainType("#797979", normal_coal),

	new GrainType("#161616", normal_powder_coal),
	new GrainType("#414141", normal_powder_coal),
	new GrainType("#575757", normal_powder_coal),
	new GrainType("#797979", normal_powder_coal),

	new GrainType("#ff7a7a", normal_meat),
	new GrainType("#742f35", normal_meat), // more rotten color
	new GrainType("#8b594c", normal_meat),
	new GrainType("#6f4c33", normal_meat),
	new GrainType("#535a4a", normal_meat),

	new GrainType("#feffc0", normal_radioactiveMeat),
	new GrainType("#feff91", normal_radioactiveMeat), // more rotten color
	new GrainType("#9bd662", normal_radioactiveMeat),
	new GrainType("#508356", normal_radioactiveMeat),
	new GrainType("#3a313e", normal_radioactiveMeat),

	
	new GrainType("#f6e000", normal_honey),
	new GrainType("#ffbe42", normal_honey),
	new GrainType("#ffb100", normal_honey), 
	new GrainType("#ed8c00", normal_honey),
	new GrainType("#cc5d00", normal_honey),

	new GrainType("#dd7d7d", normal_brick), 
	new GrainType("#cb6b6b", normal_brick),
	new GrainType("#b65454", normal_brick),
	new GrainType("#9e3333", normal_brick),
	new GrainType("#842020", normal_brick),


	new GrainType("#f6e000", normal_bee),
	new GrainType("#f9c901", normal_bee),
	new GrainType("#985b10", normal_bee),
	new GrainType("#896800", normal_bee),
	new GrainType("#6b4701", normal_bee),



	new GrainType("#f9d6d4", normal_fly),
	new GrainType("#e5b1b9", normal_fly),
	new GrainType("#a77680", normal_fly),
	new GrainType("#7f4c4f", normal_fly),

	new GrainType("#dcff00", normal_radioactiveFly),
	new GrainType("#c3ff00", normal_radioactiveFly),
	new GrainType("#88ff00", normal_radioactiveFly),
	new GrainType("#64ff00", normal_radioactiveFly),
	new GrainType("#1dff00", normal_radioactiveFly)
];

class GrainVariety {
	amount = 1;
	type = grain;

	constructor(amount, type) {
		this.amount = amount;
		this.type = type;
	}
}



async function getGrainTypes() {
	var lastGrain;
	var i = 0;
	for (grain of grains) {
		if (lastGrain == grain.type) {
			grainTypes[i - 1].amount++;
		} else {
			grainTypes.push(new GrainVariety(1, grain.type));
			lastGrain = grain.type;
			i++;
		}
	}

	for (grainType of grainTypes) {
		grainType.type.findNormalInt(grainType.type);
	}
}


// ANIMATIONS 

normal_wire.exampleInstructions = [
	{ time: 0, x: 30, y: 30, size: 10, grain: normal_wire },
	{ time: 5, x: 30, y: 32, size: 1, grain: normal_uran }

];

function findGrain(int) {
	if (int == 0) return;
	for (let grainIndex in grains)
		if (grainIndex == int - 1) return grains[grainIndex];
}
