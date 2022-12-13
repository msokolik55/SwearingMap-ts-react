import { LatLngTuple } from "leaflet";

export interface ICountry {
	region: string;
	center: LatLngTuple;
	words?: string[];
}
