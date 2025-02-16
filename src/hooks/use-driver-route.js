import { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { toast } from "sonner";

export function useDriverRoutes(driverIds, driverLocations) {
  const [driverRoutes, setDriverRoutes] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const driverIdsMemoized = useMemo(() => {
    return driverIds;
  }, [driverIds]);

  const driverLocationsMemoized = useMemo(() => {
    return JSON.stringify(driverLocations);
  }, [driverLocations]);

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        setIsLoading(true);
        const routes = {};
        for (const driverId of driverIdsMemoized) {
          try {
            const response = await axios.get(`/api/driver/routing/${driverId}`);
            routes[driverId] = response.data;
          } catch (err) {
            toast.error(`Failed to fetch route for driver ${driverId}`);
          }
        }

        setDriverRoutes((prev) => {
          if (JSON.stringify(prev) !== JSON.stringify(routes)) {
            return routes;
          }
          return prev;
        });
        setError(null);
      } catch (err) {
        toast.error(err.message);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoutes();
  }, [ driverLocationsMemoized]);

  return { driverRoutes, isLoading, error };
}