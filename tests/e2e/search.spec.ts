import { test, expect } from "@playwright/test";

test("Edmonton search displays a positive result total", async ({ page }) => {
  await page.goto("/search?freeText=Edmonton");

  const header = page.getByTestId("search-count-header");

  await expect(header).toBeVisible();
  await expect(header).toContainText('results for "Edmonton"');

  const pagination = page.locator("#items-per-page");

  await expect(pagination).toBeVisible();

  const totalPattern = /\bof\s+([\d,]+)\s*$/;

  await expect(pagination).toHaveText(totalPattern);

  const text = await pagination.innerText();
  const match = text.match(totalPattern);

  if (!match) {
    throw new Error(`Cannot parse result total from: ${text}`);
  }

  const total = Number(match[1].replace(/,/g, ""));

  expect(total).toBeGreaterThan(0);

  console.log("Edmonton result total:", total);
  const cards = page.getByTestId(/^searchResultItemCard-\d+$/);

  await expect(cards.first()).toBeVisible();

  const count = await cards.count();
  expect(count).toBeGreaterThan(0);

  const titles: string[] = [];

  for (let index = 0; index < count; index++) {
    const card = cards.nth(index);

    const title = card.getByTestId("item-card-title-link");

    await expect(title).toHaveText(/\S+/);

    titles.push((await title.innerText()).trim());

    const locations = card.locator("p[title]");

    for (let n = 0; n < (await locations.count()); n++) {
      await expect(locations.nth(n)).toHaveText(/\S+/);
    }

    const dates = card.getByTestId("end-date-section");

    for (let n = 0; n < (await dates.count()); n++) {
      await expect(dates.nth(n)).toHaveText(/\S+/);
    }
  }

  console.log("First 5 lot titles:", titles.slice(0, 5));
});

//negative tests

test("Unmatched search shows no exact matches", async ({ page }) => {
  const searchTerm = "ntc1_no_matching_equipment_987654321negative1";

  await page.goto(`/search?freeText=${encodeURIComponent(searchTerm)}`);

  const message = page.getByTestId("zero-exact-matches-title");

  await expect(message).toBeVisible();

  await expect(message).toHaveText(
    `No exact matches found for "${searchTerm}"`,
  );

  await expect(
    page.getByText(
      "Save this search to receive alerts " + "when new items are available.",
      { exact: true },
    ),
  ).toBeVisible();
});
