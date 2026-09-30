#!/usr/bin/env node
// Restore the reviewed views-change report after publisher sweeps regenerate public pages.
import {copyFile, mkdir, readFile} from 'node:fs/promises';
import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const pinned = resolve(root, '.github/persisted/views-change');
const output = resolve(root, 'reports');
const names = ['views-change.html', 'views-change-chart.png', 'views-change-daily.csv'];
const [html, chart, csv] = await Promise.all([
  readFile(resolve(pinned, names[0]), 'utf8'),
  readFile(resolve(pinned, names[1])),
  readFile(resolve(pinned, names[2]), 'utf8'),
]);
const channelCount = Number(html.match(/\b(\d{2,3}) channels\b/i)?.[1] ?? 0);
if (channelCount < 100 || !html.includes('Creator questions')) {
  throw new Error('Pinned report is incomplete or has lost its expanded channel coverage.');
}
if (!html.includes(names[1]) || !html.includes(names[2])) {
  throw new Error('Pinned report no longer links to its chart and historical CSV.');
}
const csvRows = csv.trimEnd().split(/\r?\n/);
if (!csvRows[0].startsWith('date,') || !csvRows[0].includes('watch_time_hours_median') || csvRows.length < 351) {
  throw new Error('Pinned daily history is missing watch-time data or has fewer than 350 dates.');
}
if (chart.length < 8 || !chart.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))) {
  throw new Error('Pinned chart is not a valid PNG.');
}
await mkdir(output, {recursive: true});
await Promise.all(names.map(name => copyFile(resolve(pinned, name), resolve(output, name))));
console.log(JSON.stringify({restored: names, measuredChannels: channelCount, historyDays: csvRows.length - 1}));