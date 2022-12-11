import { useState } from "react";
import { MapContainer, TileLayer, Popup, Marker } from "react-leaflet";
import "./App.css";

const position = [51.505, -0.09];

function App() {
	return (
		<div id="map">
			<MapContainer
				center={position}
				zoom={13}
				scrollWheelZoom={false}
				style={{ width: "100vw", height: "100vh" }}
			>
				<TileLayer
					attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
					url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
				/>
				<Marker position={position}>
					<Popup>
						A pretty CSS3 popup. <br /> Easily customizable.
					</Popup>
				</Marker>
			</MapContainer>
		</div>
	);
}

export default App;
