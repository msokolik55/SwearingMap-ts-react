import { LatLngExpression } from "leaflet";
import { MapContainer, TileLayer } from "react-leaflet";

import Borders from "../data/borders.json";

import styles from "./Map.module.css";
import Country from "./Country";
import { IBorder } from "../schema/border";

// TODO: remove type errors
const Map = () => {
	const center: LatLngExpression = [49.308877665000068, 20.135855754000119];

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

				{Borders.features.map((border: IBorder) => (
					// TODO: add unique keys to <Country />
					<Country border={border} />
				))}
			</MapContainer>
		</div>
	);
};

export default Map;
