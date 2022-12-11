import { LatLngExpression, setOptions } from "leaflet";
import { MapContainer, TileLayer, Polygon } from "react-leaflet";

import "./App.css";

import Borders from "./data/borders.json";
import { IBorder, Position } from "./schema/border";

import Countries from "./data/countries.json";
import { ICountry } from "./schema/country";

const position: LatLngExpression = [49.308877665000068, 20.135855754000119];
const colors = {
	default: "orange",
	hover: "purple",
	disabled: "gray",
};

// TODO: remove type errors
function App() {
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

	const getColor = (isCode: string): string => {
		return getCountry(isCode) && getCountry(isCode).words
			? colors.default
			: colors.disabled;
	};

	return (
		<div id="map">
			<MapContainer
				center={position}
				zoom={4}
				scrollWheelZoom={true}
				className="map-container"
			>
				<TileLayer
					attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
					url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
				/>

				{Borders.features.map((border: IBorder) => (
					// TODO: onclick display words
					// TODO: add unique keys to Polygon
					<Polygon
						pathOptions={{
							color: getColor(border.properties.ISO_A3),
						}}
						positions={border.geometry.coordinates.map(
							(positions) =>
								border.geometry.type === "Polygon"
									? reverseCoords(positions)
									: reverseCoords(positions[0])
						)}
						eventHandlers={{
							click: () => {},
							mouseover: (e) => {
								let layer = e.target;
								layer.setStyle({
									color: colors.hover,
								});
							},
							mouseout: (e) => {
								let layer = e.target;
								layer.setStyle({
									color: getColor(border.properties.ISO_A3),
								});
							},
						}}
					/>
				))}
			</MapContainer>
		</div>
	);
}

export default App;
