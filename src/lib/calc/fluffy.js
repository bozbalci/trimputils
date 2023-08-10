import { prettify } from '$lib/utils/format';

const xpPerZoneGrowth = 1.015;
const growth = 4;
const prestigeExpModifier = 5;
const baseFirstLevel = 1000;

export function getFluffyEvolutionAndLevel({ fluffyPrestige, fluffyExp }) {
	const evolution = fluffyPrestige;
	const firstLevelForEvolution = baseFirstLevel * Math.pow(prestigeExpModifier, evolution);
	const level = Math.floor(
		Math.log((fluffyExp / firstLevelForEvolution) * (growth - 1) + 1) / Math.log(growth)
	);

	return {
		evolution,
		level
	};
}

export function getEffectiveFluffy(fluffyEvo, fluffyLevel, fluffinity) {
	return fluffyEvo + fluffyLevel + fluffinity;
}

export function getMaximumVoidMapStack(evolution, level, fluffinity, voidSpecialization2) {
	const totalLevel = evolution + level + fluffinity;
	let maxStack = 1;
	if (totalLevel >= 6) maxStack += 1;
	if (totalLevel >= 16) maxStack += 4;
	if (voidSpecialization2) maxStack += 1;
	return maxStack;
}

export function fluffyExpAtZone({
	zone,
	cunning,
	curious,
	classy,
	fluffyEvo,
	fluffocus,
	staffPetExp,
	knowledgeOwned,
	knowledgeLevel,
	frigidCompletions,
	iceEnlightenmentActive,
	iceLevel
}) {
	let total = 50;
	const rows = [];

	rows.push(['Base', '', '', '', prettify(total)]);

	if (curious > 0) {
		let curiousBonus = 80 * curious;
		total += curiousBonus;
		rows.push(['Curious', '80N', curious, curiousBonus / 50, prettify(total)]);
	}

	if (cunning > 0) {
		let cunningBonus = 1 + 0.25 * cunning;
		total *= cunningBonus;
		rows.push(['Cunning', '0.25', cunning, prettify(cunningBonus), prettify(total)]);
	}

	if (classy > 0) {
		let classyBonus = Math.pow(xpPerZoneGrowth, classy * 3);
		total *= classyBonus;
		rows.push(['Classy', xpPerZoneGrowth, classy, prettify(classyBonus), prettify(total)]);
	}

	let worldBonus = Math.pow(xpPerZoneGrowth, zone - 300);
	total *= worldBonus;
	rows.push(['World', xpPerZoneGrowth, zone, prettify(worldBonus), prettify(total)]);

	if (fluffocus) {
		let fluffocusBonus = 1 + 0.25 * fluffyEvo;
		total *= fluffocusBonus;
		rows.push(['Fluffocus', '0.25', fluffyEvo, prettify(fluffocusBonus), prettify(total)]);
	}

	if (knowledgeOwned > 0 && knowledgeLevel > 0) {
		let knowledgeBonusEach = 0.15 + 0.075 * (knowledgeLevel - 1);
		let knowledgeBonus = 1 + knowledgeOwned * knowledgeBonusEach;
		total *= knowledgeBonus;
		rows.push([
			'Knowledge Towers',
			prettify(knowledgeBonusEach),
			knowledgeOwned,
			prettify(knowledgeBonus),
			prettify(total)
		]);
	}

	if (staffPetExp > 0) {
		let staffBonus = 1 + staffPetExp / 100;
		total *= staffBonus;
		rows.push(['Heirloom (Staff)', staffPetExp, '', prettify(staffBonus), prettify(total)]);
	}

	if (frigidCompletions > 0) {
		let frigidBonus = 1 + (2.5 * frigidCompletions * (frigidCompletions + 1)) / 200;
		total *= frigidBonus;
		rows.push(['Frigid Completions', '+2.5N%', frigidCompletions, frigidBonus, prettify(total)]);
	}

	if (iceEnlightenmentActive) {
		let iceBonus = 1 + 0.0025 * iceLevel;
		total *= iceBonus;
		rows.push(['Enlightened Ice', '+0.25%', iceLevel, prettify(iceBonus), prettify(total)]);
	}

	return { total, rows };
}

export function totalFluffyExpAtZone(maxZone, calcParams) {
	let xpBeginZone = 300 - 3 * calcParams.classy;
	let totalExp = 0;
	for (let i = xpBeginZone; i <= maxZone; i++) {
		let result = fluffyExpAtZone({ zone: i, ...calcParams });
		totalExp += result.total;
	}
	return totalExp;
}