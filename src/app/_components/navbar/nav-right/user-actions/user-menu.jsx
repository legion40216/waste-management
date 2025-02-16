"use client";
import React, { useEffect } from "react";
import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { supabase } from "@/lib/supabaseClient";
import { currentUser } from "@/hooks/use-current-user";

export default function UserMenu() {
  const user = currentUser();
  const userId = user?.id;

  const fetchDriverId = async () => {
    if (!userId) return null;

    const { data: driver, error } = await supabase
      .from("Driver")
      .select("id")
      .eq("userId", userId)
      .single();

    if (error) {
      console.error("Error fetching driver ID:", error);
      return null;
    }

    return driver?.id;
  };

  const handleLogout = async (e) => {
    e.stopPropagation();
    if(user?.role === 'USER') {
      await signOut();
    }

    const driverId = await fetchDriverId();

    if (driverId) {
      // User is a driver, go through the driver logout process
      const channel = supabase.channel(`driver-${driverId}`);

      try {
        await new Promise((resolve, reject) => {
          channel.subscribe((status) => {
            if (status === "SUBSCRIBED") {
              resolve();
            } else if (status === "CHANNEL_ERROR") {
              reject(new Error("Failed to subscribe to channel"));
            }
          });
        });

        await channel.untrack();
        await supabase
          .from("DriverLocation")
          .update({ isOnline: false, lastUpdate: new Date().toISOString() })
          .eq("driverId", driverId);

        await channel.unsubscribe();
      } catch (error) {
        console.error("Error handling driver logout:", error);
      } finally {
        // Sign out the user regardless of their role
        await signOut();
      }
    }
  };

  useEffect(() => {
    const handleBeforeUnload = async (event) => {
      if (!userId) return;

      const driverId = await fetchDriverId();
      if (!driverId) return;

      const channel = supabase.channel(`driver-${driverId}`);

      try {
        await new Promise((resolve, reject) => {
          channel.subscribe((status) => {
            if (status === "SUBSCRIBED") {
              resolve();
            } else if (status === "CHANNEL_ERROR") {
              reject(new Error("Failed to subscribe to channel"));
            }
          });
        });

        await channel.untrack();
        await supabase
          .from("DriverLocation")
          .update({ isOnline: false, lastUpdate: new Date().toISOString() })
          .eq("driverId", driverId);

        await channel.unsubscribe();
      } catch (error) {
        console.error("Error handling beforeunload:", error);
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [userId]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button className="flex items-center gap-3 w-auto h-auto p-1" variant="ghost">
          <Avatar>
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>CN</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="z-[9999]" align="end">
        <DropdownMenuLabel>My Account</DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}