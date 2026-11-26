import assert from 'node:assert/strict';
import test from 'node:test';
import { incidents } from '../src/incidents.ts';
import { orderIncidents, dailyCounts, defaultFilters, exportCsv, filterIncidents, filtersFromQuery, queryWithFilters } from '../src/model.ts';

const options = { days: 14, phase: 'all', service: 'all', search: '' };

test('search and service filters compose and ignore accents', () => {
  const rows = filterIncidents(incidents, { ...options, search: 'latencia', service: 'API pública' });
  assert.deepEqual(rows.map(row => row.id), ['INC-115']);
});

test('date range includes the first day and excludes older records', () => {
  const rows = filterIncidents(incidents, { ...options, days: 7 });
  assert(rows.some(row => row.date === '2026-11-20'));
  assert(rows.every(row => row.date >= '2026-11-20'));
  assert.equal(rows[0].id, 'INC-118');
});

test('chart preserves zero days and separates the resolved count', () => {
  const result = dailyCounts(incidents, 14);
  assert.equal(result.length, 14);
  assert(result.some(day => day.total === 0));
  assert.deepEqual(result.at(-1), { date: '2026-11-26', total: 3, resolved: 1 });
});

test('shareable filters round-trip and clearing them preserves other parameters', () => {
  const filters = { days: 7, phase: 'open', service: 'API pública', search: 'latência' };
  const query = queryWithFilters('?utm_source=portfolio', filters);
  assert.deepEqual(filtersFromQuery(query), filters);
  assert.equal(queryWithFilters(query, defaultFilters), '?utm_source=portfolio');
  assert.deepEqual(filtersFromQuery('?dias=90&status=constructor&servico=unknown'), defaultFilters);
});

test('CSV escapes quotes and neutralizes cells interpreted as spreadsheet formulas', () => {
  const csv = exportCsv([{ ...incidents[0], title: ' =2+2;"x"' }]);
  assert(csv.startsWith('\ufeff"ID";"Incidente"'));
  assert(csv.includes("\"' =2+2;\"\"x\"\"\""));
});

test('incident order supports oldest first and severity without mutating the input', () => {
  const rows = [
    { ...incidents[0], id: 'latest-major', date: '2026-11-26', severity: 'major' },
    { ...incidents[0], id: 'latest-critical', date: '2026-11-26', severity: 'critical' },
    { ...incidents[0], id: 'older-critical', date: '2026-11-23', severity: 'critical' },
  ];
  assert.equal(orderIncidents(rows, 'oldest')[0].id, 'older-critical');
  assert.deepEqual(orderIncidents(rows, 'severity').map(row => row.id),
    ['latest-critical', 'older-critical', 'latest-major']);
  assert.equal(rows[0].id, 'latest-major');
});
