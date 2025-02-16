"use client"
import { useEffect } from "react"
import { useMap } from "react-leaflet"

export function MapController({
  onLocationSelected,
  selectedLocation,
  currentLocation,
  center,
  flyToLocation,
  setCenter,
}) {
  const map = useMap()

  useEffect(() => {
    // Handle flying to a location
    if (flyToLocation) {
      const currentMapCenter = map.getCenter()
      if (currentMapCenter.lat !== flyToLocation.lat || currentMapCenter.lng !== flyToLocation.lng) {
        map.flyTo([flyToLocation.lat, flyToLocation.lng], 15)
      }
    }
  }, [flyToLocation, map])

  useEffect(() => {
    // Handle clicks on the map
    const handleMapClick = (e) => {
      onLocationSelected(e.latlng)
      map.flyTo(e.latlng, map.getZoom())
    }

    // Add click event listener
    map.on("click", handleMapClick)

    // Cleanup event listener on unmount
    return () => {
      map.off("click", handleMapClick)
    }
  }, [onLocationSelected, map])

  useEffect(() => {
    // Handle moveend events
    const handleMoveEnd = () => {
      const newCenter = map.getCenter()
      if (newCenter.lat !== center.lat || newCenter.lng !== center.lng) {
        setCenter({ lat: newCenter.lat, lng: newCenter.lng })
      }
    }

    // Add moveend event listener
    map.on("moveend", handleMoveEnd)

    // Cleanup event listener on unmount
    return () => {
      map.off("moveend", handleMoveEnd)
    }
  }, [center, map, setCenter])

  useEffect(() => {
    // Handle fly to current location
    if (currentLocation) {
      const currentMapCenter = map.getCenter()
      if (currentMapCenter.lat !== currentLocation.lat || currentMapCenter.lng !== currentLocation.lng) {
        map.flyTo([currentLocation.lat, currentLocation.lng], 15)
      }
    }
  }, [currentLocation, map])

  useEffect(() => {
    // Handle fly to selected location
    if (selectedLocation) {
      const currentMapCenter = map.getCenter()
      if (currentMapCenter.lat !== selectedLocation.lat || currentMapCenter.lng !== selectedLocation.lng) {
        map.flyTo([selectedLocation.lat, selectedLocation.lng], 15)
      }
    }
  }, [selectedLocation, map])

  return null
}



