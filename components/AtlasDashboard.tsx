'use client';
import dynamic from 'next/dynamic';
import { useEffect, useMemo, useState } from 'react';
import { demoOpportunities } from '@/lib/seed-data';
import type { Opportunity, OpportunityType } from '@/lib/types';

const Globe = dynamic(() => import('./AtlasGlobe'), { ssr:false, loading:()=> <div className="globe-loading">INITIALIZING ATLAS…</div> });

const typeMeta:{[K in OpportunityType]:{label:string; color:string; icon:string}}={
  INTERNSHIP:{label:'Internships',color:'#ff4056',icon:'◆'}, JOB:{label:'Jobs',color:'#ffbd2e',icon:'◆'}, SCHOLARSHIP:{label:'Scholarships',color:'#3288ff',icon:'◆'}
};

function daysLeft(deadline?:string|null){ if(!deadline) return null; return Math.max(0,Math.ceil((new Date(deadline).getTime()-Date.now())/86400000)); }

export default function AtlasDashboard(){
  const [items,setItems]=useState<Opportunity[]>(demoOpportunities);
  const [selected,setSelected]=useState<Opportunity|null>(demoOpportunities[1]);
  const [type,setType]=useState<'ALL'|OpportunityType>('ALL');
  const [country,setCountry]=useState('ALL');
  const [field,setField]=useState('ALL');
  const [workMode,setWorkMode]=useState('ALL');
  const [experience,setExperience]=useState('ALL');
  const [deadline,setDeadline]=useState('ALL');
  const [query,setQuery]=useState('');

  useEffect(()=>{fetch('/api/opportunities').then(r=>r.json()).then(d=>Array.isArray(d)&&d.length&&setItems(d)).catch(()=>{});},[]);

  const countries=useMemo(()=>['ALL',...Array.from(new Set(items.map(x=>x.country))).sort()],[items]);
  const fields=useMemo(()=>['ALL',...Array.from(new Set(items.map(x=>x.field).filter(Boolean) as string[])).sort()],[items]);
  const filtered=useMemo(()=>items.filter(x=>{
    const q=query.toLowerCase();
    const matchQ=!q || [x.title,x.organization,x.country,x.city,x.field].filter(Boolean).join(' ').toLowerCase().includes(q);
    const d=daysLeft(x.deadline);
    return (type==='ALL'||x.type===type)&&(country==='ALL'||x.country===country)&&(field==='ALL'||x.field===field)&&(workMode==='ALL'||(x.workMode??'').toLowerCase().includes(workMode.toLowerCase()))&&(experience==='ALL'||(x.experienceRequired??'').includes(experience))&&(deadline==='ALL'||(deadline==='7'&&d!==null&&d<=7)||(deadline==='30'&&d!==null&&d<=30))&&matchQ;
  }),[items,type,country,field,workMode,experience,deadline,query]);
  const counts={JOB:items.filter(x=>x.type==='JOB').length,INTERNSHIP:items.filter(x=>x.type==='INTERNSHIP').length,SCHOLARSHIP:items.filter(x=>x.type==='SCHOLARSHIP').length};

  function reset(){setType('ALL');setCountry('ALL');setField('ALL');setWorkMode('ALL');setExperience('ALL');setDeadline('ALL');setQuery('');}

  return <main className="atlas-shell">
    <header className="topbar">
      <div className="brand"><div className="brand-mark">◎</div><div><div className="brand-name">ATLAS</div><div className="brand-sub">AUTOMATED TALENT LOCATOR &amp; APPLICATION SYSTEM</div></div></div>
      <nav><span>EXPLORE</span><span>APPLY</span><span>BUILD YOUR FUTURE</span></nav>
      <div className="live"><i/> LIVE <button className="search-top">⌕</button></div>
    </header>

    <section className="workspace">
      <aside className="left-rail">
        <button className="inbox">♧ &nbsp; INBOX <b>3</b></button>
        <div className="stat-card"><div className="eyebrow">TOTAL OPPORTUNITIES</div><div className="big-number">{filtered.length.toLocaleString()} <small>● Live</small></div><div className="stat-row"><em style={{color:typeMeta.INTERNSHIP.color}}>◆</em> Internships <strong>{counts.INTERNSHIP}</strong></div><div className="stat-row"><em style={{color:typeMeta.JOB.color}}>◆</em> Jobs <strong>{counts.JOB}</strong></div><div className="stat-row"><em style={{color:typeMeta.SCHOLARSHIP.color}}>◆</em> Scholarships <strong>{counts.SCHOLARSHIP}</strong></div></div>
        <button className="settings">⚙ &nbsp; SETTINGS</button>
      </aside>

      <div className="globe-stage"><Globe opportunities={filtered} selected={selected} onSelect={setSelected}/><div className="timeline"><span>1M</span><div className="track"><div className="thumb"/></div><span>6M</span><span>1Y</span><span>ALL</span></div></div>

      <aside className="details-panel">{selected ? <div className="detail-card"><button className="close" onClick={()=>setSelected(null)}>×</button><div className="pin-title"><span style={{color:typeMeta[selected.type].color}}>◆</span><div><h1>{selected.title}</h1><h2>{selected.organization}</h2></div></div><span className="type-pill" style={{borderColor:typeMeta[selected.type].color,color:typeMeta[selected.type].color}}>{typeMeta[selected.type].label.slice(0,-1).toUpperCase()}</span><div className="detail-lines"><p>⌖ <b>{selected.city ? `${selected.city}, `:''}{selected.region ? `${selected.region}, `:''}{selected.country}</b></p><p>▣ <b>{selected.workMode ?? 'Not specified'}</b></p><p>♙ <b>{selected.experienceRequired ?? 'Not specified'}</b></p>{selected.salary&&<p>◉ <b>{selected.salary} {selected.currency ?? ''}</b></p>}{selected.deadline ? <p>▣ <b>Deadline: {new Date(selected.deadline).toLocaleDateString('en-GB',{day:'2-digit',month:'short',year:'numeric'})}</b> <span className="days">{daysLeft(selected.deadline)} days left</span></p> : <p>▣ <b>Deadline: Not published by source</b></p>}</div><p className="description">{selected.description}</p><a className="apply" href={selected.applicationUrl} target="_blank" rel="noreferrer">View Opportunity ↗</a><a className="company-link" href={selected.sourceUrl ?? selected.applicationUrl} target="_blank" rel="noreferrer">↗ &nbsp; Source: {selected.sourceName}</a>{selected.verified&&<div className="verified">✓ Verified official source</div>}</div>:<div className="empty-detail">SELECT A PIN<br/><small>Choose an opportunity on the globe.</small></div>}</aside>
    </section>

    <section className="filters"><div className="filter-title">⌯ &nbsp; Filters</div><Filter label="Type" value={type} onChange={v=>setType(v as any)} options={['ALL','INTERNSHIP','JOB','SCHOLARSHIP']}/><Filter label="Country" value={country} onChange={setCountry} options={countries}/><Filter label="Field of Study" value={field} onChange={setField} options={fields}/><Filter label="Work Mode" value={workMode} onChange={setWorkMode} options={['ALL','Remote','Hybrid','On-site','On-campus']}/><Filter label="Experience Level" value={experience} onChange={setExperience} options={['ALL','0–2 years','Students / 0–1 year']}/><Filter label="Deadline" value={deadline} onChange={setDeadline} options={['ALL','7','30']}/><button className="reset" onClick={reset}>↻ Reset</button><input className="keyword" value={query} onChange={e=>setQuery(e.target.value)} placeholder="⌕  Search by keyword..."/></section>
    <div className="legend"><span><i style={{background:typeMeta.INTERNSHIP.color}}/> INTERNSHIPS</span><span><i style={{background:typeMeta.JOB.color}}/> JOBS</span><span><i style={{background:typeMeta.SCHOLARSHIP.color}}/> SCHOLARSHIPS</span></div>
  </main>
}
function Filter({label,value,onChange,options}:{label:string;value:string;onChange:(v:string)=>void;options:string[]}){return <label className="filter"><span>{label}</span><select value={value} onChange={e=>onChange(e.target.value)}>{options.map(o=><option key={o} value={o}>{o==='ALL'?'All':o==='7'?'Next 7 days':o==='30'?'Next 30 days':o}</option>)}</select></label>}
