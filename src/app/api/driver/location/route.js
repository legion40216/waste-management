import { auth } from "@/lib/auth";
import { supabase } from "@/lib/supabaseClient";
import prisma from "@/lib/prismadb";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    // 1. Authentication check
    const session = await auth();
    if (!session || session.user.role !== "DRIVER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Validate request body
    let body;
    try {
      body = await request.json();
    } catch (e) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const { lat, lng, heading, speed } = body;

    // Validate required fields
    if (typeof lat !== 'number' || typeof lng !== 'number') {
      return NextResponse.json({ 
        error: "Invalid coordinates. Latitude and longitude must be numbers" 
      }, { status: 400 });
    }

    // 3. Get driver information
    const driver = await prisma.driver.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });

    if (!driver) {
      return NextResponse.json({ error: "Driver not found" }, { status: 404 });
    }

    // 4. Update Prisma
    try {
      await prisma.driverLocation.upsert({
        where: { driverId: driver.id },
        update: {
          latitude: lat,
          longitude: lng,
          heading: heading || null,
          speed: speed || null,
          lastUpdate: new Date(),
          isOnline: true,
        },
        create: {
          driverId: driver.id,
          latitude: lat,
          longitude: lng,
          heading: heading || null,
          speed: speed || null,
          isOnline: true,
        },
      });
    } catch (error) {
      console.error("Prisma update error:", error);
      return NextResponse.json({ 
        error: "Database update failed", 
        details: error.message 
      }, { status: 500 });
    }

    // 5. Update Supabase
    try {
      const { error: supabaseError } = await supabase
        .from("DriverLocation")
        .upsert(
          {
            driverId: driver.id,
            latitude: lat,
            longitude: lng,
            heading: heading || null,
            speed: speed || null,
            lastUpdate: new Date().toISOString(),
            isOnline: true,
          },
          { onConflict: "driverId" }
        );

      if (supabaseError) {
        throw supabaseError;
      }
    } catch (error) {
      console.error("Supabase update error:", error);
      // Don't return here - we successfully updated Prisma, so we can continue
    }

    return NextResponse.json({ success: true });

  } catch (error) {
      console.error("[DRIVER_LOCATION_POST]", error);
      return NextResponse.json(
        { message: "An unexpected error occurred. Please try again later." }, 
        { status: 500 }
      );
    }
  }
  