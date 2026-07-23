import { expect, test } from "@playwright/test";

test("presents the product shell and opens the isolated map route", async ({ page }) => {
	await page.goto("/");

	await expect(page).toHaveTitle("Swearing Map");
	await expect(
		page.getByRole("heading", {
			name: "Learn the language people use when the polite words run out.",
		})
	).toBeVisible();

	await page.getByRole("link", { name: "Explore the live map" }).click();

	await expect(page).toHaveURL(/\/map\/$/u);
	await expect(page.locator(".leaflet-container")).toBeVisible();
});

test("keeps primary actions usable on a mobile viewport", async ({ page }) => {
	await page.setViewportSize({ width: 390, height: 844 });
	await page.goto("/");

	const primaryAction = page.getByRole("link", { name: "Explore the live map" });
	await expect(primaryAction).toBeVisible();
	await expect(primaryAction).toHaveCSS("width", "350px");
});
