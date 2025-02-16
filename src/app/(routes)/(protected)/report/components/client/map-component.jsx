import { useRef, useEffect, useMemo } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-markercluster';
import { MapController } from './map-component/map-controller';
import { useDriverRoutes } from '@/hooks/use-driver-route';
import { useDriversLocations } from '@/hooks/use-driver-location';

// Move icon creation outside component to prevent recreation on renders
const createMarkerIcon = (color) => {
  return new L.Icon({
    iconUrl: `data:image/svg+xml;base64,${btoa(`
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 41">
        <path d="M12 0C5.383 0 0 5.383 0 12c0 9.018 12 29 12 29s12-19.982 12-29c0-6.617-5.383-12-12-12z" 
              fill="${color}"/>
        <circle cx="12" cy="12" r="6" fill="white"/>
      </svg>
    `)}`,
    iconSize: [24, 41],
    iconAnchor: [12, 41],
    popupAnchor: [0, -41],
  });
};

// Create icons once, outside the component
const ICONS = {
  notYourReport: createMarkerIcon('#808080'),
  default: createMarkerIcon('#2196F3'),
  selected: createMarkerIcon('#FF4444'),
  currentLocation: createMarkerIcon('#4CAF50'),
  activeDriver: createMarkerIcon('#FF9800'),
};

// Set the default icon for all markers
L.Marker.prototype.options.icon = ICONS.default;

export default function Map({
  center,
  onLocationSelected,
  currentLocation,
  driversWithUserAssignments,
  selectedLocation,
  flyToLocation,
  setCenter,
  geoTagsReports = [],
  currentUserId,
}) {
  const mapRef = useRef(null);
  const routingControlsRef = useRef({}); // Store routing controls for each driver

  const driverIds = useMemo(() => {
    return driversWithUserAssignments.map((driver) => driver.id);
  }, [driversWithUserAssignments]);

  const driversLocations = useDriversLocations(driverIds);
  const { driverRoutes } = useDriverRoutes(driverIds, driversLocations);

  // Memoize driver markers for online drivers only
  const driverMarkers = useMemo(() => {
    return driversWithUserAssignments.map((driver) => {
      const driverLocation = driversLocations[driver.id];
      if (!driverLocation || !driverLocation.isOnline) return null;

      return (
        <Marker
          key={driver.id}
          position={[driverLocation.lat, driverLocation.lng]}
          icon={ICONS.activeDriver}
        >
          <Popup>
            <div className="text-sm">
              <p>Driver: {driver.user.name}</p>
              <p>Status: Online</p>
              <p>Last Updated: {new Date(driverLocation.lastUpdated).toLocaleTimeString()}</p>
            </div>
          </Popup>
        </Marker>
      );
    });
  }, [driversWithUserAssignments, driversLocations]);

  // Add routing controls for each driver's route
  useEffect(() => {
    if (!mapRef.current || !driverRoutes) return;
  
    const map = mapRef.current;
  
    // Clean up existing routing controls
    Object.values(routingControlsRef.current).forEach((control) => {
      if (control) map.removeControl(control);
    });
    routingControlsRef.current = {};
  
    // Add new routing controls for each online driver
    Object.entries(driverRoutes).forEach(([driverId, routeData]) => {
      const driverLocation = driversLocations[driverId];
      
      // Skip if driver is not online
      if (!driverLocation || !driverLocation.isOnline) return;
  
      const optimizedRoute = routeData.optimizedRoute;
      if (!optimizedRoute || !optimizedRoute.length) return;
  
      const waypoints = optimizedRoute.map((pos) => L.latLng(pos.lat, pos.lng));
  
      const routingControl = L.Routing.control({
        waypoints,
        routeWhileDragging: false,
        addWaypoints: false,       // Disable adding new waypoints
        draggableWaypoints: false, // Disable dragging waypoints
        show: false,               // Hide the default text instructions
        createMarker: function(i, waypoint, n) {
          // Don't create markers for any waypoints
          return null;
        },
        lineOptions: {
          styles: [{ color: '#3B82F6', weight: 4, opacity: 0.8 }],
        },
        router: L.Routing.osrmv1({
          serviceUrl: 'https://router.project-osrm.org/route/v1',
        }),
      }).addTo(map);
  
      // Store the routing control for cleanup
      routingControlsRef.current[driverId] = routingControl;
  
      // Event handlers
      routingControl.on('routingerror', (event) => {
        console.error(`Routing error for driver ${driverId}:`, event.error);
      });
  
      routingControl.on('routesfound', (event) => {
        console.log(`Route found for driver ${driverId}:`, event.routes);
      });
    });
  
    // Cleanup function
    return () => {
      Object.values(routingControlsRef.current).forEach((control) => {
        if (control && map) map.removeControl(control);
      });
    };
  }, [driverRoutes, driversLocations]);

  return (
    <MapContainer
      center={[center.lat, center.lng]}
      zoom={13}
      className="h-full w-full"
      ref={mapRef}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />

      <MapController
        onLocationSelected={onLocationSelected}
        selectedLocation={selectedLocation}
        currentLocation={currentLocation}
        center={center}
        flyToLocation={flyToLocation}
        setCenter={setCenter}
      />

      <MarkerClusterGroup
        chunkedLoading
        maxClusterRadius={60}
        spiderfyOnMaxZoom={true}
        animate={true}
      >
        {selectedLocation && (
          <Marker position={[selectedLocation.lat, selectedLocation.lng]} icon={ICONS.selected}>
            <Popup>
              <div className="text-sm">
                <p>Selected Location</p>
                <p>Lat: {selectedLocation.lat.toFixed(6)}</p>
                <p>Lng: {selectedLocation.lng.toFixed(6)}</p>
              </div>
            </Popup>
          </Marker>
        )}

        {currentLocation && (
          <Marker position={[currentLocation.lat, currentLocation.lng]} icon={ICONS.currentLocation}>
            <Popup>
              <div className="text-sm">
                <p>Your Current Location</p>
                <p>Lat: {currentLocation.lat.toFixed(6)}</p>
                <p>Lng: {currentLocation.lng.toFixed(6)}</p>
              </div>
            </Popup>
          </Marker>
        )}

{geoTagsReports.map((item) => (
  <Marker
    key={item.id}
    position={[item.latitude, item.longitude]}
    icon={item.userId === currentUserId ? ICONS.default : ICONS.notYourReport} // Use different icons
  >
    {item.userId === currentUserId && (
        <Popup>
        <div className="p-2">
          <img
            src={item.imageUrl || '/api/placeholder/320/240'}
            alt="Report"
            className="w-full h-32 object-cover mb-2 rounded"
          />
          <p className="text-sm">{item.description}</p>
          <p className="text-xs text-gray-500 mt-1">{item.createdAt}</p>
        </div>
      </Popup>
     )}
  
  </Marker>
))}

        {driverMarkers}
      </MarkerClusterGroup>
    </MapContainer>
  );
}