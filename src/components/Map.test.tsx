import type { ReactNode } from "react";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import Map from "./Map";

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
});
