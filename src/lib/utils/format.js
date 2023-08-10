const notations = {
	scientific: [],
	standard: (
		'KMBTQaQiSxSpOcNoDcUdDdTdQadQidSxdSpdOdNdVUvDvTvQavQivSxvSpvOvNvTgUtgDtgTtgQatg' +
		'QitgSxtgSptgOtgNtgQaaUqaDqaTqaQaqaQiqaSxqaSpqaOqaNqaQiaUqiDqiTqiQaqiQiqiSxqiSpqi' +
		'OqiNqiSxaUsxDsxTsxQasxQisxSxsxSpsxOsxNsxSpaUspDspTspQaspQispSxspSpspOspNspOgUog' +
		'DogTogQaogQiogSxogSpogOogNogNaUnDnTnQanQinSxnSpnOnNnCtUc'
	).split(/(?=[A-Z])/),
	engineering: [],
	alphabetic: (
		'a b c d e f g h i j k l m n o p q r s t u v w x y z' +
		' aa ab ac ad ae af ag ah ai aj ak al am an ao ap aq ar as at au av aw ax ay az' +
		' ba bb bc bd be bf bg bh bi bj bk bl bm bn bo bp bq br bs bt bu bv bw bx by bz' +
		' ca cb cc cd ce cf cg ch ci cj ck cl cm cn co cp cq cr cs ct cu cv cw cx'
	).split(' '),
	hybrid: 'KMBTQaQiSxSpOcNoDcUdDdTdQadQidSxdSpdOdNdVUvDvTvQavQivSxvSpvOvNvTg'.split(/(?=[A-Z])/),
	logarithmic: []
};

export function prettify(number, notation) {
	if (number < 0) return '-' + prettify(-number);

	if (number < 10000) return +number.toPrecision(4) + '';

	if (notation === 'scientific') return number.toExponential(2).replace('+', '');

	let unit = 0;
	while (number >= 999.5) {
		number /= 1000;
		++unit;
	}

	let suffixes = notations[notation || 'standard'];
	let suffix = unit > suffixes.length ? `e${3 * unit}` : suffixes[unit - 1];
	return +number.toPrecision(3) + suffix;
}
