import assert from 'node:assert/strict';
import test from 'node:test';
import { incidents } from '../src/incidents.ts';
import { orderFromQuery, orderIncidents, dailyCounts, defaultFilters, exportCsv, filterIncidents, filtersFromQuery, queryWithFilters } from '../src/model.ts';

const options = defaultFilters;

test('search and service filters compose and ignore accents', () => {
  const rows = filterIncidents(incidents, { ...options, search: 'latencia', service: 'API pública' });
  assert.deepEqual(rows.map(row => row.id), ['INC-115', 'INC-113']);
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
  const filters = { days: 7, phase: 'open', severity: 'critical', service: 'API pública', search: 'latência' };
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

test('severity narrows results and persists in a shared link', () => {
  const filters = filtersFromQuery('?severidade=critical');
  const rows = filterIncidents(incidents, filters);
  assert(rows.length > 0);
  assert(rows.every(row => row.severity === 'critical'));
  assert.equal(queryWithFilters('', filters), '?severidade=critical');
  assert.equal(queryWithFilters('?severidade=critical&origem=portfolio', defaultFilters), '?origem=portfolio');
  assert.equal(filtersFromQuery('?severidade=invalid').severity, 'all');
});

test('search matches all terms across separate incident fields', () => {
  const example = { ...incidents[0], title: 'Falha', summary: 'Conexão instável no banco' };
  assert.deepEqual(filterIncidents([example], { ...defaultFilters, search: 'instavel   FALHA' }), [example]);
  assert.deepEqual(filterIncidents([example], { ...defaultFilters, search: 'instável desconhecido' }), []);
});

test('shared ordering round-trips and preserves unrelated URL parameters', () => {
  const query = queryWithFilters('?origem=portfolio', { ...defaultFilters, days: 7 }, 'severity');
  assert.equal(filtersFromQuery(query).days, 7);
  assert.equal(orderFromQuery(query), 'severity');
  assert.equal(queryWithFilters(query, defaultFilters, 'newest'), '?origem=portfolio');
  assert.equal(orderFromQuery('?ordem=invalida'), 'newest');
});
