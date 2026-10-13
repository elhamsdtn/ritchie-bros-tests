import { type Page } from '@playwright/test';

export class LocationsPage {
  constructor(private readonly page: Page) {}

  async open() {
    await this.page.goto('/lp');
  }

  countryList(country: string) {
    return this.page.getByRole('list', {
      name: country,
      exact: true,
    });
  }

  location(country: string, name: string) {
    return this.countryList(country).getByRole('link', {
      name,
      exact: true,
    });
  }
}