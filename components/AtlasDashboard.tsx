'use client';

import dynamic from 'next/dynamic';
import { useEffect, useMemo, useState } from 'react';
import { demoOpportunities } from '@/lib/seed-data';
import type { Opportunity, OpportunityType } from '@/lib/types';

const Globe = dynamic(() => import('./AtlasGlobe'), {
  ssr: false,
  loading: () => <div className="globe-loading"><span className="loader-orbit" />SYNCING GLOBAL OPPORTUNITIES</div>,
});

const meta: Record<OpportunityType, { label: string; color: string; short: string }> = {
  INTERNSHIP: { label: 'Internships', color: '#ff4961', short: 'INTERNSHIP' },
  JOB: { label: 'Jobs', color: '#ffc247', short: 'JOB' },
  SCHOLARSHIP: { label: 'Scholarships', color: '#3c91ff', short: 'SCHOLARSHIP' },
};

function daysLeft(deadline?: string | null) {
  if (!deadline) return null;
  return Math.max(0, Math.ceil((new Date(deadline).getTime() - Date.now()) / 86400000));
}

export default function AtlasDashboard() {
  const [items, setItems] = useState<Opportunity[]>(demoOpportunities);
  const [selected, setSelected] = useState<Opportunity | null>(demoOpportunities[0]);
  const [type, setType] = useState<'ALL' | OpportunityType>('ALL');
  const [country, setCountry] = useState('ALL');
  const [field, setField] = useState('ALL');
  const [workMode, setWorkMode] = useState('ALL');
  const [deadline, setDeadline] = useState('ALL');
  const [query, setQuery] = useState('');
  const [filtersOpen, setFiltersOpen] = useState(false);

  useEffect(() => {
    fetch('/api/opportunities')
      .then((r) => r.json())
      .then((d) => {
        const next = Array.isArray(d) ? d : Array.isArray(d?.items) ? d.items : [];
        if (next.length) {
          setItems(next);
          setSelected((current) => next.find((x: Opportunity) => x.id === current?.id) ?? next[0]);
        }
      })
      .catch(() => undefined);
  }, []);

  const countries = useMemo(() => ['ALL', ...Array.from(new Set(items.map((x) => x.country))).sort()], [items]);
  const fields = useMemo(() => ['ALL', ...Array.from(new Set(items.map((x) => x.field).filter(Boolean) as string[])).sort()], [items]);

  const filtered = useMemo(() => items.filter((x) => {
    const q = query.trim().toLowerCase();
    const searchable = [x.title, x.organization, x.country, x.city, x.field, x.description].filter(Boolean).join(' ').toLowerCase();
    const d = daysLeft(x.deadline);
    return (type === 'ALL' || x.type === type)
      && (country === 'ALL' || x.country === country)
      && (field === 'ALL' || x.field === field)
      && (workMode === 'ALL' || (x.workMode ?? '').toLowerCase().includes(workMode.toLowerCase()))
      && (deadline === 'ALL' || (deadline === '7' && d !== null && d <= 7) || (deadline === '30' && d !== null && d <= 30))
      && (!q || searchable.includes(q));
  }), [items, type, country, field, workMode, deadline, query]);

  useEffect(() => {
    if (selected && !filtered.some((x) => x.id === selected.id)) setSelected(filtered[0] ?? null);
  }, [filtered, selected]);

  const counts = useMemo(() => ({
    JOB: items.filter((x) => x.type === 'JOB').length,
    INTERNSHIP: items.filter((x) => x.type === 'INTERNSHIP').length,
    SCHOLARSHIP: items.filter((x) => x.type === 'SCHOLARSHIP').length,
  }), [items]);

  const reset = () => { setType('ALL'); setCountry('ALL'); setField('ALL'); setWorkMode('ALL'); setDeadline('ALL'); setQuery(''); };

  return (
    <main className="atlas-app">
      <header className="atlas-header">
        <div className="atlas-brand">
          <div className="atlas-logo"><span /><i /><b /></div>
          <div><strong>ATLAS</strong><small>AUTOMATED TALENT LOCATOR</small></div>
        </div>
        <div className="header-center"><span className="header-active">GLOBAL OPPORTUNITY INTELLIGENCE</span><span className="header-separator" /><span className="header-live"><i /> LIVE DATA</span></div>
        <div className="header-actions"><button aria-label="Notifications">◌</button><button aria-label="Settings">⚙</button><div className="avatar">A</div></div>
      </header>

      <section className="atlas-map-area">
        <div className="map-grid" />
        <div className="map-vignette" />
        <div className="map-title"><span>LIVE MAP</span><strong>OPPORTUNITIES AROUND THE WORLD</strong></div>

        <aside className="left-console">
          <div className="console-card overview-card">
            <div className="console-kicker">NETWORK STATUS <span><i /> OPERATIONAL</span></div>
            <div className="total-value">{filtered.length.toLocaleString()}</div>
            <div className="total-label">ACTIVE OPPORTUNITIES</div>
            <div className="mini-stats">
              {(Object.keys(meta) as OpportunityType[]).map((key) => (
                <button key={key} onClick={() => setType(type === key ? 'ALL' : key)} className={type === key ? 'mini-stat active' : 'mini-stat'}>
                  <i style={{ background: meta[key].color, boxShadow: `0 0 10px ${meta[key].color}` }} />
                  <span>{meta[key].label}</span><b>{counts[key]}</b>
                </button>
              ))}
            </div>
          </div>
          <button className="filter-trigger" onClick={() => setFiltersOpen(!filtersOpen)}><span>☷</span> FILTER NETWORK <b>{filtered.length}</b></button>
          {filtersOpen && (
            <div className="console-card filter-card">
              <Select label="TYPE" value={type} onChange={(v) => setType(v as any)} options={['ALL', 'INTERNSHIP', 'JOB', 'SCHOLARSHIP']} />
              <Select label="COUNTRY" value={country} onChange={setCountry} options={countries} />
              <Select label="FIELD" value={field} onChange={setField} options={fields} />
              <Select label="WORK MODE" value={workMode} onChange={setWorkMode} options={['ALL', 'Remote', 'Hybrid', 'On-site', 'On-campus']} />
              <Select label="DEADLINE" value={deadline} onChange={setDeadline} options={['ALL', '7', '30']} />
              <button className="clear-btn" onClick={reset}>RESET ALL FILTERS</button>
            </div>
          )}
        </aside>

        <div className="globe-container"><Globe opportunities={filtered} selected={selected} onSelect={setSelected} /></div>

        <div className="map-controls"><button onClick={() => setSelected(null)}>×</button><button onClick={reset}>↻</button></div>

        <aside className={`opportunity-panel ${selected ? 'visible' : ''}`}>
          {selected && <>
            <button className="panel-close" onClick={() => setSelected(null)}>×</button>
            <div className="panel-type" style={{ color: meta[selected.type].color }}><i style={{ background: meta[selected.type].color }} /> {meta[selected.type].short} <span>•</span> VERIFIED</div>
            <h1>{selected.title}</h1>
            <div className="org-line"><div className="org-avatar">{selected.organization.slice(0, 1).toUpperCase()}</div><span>{selected.organization}</span></div>
            <div className="panel-location"><span>⌖</span><b>{selected.city ? `${selected.city}, ` : ''}{selected.region ? `${selected.region}, ` : ''}{selected.country}</b></div>
            <div className="panel-grid">
              <Info label="FIELD" value={selected.field || 'Not specified'} />
              <Info label="EXPERIENCE" value={selected.experienceRequired || 'Student / Entry'} />
              <Info label="WORK MODE" value={selected.workMode || 'Not specified'} />
              <Info label="COMPENSATION" value={selected.salary ? `${selected.salary} ${selected.currency ?? ''}` : 'Not published'} />
            </div>
            <div className="deadline-box"><div><span>APPLICATION DEADLINE</span><strong>{selected.deadline ? new Date(selected.deadline).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : 'Not published'}</strong></div>{selected.deadline && <b>{daysLeft(selected.deadline)} DAYS LEFT</b>}</div>
            <p className="panel-description">{selected.description}</p>
            <a className="apply-btn" href={selected.applicationUrl} target="_blank" rel="noreferrer">OPEN OFFICIAL LISTING <span>↗</span></a>
            <div className="source-line">SOURCE <b>{selected.sourceName}</b>{selected.verified && <span>✓ Official source</span>}</div>
          </>}
        </aside>

        <div className="search-dock">
          <div className="search-input"><span>⌕</span><input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search companies, roles, fields, countries..." /><kbd>/</kbd></div>
          <div className="legend-dock">
            {(Object.keys(meta) as OpportunityType[]).map((key) => <button key={key} onClick={() => setType(type === key ? 'ALL' : key)}><i style={{ background: meta[key].color }} />{meta[key].label}<b>{counts[key]}</b></button>)}
          </div>
        </div>

        <div className="map-footer"><span>ATLAS GLOBAL INDEX</span><span>DATA SOURCES <b>14</b></span><span>LAST SYNC <b>LIVE</b></span><span className="coords">LAT 20.00° &nbsp; LNG 20.00°</span></div>
      </section>
    </main>
  );
}

function Select({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return <label className="select-field"><span>{label}</span><select value={value} onChange={(e) => onChange(e.target.value)}>{options.map((o) => <option key={o} value={o}>{o === 'ALL' ? 'All' : o === '7' ? 'Next 7 days' : o === '30' ? 'Next 30 days' : o}</option>)}</select></label>;
}
function Info({ label, value }: { label: string; value: string }) { return <div className="info-cell"><span>{label}</span><b>{value}</b></div>; }
