import { test, expect } from "@playwright/test";
import { getPageProps } from "../../helpers/page-json";

interface ApiLocationAddress {
  country: string;
  [key: string]: unknown;
}

interface ApiLocationYard {
  name: string;
  type: "Satellite" | "Permanent";
  address: ApiLocationAddress;
  [key: string]: unknown;
}

interface ApiLocationsPageProps {
  yards: ApiLocationYard[];
}

interface ApiLocationsData {
  props: {
    pageProps: ApiLocationsPageProps;
  };
  [key: string]: unknown;
}

test("Locations page contains yard JSON", async ({ request }) => {
  const props = await getPageProps(request, "/lp");
  const yards: ApiLocationYard[] = props.yards;
  expect(Array.isArray(yards)).toBe(true);
  expect(yards.length).toBeGreaterThan(60);

  console.log("API yard count:", yards.length);

  for (const yard of yards) {
    expect(typeof yard.name).toBe("string");
    expect(yard.name.trim().length).toBeGreaterThan(0);

    expect(typeof yard.address?.country).toBe("string");

    expect(yard.address.country.trim().length).toBeGreaterThan(0);

    expect(["Satellite", "Permanent"]).toContain(yard.type);
  }

  expect(yards).toEqual(
    expect.arrayContaining([
      expect.objectContaining({
        name: "Edmonton",
        address: expect.objectContaining({
          country: "Canada",
        }),
      }),
      expect.objectContaining({
        name: "Phoenix",
        address: expect.objectContaining({
          country: "United States",
        }),
      }),
    ]),
  );

  const satellites: ApiLocationYard[] = yards.filter(
    (yard: ApiLocationYard) => yard.type === "Satellite",
  );

  const permanentSites: ApiLocationYard[] = yards.filter(
    (yard: ApiLocationYard) => yard.type === "Permanent",
  );

  expect(satellites.length).toBeGreaterThan(15);
  expect(permanentSites.length).toBeGreaterThan(25);

  const countries: string[] = [
    ...new Set(yards.map((yard: ApiLocationYard) => yard.address.country)),
  ];

  expect(countries.length).toBeGreaterThan(8);

  expect(countries).toEqual(
    expect.arrayContaining(["United States", "Canada"]),
  );

  console.log("API satellites:", satellites.length);
  console.log("API permanent sites:", permanentSites.length);
  console.log("API country count:", countries.length);
});
