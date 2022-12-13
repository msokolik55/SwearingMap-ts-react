import { LatLngExpression } from "leaflet";
import { MapContainer, TileLayer, Popup } from "react-leaflet";
import { v4 as uuidv4 } from "uuid";

import Borders from "../data/borders.json";
import Countries from "../data/countries.json";

import styles from "./Map.module.css";
import Country from "./Country";
import { IBorder } from "../schema/border";
import { useState } from "react";
import { ICountry } from "../schema/country";

// TODO: remove type errors
const Map = () => {
	const center: LatLngExpression = [49.308877665000068, 20.135855754000119];
	const [bord, setBord] = useState<IBorder>(Borders.features[0]);
	const [country, setCountry] = useState<ICountry>(Countries["NOR"]);

	// TODO: duplicity with Country.tsx
	const reversePosition = (
		position: LatLngExpression[]
	): LatLngExpression[] => {
		return [position[1], position[0]];
	};

	const getCenter = (): LatLngExpression => {
		let position: LatLngExpression =
			bord.geometry.type === "Polygon"
				? bord.geometry.coordinates[0][0]
				: bord.geometry.coordinates[0][0][0];

		return reversePosition(position);
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
