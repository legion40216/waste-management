"use client";
import { useState, useEffect } from "react";
import dynamic from 'next/dynamic';
import { LoaderCircle } from 'lucide-react'
import ReportForm from "./client/report-form";
import { toast } from "sonner";
import axios from "axios";
import { useRouter } from "next/navigation";
import ReportList from "./client/report-list";

const Map = dynamic(() => import('./client/map-component'), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-secondary">
      <LoaderCircle className="h-8 w-8 animate-spin" />
    </div>
  )
});

export default function Client({
  reports,
  driversWithUserAssignments,
  currentUserId,
  geoTagsReports
}) {
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [currentLocation, setCurrentLocation] = useState(null);
  const [center, setCenter] = useState({ lat: 51.505, lng: -0.09 });
  const [flyToLocation, setFlyToLocation] = useState(null);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const router = useRouter();

  const handleFlyTo = (location) => {
    setFlyToLocation(location);
  };

  const handleLocationSelected = (location) => {
    setSelectedLocation(location);
  };

  // Get user's location
  useEffect(() => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported");
      return;
    }
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setCurrentLocation(newLocation);
          setCenter(newLocation);
          setIsLoadingLocation(false);
        },
        (error) => {
          toast.error(errorMessages[error.code] || "Unable to get location");
          setIsLoadingLocation(false);
        }
      );
  }, []);

  const onDelete = async (reportId) => {
    const toastId = toast.loading(`Deleting Report`);
    try {
      await axios.delete(`/api/reports/${reportId}`);
      toast.success(`Report deleted`);
      router.refresh();
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong!");
    } finally {
      toast.dismiss(toastId);
    }
  }

  if (isLoadingLocation) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <LoaderCircle className="h-8 w-8 animate-spin" />
        <span className="ml-2">Getting location...</span>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-[30%,1fr] gap-4 p-4">
      <div className="space-y-4">
      <ReportForm 
        selectedLocation={selectedLocation}
        currentLocation={currentLocation}
        center={center} // Pass the center state
        onFlyTo={handleFlyTo} 
      />
      <ReportList 
      onDelete={onDelete} 
      reports={reports}
      />
      </div>
      
      <div className="rounded-lg overflow-hidden h-[100vh] md:h-full">
      <Map
        center={center}
        reports={reports}
        onLocationSelected={handleLocationSelected}
        selectedLocation={selectedLocation}
        currentLocation={currentLocation}
        flyToLocation={flyToLocation}
        setCenter={setCenter} // Pass the setCenter function
        driversWithUserAssignments={driversWithUserAssignments}
        currentUserId={currentUserId}
        geoTagsReports={geoTagsReports}
      />
      </div>
    </div>
  );
}