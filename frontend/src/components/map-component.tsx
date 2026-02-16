"use client"

import { useEffect, useState } from "react"
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet"
import "leaflet/dist/leaflet.css"
import L from "leaflet"

// Fix for default marker icon in Next.js
const icon = L.icon({
    iconUrl: "/marker-icon.png",
    iconRetinaUrl: "/marker-icon-2x.png",
    shadowUrl: "/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
})

export default function MapComponent() {
    // Optimized: Moved ssr check to parent or dynamic import
    // const [isMounted, setIsMounted] = useState(false)
    // useEffect(() => { setIsMounted(true) }, [])
    // if (!isMounted) return <div className="...Loading..." />

    // We can directly return the MapContainer, assuming dynamic import with ssr: false is used.


    return (
        <MapContainer
            center={[11.0168, 76.9558]} // Coimbatore, India
            zoom={13}
            scrollWheelZoom={false}
            className="h-[400px] w-full rounded-lg shadow-md z-0"
        >
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={[11.0168, 76.9558]} icon={icon}>
                <Popup>
                    Coimbatore, India
                </Popup>
            </Marker>
        </MapContainer>
    )
}
