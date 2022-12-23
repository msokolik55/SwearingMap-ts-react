import Borders from "../data/borders.json";

const getCoords = (isoCode: string) => {
	return Borders.features.filter(
		(feature) => feature.properties.ISO_A3 === isoCode
	)[0].geometry.coordinates;
};

export const showBigDifference = (isoCode: string) => {
	const parts: number[][][] = getCoords(isoCode);

	parts.map((part) => {
		for (let i = 1; i < part.length; i++) {
			const prev = part[i - 1];
			const curr = part[i];

			const diff = Math.max(
				Math.abs(prev[0] - curr[0]),
				Math.abs(prev[1] - curr[1])
			);
			if (diff >= 2) console.log(prev, curr);
		}
	});
};
