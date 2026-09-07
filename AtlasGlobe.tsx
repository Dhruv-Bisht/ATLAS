'use client';

import GlobeGL from 'react-globe.gl';
import * as THREE from 'three';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { Opportunity } from '@/lib/types';

type Props = {
  opportunities: Opportunity[];
  selected: Opportunity | null;
  onSelect: (o: Opportunity) => void;
};

const pinColor = (type: Opportunity['type']) =>
  type === 'INTERNSHIP' ? '#ff4056' : type === 'JOB' ? '#ffbd2e' : '#3288ff';

function useSize() {
  const [size, setSize] = useState({ w: 900, h: 680 });
  useEffect(() => {
    const update = () =>
      setSize({
        w: Math.min(1180, Math.max(560, window.innerWidth - (window.innerWidth < 1050 ? 60 : 470))),
        h: Math.min(880, Math.max(520, window.innerHeight - (window.innerWidth < 850 ? 260 : 175))),
      });
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);
  return size;
}

export default function AtlasGlobe({ opportunities, selected, onSelect }: Props) {
  const ref = useRef<any>(null);
  const { w, h } = useSize();

  // Initial camera + gentle auto-rotate.
  useEffect(() => {
    if (!ref.current) return;
    const controls = ref.current.controls();
    controls.autoRotate = true;
    controls.autoRotateSpeed = 0.22;
    controls.enablePan = false;
    controls.enableZoom = true;
    controls.minDistance = 145;
    controls.maxDistance = 480;
    controls.addEventListener('start', () => { controls.autoRotate = false; });
    ref.current.pointOfView({ lat: 18, lng: 25, altitude: 2.1 }, 0);
  }, []);

  // Richer, more "realistic" lighting: warm key light + cool rim light + brighter ambient
  // so the night-side city lights and coastline bump-map actually read as lit terrain
  // rather than a flat texture.
  useEffect(() => {
    if (!ref.current) return;
    const scene: THREE.Scene = ref.current.scene();

    scene.children.forEach((child: any) => {
      if (child.isAmbientLight) child.intensity = 1.15;
      if (child.isDirectionalLight) {
        child.intensity = 0.9;
        child.color = new THREE.Color('#eaf1ff');
      }
    });

    const key = new THREE.PointLight('#ffd9a8', 1.1, 900);
    key.position.set(260, 180, 260);
    key.name = 'atlas-key-light';

    const rim = new THREE.PointLight('#2f7dff', 1.4, 900);
    rim.position.set(-280, -120, -220);
    rim.name = 'atlas-rim-light';

    if (!scene.getObjectByName('atlas-key-light')) scene.add(key);
    if (!scene.getObjectByName('atlas-rim-light')) scene.add(rim);

    return () => {
      scene.remove(key);
      scene.remove(rim);
    };
  }, [w, h]);

  // Fly to the selected opportunity.
  useEffect(() => {
    if (selected && ref.current) {
      ref.current.pointOfView(
        { lat: selected.latitude, lng: selected.longitude, altitude: selected.city ? 0.55 : 1.05 },
        1200
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
    // Re-creating the array (new object identities) when the selection changes
    // forces react-globe.gl to rebuild each pin's DOM element, so the
    // "is-selected" class (and its pop/glow animation) actually applies.
    [opportunities, selected?.id]
  );

  const selectedRing = selected ? [selected] : [];

  return (
    <div className="globe-wrap">
      <GlobeGL
        ref={ref}
        width={w}
        height={h}
        backgroundColor="rgba(0,0,0,0)"
        globeImageUrl="https://unpkg.com/three-globe/example/img/earth-night.jpg"
        bumpImageUrl="https://unpkg.com/three-globe/example/img/earth-topology.png"
        atmosphereColor="#3d8bff"
        atmosphereAltitude={0.16}
        showAtmosphere
        htmlElementsData={points}
        htmlLat="latitude"
        htmlLng="longitude"
        htmlAltitude={0.03}
        htmlTransitionDuration={350}
        htmlElement={(d: any) => {
          const el = document.createElement('button');
          el.className = 'atlas-map-pin' + (selected?.id === d.id ? ' is-selected' : '');
          el.type = 'button';
          el.setAttribute('aria-label', `${d.title} — ${d.__label}`);
          el.style.setProperty('--pin-color', d.__color);
          el.innerHTML =
            '<span class="atlas-pin-shape"><span class="atlas-pin-dot"></span></span>' +
            `<span class="atlas-pin-label"><b>${d.city ?? d.country}</b><small>${d.organization}</small></span>`;
          el.onclick = (event) => {
            event.stopPropagation();
            onSelect(d);
          };
          return el;
        }}
        ringsData={selectedRing}
        ringLat="latitude"
        ringLng="longitude"
        ringColor={() => (selected ? pinColor(selected.type) : '#3288ff')}
        ringMaxRadius={3.2}
        ringPropagationSpeed={1.8}
        ringRepeatPeriod={1200}
      />
    </div>
  );
}
