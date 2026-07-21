import { useState } from "react";
import type { LatLngExpression } from "leaflet";
import { MapContainer, TileLayer, Popup } from "react-leaflet";

import Borders from "../data/borders.json";

import styles from "./Map.module.css";
import Country from "./Country";
import { reversePosition } from "../assets/util";
import type { ICountry } from "../schema/country";

const Map = () => {
	const mapCenter: LatLngExpression = [
		49.308877665000068, 20.135855754000119,
	];
	const [country, setCountry] = useState<ICountry | null>(null);

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
					<Country
						key={border.properties.ISO_A3}
						border={border}
						onSelect={setCountry}
					/>
				))}

				{country && country.words && (
					<Popup position={getCenter()}>
						{country.words.map((word, index) => (
							<div key={`${country.ISO_A3}-${word}-${index}`}>
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
