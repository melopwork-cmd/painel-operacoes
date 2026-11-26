import { StrictMode, useEffect, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { incidents } from './incidents.ts';
import {
  orderFromQuery, orderIncidents, dailyCounts, dateLabel, defaultFilters, exportCsv, filterIncidents, filtersFromQuery,
  phases, queryWithFilters, services, severities, snapshot,
} from './model.ts';
import type { Filters, Incident } from './model.ts';
import './style.css';

function Details({ incident, onClose }: { incident: Incident; onClose: () => void }) {
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (dialog.current && !dialog.current.open) dialog.current.showModal();
  }, []);
  return (
    <dialog ref={dialog} onClose={onClose} aria-labelledby="detail-title">
      <div className="dialog-top">
        <p className="incident-id">{incident.id} · {incident.service}</p>
        <button type="button" className="secondary" onClick={() => dialog.current?.close()}>Fechar</button>
      </div>
      <h2 id="detail-title">{incident.title}</h2>
      <div className="dialog-meta">
        <span className={'pill ' + incident.phase}>{phases[incident.phase]}</span>
        <span className={'severity ' + incident.severity}>{severities[incident.severity]}</span>
        <time dateTime={incident.date}>{dateLabel(incident.date)}</time>
      </div>
      <p>{incident.summary}</p>
    </dialog>
  );
}

