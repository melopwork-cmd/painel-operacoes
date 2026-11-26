import type { Incident, Service } from './model.ts';

export function countByService(rows: Incident[]) {
  const counts = new Map<Service, { service: Service; total: number; active: number }>();
  for (const { service, phase } of rows) {
    const entry = counts.get(service) ?? { service, total: 0, active: 0 };
    entry.total++;
    entry.active += Number(phase !== 'resolved');
    counts.set(service, entry);
  }
  return [...counts.values()].sort((a, b) => b.total - a.total || a.service.localeCompare(b.service, 'pt-BR'));
}
