"use client"

import { MapContainer, TileLayer, Marker } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import { useEffect, useState } from "react"

export default function Map({ properties }: { properties: any[] }) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null
  const priceIcon = (price: number) =>
    L.divIcon({
      className: "price-icon",
      html: '<div class="bubble">₦' + price + '</div>',
      iconSize: [80, 40],
      iconAnchor: [40, 20],
    })
    return (
      <MapContainer
        center={[6.5244, 3.3792]}
        zoom={13}
        style={{ height: "100vh", width: "100%" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
  
        {properties.map((p) => (
          <Marker
          key={p.id}
          position={[p.latitude, p.longitude]}
          icon={priceIcon(p.price)}
        />
        ))}
      </MapContainer>
    )
  }