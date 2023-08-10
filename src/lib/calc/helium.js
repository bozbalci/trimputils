import { prettify } from '$lib/utils/format';
import { getEffectiveFluffy } from './fluffy';
import { countExtraAchievementGoldens } from './golden';

function isWindZone(zone) {
	if (zone < 236) return false;
	const i = (zone - 236) % 15;
	return 5 <= i && i < 10;
}

export function heliumAtZone({
	zone,
	looting,
	looting2,
	c2,
	frigidCompletions,
	achievementBonus,
	scientist5,
	condenserLevel,
	condenserOwned,
	fluffyEvo,
	fluffyLevel,
	fluffinity,
	stillRowing,
	headstartLevel,
	strengthInHealth2,
	goldenBattle,
	windLevel,
	windEnlightenmentActive,
	windStack,
	windStackFromZone,
	// Pretend Void
	ignoreWindForVoid,
	voidSpecialization,
	lastPortalZone,
	scryhard2
}) {
	let total = 0;
	const rows = [];

	if (zone < 20) {
		return { total, rows };
	}

	let zoneFactor = 1.35 * (zone - 19);
	let base = Math.round(zoneFactor + Math.pow(1.23, Math.sqrt(zoneFactor)));
	total += base;
	rows.push(['Base', '', '', '', prettify(total)]);

	// Used in multiple calcs
	let totalFluffyLevel = getEffectiveFluffy(fluffyEvo, fluffyLevel, fluffinity);

	// World
	let blimpType = '';
	let blimpMultiplier = 1;
	if (zone >= 59) {
		blimpType = 'Improbability';
		blimpMultiplier *= 5;
	}
	if (zone >= 230) {
		blimpType = 'Omnipotrimp';
		blimpMultiplier *= 3;
	}
	total *= blimpMultiplier;
	if (blimpMultiplier > 1) {
		rows.push([`${blimpType} Bonus`, '', '', blimpMultiplier, prettify(total)]);
	}
	if (zone >= 181) {
		total *= 2;
		rows.push(['Corruption Bonus', '', '', 2, prettify(total)]);
	}

	// Scientist V
	if (scientist5) {
		let scientistVBonus = Math.pow(1.005, zone);
		total *= scientistVBonus;
		rows.push(['Scientist V', '', '', prettify(scientistVBonus), prettify(total)]);
	}

	// Golden Helium
	if (!goldenBattle) {
		let goldenVoids = 8; // Hardcoded for now
		let freeGoldens = countExtraAchievementGoldens(achievementBonus);
		let earnedGoldensAtZone = Math.floor(zone / 25);
		let totalGoldenHeliumUpgrades = freeGoldens + earnedGoldensAtZone - goldenVoids;
		let lowest = goldenVoids + 1;
		let highest = lowest + totalGoldenHeliumUpgrades - 1;
		let avg = (highest + lowest) / 2;
		let goldenBonus = 1 + (avg * totalGoldenHeliumUpgrades) / 100;
		total *= goldenBonus;
		rows.push(['Golden Helium', '', '', prettify(goldenBonus), prettify(total)]);
	}

	// Fluffy Helium
	let totalFluffyBonusCount = 0;
	if (totalFluffyLevel >= 2) totalFluffyBonusCount += 1;
	if (totalFluffyLevel >= 7) totalFluffyBonusCount += 1;
	if (totalFluffyBonusCount > 0) {
		let fluffyBonus = 1 + 0.25 * totalFluffyBonusCount;
		total *= fluffyBonus;
		rows.push(['Fluffy Helium', '25%', totalFluffyBonusCount, fluffyBonus, prettify(total)]);
	}

	// Perk bonuses
	let lootingBonus = 1 + 0.05 * looting;
	total *= lootingBonus;
	rows.push(['Looting (perk)', '+ 5%', looting, prettify(lootingBonus), prettify(total)]);

	let looting2Bonus = 1 + 0.0025 * looting2;
	total *= looting2Bonus;
	rows.push([
		'Looting II (perk)',
		'+ 0.25%',
		prettify(looting2),
		prettify(looting2Bonus),
		prettify(total)
	]);

	// Spire Rows
	let singleRowBonus = stillRowing ? 0.03 : 0.02;
	let spiresClearedAtZone = 0;
	[200, 300, 400, 500, 600, 700, 800].forEach((spireZone) => {
		if (zone >= spireZone) {
			spiresClearedAtZone += 1;
		}
	});
	let spireRows = spiresClearedAtZone * 10;
	let spireBonus = 1 + singleRowBonus * spireRows;
	if (spireBonus > 1) {
		total *= spireBonus;
		rows.push(['Spire Rows', singleRowBonus, spireRows, prettify(spireBonus), prettify(total)]);
	}

	// Wind
	if (isWindZone(zone) && !ignoreWindForVoid) {
		let singleStackWindBonus = windLevel / 1000;
		if (totalFluffyLevel >= 18) singleStackWindBonus *= 5;
		let averageStack = 1;
		if (windStack && zone >= windStackFromZone) averageStack = 200;
		if (windEnlightenmentActive) averageStack *= 1.5;
		const windMultiplier = 1 + singleStackWindBonus * averageStack;
		total *= windMultiplier;
		rows.push([
			'Swiftness (Wind)',
			singleStackWindBonus,
			averageStack,
			prettify(windMultiplier),
			prettify(total)
		]);
	}

	// Challenge^2
	let c2Bonus = 1 + c2 / 1000;
	total *= c2Bonus;
	rows.push(['Challenge^2 Reward', '', '', c2Bonus, prettify(total)]);

	// Condenser Towers
	if (condenserOwned > 0 && condenserLevel > 0) {
		let condenserBonusEach = 0.1 + 0.05 * (condenserLevel - 1);
		let condenserBonus = 1 + condenserOwned * condenserBonusEach;
		total *= condenserBonus;
		rows.push([
			'Condenser Towers',
			prettify(condenserBonusEach),
			condenserOwned,
			prettify(condenserBonus),
			prettify(total)
		]);
	}

	// Frigid
	if (frigidCompletions > 0) {
		let frigidBonus = 1 + (2.5 * frigidCompletions * (frigidCompletions + 1)) / 200;
		total *= frigidBonus;
		rows.push(['Frigid Completions', '+2.5N%', frigidCompletions, frigidBonus, prettify(total)]);
	}

	// Corruption
	let possibleCorruptedCellCount = 0;
	let corruptionStartZone = 181;
	let corruptionMultiplier = 0.15;
	if (headstartLevel >= 1) corruptionStartZone = 176;
	if (headstartLevel >= 2) corruptionStartZone = 166;
	if (headstartLevel >= 3) corruptionStartZone = 151;
	if (zone >= corruptionStartZone) {
		possibleCorruptedCellCount = Math.floor((zone - corruptionStartZone) / 3) + 2;
		possibleCorruptedCellCount = Math.max(possibleCorruptedCellCount, 0);
		possibleCorruptedCellCount = Math.min(possibleCorruptedCellCount, 80);
	}

	// Healthy
	let possibleHealthyCellCount = 0;
	let healthyMultiplier = strengthInHealth2 ? 0.65 : 0.45;
	if (spiresClearedAtZone >= 2) {
		let penultimateSpireZone = spiresClearedAtZone * 100;
		let lastHealthyZone = Math.min(zone, penultimateSpireZone + 199);
		possibleHealthyCellCount = Math.floor((lastHealthyZone - 300) / 15) + 2;
		if (strengthInHealth2) possibleHealthyCellCount += spiresClearedAtZone;
		possibleHealthyCellCount = Math.min(possibleHealthyCellCount, 80);
		if (zone < 301) possibleHealthyCellCount = 0;
		possibleCorruptedCellCount -= possibleHealthyCellCount;
	}

	// Mutations
	let totalBeforeMutations = total;

	let corruptionBonus = corruptionMultiplier * possibleCorruptedCellCount;
	let corruptionValue = totalBeforeMutations * corruptionBonus;
	if (possibleCorruptedCellCount > 0) {
		rows.push([
			'Corrupted Cells',
			corruptionMultiplier,
			possibleCorruptedCellCount,
			prettify(corruptionBonus),
			prettify(corruptionValue) + ' per zone'
		]);
	}

	let healthyBonus = healthyMultiplier * possibleHealthyCellCount;
	let healthyValue = totalBeforeMutations * healthyBonus;
	if (possibleHealthyCellCount > 0) {
		rows.push([
			'Healthy Cells',
			healthyMultiplier,
			possibleHealthyCellCount,
			prettify(healthyBonus),
			prettify(healthyValue) + ' per zone'
		]);
	}

	total += corruptionValue + healthyValue;
	if (possibleCorruptedCellCount + possibleHealthyCellCount > 0) {
		rows.push([
			'Mutation Total',
			'',
			possibleCorruptedCellCount + possibleHealthyCellCount,
			prettify(corruptionBonus + healthyBonus - 1),
			prettify(total)
		]);
	} else {
		rows.push(['Total', '', '', '', prettify(total)]);
	}

	// Voids
	let totalVoid = total;
	let voidMapBonus = 2;
	totalVoid *= voidMapBonus;
	rows.push(['Void Map', '', '', voidMapBonus, prettify(totalVoid)]);

	if (scryhard2) {
		let scryhard2Bonus = 1.5;
		totalVoid *= scryhard2Bonus;
		rows.push(['Scryhard II', '', '', scryhard2Bonus, prettify(totalVoid)]);
	}

	if (voidSpecialization) {
		let voidSpecializationBonus = 1 + 0.0025 * lastPortalZone;
		totalVoid *= voidSpecializationBonus;
		rows.push(['Void Special', '', '', prettify(voidSpecializationBonus), prettify(totalVoid)]);
	}

	return {
		total,
		rows
	};
}

export function totalHeliumAtZone(maxZone, calcParams) {
	let totalHe = 0;
	for (let i = 20; i <= maxZone; i++) {
		let result = heliumAtZone({ zone: i, ...calcParams });
		totalHe += result.total;
	}
	return totalHe;
}
