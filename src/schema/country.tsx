import { LatLngTuple } from "leaflet";

export interface ICountry {
	ISO_A3: string;
	region: string;
	center: number[];
	words?: string[];
}
