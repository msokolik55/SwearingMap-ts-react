import { LatLngExpression } from "leaflet";

export const reversePosition = (position: number[]): LatLngExpression => {
	return [position[1], position[0]];
};

export const reverseCoords = (coords: number[][]): LatLngExpression[] => {
	return coords.map((coord) => reversePosition(coord));
};
