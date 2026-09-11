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

const MAINZ_CENTER: [number, number] = [49.9968, 8.2700]

function getCoords(spot: Spot): [number, number] {
  if (spot.lat != null && spot.lng != null) return [spot.lat, spot.lng]
  return FALLBACK_COORDS[spot.id] ?? MAINZ_CENTER
}

function createSpotIcon(index: number, isActive: boolean) {
  const size = 34
  return L.divIcon({
    className: '',
    html: `<div class="spot-marker" data-active="${isActive}">${String(index).padStart(2, '0')}</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -size / 2 - 4],
  })
}

function FlyToSpot({ spot }: { spot: Spot | null }) {
  const map = useMap()
  useEffect(() => {
    if (spot) map.flyTo(getCoords(spot), 14, { duration: 0.8 })
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
    <MapContainer center={MAINZ_CENTER} zoom={12} style={{ height: '100%', width: '100%' }} zoomControl scrollWheelZoom={false}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
        maxZoom={19}
      />
      <FlyToSpot spot={activeSpot} />
      {spots.map((spot, i) => (
        <Marker key={spot.id} position={getCoords(spot)} icon={createSpotIcon(i + 1, activeSpot?.id === spot.id)} eventHandlers={{ click: () => onSpotClick(spot) }}>
          <Popup>
            <strong style={{ display: 'block', marginBottom: 4, fontFamily: 'var(--font-display)', fontSize: 20, lineHeight: 1, textTransform: 'uppercase' }}>{t(spot.name, lang)}</strong>
            <span style={{ color: 'var(--fg-dim)', fontSize: 12 }}>{spot.address}</span>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  )
}
