'use client'

import { useEffect, useRef, useState } from 'react'
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import { inp } from '@/app/admin/shared'

type Props = {
  lat: string
  lng: string
  onChange: (lat: string, lng: string) => void
}

const MAINZ: [number, number] = [49.9968, 8.2700]

const PIN_ICON = L.divIcon({
  className: '',
  html: `<div style="width:24px;height:24px;border-radius:50% 50% 50% 0;background:#F5F3EE;border:2px solid #0B0B0D;transform:rotate(-45deg);box-shadow:0 2px 8px rgba(0,0,0,0.6)"></div>`,
  iconSize: [24, 24],
  iconAnchor: [12, 24],
})

type NominatimResult = { display_name: string; lat: string; lon: string }

function ClickHandler({ onClick }: { onClick: (lat: number, lng: number) => void }) {
  useMapEvents({ click: e => onClick(e.latlng.lat, e.latlng.lng) })
  return null
}

function DraggableMarker({ lat, lng, onChange }: { lat: number; lng: number; onChange: (lat: string, lng: string) => void }) {
  const markerRef = useRef<L.Marker>(null)
  return (
    <Marker
      position={[lat, lng]}
      icon={PIN_ICON}
      draggable
      ref={markerRef}
      eventHandlers={{
        dragend: () => {
          const pos = markerRef.current?.getLatLng()
          if (pos) onChange(pos.lat.toFixed(6), pos.lng.toFixed(6))
        },
      }}
    />
  )
}

export default function LocationPicker({ lat, lng, onChange }: Props) {
  const [search, setSearch] = useState('')
  const [results, setResults] = useState<NominatimResult[]>([])
  const [searching, setSearching] = useState(false)
  const [mapInstance, setMapInstance] = useState<L.Map | null>(null)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const hasPin = lat && lng && !isNaN(parseFloat(lat)) && !isNaN(parseFloat(lng))

  function handleMapClick(clickLat: number, clickLng: number) {
    onChange(clickLat.toFixed(6), clickLng.toFixed(6))
  }

  function pickResult(r: NominatimResult) {
    const la = parseFloat(r.lat).toFixed(6)
    const lo = parseFloat(r.lon).toFixed(6)
    onChange(la, lo)
    mapInstance?.flyTo([parseFloat(la), parseFloat(lo)], 16, { duration: 0.8 })
    setResults([])
    setSearch(r.display_name.split(',').slice(0, 2).join(','))
  }

  useEffect(() => {
    if (!search.trim() || search.length < 3) { setResults([]); return }
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      setSearching(true)
      try {
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(search)}&format=json&limit=5&accept-language=de`,
          { headers: { 'Accept-Language': 'de' } }
        )
        setResults(await res.json())
      } catch { setResults([]) }
      finally { setSearching(false) }
    }, 400)
  }, [search])

  const center: [number, number] = hasPin
    ? [parseFloat(lat), parseFloat(lng)]
    : MAINZ

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {/* Search */}
      <div style={{ position: 'relative' }}>
        <div style={{ position: 'relative' }}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Ort suchen (z. B. JGU Campus Mainz) …"
            style={{ ...inp, paddingRight: 36 }}
            onBlur={() => setTimeout(() => setResults([]), 150)}
          />
          {searching && (
            <div style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-mute)' }}>
              …
            </div>
          )}
        </div>
        {results.length > 0 && (
          <div style={{
            position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 1000,
            background: 'var(--bg-2)', border: '1px solid var(--line)',
            borderRadius: '0 0 8px 8px', overflow: 'hidden', marginTop: 2,
          }}>
            {results.map((r, i) => (
              <button
                key={i}
                type="button"
                onClick={() => pickResult(r)}
                style={{
                  display: 'block', width: '100%', textAlign: 'left',
                  padding: '10px 14px', background: 'transparent', border: 'none',
                  borderBottom: i < results.length - 1 ? '1px solid var(--line-soft)' : 'none',
                  color: 'var(--fg-dim)', fontSize: 13, cursor: 'pointer',
                  fontFamily: 'var(--font-sans)',
                  transition: 'background 0.1s',
                }}
                onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-3)')}
                onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >
                {r.display_name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Map */}
      <div style={{ borderRadius: 10, overflow: 'hidden', border: '1px solid var(--line)', height: 280, position: 'relative' }}>
        <MapContainer
          center={center}
          zoom={hasPin ? 15 : 12}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={false}
          ref={setMapInstance}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={19}
          />
          <ClickHandler onClick={handleMapClick} />
          {hasPin && (
            <DraggableMarker
              lat={parseFloat(lat)}
              lng={parseFloat(lng)}
              onChange={onChange}
            />
          )}
        </MapContainer>
        {!hasPin && (
          <div style={{
            position: 'absolute', bottom: 10, left: '50%', transform: 'translateX(-50%)',
            background: 'rgba(26,26,30,0.85)', backdropFilter: 'blur(8px)',
            border: '1px solid var(--line-soft)', borderRadius: 8,
            padding: '6px 14px', zIndex: 500,
            fontFamily: 'var(--font-mono)', fontSize: 10,
            color: 'var(--fg-mute)', letterSpacing: '0.06em', whiteSpace: 'nowrap',
          }}>
            Auf Karte klicken oder Ort suchen
          </div>
        )}
      </div>

      {/* Coordinates display */}
      {hasPin && (
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--fg-mute)', letterSpacing: '0.06em' }}>
            {parseFloat(lat).toFixed(5)}, {parseFloat(lng).toFixed(5)}
          </span>
          <button
            type="button"
            onClick={() => { onChange('', ''); setSearch('') }}
            style={{ fontFamily: 'var(--font-mono)', fontSize: 9, color: 'var(--danger)', background: 'none', border: 'none', cursor: 'pointer', letterSpacing: '0.06em', textTransform: 'uppercase', padding: 0 }}
          >
            Zurücksetzen
          </button>
        </div>
      )}
    </div>
  )
}
