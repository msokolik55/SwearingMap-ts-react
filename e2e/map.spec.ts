import { expect, test } from "@playwright/test";

const transparentPng = Buffer.from(
	"iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M/wHwAEAQH/6F2lWQAAAABJRU5ErkJggg==",
	"base64"
);

test.beforeEach(async ({ page }) => {
	await page.route("https://*.tile.openstreetmap.org/**", (route) =>
		route.fulfill({ status: 200, contentType: "image/png", body: transparentPng })
	);
});

test("loads the map and opens a country's vocabulary", async ({ page }) => {
	const borderResponse = page.waitForResponse(
		(response) => response.url().endsWith("/data/borders.json") && response.ok()
	);

	await page.goto("/");
	await borderResponse;

	await expect(page).toHaveTitle("Swearing Map");
	await expect(page.locator(".leaflet-container")).toBeVisible();
	await expect(page.locator(".leaflet-control-attribution")).toContainText(
		"OpenStreetMap"
	);

	const country = page
		.locator(".leaflet-overlay-pane path.leaflet-interactive")
		.first();
	await expect(country).toBeVisible();
	await country.click({ force: true });

	await expect(page.locator(".leaflet-popup")).toBeVisible();
	await expect(page.locator(".leaflet-popup-content")).not.toBeEmpty();
});

test("shows a recoverable error when country data is unavailable", async ({ page }) => {
	await page.route("**/data/borders.json", (route) =>
		route.fulfill({ status: 503, contentType: "application/json", body: "{}" })
	);

	await page.goto("/");

	await expect(page.getByRole("alert")).toContainText(
		"Country data request failed with status 503. Reload the page to try again."
	);
	await expect(page.locator(".leaflet-container")).toBeVisible();
});
