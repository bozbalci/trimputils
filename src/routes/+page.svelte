<script>
	import { parseSave, saveStore } from '$lib/utils/save';
	import { prettify } from '$lib/utils/format';

	import { heliumAtZone, totalHeliumAtZone } from '$lib/calc/helium';
	import {
		getFluffyEvolutionAndLevel,
		getMaximumVoidMapStack,
		fluffyExpAtZone,
		totalFluffyExpAtZone
	} from '$lib/calc/fluffy';
	import { getEffectiveVoidHeliumMultiplier } from '$lib/calc/void';

	import NumberInput from '../components/NumberInput.svelte';
	import Checkbox from '../components/Checkbox.svelte';

	let game = null;
	let gameDebugText = '';

	let heliumLines = [];
	let fluffyLines = [];

	const calcParams = {
		// Perks
		looting: 0,
		looting2: 0,
		cunning: 0,
		curious: 0,
		classy: 0,
		// Permanent Bonuses
		c2: 0,
		frigidCompletions: 0,
		achievementBonus: 0,
		scientist5: false,
		// Player's Spire
		condenserLevel: 0,
		condenserOwned: 0,
		knowledgeLevel: 0,
		knowledgeOwned: 0,
		// Fluffy
		fluffyEvo: 0,
		fluffyLevel: 0,
		// Mastery
		stillRowing: false,
		headstartLevel: 0,
		strengthInHealth2: false,
		masterOfTheVoid: false,
		scryhard2: false,
		voidSpecialization: false,
		voidSpecialization2: false,
		fluffocus: false,
		fluffinity: false,
		// Golden
		goldenBattle: false,
		// Empowerment
		windLevel: 0,
		windEnlightenmentActive: false,
		windStack: false,
		windStackFromZone: 0,
		iceLevel: 0,
		iceEnglightenmentActive: false,

		// Heirlooms
		staffPetExp: 0,

		// Run details
		selectedZone: 20,
		voidMapZone: 20,
		lastPortalZone: 0,
		voidMapCount: 0,
		experienceStartZone: 350,
		experienceEndZone: 615,
		experienceBionicCompleted: 1,
		experiencePartialRun: false,

		// Hidden settings
		ignoreWindForVoid: false
	};

	const heliumResult = {
		worldHe: 0,
		voidMultiplier: 1,
		voidHe: 0,
		totalHe: 0,
	};

	const fluffyResult = {
		worldExp: 0,
		wonderExp: 0,
		wondersFound: 0,
		bionicsCompleted: 0,
		wonderMultiplier: 0,
		challengeReward: 0,
		totalExpBeforeChallenge: 0,
		totalExp: 0,
	}

	function parse() {
		game = parseSave($saveStore);
		window.game = game;
		gameDebugText = JSON.stringify(game, null, 2);

		// Permanent bonuses
		calcParams.c2 = game.global.totalSquaredReward;
		calcParams.frigidCompletions = game.global.frigidCompletions;
		calcParams.achievementBonus = game.global.achievementBonus;
		calcParams.scientist5 = game.global.sLevel >= 5;
		// Perks
		calcParams.looting = game.portal.Looting.level;
		calcParams.looting2 = game.portal.Looting_II.level;
		calcParams.cunning = game.portal.Cunning.level;
		calcParams.curious = game.portal.Curious.level;
		calcParams.classy = game.portal.Classy.level;
		// Player's Spire
		calcParams.condenserOwned = game.playerSpire.traps.Condenser.owned;
		calcParams.condenserLevel = game.playerSpire.traps.Condenser.level;
		calcParams.knowledgeOwned = game.playerSpire.traps.Knowledge.owned;
		calcParams.knowledgeLevel = game.playerSpire.traps.Knowledge.level;
		// Mastery
		calcParams.stillRowing = game.talents.stillRowing.purchased;
		calcParams.headstartLevel =
			game.talents.headstart.purchased +
			game.talents.headstart2.purchased +
			game.talents.headstart3.purchased;
		calcParams.strengthInHealth2 = game.talents.healthStrength2.purchased;
		calcParams.masterOfTheVoid = game.talents.voidMastery.purchased;
		calcParams.scryhard2 = game.talents.scry2.purchased;
		calcParams.voidSpecialization = game.talents.voidSpecial.purchased;
		calcParams.voidSpecialization2 = game.talents.voidSpecial2.purchased;
		calcParams.fluffocus = game.talents.fluffyExp.purchased;
		calcParams.fluffinity = game.talents.fluffyAbility.purchased;
		// Fluffy
		const fluffy = getFluffyEvolutionAndLevel({
			fluffyPrestige: game.global.fluffyPrestige,
			fluffyExp: game.global.fluffyExp
		});
		calcParams.fluffyEvo = fluffy.evolution;
		calcParams.fluffyLevel = fluffy.level;
		// Empowerment
		calcParams.windLevel = game.empowerments.Wind.level;
		calcParams.windEnlightenmentActive = game.global.uberNature === 'Wind';
		calcParams.windStack = calcParams.windEnlightenmentActive;
		calcParams.iceLevel = game.empowerments.Ice.level;
		calcParams.iceEnlightenmentActive = game.global.uberNature === 'Ice';
		// Heirlooms
		const equippedStaff = game.global.StaffEquipped;
		if (equippedStaff !== null && equippedStaff.mods !== null) {
			for (let i = 0; i < equippedStaff.mods.length; i++) {
				const mod = equippedStaff.mods[i];
				if (mod[0] === 'FluffyExp') {
					calcParams.staffPetExp = mod[1];
				}
			}
		}

		// Run stats
		calcParams.selectedZone = game.global.world;
		calcParams.voidMapZone = game.global.voidMaxLevel;
		calcParams.lastPortalZone = game.global.lastPortal;
		calcParams.voidMapCount = game.global.totalVoidMaps;
		calcParams.windStackFromZone = game.global.highestLevelCleared - 100;
		// calcParams.selectedZone = game.global.highestLevelCleared;
		// Max spire rows need to be its own thing
	}

	function simulateTotal() {
		heliumResult.worldHe = totalHeliumAtZone(calcParams.selectedZone, calcParams);
		fluffyResult.worldExp = totalFluffyExpAtZone(calcParams.selectedZone, calcParams);
	}

	function simulateVoid() {
		heliumResult.voidMultiplier = getEffectiveVoidHeliumMultiplier({
			mapCount: calcParams.voidMapCount,
			maxStackSize: getMaximumVoidMapStack(
				calcParams.fluffyEvo,
				calcParams.fluffyLevel,
				calcParams.fluffinity,
				calcParams.voidSpecialization2
			),
			multiplicative: calcParams.masterOfTheVoid,
			scryhard2: calcParams.scryhard2,
			voidSpecialization: calcParams.voidSpecialization,
			previousRunHze: calcParams.lastPortalZone
		});
		heliumResult.voidHe =
			heliumAtZone({ zone: calcParams.voidMapZone, ...calcParams, ignoreWindForVoid: true }).total *
			heliumResult.voidMultiplier;
	}

	function simulateExperience() {
		let totalWonderExp = 0;
		let wondersFound = 0;
		for (let i = calcParams.experienceStartZone; i <= calcParams.experienceEndZone; i += 5) {
			totalWonderExp += fluffyExpAtZone({ zone: i, ...calcParams }).total * 3;
			wondersFound += 1;
		}
		fluffyResult.wonderExp = totalWonderExp;
		fluffyResult.wondersFound = wondersFound;
		fluffyResult.bionicsCompleted = calcParams.experienceBionicCompleted;

		fluffyResult.wonderMultiplier = 0.05 * fluffyResult.wondersFound + 0.50 * fluffyResult.bionicsCompleted;
		fluffyResult.totalExpBeforeChallenge = fluffyResult.worldExp + fluffyResult.wonderExp;
		if (!calcParams.experiencePartialRun) {
			fluffyResult.challengeReward = fluffyResult.totalExpBeforeChallenge * fluffyResult.wonderMultiplier;
		} else {
			fluffyResult.challengeReward = 0; // Need to set this explicitly to get correct values
		}
		fluffyResult.totalExp = fluffyResult.totalExpBeforeChallenge + fluffyResult.challengeReward;
	}

	function execute(zone) {
		const result = heliumAtZone({ zone, ...calcParams });
		heliumLines = result.rows;

		const fluffyOutcome = fluffyExpAtZone({ zone: zone, ...calcParams });
		fluffyLines = fluffyOutcome.rows;

		simulateTotal();
		simulateVoid();
		simulateExperience();

		heliumResult.totalHe = heliumResult.worldHe + heliumResult.voidHe;
	}

	$: execute(calcParams.selectedZone, calcParams);

	// If data is loaded, do initial
	if ($saveStore !== '') {
		try {
			parse();
		} catch (e) {
			$saveStore = '';
			game = null;
		}
	}
