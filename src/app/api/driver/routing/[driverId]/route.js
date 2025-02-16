import { NextResponse } from "next/server";
import prisma from "@/lib/prismadb";
import { calculateOptimizedRoute } from "@/hooks/calculatedOptimizedRoute";

export async function GET(request, { params }) {
  try {
    // Properly await and destructure the driverId
    const { driverId } = await params;

    // Get driver location
    const driverLocation = await prisma.driverLocation.findUnique({
      where: { driverId }
    });

    if (!driverLocation) {
      return NextResponse.json(
        { error: "Driver location not found" },
        { status: 404 }
      );
    }

    // Get driver's assignments
    const assignments = await prisma.assignment.findMany({
      where: {
        driverId,
        status: {
          not: 'COMPLETED'
        }
      },
      include: {
        report: true
      }
    });

    // Create locations array starting with driver's location
    const locations = [
      { lat: driverLocation.latitude, lng: driverLocation.longitude }
    ];

    // Add report locations
    assignments.forEach(assignment => {
      locations.push({
        lat: assignment.report.latitude,
        lng: assignment.report.longitude
      });
    });

    // Calculate optimized route
    const optimizedRoute = calculateOptimizedRoute(locations);

    return NextResponse.json({
      driverLocation,
      assignments,
      optimizedRoute
    });

  } catch (error) {
    console.error("[ROUTE_GET]", error);
    return NextResponse.json(
      { message: "An unexpected error occurred. Please try again later." }, 
      { status: 500 }
    );
  }
}
