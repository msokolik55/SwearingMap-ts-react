import { Polygon } from "react-leaflet";
import { useSetRecoilState } from "recoil";

import { IBorder } from "../schema/border";
import { ICountry } from "../schema/country";

import Countries from "../data/countries.json";
import { reverseCoords } from "../assets/util";
import { countryAtom } from "../state/Atom";

interface ICountryProps {
	border: IBorder;
}

const Country = (props: ICountryProps) => {
	const setCountry = useSetRecoilState(countryAtom);

	const isoCode = props.border.properties.ISO_A3;
	const country = Countries[isoCode];

	if (!country || !country.words) {
		return null;
	}

	const colors = {
		default: "orange",
		hover: "purple",
		disabled: "gray",
	};

	const getColor = (): string => {
		return country && country.words ? colors.default : colors.disabled;
	};

	return (
		<Polygon
			pathOptions={{
				color: getColor(),
			}}
			positions={props.border.geometry.coordinates.map((positions) =>
				reverseCoords(positions)
			)}
			eventHandlers={{
				click: () => {
					setCountry(country);
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
						color: getColor(),
					});
				},
			}}
		/>
	);
};

export default Country;