</script>

<div class="w-screen flex p-2">
	<aside id="sidebar" class="w-1/3 px-4">
		<div class="border-b-2 pb-2">
			<label for="saveInput" class="block text-sm mb-1">Import save</label>
			<textarea
				id="saveInput"
				bind:value={$saveStore}
				on:input={parse}
				class="bg-gray-50 border border-gray-300 text-sm rounded-lg resize-none"
			/>
		</div>

		<!-- Populated from save -->
		<div class="grid grid-cols-1 gap-4">
			<div>
				<div class="text-lg font-bold">Perks</div>
				<div class="flex space-x-2">
					<NumberInput id="looting" label="Looting" bind:value={calcParams.looting} />
					<NumberInput id="looting2" label="Looting II" bind:value={calcParams.looting2} />
				</div>
				<div class="flex space-x-2">
					<NumberInput id="cunning" label="Cunning" bind:value={calcParams.cunning} />
					<NumberInput id="curious" label="Curious" bind:value={calcParams.curious} />
					<NumberInput id="classy" label="Classy" bind:value={calcParams.classy} />
				</div>
			</div>

			<div>
				<div class="text-lg font-bold">Permanent Bonuses</div>
				<div class="flex space-x-2">
					<NumberInput id="c2" label="Challenge^2" bind:value={calcParams.c2} />
					<NumberInput
						id="achievementBonus"
						label="Achievements"
						bind:value={calcParams.achievementBonus}
					/>
					<NumberInput
						id="frigidCompletions"
						label="Frigid Completions"
						bind:value={calcParams.frigidCompletions}
					/>
				</div>
			<div class="flex space-x-4">
				<label>
					<input type="checkbox" bind:checked={calcParams.scientist5} />
					Scientist V
				</label>
				<label>
					<input type="checkbox" bind:checked={calcParams.goldenBattle} />
					Battle Spec?
				</label>
			</div>
			</div>

			<div>
				<div class="text-lg font-bold">Fluffy</div>
				<div class="flex space-x-4">
					<NumberInput id="fluffyEvo" label="Evolution" bind:value={calcParams.fluffyEvo} />
					<NumberInput id="fluffyLevel" label="Level" bind:value={calcParams.fluffyLevel} />
				</div>
			</div>

			<div>
				<div class="text-lg font-bold">Player's Spire</div>
				<div class="flex space-x-4">
					Condenser
					<NumberInput id="condenserLevel" label="Level" bind:value={calcParams.condenserLevel} />
					<NumberInput id="condenserOwned" label="Owned" bind:value={calcParams.condenserOwned} />
				</div>
				<div class="flex space-x-4">
					Knowledge
					<NumberInput id="knowledgeLevel" label="Level" bind:value={calcParams.knowledgeLevel} />
					<NumberInput id="knowledgeOwned" label="Owned" bind:value={calcParams.knowledgeOwned} />
				</div>
			</div>

			<div>
				<div class="text-lg font-bold">Nature</div>
				<div class="flex space-x-4">
					Wind
					<NumberInput id="windLevel" label="Empowerment Level" bind:value={calcParams.windLevel} />
					<label>
						<input type="checkbox" bind:checked={calcParams.windEnlightenmentActive} />
						Enlightened?
					</label>
					<label>
						<input type="checkbox" bind:checked={calcParams.windStack} />
						Stack Max
					</label>
					<NumberInput id="fromZone" label="From Zone" bind:value={calcParams.windStackFromZone} />
				</div>
				<div class="flex space-x-4">
					Ice
					<NumberInput id="iceLevel" label="Empowerment Level" bind:value={calcParams.iceLevel} />
					<label>
						<input type="checkbox" bind:checked={calcParams.iceEnlightenmentActive} />
						Enlightened?
					</label>
				</div>
			</div>


			<div>
				<div class="text-lg font-bold">Mastery</div>
				<div class="grid grid-cols-2">
					<Checkbox id="scryhard2" label="Scryhard II" bind:checked={calcParams.scryhard2} />
					<Checkbox id="stillRowing" label="Still Rowing" bind:checked={calcParams.stillRowing} />
					<Checkbox
						id="strengthInHealth2"
						label="Strength in Health II"
						bind:checked={calcParams.strengthInHealth2}
					/>
					<Checkbox
						id="voidSpecialization"
						label="Void Specialization I"
						bind:checked={calcParams.voidSpecialization}
					/>
					<Checkbox
						id="voidSpecialization2"
						label="Void Specialization II"
						bind:checked={calcParams.voidSpecialization2}
					/>
					<Checkbox
						id="masterOfTheVoid"
						label="Master of the Void"
						bind:checked={calcParams.masterOfTheVoid}
					/>
					<Checkbox
						id="fluffinity"
						label="Fluffinity"
						bind:checked={calcParams.fluffinity}
					/>
					<Checkbox
						id="fluffocus"
						label="Fluffocus"
						bind:checked={calcParams.fluffocus}
					/>
					<div class="flex items-center">
						<label for="headstart" class="text-sm text-gray-900">
							Headstart {calcParams.headstartLevel}
						</label>
						<input
							type="range"
							min="0"
							max="3"
							step="1"
							list="headstartMarkers"
							bind:value={calcParams.headstartLevel}
							id="headstart"
							class="ml-2 w-16"
						/>
						<datalist id="headstartMarkers">
							<option value="0" />
							<option value="1" />
							<option value="2" />
							<option value="3" />
						</datalist>
					</div>
				</div>
			</div>

			<div>
				<div class="text-lg font-bold">Run Details</div>
				<div class="grid grid-cols-2 gap-2">
					<NumberInput id="zone" label="Zone" bind:value={calcParams.selectedZone} />
					<NumberInput id="voidMapZone" label="Run Voids At" bind:value={calcParams.voidMapZone} />
					<NumberInput
						id="lastPortalZone"
						label="Last Portal At"
						bind:value={calcParams.lastPortalZone}
					/>
					<NumberInput
						id="voidMapCount"
						label="Void Map Count"
						bind:value={calcParams.voidMapCount}
					/>
					<NumberInput
						id="experienceStartZone"
						label="Wonder Search Start"
						bind:value={calcParams.experienceStartZone}
					/>
					<NumberInput
						id="experienceEndZone"
						label="Wonder Search End"
						bind:value={calcParams.experienceEndZone}
					/>
					<NumberInput
						id="experienceBionicsCompleted"
						label="Experience BWs Completed"
						bind:value={calcParams.experienceBionicCompleted}
					/>
					<Checkbox
						id="experiencePartialRun"
						label="Partial Experience"
						bind:checked={calcParams.experiencePartialRun}
					/>
				</div>
			</div>
		</div>
	</aside>
	<section id="results">
		<table>
			<tbody>
				<tr>
					<td>Thing</td>
					<td>Number</td>
				</tr>
				<tr>
					<td>Helium from World</td>
					<td>{prettify(heliumResult.worldHe)}</td>
				</tr>
				<tr>
					<td>Helium from Void Maps</td>
					<td>{prettify(heliumResult.voidHe)}</td>
				</tr>
				<tr>
					<td>Total Helium</td>
					<td>{prettify(heliumResult.totalHe)}</td>
				</tr>
				<tr>
					<td>Fluffy Exp from World</td>
					<td>{prettify(fluffyResult.worldExp)}</td>
				</tr>
				<tr>
					<td>Fluffy Exp from Wonders</td>
					<td>{prettify(fluffyResult.wonderExp)}</td>
				</tr>
				<tr>
					<td>Experience Challenge Reward</td>
					<td>{prettify(fluffyResult.challengeReward)}</td>
				</tr>
				<tr>
					<td>Total Fluffy Experience</td>
					<td>{prettify(fluffyResult.totalExp)}</td>
				</tr>
			</tbody>
		</table>

		<pre class="mt-16">
