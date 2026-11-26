export type Severity = 'critical' | 'major' | 'minor';
export type IncidentOrder = 'newest' | 'oldest' | 'severity';
export type Phase = 'open' | 'monitoring' | 'resolved';
export type Service = 'Pagamentos' | 'API pública' | 'Identidade' | 'Notificações';

export type Incident = {
  id: string;
  title: string;
  service: Service;
  severity: Severity;
  phase: Phase;
  date: string;
  summary: string;
};

export type Filters = {
  days: 7 | 14 | 30;
  phase: Phase | 'all';
  service: Service | 'all';
  search: string;
};

export const defaultFilters: Filters = { days: 14, phase: 'all', service: 'all', search: '' };
export const snapshot = '2026-11-26';
export const phases: Record<Phase, string> = { open: 'Aberto', monitoring: 'Monitorando', resolved: 'Resolvido' };
export const severities: Record<Severity, string> = { critical: 'Crítica', major: 'Alta', minor: 'Moderada' };
export const services: Service[] = ['Pagamentos', 'API pública', 'Identidade', 'Notificações'];

export function filtersFromQuery(query: string): Filters {
  const params = new URLSearchParams(query);
  const days = Number(params.get('dias'));
  const phase = params.get('status') ?? '';
  const service = services.find(value => value === params.get('servico'));
  return {
    days: days === 7 || days === 14 || days === 30 ? days : defaultFilters.days,
    phase: Object.hasOwn(phases, phase) ? phase as Phase : defaultFilters.phase,
    service: service ?? defaultFilters.service,
    search: params.get('q') ?? defaultFilters.search,
  };
}

export function queryWithFilters(query: string, filters: Filters): string {
  const params = new URLSearchParams(query);
  const keys = { days: 'dias', phase: 'status', service: 'servico', search: 'q' } as const;
  for (const key of Object.keys(keys) as (keyof Filters)[]) {
    if (filters[key] === defaultFilters[key]) params.delete(keys[key]);
    else params.set(keys[key], String(filters[key]));
  }
  const search = params.toString();
  return search ? '?' + search : '';
}

const dayMs = 86_400_000;
const parseDay = (date: string) => Date.parse(date + 'T00:00:00Z');
const clean = (text: string) => text.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLocaleLowerCase('pt-BR').trim();

export function dateLabel(date: string) {
  return new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', timeZone: 'UTC' }).format(parseDay(date));
}

export function filterIncidents(incidents: Incident[], filters: Filters) {
  const end = parseDay(snapshot);
  const start = end - (filters.days - 1) * dayMs;
  const query = clean(filters.search);
  return incidents
    .filter(item => parseDay(item.date) >= start && parseDay(item.date) <= end)
    .filter(item => filters.phase === 'all' || item.phase === filters.phase)
    .filter(item => filters.service === 'all' || item.service === filters.service)
    .filter(item => !query || clean([item.id, item.title, item.service].join(' ')).includes(query))
    .sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));
}

export function orderIncidents(rows: Incident[], order: IncidentOrder) {
  const severityRank = { critical: 0, major: 1, minor: 2 };
  return [...rows].sort((a, b) => {
    const newestFirst = b.date.localeCompare(a.date) || b.id.localeCompare(a.id);
    if (order === 'oldest') return -newestFirst;
    if (order === 'severity') return severityRank[a.severity] - severityRank[b.severity] || newestFirst;
    return newestFirst;
  });
}

export function dailyCounts(incidents: Incident[], days = 7) {
  const end = parseDay(snapshot);
  return Array.from({ length: days }, (_, index) => {
    const date = new Date(end - (days - 1 - index) * dayMs).toISOString().slice(0, 10);
    const entries = incidents.filter(item => item.date === date);
    return { date, total: entries.length, resolved: entries.filter(item => item.phase === 'resolved').length };
  });
}

function csvCell(value: string) {
  const safe = /^[\u0000-\u0020]*[=+\-@]|^[\t\r\n]/.test(value) ? "'" + value : value;
  return '"' + safe.replace(/"/g, '""') + '"';
}

export function exportCsv(incidents: Incident[]) {
  const header = ['ID', 'Incidente', 'Serviço', 'Severidade', 'Status', 'Data'];
  const rows = incidents.map(item => [
    item.id, item.title, item.service, severities[item.severity], phases[item.phase], item.date,
  ]);
  return '\ufeff' + [header, ...rows].map(row => row.map(csvCell).join(';')).join('\r\n') + '\r\n';
}
