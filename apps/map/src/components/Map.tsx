import { useState } from "react";
import type { LatLngExpression } from "leaflet";
import { MapContainer, TileLayer, Popup } from "react-leaflet";

import styles from "./Map.module.css";
import Country from "./Country";
import { reversePosition } from "../assets/util";
import { useBorders } from "../data/useBorders";
import type { ICountry } from "../schema/country";

const Map = () => {
	const mapCenter: LatLngExpression = [
		49.308877665000068, 20.135855754000119,
	];
	const [country, setCountry] = useState<ICountry | null>(null);
	const { borders, isLoading, error } = useBorders();

	const getCenter = (): LatLngExpression | undefined => {
		return country ? reversePosition(country.center) : undefined;
	};

	return (
		<div id="map" className={styles.mapRoot} aria-busy={isLoading}>
			{isLoading && (
				<div className={styles.status} role="status">
					Loading country data…
				</div>
			)}
			{error && (
				<div className={`${styles.status} ${styles.error}`} role="alert">
					{error} Reload the page to try again.
				</div>
			)}
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

				{borders.map((border) => (
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