function App() {
  const [filters, setFilters] = useState<Filters>(() => filtersFromQuery(window.location.search));
  const [order, setOrder] = useState(() => orderFromQuery(window.location.search));
  const [selected, setSelected] = useState<Incident | null>(null);
  useEffect(() => {
    const onNavigate = () => {
      setFilters(filtersFromQuery(window.location.search));
      setOrder(orderFromQuery(window.location.search));
    };
    window.addEventListener('popstate', onNavigate);
    return () => window.removeEventListener('popstate', onNavigate);
  }, []);

  useEffect(() => {
    const next = queryWithFilters(window.location.search, filters, order);
    if (next !== window.location.search) {
      const route = window.location.pathname + next + window.location.hash;
      window.history.replaceState(window.history.state, '', route);
    }
  }, [filters, order]);

  const hasFilters = (Object.keys(defaultFilters) as (keyof Filters)[])
    .some(key => filters[key] !== defaultFilters[key]);
  const rows = orderIncidents(filterIncidents(incidents, filters), order);
  const trend = dailyCounts(rows, filters.days);
  const max = Math.max(1, ...trend.map(day => day.total));
  const metrics = [
    { label: 'Incidentes abertos', count: rows.filter(row => row.phase === 'open').length, theme: 'warm' },
    { label: 'Em monitoramento', count: rows.filter(row => row.phase === 'monitoring').length, theme: 'blue' },
    { label: 'Resolvidos', count: rows.filter(row => row.phase === 'resolved').length, theme: 'green' },
  ];

  function update<K extends keyof Filters>(key: K, value: Filters[K]) {
    setFilters(current => ({ ...current, [key]: value }));
  }

  function download() {
    const url = URL.createObjectURL(new Blob([exportCsv(rows)], { type: 'text/csv;charset=utf-8' }));
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'incidentes.csv';
    anchor.click();
    window.setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  return (
    <>
      <a className="skip-link" href="#incidentes">Ir para incidentes</a>
      <header className="topbar">
        <div className="frame topbar-inner">
          <a href="#" className="brand"><span className="brand-mark" aria-hidden="true"><i/><i/><i/></span> Operações</a>
          <span className="dataset"><time dateTime={snapshot}>26 nov. 2026</time><span aria-hidden="true">·</span> Dados simulados</span>
        </div>
      </header>
      <main className="frame page">
        <div className="page-header">
          <div><h1>Central de Operações</h1><p>Acompanhe os incidentes dos seus serviços.</p></div>
          <label className="period">Período
            <select aria-label="Período" value={filters.days} onChange={event => update('days', Number(event.target.value) as Filters['days'])}>
              <option value={7}>Últimos 7 dias</option>
              <option value={14}>Últimos 14 dias</option>
              <option value={30}>Últimos 30 dias</option>
            </select>
          </label>
        </div>

        <div className="metrics" aria-label="Resumo dos incidentes">
          {metrics.map(metric => <section key={metric.label} className={'metric ' + metric.theme}>
            <h2>{metric.label}</h2>
            <p>{metric.count}</p>
          </section>)}
        </div>

        <section className="card trend" aria-labelledby="trend-title">
          <div className="card-heading">
            <h2 id="trend-title">Incidentes por dia</h2>
            <ul className="legend"><li><i/> Abertos ou monitorando</li><li><i/> Resolvidos</li></ul>
          </div>
          <ol className="chart" aria-label="Contagem diária no período selecionado">
            {trend.map((day, index) => {
              const label = dateLabel(day.date);
              const active = day.total - day.resolved;
              const step = filters.days > 14 ? 5 : filters.days > 7 ? 2 : 1;
              const last = trend.length - 1;
              const show = index === last || (index % step === 0 && last - index >= step);
              return (
                <li key={day.date} aria-label={label + ', ' + day.total + ' incidentes, ' + day.resolved + ' resolvidos'}
                    title={label + ' · ' + day.total + ' incidentes'}>
                  <div className="column" aria-hidden="true">
                    <span className="segment active" style={{ height: (active / max) * 100 + '%' }} />
                    <span className="segment resolved" style={{ height: (day.resolved / max) * 100 + '%' }} />
                  </div>
                  <span className="axis-label" aria-hidden="true">{show ? label.replace(/\s+de\s+/g, ' ') : '\u00a0'}</span>
                </li>
              );
            })}
          </ol>
        </section>

        <section className="card" id="incidentes" aria-labelledby="incident-title">
          <div className="card-heading">
            <h2 id="incident-title">Incidentes</h2>
            <div className="table-actions">
              {hasFilters && <button className="secondary" type="button" onClick={() => setFilters(defaultFilters)}>Limpar filtros</button>}
              <button className="secondary" type="button" disabled={rows.length === 0} onClick={download}>Exportar CSV</button>
            </div>
          </div>
          <div className="filters">
            <label className="search">Buscar
              <input type="search" value={filters.search} placeholder="Título, resumo, serviço ou ID"
                     onChange={event => update('search', event.target.value)} />
            </label>
            <label>Status
              <select aria-label="Status" value={filters.phase} onChange={event => update('phase', event.target.value as Filters['phase'])}>
                <option value="all">Todos os status</option>
                {Object.entries(phases).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
              </select>
            </label>
            <label>Severidade
              <select aria-label="Severidade" value={filters.severity} onChange={event => update('severity', event.target.value as Filters['severity'])}>
                <option value="all">Todas as severidades</option>
                {Object.entries(severities).map(([key, label]) => <option key={key} value={key}>{label}</option>)}
              </select>
            </label>
            <label>Serviço
              <select aria-label="Serviço" value={filters.service} onChange={event => update('service', event.target.value as Filters['service'])}>
                <option value="all">Todos os serviços</option>
                {services.map(service => <option key={service} value={service}>{service}</option>)}
              </select>
            </label>
          </div>
          <div className="table-controls">
            <label>Ordenar por
              <select value={order} onChange={event => setOrder(event.target.value as typeof order)}>
                <option value="newest">Mais recentes</option>
                <option value="oldest">Mais antigos</option>
                <option value="severity">Severidade</option>
                <option value="service">Serviço</option>
              </select>
            </label>
          </div>
          {rows.length ? (
            <div className="table-overflow" tabIndex={0} aria-label="Tabela de incidentes" role="region">
              <table>
                <thead><tr><th>Incidente</th><th>Serviço</th><th>Severidade</th><th>Status</th><th>Data</th></tr></thead>
                <tbody>
                  {rows.map(incident => (
                    <tr key={incident.id}>
                      <th scope="row">
                        <button className="incident-link" type="button" onClick={() => setSelected(incident)}>
                          {incident.title}<span className="incident-id">{incident.id}</span>
                        </button>
                      </th>
                      <td>{incident.service}</td>
                      <td><span className={'severity ' + incident.severity}>{severities[incident.severity]}</span></td>
                      <td><span className={'pill ' + incident.phase}>{phases[incident.phase]}</span></td>
                      <td><time dateTime={incident.date}>{dateLabel(incident.date)}</time></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : <div className="empty"><p>Nenhum incidente encontrado.</p></div>}
          <p className="results" aria-live="polite">{rows.length === 1 ? '1 incidente' : rows.length + ' incidentes'}</p>
        </section>
      </main>
      {selected && <Details incident={selected} onClose={() => setSelected(null)} />}
    </>
  );
}

createRoot(document.getElementById('root')!).render(<StrictMode><App /></StrictMode>);
