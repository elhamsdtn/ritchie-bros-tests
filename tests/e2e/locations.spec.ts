import { test, expect } from "@playwright/test";
import { LocationsPage } from "../../pages/LocationsPage";

test("Satellite sites are represented by an asterisk.*", async ({ page }) => {
  await page.goto("/lp");

  const heading = page.getByRole("heading", {
    name: "Locations",
    exact: true,
  });

  await expect(heading).toBeVisible();
  const intro = page.getByText(
    /over 60 permanent auction sites and local yards/i,
  );
  await expect(intro).toBeVisible();

  const satelliteNote = page.getByText(
    "Satellite sites are represented by an asterisk.*",
    { exact: true },
  );

  await expect(satelliteNote).toBeVisible();
});

test("Directory lists country groups sections", async ({ page }) => {
  await page.goto("/lp");

  const unitedStates = page.getByRole("heading", {
    name: "United States",
    level: 4,
    exact: true,
  });

  const canada = page.getByRole("heading", {
    name: "Canada",
    level: 4,
    exact: true,
  });

  await expect(unitedStates).toBeVisible();
  await expect(canada).toBeVisible();
  const countryHeadings = page.getByRole("heading", {
    level: 4,
  });

  const countryNames = await countryHeadings.allTextContents();

  console.log("Country count:", countryNames.length);
  console.log("Country names:", countryNames);

  expect(countryNames.slice(0, 2)).toEqual(["United States", "Canada"]);

  expect(countryNames).toEqual(
    expect.arrayContaining([
      "United States",
      "Canada",
      "Australia",
      "United Kingdom",
      "Netherlands",
      "UAE",
    ]),
  );
});

test("United States lists required locations", async ({ page }) => {
  const locationsPage = new LocationsPage(page);
  await locationsPage.open();

  const usList = locationsPage.countryList("United States");

  await expect(usList).toBeVisible();

  const locations = usList.getByRole("link");
  const locationNames = await locations.allTextContents();

  console.log("US location count:", locationNames.length);

  expect(locationNames.length).toBeGreaterThan(20);

  expect(locationNames).toEqual(
    expect.arrayContaining([
      "Phoenix",
      "Salt Lake City",
      "Houston",
      "Las Vegas",
      "Atlanta",
    ]),
  );
});

test("Canada lists required locations", async ({ page }) => {
  const locationsPage = new LocationsPage(page);
  await locationsPage.open();

  const canadaList = locationsPage.countryList("Canada");
  await expect(canadaList).toBeVisible();

  const locations = canadaList.getByRole("link");
  const locationNames = await locations.allTextContents();

  console.log("Canada location count:", locationNames.length);
  console.log("Canada locations:", locationNames);

  expect(locationNames.length).toBeGreaterThan(10);

  expect(locationNames).toEqual(
    expect.arrayContaining([
      "Edmonton",
      "Montreal",
      "Toronto",
      "Regina",
      "Saskatoon",
    ]),
  );
});

test("Directory counts all locations", async ({ page }) => {
  await page.goto("/lp");

  const usList = page.getByRole("list", {
    name: "United States",
    exact: true,
  });

  await expect(usList).toBeVisible();

  const locationLinks = page.locator('ul[aria-label] a[href^="/lp/"]');

  const locationNames = await locationLinks.allTextContents();

  console.log("Total locations:", locationNames.length);
  console.log("All locations:", locationNames);

  expect(locationNames.length).toBeGreaterThan(60);
  const satellites = locationNames.filter((name) => {
    return name.trim().endsWith("*");
  });

  const permanentSites = locationNames.filter((name) => {
    return !name.trim().endsWith("*");
  });

  console.log("Satellite count:", satellites.length);
  console.log("Permanent count:", permanentSites.length);

  expect(satellites.length).toBeGreaterThan(15);
  expect(permanentSites.length).toBeGreaterThan(25);

  expect(satellites.length + permanentSites.length).toBe(locationNames.length);
});

test("Known locations show correct site types", async ({ page }) => {
  await page.goto("/lp");

  const usList = page.getByRole("list", {
    name: "United States",
    exact: true,
  });

  const canadaList = page.getByRole("list", {
    name: "Canada",
    exact: true,
  });

  await expect(
    usList.getByRole("link", {
      name: "San Antonio*",
      exact: true,
    }),
  ).toBeVisible();

  await expect(
    canadaList.getByRole("link", {
      name: "Calgary, AB*",
      exact: true,
    }),
  ).toBeVisible();

  await expect(
    usList.getByRole("link", {
      name: "Phoenix",
      exact: true,
    }),
  ).toBeVisible();

  await expect(
    canadaList.getByRole("link", {
      name: "Edmonton",
      exact: true,
    }),
  ).toBeVisible();
});

test("Switch to local representatives", async ({ page }) => {
  await page.goto("/lp");

  const auctionSites = page.getByRole("tab", {
    name: "Auction sites",
    exact: true,
  });

  const representatives = page.getByRole("tab", {
    name: "Local representatives",
    exact: true,
  });

  await expect(auctionSites).toBeVisible();
  await expect(representatives).toBeVisible();

  await auctionSites.click();

  await expect(auctionSites).toHaveAttribute("aria-selected", "true");

  await representatives.click();

  await expect(representatives).toHaveAttribute("aria-selected", "true");

  await expect(auctionSites).toHaveAttribute("aria-selected", "false");

  await expect(
    page.getByText("Search for representatives", {
      exact: true,
    }),
  ).toBeVisible();
});

test("Open Edmonton from the Canada directory", async ({ page }) => {
  const locationsPage = new LocationsPage(page);

  await locationsPage.open();

  const edmonton = locationsPage.location("Canada", "Edmonton");

  await expect(edmonton).toBeVisible();
  await edmonton.click();

  await expect(page).toHaveURL(/\/lp\/edmonton-ab(?:[/?#]|$)/);

  await expect(
    page.getByRole("heading", {
      name: "Edmonton",
      exact: true,
    }),
  ).toBeVisible();
});
