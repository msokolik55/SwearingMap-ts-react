import Borders from "../data/borders.json";
import Countries from "../data/countries.json";
import keepFile from "../data/keep.txt";

const printCountry = (title: string, words: string[]) => {
	console.log(title);
	console.log(formatWords(words));
};

const formatWords = (words: string[]) => {
	return `${words.join("\n")}\n`;
};

const getEOL = (textFile: string) => {
	return textFile.includes("\r") ? "\r\n" : "\n";
};

export const printCountriesKeep = () => {
	fetch(keepFile)
		.then((r) => r.text())
		.then((plainText) => {
			const eol = getEOL(plainText);
			const countries = plainText.split(eol + eol);

			countries.map((country) => {
				const countryData = country
					.split(eol)
					.filter((word) => word.length > 0);
				const admin = countryData[0];
				const words = countryData.slice(1);
				printCountry(`${admin} (${words.length}):`, words);
			});
		});
};

const getAdminName = (isoCode: string) => {
	return Borders.features.filter(
		(border) => border.properties.ISO_A3 === isoCode
	);
};

export const printCountriesJSON = () => {
	Countries.map((country) => {
		if (!country.words) return;

		const borders = getAdminName(country.ISO_A3);
		if (borders.length === 0) return;

		const title = `# [${country.ISO_A3}] ${borders[0].properties.ADMIN} (${country.words.length}):`;
		printCountry(title, country.words);
	});
};