"calcParams": {JSON.stringify(calcParams, null, 2)}
"helium": {JSON.stringify(heliumResult, null, 2)}
"fluffy": {JSON.stringify(fluffyResult, null, 2)}
		</pre>
	</section>


<section id="results" class="mt-16">
	<div class="grid grid-cols-1 gap-4">
		<!-- Helium Preview -->
		<div>
			<table>
				<tbody>
					<tr>
						<td />
						<td>Base</td>
						<td>Amount</td>
						<td>Line Total</td>
						<td>Total</td>
					</tr>
					{#each heliumLines as heliumLine}
						<tr>
							<td>
								{heliumLine[0]}
							</td>
							<td>
								{heliumLine[1]}
							</td>
							<td>
								{heliumLine[2]}
							</td>
							<td>
								{heliumLine[3]}
							</td>
							<td>
								{heliumLine[4]}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
		<!-- Fluffy Preview -->
		<div>
			<table>
				<tbody>
					<tr>
						<td />
						<td>Base</td>
						<td>Amount</td>
						<td>Line Total</td>
						<td>Total</td>
					</tr>
					{#each fluffyLines as fluffyLine}
						<tr>
							<td>
								{fluffyLine[0]}
							</td>
							<td>
								{fluffyLine[1]}
							</td>
							<td>
								{fluffyLine[2]}
							</td>
							<td>
								{fluffyLine[3]}
							</td>
							<td>
								{fluffyLine[4]}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	</div>
</section>
</div>

<style>
	table, td {
		padding: 4px;
		border: 1px solid gray;
		border-collapse: collapse;
	}
</style>