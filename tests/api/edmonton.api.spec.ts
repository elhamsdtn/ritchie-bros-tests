import { test, expect } from "@playwright/test";
import { getPageProps } from "../../helpers/page-json";

interface YardAddress {
  addressLine1: string;
  city: string;
  zipPostalCode: string;
}

interface YardDetails {
  name: string;
  address: YardAddress;
  contactPhone: string;
  pickupHoursFrom: string;
  pickupHoursTo: string;
}

interface UpcomingEvent {
  event_advertised_name: string;
  event_locality?: string;
  event_start_date_time: string;
  event_end_date_time: string;
}

interface YardCategory {
  categoryLocalized: string;
  totalAssets?: number;
}

interface YardItemGroup {
  categories: YardCategory[];
}

interface PageProps {
  yardDetails: YardDetails;
  upcomingEvents: UpcomingEvent[];
  itemsInYard: YardItemGroup[];
}

interface NextData {
  props: {
    pageProps: PageProps;
  };
}

test("Edmonton page JSON contains yard details", async ({ request }) => {
  const props: PageProps = await getPageProps(request, "/lp/edmonton-ab");

  const yard: YardDetails = props.yardDetails;

  expect(yard.name).toBe("Edmonton");

  expect(yard.address.addressLine1).toContain("1500 Sparrow Drive");

  expect(yard.address.city).toContain("Nisku");

  expect(yard.address.zipPostalCode).toContain("T9E 8H6");

  expect(typeof yard.contactPhone).toBe("string");
  expect(yard.contactPhone).toMatch(/\d/);

  const timeFormat: RegExp = /^([01]\d|2[0-3]):[0-5]\d$/;

  expect(yard.pickupHoursFrom).toMatch(timeFormat);
  expect(yard.pickupHoursTo).toMatch(timeFormat);

  const events: UpcomingEvent[] = props.upcomingEvents;

  expect(Array.isArray(events)).toBe(true);

  console.log("API upcoming event count:", events.length);

  if (events.length > 0) {
    expect(events.length).toBeGreaterThanOrEqual(1);

    for (const event of events) {
      expect(typeof event.event_advertised_name).toBe("string");

      expect(event.event_advertised_name.trim().length).toBeGreaterThan(0);

      const start = Date.parse(event.event_start_date_time);

      const end = Date.parse(event.event_end_date_time);

      expect(Number.isFinite(start)).toBe(true);
      expect(Number.isFinite(end)).toBe(true);
      expect(end).toBeGreaterThanOrEqual(start);
    }

    const refersToEdmonton = events.some((event) => {
      return (
        /Edmonton|Nisku/i.test(event.event_advertised_name) ||
        /Edmonton|Nisku/i.test(event.event_locality || "")
      );
    });

    expect(refersToEdmonton).toBe(true);
  }

  expect(Array.isArray(props.itemsInYard)).toBe(true);

  for (const group of props.itemsInYard) {
    expect(Array.isArray(group.categories)).toBe(true);
  }

  const categories = props.itemsInYard.flatMap((group) => group.categories);

  console.log("API category count:", categories.length);

  expect(categories.length).toBeGreaterThan(5);

  for (const category of categories) {
    expect(typeof category.categoryLocalized).toBe("string");

    expect(category.categoryLocalized.trim().length).toBeGreaterThan(0);

    if (category.totalAssets !== undefined) {
      expect(typeof category.totalAssets).toBe("number");
      expect(Number.isFinite(category.totalAssets)).toBe(true);
      expect(category.totalAssets).toBeGreaterThanOrEqual(0);
    }
  }

  expect(categories).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        categoryLocalized: "Excavators",
      }),
    ]),
  );
});

test("Invalid yard returns a Page not found response", async ({ request }) => {
  const response = await request.get("/lp/ntc1-nonexistent-yard-987654321");

  // Observed site behavior: soft 404.
  expect(response.status()).toBe(200);

  expect(response.headers()["content-type"]).toContain("text/html");

  const body = await response.text();

  expect(body).toContain("Page not found");
});
