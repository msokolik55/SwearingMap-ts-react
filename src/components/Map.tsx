import { LatLngExpression } from "leaflet";
import { MapContainer, TileLayer, Popup } from "react-leaflet";
import { v4 as uuidv4 } from "uuid";
import { useRecoilValue } from "recoil";

import Borders from "../data/borders.json";

import styles from "./Map.module.css";
import Country from "./Country";
import { countryAtom } from "../state/Atom";
import { reversePosition } from "../assets/util";

const Map = () => {
	const mapCenter: LatLngExpression = [
		49.308877665000068, 20.135855754000119,
	];
	const country = useRecoilValue(countryAtom);

	const getCenter = (): LatLngExpression | undefined => {
		return country ? reversePosition(country.center) : undefined;
	};

	return (
		<div id="map">
			<MapContainer
				center={mapCenter}
				zoom={4}
				scrollWheelZoom={true}
				className={styles.mapContainer}
			>
				<TileLayer
					attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
					url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
				/>

				{Borders.features.map((border) => (
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
