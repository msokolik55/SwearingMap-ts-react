import { LatLngExpression, LatLngTuple } from "leaflet";
import { MapContainer, TileLayer, Popup } from "react-leaflet";
import { v4 as uuidv4 } from "uuid";
import { useRecoilValue } from "recoil";

import Borders from "../data/borders.json";
import Countries from "../data/countries.json";

import styles from "./Map.module.css";
import Country from "./Country";
import { IBorder } from "../schema/border";
import { countryAtom } from "../state/Atom";

// TODO: remove type errors
const Map = () => {
	const center: LatLngExpression = [49.308877665000068, 20.135855754000119];
	const country = useRecoilValue(countryAtom);

	// TODO: duplicity with Country.tsx
	const reversePosition = (position: LatLngTuple): LatLngExpression => {
		return [position[1], position[0]];
	};

	const getCenter = (): LatLngExpression => {
		return reversePosition(country.center);
	};

	return (
		<div id="map">
			<MapContainer
				center={center}
				zoom={4}
				scrollWheelZoom={true}
				className={styles.mapContainer}
			>
				<TileLayer
					attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
					url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
				/>

				{/* TODO: JSON schema validation */}
				{Borders.features.map((border: IBorder) => (
					<Country key={uuidv4()} border={border} />
				))}

				{country && country.words && (
					<Popup position={getCenter()}>
						{country.words.map((word) => (
							<div key={uuidv4()}>
								{word}
								<br />
							</div>
						))}
					</Popup>
				)}
			</MapContainer>
		</div>
	);
};

export default Map;
