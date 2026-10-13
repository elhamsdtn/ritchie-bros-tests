import { test, expect } from "@playwright/test";

interface SearchApiRecord {
  assetDescription: string;
}

interface SearchApiResults {
  totalAmount: number;
  records: SearchApiRecord[];
}

interface SearchApiResponse {
  results: SearchApiResults;
}

test("Edmonton inventory API returns named records", async ({ request }) => {
  const response = await request.post("/api/search?source=search_page", {
    data: {
      listingStatuses: "Open,New,Preview,BuyNowPending,SALE_PENDING",
      freeText: "Edmonton",
      sortBy: "indexedAt_desc",
    },
  });

  expect(response.status()).toBe(200);

  expect(response.headers()["content-type"]).toContain("application/json");

  const data: SearchApiResponse = await response.json();
  const results: SearchApiResults = data.results;

  expect(typeof results.totalAmount).toBe("number");
  expect(Number.isFinite(results.totalAmount)).toBe(true);
  expect(results.totalAmount).toBeGreaterThan(0);

  expect(Array.isArray(results.records)).toBe(true);
  expect(results.records.length).toBeGreaterThan(0);

  for (const record of results.records) {
    expect(typeof record.assetDescription).toBe("string");

    expect(record.assetDescription.trim().length).toBeGreaterThan(0);
  }

  const firstFiveTitles: string[] = results.records
    .slice(0, 5)
    .map((record: SearchApiRecord) => record.assetDescription);

  console.log("API result total:", results.totalAmount);
  console.log("API first 5 titles:", firstFiveTitles);
});

test("Unmatched search API applies fallback", async ({ request }) => {
  const response = await request.post("/api/search?source=search_page", {
    data: {
      listingStatuses: "Open,New,Preview,BuyNowPending,SALE_PENDING",
      freeText: "ntc1_no_matching_equipment_987654321negative1",
      sortBy: "indexedAt_desc",
    },
  });

  console.log("Unmatched status:", response.status());

  expect(response.status()).toBe(200);

  const data = await response.json();
  expect(data.results.fallbackApplied).toBe(true);

  expect(typeof data.results.totalAmount).toBe("number");
  expect(data.results.totalAmount).toBeGreaterThan(0);

  expect(Array.isArray(data.results.records)).toBe(true);
  expect(data.results.records.length).toBeGreaterThan(0);
  console.log("Total:", data.results.totalAmount);
  console.log("Fallback applied:", data.results.fallbackApplied);
  console.log("Returned records:", data.results.records.length);
});
