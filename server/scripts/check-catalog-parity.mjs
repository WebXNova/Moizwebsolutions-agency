/**
 * Fails if the trusted server catalog drifts away from the one the UI renders.
 *
 * The server deliberately keeps its own copy so it never trusts labels sent by
 * the browser, which means the two files have to be kept in step by hand. This
 * runs locally/in CI, not at runtime — the API has no dependency on `client/`.
 *
 *   npm run check:catalog
 */
import { pathToFileURL } from 'node:url';
import path from 'node:path';

import * as server from '../src/inquiry/catalog.js';

const clientCatalogPath = path.resolve(
  import.meta.dirname,
  '../../client/src/data/projectInquiry.js',
);
const client = await import(pathToFileURL(clientCatalogPath).href);

/** @type {string[]} */
const problems = [];

/**
 * @param {string} label
 * @param {unknown} actual
 * @param {unknown} expected
 */
function compare(label, actual, expected) {
  const a = JSON.stringify(actual);
  const b = JSON.stringify(expected);
  if (a !== b) problems.push(`${label}\n  server: ${a}\n  client: ${b}`);
}

compare(
  'services',
  server.services.map((service) => ({
    id: service.id,
    title: service.title,
    timelinePreset: service.timelinePreset,
    projectTypes: service.projectTypes,
  })),
  client.inquiryServices.map((service) => ({
    id: service.id,
    title: service.title,
    timelinePreset: service.timelinePreset,
    projectTypes: service.projectTypes,
  })),
);

compare(
  'currencies',
  server.currencies,
  client.currencies.map((currency) => currency.id),
);

compare('budgetRanges', server.budgetRanges, client.budgetRanges);
compare('timelinePresets', server.timelinePresets, client.timelinePresets);

for (const service of client.inquiryServices) {
  compare(
    `resolveTimelineOptions(['${service.id}'])`,
    server.resolveTimelineOptions([service.id]),
    client.resolveTimelineOptions([service.id]),
  );
}

if (problems.length > 0) {
  console.error(
    `Catalog drift detected between server/src/inquiry/catalog.js and client/src/data/projectInquiry.js:\n\n${problems.join('\n\n')}\n`,
  );
  process.exit(1);
}

console.log('Catalog parity OK — server and client inquiry options match.');
