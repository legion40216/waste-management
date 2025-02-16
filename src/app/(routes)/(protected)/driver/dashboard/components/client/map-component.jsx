"use client";
import { useEffect, useRef, useState } from "react";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet-routing-machine";
import { Badge } from "@/components/ui/badge";
import { calculateDistance } from "../utils/distance";
import { MapController } from "./map-component/map-controller";
import { toast } from "sonner";
import axios from "axios";
import MarkerClusterGroup from "react-leaflet-markercluster";
import "leaflet.markercluster/dist/MarkerCluster.css";
import "leaflet.markercluster/dist/MarkerCluster.Default.css";

// Fix Leaflet default icon issues
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Create marker icons
const createMarkerIcon = (color) => {
  return L.divIcon({
    className: "custom-div-icon",
    html: `
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 41" width="24" height="41">
        <path d="M12 0C5.383 0 0 5.383 0 12c0 9.018 12 29 12 29s12-19.982 12-29c0-6.617-5.383-12-12-12z" fill="${color}"/>
        <circle cx="12" cy="12" r="6" fill="white"/>
      </svg>
    `,
    iconSize: [24, 41],
    iconAnchor: [12, 41],
    popupAnchor: [0, -41],
  });
};

const defaultIcon = createMarkerIcon("#2196F3");
const currentLocationIcon = createMarkerIcon("#4CAF50");
const inProgressIcon = createMarkerIcon("#FF9800");

export default function DriverMap({
  center,
  reports = [],
  currentLocation,
  flyToLocation,
  setCenter,
  driverId,
}) {
  const mapRef = useRef(null);
  const routingControlRef = useRef(null);
  const [optimizedRoute, setOptimizedRoute] = useState([]);
  const [isLoadingRoute, setIsLoadingRoute] = useState(false);

  // Fetch Route Data
  useEffect(() => {
    const fetchRoutes = async () => {
      if (!driverId || !currentLocation) return;

      setIsLoadingRoute(true);
      try {
        const response = await axios.get(`/api/driver/routing/${driverId}`);
        if (response.data.optimizedRoute) {
          setOptimizedRoute(response.data.optimizedRoute);
        }
      } catch (error) {
        toast.error(error.response?.data?.message || "Something went wrong!");
      } finally {
        setIsLoadingRoute(false);
      }
    };

    fetchRoutes();
  }, [driverId, currentLocation]);

  // Handle Route Display
  useEffect(() => {
    if (!mapRef.current || !optimizedRoute.length || isLoadingRoute) return;

    const map = mapRef.current;

    // Wait for the map to be fully loaded
    map.whenReady(() => {
      // Clean up old route
      if (routingControlRef.current) {
        map.removeControl(routingControlRef.current);
      }

      try {
        // Setup new route
        const waypoints = optimizedRoute.map((pos) => L.latLng(pos.lat, pos.lng));

        routingControlRef.current = L.Routing.control({
          waypoints,
          routeWhileDragging: false,
          addWaypoints: false,
          draggableWaypoints: false,
          show: false, // Set to true to show the control panel
          lineOptions: {
            styles: [{ color: "#3B82F6", weight: 4, opacity: 0.8 }],
          },
          router: L.Routing.osrmv1({
            serviceUrl: "https://router.project-osrm.org/route/v1",
            timeout: 10000, // 10 second timeout
          }),
        }).addTo(map);

        // Simple error handling for routing
        routingControlRef.current.on("routingerror", (error) => {
          console.error("Routing error:", error);
          toast.error("Route calculation failed. Please try again.");
        });
      } catch (error) {
        console.error("Routing display error:", error);
        toast.error("Problem showing route on map");
      }
    });
  }, [optimizedRoute, isLoadingRoute]);

  return (
    <MapContainer center={center} zoom={13} className="h-full w-full" ref={mapRef}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <MapController
        currentLocation={currentLocation}
        flyToLocation={flyToLocation}
        setCenter={setCenter}
      />

      {/* Marker Cluster Group */}
      <MarkerClusterGroup
        chunkedLoading
        maxClusterRadius={60}
        spiderfyOnMaxZoom={true}
        animate={true}
      >
        {currentLocation && (
          <Marker position={[currentLocation.lat, currentLocation.lng]} icon={currentLocationIcon}>
            <Popup>Your Current Location</Popup>
          </Marker>
        )}

        {reports.map((item) => (
          <Marker
            key={item.id}
            position={[item.latitude, item.longitude]}
            icon={item.status === "IN_PROGRESS" ? inProgressIcon : defaultIcon}
            draggable={false}
          >
            <Popup>
              <div className="p-2 max-w-[280px]">
              <img
                  src={item.imageUrl || '/api/placeholder/320/240'}
                  alt="Report"
                  className="w-full h-32 object-cover mb-2 rounded"
                />
                <p className="text-sm font-medium">{item.description}</p>
                <Badge className="mt-1">{item.status}</Badge>
                {currentLocation && (
                  <p className="text-xs text-muted-foreground mt-1">
                    {calculateDistance(currentLocation.lat, currentLocation.lng, item.latitude, item.longitude)} km away
                  </p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MarkerClusterGroup>
    </MapContainer>
  );
}