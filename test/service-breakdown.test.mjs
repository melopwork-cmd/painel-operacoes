import assert from 'node:assert/strict';
import test from 'node:test';
import { incidents } from '../src/incidents.ts';
import { countByService } from '../src/service-breakdown.ts';

test('service breakdown counts active and resolved incidents independently', () => {
  const rows = [
    { ...incidents[0], service: 'Pagamentos', phase: 'resolved' },
    { ...incidents[0], service: 'Pagamentos', phase: 'monitoring' },
    { ...incidents[0], service: 'Identidade', phase: 'open' },
  ];
  assert.deepEqual(countByService(rows), [
    { service: 'Pagamentos', total: 2, active: 1 },
    { service: 'Identidade', total: 1, active: 1 },
  ]);
  assert.deepEqual(countByService([]), []);
});
