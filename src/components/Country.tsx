import { Polygon } from "react-leaflet";
import { IBorder } from "../schema/border";
import { ICountry } from "../schema/country";

import Countries from "../data/countries.json";
import { reverseCoords } from "../assets/util";

interface ICountryProps {
	border: IBorder;
}

const Country = (props: ICountryProps) => {
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
					reverseCoords(positions)
				)}
				eventHandlers={{
					click: () => {
						const words = country.words;
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
