import Borders from "../data/borders.json";
import Countries from "../data/countries.json";
import { getCoords } from "./fixing";

const sum = (lst: number[]) => {
	return lst.reduce((partialSum, a) => partialSum + a, 0);
};

const average = (lst: number[]) => {
	return sum(lst) / lst.length;
};

const getBiggestPart = (parts: number[][][]) => {
	const maxLength = parts.map((part) => part.length).sort((a, b) => a - b)[
		parts.length - 1
	];
	return parts.filter((part) => part.length === maxLength)[0];
};

const showCenter = (isoCode: string) => {
	const parts = getCoords(isoCode);
	const biggestPart = getBiggestPart(parts);

	const avg0 = average(biggestPart.map((coord) => coord[0]));
	const avg1 = average(biggestPart.map((coord) => coord[1]));
	console.log(`${isoCode}: [${avg0}, ${avg1}]`);
};

export const showAllCenters = () => {
	const isoCodes = Borders.features.map(
		(feature) => feature.properties.ISO_A3
	);
	isoCodes.map((isoCode) => showCenter(isoCode));
};

export const showWords = () => {
	return Countries.map((country) => {
		if (!country.words) return;
		console.log(country.ISO_A3, country.words);
	});
};
