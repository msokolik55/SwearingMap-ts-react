import { LatLngExpression } from "leaflet";

export interface IBorder {
	type: string;
	properties: { ADMIN: string; ISO_A3: string };
	geometry: {
		type: string;
		coordinates: LatLngExpression[][];
	};
}
