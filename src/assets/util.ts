import { LatLngExpression, LatLngTuple } from "leaflet";

export const reversePosition = (position: LatLngTuple): LatLngExpression => {
	return [position[1], position[0]];
};

export const reverseCoords = (coords: LatLngTuple[]): LatLngExpression[] => {
	return coords.map((coord) => reversePosition(coord));
};
