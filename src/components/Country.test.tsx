import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import Country from "./Country";
import type { IBorder } from "../schema/border";

const createBorder = (ISO_A3: string): IBorder => ({
	type: "Feature",
	properties: { ADMIN: "Test country", ISO_A3 },
	geometry: { type: "Polygon", coordinates: [[[15, 49]]] },
});

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
		const border = createBorder("CZE");

		render(<Country border={border} onSelect={onSelect} />);
		fireEvent.click(screen.getByRole("button", { name: "Select country" }));

		expect(onSelect).toHaveBeenCalledOnce();
		expect(onSelect).toHaveBeenCalledWith(expect.objectContaining({ ISO_A3: "CZE" }));
	});

	it("does not render a polygon for a country without words", () => {
		const border = createBorder("DZA");

		const { container } = render(<Country border={border} onSelect={vi.fn()} />);

		expect(container).toBeEmptyDOMElement();
	});
});
