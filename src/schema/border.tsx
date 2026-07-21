export interface IBorder {
	type: string;
	properties: { ADMIN: string; ISO_A3: string };
	geometry: {
		type: string;
		coordinates: number[][][];
	};
}

export interface IBorderCollection {
	type: "FeatureCollection";
	features: IBorder[];
}
