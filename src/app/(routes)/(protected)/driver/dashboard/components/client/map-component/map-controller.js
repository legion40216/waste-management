"use client"
import { useEffect, useRef } from "react"
import { useMap } from "react-leaflet"

export function MapController({ currentLocation, flyToLocation, setCenter }) {
  const map = useMap()
  const isFlying = useRef(false)

  useEffect(() => {
    if (flyToLocation && !isFlying.current) {
      isFlying.current = true
      map.flyTo([flyToLocation.lat, flyToLocation.lng], 15, {
        duration: 2,
        easeLinearity: 0.25,
      })
      setTimeout(() => {
        isFlying.current = false
      }, 2000)
    }
  }, [flyToLocation, map])

  useEffect(() => {
    const handleMoveEnd = () => {
      if (!isFlying.current) {
        const newCenter = map.getCenter()
        setCenter({ lat: newCenter.lat, lng: newCenter.lng })
      }
    }
    map.on("moveend", handleMoveEnd)
    return () => map.off("moveend", handleMoveEnd)
  }, [map, setCenter])

  useEffect(() => {
    if (currentLocation && !isFlying.current) {
      isFlying.current = true
      map.flyTo([currentLocation.lat, currentLocation.lng], 15, {
        duration: 2,
        easeLinearity: 0.25,
      })
      setTimeout(() => {
        isFlying.current = false
      }, 2000)
    }
  }, [currentLocation, map])

  return null
}


