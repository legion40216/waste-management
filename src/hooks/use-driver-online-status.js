import { useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";

export function useDriverOnlineStatus(driverId) {
  useEffect(() => {
    if (!driverId) return;

    const updateOnlineStatus = async (status) => {
      await supabase
        .from("DriverLocation")
        .update({
          isOnline: status,
          lastUpdate: new Date().toISOString(),
        })
        .eq("driverId", driverId);
    };

    // Create the presence channel
    const channel = supabase.channel(`driver-${driverId}`, {
      config: { presence: { key: driverId } }, // Ensures unique tracking for each driver
    });

    // Subscribe to the channel
    channel.subscribe((status) => {
      if (status === "SUBSCRIBED") {
        console.log("Presence channel subscribed for driver:", driverId);

        // Track driver as online
        channel.track({ online: true }).then(() => {
          // Update online status in DB
          updateOnlineStatus(true);
        });
      }
    });

    // Listen for presence updates
    channel.on("presence", { event: "sync" }, async () => {
      const presenceData = channel.presenceState();
      const isDriverActive = Object.keys(presenceData).length > 0; // Check if any session is active
      await updateOnlineStatus(isDriverActive);
    });

    // Cleanup on unmount
    return () => {
      console.log("Unsubscribing from presence channel for driver:", driverId);
      channel.untrack();
      channel.unsubscribe();
      updateOnlineStatus(false); // Mark driver as offline when they close all tabs
    };
  }, [driverId]);
}