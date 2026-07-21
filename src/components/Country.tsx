import { Polygon } from "react-leaflet";

import type { IBorder } from "../schema/border";
import type { ICountry } from "../schema/country";

import Countries from "../data/countries.json";
import { reverseCoords } from "../assets/util";

interface ICountryProps {
	border: IBorder;
	onSelect: (country: ICountry) => void;
}

const COLORS = {
	default: "orange",
	hover: "purple",
} as const;

const COUNTRIES_BY_ISO = new Map(
	Countries.map((country) => [country.ISO_A3, country] as const)
);

const Country = ({ border, onSelect }: ICountryProps) => {
	const country = COUNTRIES_BY_ISO.get(border.properties.ISO_A3);

	if (!country || !country.words) {
		return null;
	}

	return (
		<Polygon
			pathOptions={{
				color: COLORS.default,
			}}
			positions={border.geometry.coordinates.map((positions) =>
				reverseCoords(positions)
			)}
			eventHandlers={{
				click: () => {
					onSelect(country);
				},
				mouseover: (e) => {
					const layer = e.target;
					layer.setStyle({
						color: COLORS.hover,
					});
				},
				mouseout: (e) => {
					const layer = e.target;
					layer.setStyle({
						color: COLORS.default,
					});
				},
			}}
		/>
	);
};

export default Country;
