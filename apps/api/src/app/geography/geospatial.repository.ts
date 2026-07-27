export const GEOSPATIAL_REPOSITORY = Symbol("GEOSPATIAL_REPOSITORY");

export interface GeoPoint {
	latitude: number;
	longitude: number;
}

export interface NearbyCountry {
	distanceMeters: number;
	id: string;
	name: string;
	slug: string;
}

export interface GeospatialRepository {
	findCountriesNear(point: GeoPoint, radiusMeters: number): Promise<NearbyCountry[]>;
}
