// app/api/driver/reports/[reportId]/route.js
import { auth } from "@/lib/auth";
import prisma from "@/lib/prismadb";
import { NextResponse } from "next/server";

export async function POST(request, { params }) {
  try {
    const session = await auth();
    if (!session || session.user.role !== "DRIVER") {
      return NextResponse.json({ error: "Unauthorized" }, 
      { status: 401 });
    }

    const { reportId } = await params;

    // Fetch the driver record for the current user
    const driver = await prisma.driver.findUnique({
      where: {
        userId: session.user.id,
      },
    });

    if (!driver) {
      return NextResponse.json({ error: "Driver record not found" }, 
      { status: 404 });
    }

    // Check if the report is already accepted by another driver
    const existingAssignment = await prisma.assignment.findFirst({
      where: {
        reportId: reportId,
      },
    });

    if (existingAssignment) {
      return NextResponse.json(
        { error: "This report has already been accepted by another driver." },
        { status: 400 }
      );
    }

    // Create a new assignment for the driver
    await prisma.assignment.create({
      data: {
        reportId: reportId,
        driverId: driver.id, // Use the driver's ID
        userId:   session.user.id, // Link a user (based on your schema)
        status:   "PENDING", // Default status
      }
    });

    // Update the report status to "ASSIGNED"
    await prisma.report.update({
      where: {
        id: reportId,
      },
      data: {
        status: "ASSIGNED",
      },
    });

    return NextResponse.json({ message: "Report accepted successfully" });
  } catch (error) {
    console.error("[DRIVER_REPORTS_[REPORTID]_POST]", error);
    return NextResponse.json(
      { message: "An unexpected error occurred. Please try again later." }, 
      { status: 500 }
    );
  }
}

// app/api/driver/reports/[reportId]/route.js
export async function PATCH(request, { params }) {
  try {
    const { reportId } = params;

    const session = await auth();
    if (!session || session.user.role !== "DRIVER") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    if (!body.status) {
      return NextResponse.json({ error: "Status is required" }, { status: 400 });
    }

    // Fetch the driver record for the current user
    const driver = await prisma.driver.findUnique({
      where: {
        userId: session.user.id,
      },
    });

    if (!driver) {
      return NextResponse.json({ error: "Driver record not found" }, { status: 404 });
    }

    // Check if the assignment exists for the current driver and report
    const assignment = await prisma.assignment.findFirst({
      where: {
        reportId: reportId,
        driverId: driver.id, // Use the driver's ID
      },
    });

    if (!assignment) {
      return NextResponse.json(
        { error: "No assignment found for this report and driver." },
        { status: 404 }
      );
    }

    // Update the report status
    await prisma.report.update({
      where: {
        id: reportId,
      },
      data: {
        status: body.status,
      },
    });

    return NextResponse.json({ succsess: true });
  } catch (error) {
      console.error("[DRIVER_REPORTS_[REPORTID]_PATCH]", error);
      return NextResponse.json(
        { message: "An unexpected error occurred. Please try again later." }, 
        { status: 500 }
      );
    }
  }