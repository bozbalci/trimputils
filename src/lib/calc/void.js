// def get_vm_mult(effective_vms, hze):
//     result = 2  # void map
//     result *= 1.5  # scryhard 2
//     result *= 1 + 0.0025 * hze  # void specialization
//     result *= effective_vms
//     return result
//
// void_he = get_vm_mult(
//     get_effective_vms(
//         mapcnt=64,
//         max_stack=3,
//         motv=False,
//         iterations=1000
//     ),
//     hze=512
// )
//
// print(void_he)
//

const voidMapPrefixes = ['Deadly', 'Destructive', 'Heinous', 'Poisonous'];

const voidMapSuffixes = ['Descent', 'Nightmare', 'Pit', 'Void'];

function randomChoice(choices) {
	var index = Math.floor(Math.random() * choices.length);
	return choices[index];
}

function sum(arr) {
	return arr.reduce((a, b) => a + b, 0);
}

function createVoidMap() {
	const prefix = randomChoice(voidMapPrefixes);
	const suffix = randomChoice(voidMapSuffixes);
	return `${prefix} ${suffix}`;
}

function createMapStacks(mapCount, maxStackSize) {
	const mapCountsByName = {};
	for (let i = 0; i < mapCount; i++) {
		let mapName = createVoidMap();
		if (mapName in mapCountsByName) {
			mapCountsByName[mapName] += 1;
		} else {
			mapCountsByName[mapName] = 1;
		}
	}
	const mapStacksByCount = [];
	for (let count of Object.values(mapCountsByName)) {
		if (count <= maxStackSize) {
			mapStacksByCount.push(count);
		} else {
			const newStacks = Array.from(
				{ length: Math.floor(count / maxStackSize) },
				() => maxStackSize
			);
			mapStacksByCount.push(...newStacks);
			const remainder = count % maxStackSize;
			if (remainder > 0) {
				mapStacksByCount.push(remainder);
			}
		}
	}
	return mapStacksByCount;
}

function flattenStack(stackSize, multiplicative) {
	if (stackSize == 1) return 1;
	let additionalMaps = stackSize - 1;
	let increase = 1 + 0.5 * additionalMaps;
	if (multiplicative) {
		increase = Math.pow(1.5, additionalMaps);
	}
	return 1 + additionalMaps * increase;
}

export function getEffectiveNumberOfVoidMaps(mapCount, maxStackSize, multiplicative, iterations) {
	let total = 0;
	for (let i = 0; i < iterations; i++) {
		total += sum(
			createMapStacks(mapCount, maxStackSize).map((stackSize) =>
				flattenStack(stackSize, multiplicative)
			)
		);
	}
	return total / iterations;
}

export function getEffectiveVoidHeliumMultiplier({
	mapCount,
	maxStackSize,
	multiplicative,
	scryhard2,
	voidSpecialization,
	previousRunHze
}) {
	const effectiveVoidMaps = getEffectiveNumberOfVoidMaps(
		mapCount,
		maxStackSize,
		multiplicative,
		50
	);
	let result = 2;
	if (scryhard2) result *= 1.5;
	if (voidSpecialization) result *= 1 + 0.0025 * previousRunHze;
	return result * effectiveVoidMaps;
}
