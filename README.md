# Ritchie Bros. Test Automation

Playwright and TypeScript tests for the public Ritchie Bros.
locations directory, Edmonton yard, and inventory search.

## Setup

Install Node.js and npm. Development was performed with
Node.js 24.13.0 and npm 11.6.2.

From the project folder:

```bash
npm ci
npx playwright install chromium
```

On Linux, browser system dependencies may also be needed:

```bash
npx playwright install --with-deps chromium
```

## Run tests

All tests:

```bash
npm test
```

Browser tests:

```bash
npm run test:e2e
```

API tests:

```bash
npm run test:api
```

One test file:

```bash
npx playwright test tests/e2e/edmonton.spec.ts --project=chromium
```

Open the latest HTML report:

```bash
npm run report
```

## Architecture

- `tests/e2e/`: browser scenarios and negative UI tests.
- `tests/api/`: HTTP and page-JSON checks, including negative cases.
- `pages/LocationsPage.ts`: reusable directory navigation and locators.
- `helpers/page-json.ts`: shared HTTP fetching and Next.js JSON extraction.
- `playwright.config.ts`: separate Chromium and API projects.

Assertions remain in tests. Each test receives an isolated
Playwright fixture and runs independently.

One worker limits concurrent traffic to the production site.
Retries are disabled so failures remain visible. Failed browser
tests retain screenshots and traces.

## Coverage

### Browser tests

- Locations heading, introduction, and satellite note.
- Country groups and required countries.
- US and Canadian location counts and required sites.
- Satellite and permanent counts and known site types.
- Switching to local representatives.
- Navigation from the directory to Edmonton.
- Edmonton address, hours, and telephone.
- Auction-event count, dates, and titles.
- About-this-yard content.
- All items-in-yard category cards, names, and quantities.
- Seller form and contact number.
- Representative territory and contact details.
- Edmonton search context, displayed total, and first-page lot details.
- Unmatched search and invalid yard URL.

### API tests

- `/lp` page JSON: yards, countries, and site types.
- `/lp/edmonton-ab` page JSON: details, events, and categories.
- POST `/api/search?source=search_page`: total and named records.
- Unmatched search fallback.
- Invalid yard HTTP response.

Page JSON is extracted from `__NEXT_DATA__`.
`/api/countries` is not used as an auction-sites source.

## Dynamic data

Inventory totals, dates, titles, and quantities are read at runtime.
Tests use minimum counts and content/format checks rather than
fixed inventory values.

Search totals come from displayed pagination or
`results.totalAmount`; tests do not page through all inventory.

The carousel test reads off-screen cards and compares their names
with the unique, trimmed category names in the same page payload.

## Observations and limitations

- Headless browser runs received Access Denied during development.
  Headed Chromium runs succeeded, so browser tests use
  `headless: false` and require a graphical environment.
- Invalid yard URLs returned HTTP 200 with Page not found.
  The negative HTTP test documents this observed soft-404 behavior.
- Unmatched searches can return fallback results.
  The API test checks `fallbackApplied`, rather than assuming zero hits.
- The Edmonton payload contained repeated category entries.
  In one run, 55 entries represented 42 unique displayed categories.
  These counts are observations, not fixed expectations.
- The live site and inventory may change. Access blocks and content
  changes should be investigated using failure evidence.
- The Representatives test checks the first card for a territory
  and contact method; it does not require every staff member to
  have a territory.

## Production-site boundaries

Tests do not create accounts, place bids, or submit the seller form.