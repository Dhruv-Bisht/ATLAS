'use client';
import GlobeGL from 'react-globe.gl';
import { useEffect, useMemo, useRef } from 'react';
import type { Opportunity } from '@/lib/types';

export default function AtlasGlobe({opportunities,selected,onSelect}:{opportunities:Opportunity[];selected:Opportunity|null;onSelect:(o:Opportunity)=>void}){
 const ref=useRef<any>();
 useEffect(()=>{ if(ref.current){ref.current.controls().autoRotate=true;ref.current.controls().autoRotateSpeed=0.22;ref.current.controls().enablePan=false;ref.current.pointOfView({lat:20,lng:20,altitude:2.15},800);}},[]);
 useEffect(()=>{if(selected&&ref.current){ref.current.pointOfView({lat:selected.latitude,lng:selected.longitude,altitude:selected.city?0.72:1.35},1000);}},[selected]);
 const points=useMemo(()=>opportunities.map(o=>({...o,label:o.city?`${o.city}, ${o.country}`:o.country,color:o.type==='INTERNSHIP'?'#ff4056':o.type==='JOB'?'#ffbd2e':'#3288ff'})),[opportunities]);
 return <div className="globe-wrap"><GlobeGL ref={ref} width={window.innerWidth>1500?940:760} height={Math.max(610,window.innerHeight-205)} backgroundColor="rgba(0,0,0,0)" globeImageUrl="https://unpkg.com/three-globe/example/img/earth-night.jpg" bumpImageUrl="https://unpkg.com/three-globe/example/img/earth-topology.png" atmosphereColor="#2477ff" atmosphereAltitude={0.08} pointsData={points} pointLat="latitude" pointLng="longitude" pointColor="color" pointAltitude={0.025} pointRadius={0.38} pointsMerge={false} onPointClick={(p:any)=>onSelect(p)} pointLabel={(p:any)=>`<div style="padding:5px 8px;background:#050914;border:1px solid ${p.color};border-radius:5px;color:white">${p.title}<br/><span style="opacity:.7">${p.label}</span></div>`} ringsData={selected?[selected]:[]} ringLat="latitude" ringLng="longitude" ringColor={()=>selected?.type==='INTERNSHIP'?'#ff4056':selected?.type==='JOB'?'#ffbd2e':'#3288ff'} ringMaxRadius={2.2} ringPropagationSpeed={1.5} ringRepeatPeriod={1100} labelsData={selected?[selected]:[]} labelLat="latitude" labelLng="longitude" labelText={(d:any)=>d.city?`${d.city}, ${d.country}`:d.country} labelSize={0.85} labelDotRadius={0.28} labelColor={(d:any)=>d.type==='INTERNSHIP'?'#ff4056':d.type==='JOB'?'#ffbd2e':'#3288ff'} labelResolution={2}/></div>
}
