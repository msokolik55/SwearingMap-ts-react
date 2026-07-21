import { useEffect, useState } from "react";

import type { IBorder, IBorderCollection } from "../schema/border";

export const BORDER_DATA_URL = `${import.meta.env.BASE_URL}data/borders.json`;

export interface BordersState {
	borders: IBorder[];
	isLoading: boolean;
	error: string | null;
}

type BorderRequest = (
	input: string,
	init?: RequestInit
) => Promise<Pick<Response, "ok" | "status" | "json">>;

const isBorderCollection = (value: unknown): value is IBorderCollection => {
	if (!value || typeof value !== "object") {
		return false;
	}

	const collection = value as Partial<IBorderCollection>;
	return (
		collection.type === "FeatureCollection" &&
		Array.isArray(collection.features) &&
		collection.features.every(
			(feature) =>
				Boolean(feature?.properties?.ISO_A3) &&
				Array.isArray(feature?.geometry?.coordinates)
		)
	);
};

export const loadBorders = async (
	signal?: AbortSignal,
	request: BorderRequest = fetch
): Promise<IBorder[]> => {
	const response = await request(BORDER_DATA_URL, { signal });

	if (!response.ok) {
		throw new Error(`Country data request failed with status ${response.status}.`);
	}

	const data: unknown = await response.json();
	if (!isBorderCollection(data)) {
		throw new Error("Country data has an unsupported format.");
	}

	return data.features;
};

export const useBorders = (): BordersState => {
	const [state, setState] = useState<BordersState>({
		borders: [],
		isLoading: true,
		error: null,
	});

	useEffect(() => {
		const controller = new AbortController();

		void loadBorders(controller.signal)
			.then((borders) => {
				setState({ borders, isLoading: false, error: null });
			})
			.catch((error: unknown) => {
				if (controller.signal.aborted) {
					return;
				}

				setState({
					borders: [],
					isLoading: false,
					error:
						error instanceof Error
							? error.message
							: "Country data could not be loaded.",
				});
			});

		return () => controller.abort();
	}, []);

	return state;
};
