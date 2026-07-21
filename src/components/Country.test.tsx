import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import Borders from "../data/borders.json";
import Country from "./Country";

vi.mock("react-leaflet", () => ({
	Polygon: ({ eventHandlers }: { eventHandlers: { click: () => void } }) => (
		<button type="button" onClick={eventHandlers.click}>
			Select country
		</button>
	),
}));

describe("Country", () => {
	it("selects a country with words when its polygon is clicked", () => {
		const onSelect = vi.fn();
		const border = Borders.features.find(
			(feature) => feature.properties.ISO_A3 === "CZE"
		);

		expect(border).toBeDefined();
		render(<Country border={border!} onSelect={onSelect} />);
		fireEvent.click(screen.getByRole("button", { name: "Select country" }));

		expect(onSelect).toHaveBeenCalledOnce();
		expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ ISO_A3: "CZE" }));
	});

	it("does not render a polygon for a country without words", () => {
		const border = Borders.features.find(
			(feature) => feature.properties.ISO_A3 === "DZA"
		);

		expect(border).toBeDefined();
		const { container } = render(<Country border={border!} onSelect={vi.fn()} />);

		expect(container).toBeEmptyDOMElement();
	});
});
