import { LatLngExpression } from "leaflet";
import { MapContainer, TileLayer, Polygon } from "react-leaflet";

import "./App.css";

import Borders from "./data/borders.json";
import { IBorder, Position } from "./schema/border";

const position: LatLngExpression = [49.308877665000068, 20.135855754000119];

function App() {
	const reverseCoords = (coords: Position[]): LatLngExpression[] => {
		return coords.map((pair) => [pair[1], pair[0]]);
	};

	return (
		<div id="map">
			<MapContainer
				center={position}
				zoom={5}
				scrollWheelZoom={true}
				className="map-container"
			>
				<TileLayer
					attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
					url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
				/>

				{/* TODO: rendering multiple polygons */}
				{Borders.features.map((border: IBorder) => (
					<Polygon
						pathOptions={{ color: "purple" }}
						positions={border.geometry.coordinates.map(
							reverseCoords
						)}
					/>
				))}
			</MapContainer>
		</div>
	);
}

export default App;
