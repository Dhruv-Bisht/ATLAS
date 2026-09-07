'use client';

import GlobeGL from 'react-globe.gl';
import { useEffect, useMemo, useRef } from 'react';
import type { Opportunity } from '@/lib/types';

type Props = {
  opportunities: Opportunity[];
  selected: Opportunity | null;
  onSelect: (o: Opportunity) => void;
};

const pinColor = (type: Opportunity['type']) =>
  type === 'INTERNSHIP' ? '#ff4056' : type === 'JOB' ? '#ffbd2e' : '#3288ff';

export default function AtlasGlobe({ opportunities, selected, onSelect }: Props) {
  const ref = useRef<any>(null);

  useEffect(() => {
    if (!ref.current) return;
    const controls = ref.current.controls();
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.18;
    controls.enablePan = false;
    controls.enableZoom = true;
    ref.current.pointOfView({ lat: 20, lng: 20, altitude: 2.05 }, 900);
  }, []);

  useEffect(() => {
    if (selected && ref.current) {
      ref.current.pointOfView(
        {
          lat: selected.latitude,
          lng: selected.longitude,
          altitude: selected.city ? 0.68 : 1.18,
        },
        1100
      );
    }
  }, [selected]);

  const points = useMemo(
    () =>
      opportunities.map((o) => ({
        ...o,
        __color: pinColor(o.type),
        __label: o.city ? `${o.city}, ${o.country}` : o.country,
      })),
    [opportunities]
  );

  const labels = useMemo(
    () =>
      opportunities.map((o) => ({
        ...o,
        __color: pinColor(o.type),
        __label: o.city ? `${o.city}, ${o.country}` : o.country,
      })),
    [opportunities]
  );

  const selectedRing = selected ? [selected] : [];

  return (
    <div className="globe-wrap">
      <GlobeGL
        ref={ref}
        width={typeof window !== 'undefined' ? Math.min(920, Math.max(620, window.innerWidth - 570)) : 820}
        height={typeof window !== 'undefined' ? Math.max(590, window.innerHeight - 205) : 680}
        backgroundColor="rgba(0,0,0,0)"
        globeImageUrl="https://unpkg.com/three-globe/example/img/earth-night.jpg"
        bumpImageUrl="https://unpkg.com/three-globe/example/img/earth-topology.png"
        atmosphereColor="#2477ff"
        atmosphereAltitude={0.09}
        showAtmosphere
        htmlElementsData={points}
        htmlLat="latitude"
        htmlLng="longitude"
        htmlAltitude={0.045}
        htmlElement={(d: any) => {
          const el = document.createElement('button');
          el.className = 'atlas-map-pin';
          el.type = 'button';
          el.setAttribute('aria-label', `${d.title} — ${d.__label}`);
          el.style.setProperty('--pin-color', d.__color);
          el.innerHTML = `<span class="atlas-pin-shape"><span class="atlas-pin-dot"></span></span><span class="atlas-pin-label"><b>${d.city ?? d.country}</b><small>${d.organization}</small></span>`;
          el.onclick = (event) => {
            event.stopPropagation();
            onSelect(d);
          };
          return el;
        }}
        ringsData={selectedRing}
        ringLat="latitude"
        ringLng="longitude"
        ringColor={() => selected ? pinColor(selected.type) : '#3288ff'}
        ringMaxRadius={2.7}
        ringPropagationSpeed={1.6}
        ringRepeatPeriod={1200}
        labelsData={selected ? [selected] : []}
        labelLat="latitude"
        labelLng="longitude"
        labelText={(d: any) => d.city ? `${d.city}, ${d.country}` : d.country}
        labelSize={0.8}
        labelDotRadius={0.22}
        labelColor={(d: any) => pinColor(d.type)}
        labelResolution={2}
      />
    </div>
  );
}
