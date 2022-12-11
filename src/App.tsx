import { LatLngExpression } from "leaflet";
import { MapContainer, TileLayer, Polygon } from "react-leaflet";

import "./App.css";

import Borders from "./data/borders.json";
import { IBorder, Position } from "./schema/border";

const position: LatLngExpression = [49.308877665000068, 20.135855754000119];

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
					// TODO: onmousein/out change color
					<Polygon
						// TODO: different colors for countries with/without words
						pathOptions={{ color: "purple" }}
						positions={border.geometry.coordinates.map(
							(positions) =>
								border.geometry.type === "Polygon"
									? reverseCoords(positions)
									: reverseCoords(positions[0])
						)}
					/>
				))}
			</MapContainer>
		</div>
	);
}

export default App;
