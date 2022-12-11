import { LatLngExpression } from "leaflet";
import { Polygon, Popup } from "react-leaflet";
import { IBorder, Position } from "../schema/border";
import { ICountry } from "../schema/country";

import Countries from "../data/countries.json";
import { useState } from "react";

interface ICountryProps {
	border: IBorder;
}

const center: LatLngExpression = [49.308877665000068, 20.135855754000119];

const Country = (props: ICountryProps) => {
	// const [showWords, setShowWords] = useState(false);

	const reversePosition = (
		position: LatLngExpression[]
	): LatLngExpression[] => {
		return [position[1], position[0]];
	};

	const reverseCoords = (coords: Position | Position[] | Position[][]) => {
		return coords.map(reversePosition);
	};

	const getCountry = (isoCode: string): ICountry => {
		return Countries[isoCode];
	};

	const isoCode = props.border.properties.ISO_A3;
	const country = getCountry(isoCode);

	const colors = {
		default: "orange",
		hover: "purple",
		disabled: "gray",
	};

	const getColor = (isoCode: string): string => {
		const country = getCountry(isoCode);
		return country && country.words ? colors.default : colors.disabled;
	};

	return (
		<>
			{/* TODO: onclick display words */}
			<Polygon
				pathOptions={{
					color: getColor(isoCode),
				}}
				positions={props.border.geometry.coordinates.map((positions) =>
					props.border.geometry.type === "Polygon"
						? reverseCoords(positions)
						: reverseCoords(positions[0])
				)}
				eventHandlers={{
					click: () => {
						const words = country.words;
						if (words) {
							// setShowWords(true);
						}
					},
					mouseover: (e) => {
						let layer = e.target;
						layer.setStyle({
							color: colors.hover,
						});
					},
					mouseout: (e) => {
						let layer = e.target;
						layer.setStyle({
							color: getColor(isoCode),
						});
					},
				}}
			/>
		</>
	);
};

export default Country;
