import {
  expect,
  type APIRequestContext,
} from '@playwright/test';

export async function getPageProps(
  request: APIRequestContext,
  path: string
) {
  const response = await request.get(path);

  expect(
    response.status(),
    `HTTP status for ${path}`
  ).toBe(200);

  const html = await response.text();

  const script = html.match(
    /<script\b[^>]*\bid="__NEXT_DATA__"[^>]*>([\s\S]*?)<\/script>/
  );

  if (!script) {
    throw new Error(
      `No __NEXT_DATA__ script found at ${path}`
    );
  }

  const data = JSON.parse(script[1]);
  const props = data.props?.pageProps;

  expect(
    props,
    `Page props missing at ${path}`
  ).toBeDefined();

  return props;
}