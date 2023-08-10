export function countExtraAchievementGoldens(totalAchieves) {
	let bonus = 0;
	if (totalAchieves > 50000) {
		bonus += Math.floor((totalAchieves - 50000) / 10000);
		totalAchieves = 50000;
	}
	if (totalAchieves > 10000) {
		bonus += Math.floor((totalAchieves - 10000) / 2000);
		totalAchieves = 10000;
	}
	bonus += Math.floor((totalAchieves - 2000) / 500);
	return bonus > 0 ? bonus : 0;
}
