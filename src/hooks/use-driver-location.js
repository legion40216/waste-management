import { useEffect, useState, useRef } from 'react';
import { supabase } from '@/lib/supabaseClient';

export function useDriversLocations(driverIds) {
  const [driversLocations, setDriversLocations] = useState({});
  const lastUpdateTimestamps = useRef({});

  useEffect(() => {
    if (!driverIds?.length) return;

    const fetchInitialLocations = async () => {
      const { data, error } = await supabase
        .from('DriverLocation')
        .select('driverId, latitude, longitude, lastUpdate, isOnline')
        .in('driverId', driverIds)
        .eq('isOnline', true); // Only fetch online drivers

      if (!error && data) {
        const locationMap = {};
        data.forEach((location) => {
          locationMap[location.driverId] = {
            lat: location.latitude,
            lng: location.longitude,
            lastUpdated: location.lastUpdate,
            isOnline: location.isOnline
          };
          lastUpdateTimestamps.current[location.driverId] = Date.now();
        });
        setDriversLocations(locationMap);
      }
    };

    fetchInitialLocations();

    // Set up real-time updates
    const channel = supabase
      .channel('driver-locations')
      .on(
        'postgres_changes',
        {
          event: '*', // Listen for all events
          schema: 'public',
          table: 'DriverLocation',
          filter: `driverId=in.(${driverIds.join(',')})`,
        },
        (payload) => {
          // Handle offline status
          if (payload.new.isOnline === false) {
            setDriversLocations((current) => {
              const newLocations = { ...current };
              delete newLocations[payload.new.driverId];
              return newLocations;
            });
            return;
          }

          // Handle online status and location updates
          const timeSinceLastUpdate =
            Date.now() - (lastUpdateTimestamps.current[payload.new.driverId] || 0);
          const MIN_TIME_DIFFERENCE = 5000;

          if (timeSinceLastUpdate < MIN_TIME_DIFFERENCE) return;

          setDriversLocations((current) => ({
            ...current,
            [payload.new.driverId]: {
              lat: payload.new.latitude,
              lng: payload.new.longitude,
              lastUpdated: payload.new.lastUpdate,
              isOnline: payload.new.isOnline
            },
          }));
          
          lastUpdateTimestamps.current[payload.new.driverId] = Date.now();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [driverIds]);

  return driversLocations;
}