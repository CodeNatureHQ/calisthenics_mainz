'use client'

import { useEffect } from 'react'
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import type { Lang, Spot } from '@/lib/types'
import { t } from '@/lib/utils'

// Default lat/lng for known spots (fallback if DB has no lat/lng)
const FALLBACK_COORDS: Record<string, [number, number]> = {
  jgu:         [49.9926, 8.2416],
  volkspark:   [49.9878, 8.2900],
  kastel:      [50.0101, 8.2785],
  goetheplatz: [49.9984, 8.2677],
}

// Center covers all three spots
const MAINZ_CENTER: [number, number] = [49.9968, 8.2700]

function getCoords(spot: Spot): [number, number] {
  if (spot.lat != null && spot.lng != null) return [spot.lat, spot.lng]
  return FALLBACK_COORDS[spot.id] ?? MAINZ_CENTER
}

function createSpotIcon(index: number, isActive: boolean) {
  const size = 36
  const ring = isActive ? `
    <div style="
      position:absolute; inset:-6px;
      border-radius:50%;
      border:1px solid #D8FF3D;
      opacity:0.5;
      pointer-events:none;
    "></div>` : ''

  return L.divIcon({
    className: '',
    html: `
      <div style="position:relative; width:${size}px; height:${size}px;">
        ${ring}
        <div style="
          width:${size}px; height:${size}px;
          border-radius:50%;
          background:${isActive ? '#F5F3EE' : '#24242A'};
          border:2px solid ${isActive ? '#F5F3EE' : '#F5F3EE'};
          display:flex; align-items:center; justify-content:center;
          font-family:'Archivo Black',sans-serif;
          font-size:13px;
          color:${isActive ? '#0B0B0D' : '#F5F3EE'};
          box-shadow:0 4px 16px rgba(0,0,0,0.8)${isActive ? ',0 0 24px rgba(216,255,61,0.3)' : ''};
          transition:all .2s;
          cursor:pointer;
        ">${index}</div>
      </div>
    `,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2 - 4],
  })
}

function FlyToSpot({ spot }: { spot: Spot | null }) {
  const map = useMap()
  useEffect(() => {
    if (spot) {
      map.flyTo(getCoords(spot), 14, { duration: 0.8 })
    }
  }, [spot, map])
  return null
}

type Props = {
  spots: Spot[]
  activeSpot: Spot | null
  onSpotClick: (spot: Spot) => void
  lang: Lang
}

export default function LeafletMap({ spots, activeSpot, onSpotClick, lang }: Props) {
  return (
    <MapContainer
      center={MAINZ_CENTER}
      zoom={12}
      style={{ height: '100%', width: '100%' }}
      zoomControl={true}
      scrollWheelZoom={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://carto.com/attributions">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>'
        url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        subdomains="abcd"
        maxZoom={20}
      />
      <FlyToSpot spot={activeSpot} />
      {spots.map((spot, i) => (
        <Marker
          key={spot.id}
          position={getCoords(spot)}
          icon={createSpotIcon(i + 1, activeSpot?.id === spot.id)}
          eventHandlers={{ click: () => onSpotClick(spot) }}
        >
          <Popup>
            <div style={{
              fontFamily: "'Space Grotesk', sans-serif",
              minWidth: 160,
              background: '#24242A',
              color: '#F5F3EE',
              padding: '10px 12px',
              borderRadius: 8,
              fontSize: 13,
            }}>
              <strong style={{ display: 'block', marginBottom: 4, fontFamily: "'Archivo Black', sans-serif", fontSize: 14, textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                {t(spot.name, lang)}
              </strong>
              <span style={{ color: '#B8B8BD', fontSize: 12 }}>{spot.address}</span>
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
