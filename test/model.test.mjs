import assert from 'node:assert/strict';
import test from 'node:test';
import { incidents } from '../src/incidents.ts';
import { dailyCounts, exportCsv, filterIncidents } from '../src/model.ts';

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

test('CSV escapes quotes and neutralizes cells interpreted as spreadsheet formulas', () => {
  const csv = exportCsv([{ ...incidents[0], title: ' =2+2;"x"' }]);
  assert(csv.startsWith('\ufeff"ID";"Incidente"'));
  assert(csv.includes("\"' =2+2;\"\"x\"\"\""));
});
