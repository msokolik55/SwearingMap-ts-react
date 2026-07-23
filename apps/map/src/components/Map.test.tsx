import type { ReactNode } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import Map from "./Map";
import { useBorders } from "../data/useBorders";

vi.mock("../data/useBorders", () => ({
	useBorders: vi.fn(),
}));

vi.mock("react-leaflet", () => ({
	MapContainer: ({ children }: { children: ReactNode }) => <div>{children}</div>,
	Popup: ({ children }: { children: ReactNode }) => (
		<section aria-label="Country vocabulary">{children}</section>
	),
	TileLayer: () => null,
}));

vi.mock("./Country", () => ({
	default: ({
		onSelect,
	}: {
		onSelect: (country: {
			ISO_A3: string;
			region: string;
			center: number[];
			words: string[];
		}) => void;
	}) => (
		<button
			type="button"
			onClick={() =>
				onSelect({
					ISO_A3: "CZE",
					region: "Europe",
					center: [15, 49],
					words: ["test-word"],
				})
			}
		>
			Select mocked country
		</button>
	),
}));

describe("Map", () => {
	const mockedUseBorders = vi.mocked(useBorders);

	beforeEach(() => {
		mockedUseBorders.mockReturnValue({
			borders: [
				{
					type: "Feature",
					properties: { ADMIN: "Czech Republic", ISO_A3: "CZE" },
					geometry: { type: "Polygon", coordinates: [[[15, 49]]] },
				},
			],
			isLoading: false,
			error: null,
		});
	});

	it("opens the vocabulary popup after a country is selected", () => {
		render(<Map />);

		expect(screen.queryByLabelText("Country vocabulary")).not.toBeInTheDocument();
		fireEvent.click(
			screen.getAllByRole("button", { name: "Select mocked country" })[0]
		);

		expect(screen.getByLabelText("Country vocabulary")).toHaveTextContent(
			"test-word"
		);
	});

	it("announces country data loading", () => {
		mockedUseBorders.mockReturnValue({ borders: [], isLoading: true, error: null });

		render(<Map />);

		expect(screen.getByRole("status")).toHaveTextContent("Loading country data");
	});

	it("shows a recoverable message when country data fails", () => {
		mockedUseBorders.mockReturnValue({
			borders: [],
			isLoading: false,
			error: "Country data request failed with status 503.",
		});

		render(<Map />);

		expect(screen.getByRole("alert")).toHaveTextContent("Reload the page");
	});
});
