"use client";
import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { LoaderCircle } from "lucide-react";
import ReportsList from "./client/report-list";
import { toast } from "sonner";
import axios from "axios";
import { useRouter } from "next/navigation";
import { calculateDistance } from "./utils/distance";
import { useDriverOnlineStatus } from "@/hooks/use-driver-online-status";

// Dynamic import for Map component
const Map = dynamic(() => import("./client/map-component"), {
  ssr: false,
  loading: () => (
    <div className="h-full w-full flex items-center justify-center bg-secondary">
      <LoaderCircle className="h-8 w-8 animate-spin" />
    </div>
  ),
});

export default function Client({ reports = [], driverLocation, driverId }) {
  const [currentLocation, setCurrentLocation] = useState(null);
  const [center, setCenter] = useState(driverLocation || { lat: 51.505, lng: -0.09 });
  const [flyToLocation, setFlyToLocation] = useState(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [isLoadingLocation, setIsLoadingLocation] = useState(true);
  const router = useRouter();

  useDriverOnlineStatus(driverId);

  const handleLocationUpdate = async (location) => {
    const toastId = toast.loading("Updating location...");
    try {
      await axios.post('/api/driver/location', {
        lat: location.lat,
        lng: location.lng
      });
      toast.success("Location updated");
      return true;
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong!");
    } finally {
      toast.dismiss(toastId);
    }
  };

  // Watch location changes
  useEffect(() => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported");
      return;
    }
  
    const watchId = navigator.geolocation.watchPosition(
      async (position) => {
        const newLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
  
        setCurrentLocation(newLocation);
        setCenter(newLocation);
        setIsLoadingLocation(false);
        await handleLocationUpdate(newLocation);
      },
      (error) => {
        const errorMessages = {
          1: "Location access denied",
          2: "Location unavailable",
          3: "Location request timed out"
        };
        toast.error(errorMessages[error.code] || "Unable to get location");
        setIsLoadingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
    );
  
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  const handleReportSelect = (report) => {
    setFlyToLocation({ lat: report.latitude, lng: report.longitude });
  };

  const handleStatusUpdate = async (reportId, newStatus) => {
    setIsUpdatingStatus(true);
    const toastId = toast.loading("Updating status...");
    
    try {
      const endpoint = `/api/driver/reports/${reportId}${newStatus === "PENDING" ? "/" : ""}`;
      const method = newStatus === "PENDING" ? "post" : "patch";
      const data = newStatus === "PENDING" ? {} : { status: newStatus };
      
      await axios[method](endpoint, data);
      toast.success("Status updated successfully");
      router.refresh();
      
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong!");
    } finally {
      toast.dismiss(toastId);
      setIsUpdatingStatus(false);
    }
  };

  const handleDelete = async (assignmentId) => {
    setIsUpdatingStatus(true);
    const toastId = toast.loading("Canceling assignment...");
    
    try {
      await axios.delete(`/api/driver/assignment/${assignmentId}`);
      toast.success("Assignment canceled");
      router.refresh();
 
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong!");
    } finally {
      toast.dismiss(toastId);
      setIsUpdatingStatus(false);
    }
  };

  if (isLoadingLocation) {
    return (
      <div className="h-full w-full flex items-center justify-center">
        <LoaderCircle className="h-8 w-8 animate-spin" />
        <span className="ml-2">Getting location...</span>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-[30%,1fr] 
      gap-4 p-4"
      >
      <ReportsList
        reports={reports}
        currentLocation={currentLocation}
        onStatusUpdate={handleStatusUpdate}
        isUpdatingStatus={isUpdatingStatus}
        onReportSelect={handleReportSelect}
        calculateDistance={calculateDistance}
        onDelete={handleDelete}
      />
      <div className="rounded-lg overflow-hidden h-[100vh] md:h-full">
        <Map
          center={center}
          reports={reports}
          currentLocation={currentLocation}
          flyToLocation={flyToLocation}
          setCenter={setCenter}
          driverId={driverId}
        />
      </div>
    </div>
  </div>
  );
}