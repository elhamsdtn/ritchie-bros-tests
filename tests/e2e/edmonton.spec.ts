import { test, expect } from "@playwright/test";

test("Edmonton yard displays complete details", async ({ page }) => {
  await page.goto("/lp/edmonton-ab");

  // Address includes all required components.
  const address = page.getByText(/1500 Sparrow Drive/);

  await expect(address).toBeVisible();
  await expect(address).toContainText("Nisku");
  await expect(address).toContainText(/\bAB\b/);
  await expect(address).toContainText("T9E 8H6");

  // Office hours include weekdays and a time range.
  const officeHours = page.getByText(/Mon\s*-\s*Fri/);

  await expect(officeHours).toBeVisible();

  const timeRange =
    /\d{1,2}:\d{2}\s*(?:AM|PM)?\s*[-–]\s*\d{1,2}:\d{2}\s*(?:AM|PM)?/i;

  await expect(officeHours).toContainText(timeRange);

  // Telephone number is visible and has a tel link.
  const phone = page.getByTestId("contact-phone-link");

  await expect(phone).toBeVisible();

  await expect(phone).toHaveAttribute("href", /^tel:\+?\d{7,15}$/);

  await expect(phone).toContainText(/\+?\d{7,15}/);
});

test("Auction events have dates and titles", async ({ page }) => {
  await page.goto("/lp/edmonton-ab");

  const heading = page.getByRole("heading", {
    name: "Auction events",
    exact: true,
  });

  await expect(heading).toBeVisible();

  const cards = page.getByTestId(/^auction-card-\d+$/);

  await expect(cards.first()).toBeVisible();

  const count = await cards.count();

  console.log("Auction event count:", count);
  expect(count).toBeGreaterThanOrEqual(1);

  const dateRange =
    /[A-Za-z]{3,9}\s+\d{1,2}\s*[-–]\s*(?:[A-Za-z]{3,9}\s+)?\d{1,2}/;

  for (let index = 0; index < count; index++) {
    const card = cards.nth(index);

    const date = card.getByTestId(/^auction-card-date-range-\d+$/);

    const title = card.getByRole("heading", {
      level: 5,
    });

    await expect(date).toBeVisible();
    await expect(date).toHaveText(dateRange);

    await expect(title).toBeVisible();
    await expect(title).toHaveText(/\S+/);
  }
});

test("About this yard describes weekday services", async ({ page }) => {
  await page.goto("/lp/edmonton-ab");

  const heading = page.getByRole("heading", {
    name: "About this yard",
    exact: true,
  });

  await expect(heading).toBeVisible();

  const description = page.getByText(
    /This auction site's yard is open weekdays/,
  );

  await expect(description).toBeVisible();
  await expect(description).toHaveText(/\S+/);

  await expect(description).toContainText(
    "This auction site's yard is open weekdays " +
      "for equipment drop-off, inspection and pick-up.",
  );
});

test("Items in yard lists categories and quantities", async ({ page }) => {
  await page.goto("/lp/edmonton-ab");

  const heading = page.getByRole("heading", {
    name: "Items in yard",
    exact: true,
  });

  await expect(heading).toBeVisible();

  const cards = page
    .locator('a[href*="/cp/"][href*="freeText=Edmonton"]')
    .filter({
      has: page.getByRole("heading", { level: 6 }),
    });

  await expect(cards.first()).toBeAttached();

  const count = await cards.count();

  console.log("Items in yard category count:", count);
  expect(count).toBeGreaterThan(5);

  const names: string[] = [];

  for (let index = 0; index < count; index++) {
    const card = cards.nth(index);

    const name = card.getByRole("heading", {
      level: 6,
    });

    const quantity = card.locator("p");

    await expect(name).toHaveText(/\S+/);
    await expect(quantity).toHaveText(/^\s*[\d,]+\s+items\s*$/i);

    names.push((await name.innerText()).trim());
  }

  const payloadText = await page.locator("script#__NEXT_DATA__").textContent();

  if (!payloadText) {
    throw new Error("Edmonton page JSON is missing");
  }

  const payload = JSON.parse(payloadText);

  const apiNames: string[] = payload.props.pageProps.itemsInYard.flatMap(
    (group: { categories: { categoryLocalized: string }[] }) =>
      group.categories.map((category) => category.categoryLocalized),
  );

  const uniqueApiNames = [...new Set(apiNames.map((name) => name.trim()))];

  console.log("Payload category entries:", apiNames.length);
  console.log("Unique payload categories:", uniqueApiNames.length);

  expect([...names].sort()).toEqual([...uniqueApiNames].sort());

  expect(names).toContain("Excavators");

  const requiredCategories = [
    "Harvesting Equipment",
    "Agricultural Tractors",
    "Sprayers",
    "Excavator Attachments",
  ];

  const hasRequiredCategory = requiredCategories.some((name) =>
    names.includes(name),
  );

  expect(hasRequiredCategory).toBe(true);
});

test("Become a seller form is visible and displays a phone number", async ({
  page,
}) => {
  await page.goto("/lp/edmonton-ab");

  await expect(
    page.getByRole("heading", {
      name: "Become a seller",
      exact: true,
    }),
  ).toBeVisible();

  const form = page.locator("form").filter({
    has: page.getByRole("textbox", {
      name: "First name*",
      exact: true,
    }),
  });

  await expect(form).toBeVisible();

  await expect(
    form.getByRole("textbox", {
      name: "First name*",
      exact: true,
    }),
  ).toBeVisible();

  const phone = form.locator('a[href^="tel:"]');

  await expect(phone).toBeVisible();

  await expect(phone).toHaveAttribute("href", /^tel:\+?\d{7,15}$/);

  await expect(phone).toHaveText(/^\+?\d[\d\s()-]{6,}$/);

  // Do not submit the form.
});

test("Representatives show territory and contact details", async ({ page }) => {
  await page.goto("/lp/edmonton-ab");

  const tab = page.getByRole("tab", {
    name: "Representatives",
    exact: true,
  });

  await tab.click();

  await expect(tab).toHaveAttribute("aria-selected", "true");

  const panel = page.getByRole("tabpanel", {
    name: "Representatives",
    exact: true,
  });

  await expect(panel).toBeVisible();

  const cards = panel.locator(".MuiGrid2-container > div").filter({
    has: page.getByRole("heading", { level: 4 }),
  });

  await expect(cards.first()).toBeVisible();

  const count = await cards.count();

  console.log("Representative count:", count);
  expect(count).toBeGreaterThanOrEqual(1);

  const card = cards.first();

  const territory = card.locator(
    'div:has(> svg[data-testid="LocationOnIcon"]) > h6',
  );

  await expect(territory).toBeVisible();
  await expect(territory).toHaveText(/\S+/);

  const contacts = card.locator('a[href^="tel:"], a[href^="mailto:"]');

  await expect(contacts.first()).toBeVisible();
  await expect(contacts.first()).toHaveText(/\S+/);

  await expect(contacts.first()).toHaveAttribute("href", /^(?:tel:|mailto:).+/);
});

test("Invalid yard URL shows Page not found", async ({ page }) => {
  await page.goto("/lp/ntc1-nonexistent-yard-987654321");

  await expect(
    page.getByText("Page not found", {
      exact: true,
    }),
  ).toBeVisible();

  await expect(page.getByTestId("contact-phone-link")).toHaveCount(0);
});
