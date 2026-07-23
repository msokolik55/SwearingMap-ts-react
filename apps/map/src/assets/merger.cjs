const fs = require("fs");

const folderPath = "../data/"
const countriesFilename = `${folderPath}countries.json`
const bordersFilename = `${folderPath}borders.json`
const bordersAllFilename = `${folderPath}bordersAll.json`

const readJSONFile = (filename) => {
    const rawData = fs.readFileSync(filename)
    return JSON.parse(rawData)
}

const getMissingBorders = () => {
    // countries with words
    const countriesData = readJSONFile(countriesFilename)
    const countriesWords = countriesData.filter((country) => country.words).map(
        (country) => country.ISO_A3
    );

    // countries with words on the map
    const bordersData = readJSONFile(bordersFilename)
    const bordersWords = bordersData.features
        .filter((border) => countriesWords.includes(border.properties.ISO_A3))
        .map((border) => border.properties.ISO_A3);

    const missingBorders = countriesWords.filter(
        (country) => !bordersWords.includes(country)
    );

    return missingBorders;
};

const updateBordersFile = () => {
    const bordersAllData = readJSONFile(bordersAllFilename)

    const missingCountries = getMissingBorders()
    const missingBorders = bordersAllData.features.filter(feature => missingCountries.includes(feature.properties.ISO_A3))

    const bordersData = readJSONFile(bordersFilename);
    bordersData.features.push(...missingBorders)

    fs.writeFile(bordersFilename, JSON.stringify(bordersData), err => {
        if (err) console.error(`Error while writing into ${bordersFilename}: ${err}`)
    })
}

updateBordersFile()
