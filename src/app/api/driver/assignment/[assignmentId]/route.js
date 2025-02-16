// app/api/driver/assignments/[assignmentId]/route.js
import { auth } from "@/lib/auth";
import prisma from "@/lib/prismadb";
import { NextResponse } from "next/server";

export async function PATCH(request, { params }) {
  try {
    const { assignmentId } = params;

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

    // Update the assignment status
    const assignment = await prisma.assignment.update({
      where: {
        id: assignmentId,
        driverId: driver.id, // Ensure the driver can only update their own assignments
      },
      data: {
        status: body.status,
      },
      include: {
        report: true, // Include the associated report
      },
    });

    return NextResponse.json({ data: assignment });
  } catch (error) {
    console.error("[DRIVER_ASSIGNMENT_[ASSIGNMENTID]_PATCH]", error);
    return NextResponse.json(
      { message: "An unexpected error occurred. Please try again later." }, 
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { assignmentId } = params;

    const session = await auth();
    if (!session || session.user.role !== "DRIVER") {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Fetch the driver record for the current user
    const driver = await prisma.driver.findUnique({
      where: {
        userId: session.user.id,
      },
    });

    if (!driver) {
      return new NextResponse("Driver record not found", { status: 404 });
    }

    // First, find the assignment to get the reportId
    const assignment = await prisma.assignment.findUnique({
      where: {
        id: assignmentId,
        driverId: driver.id, // Ensure the driver can only delete their own assignments
      },
      select: {
        reportId: true,
      },
    });

    if (!assignment) {
      return new NextResponse("Assignment not found", { status: 404 });
    }

    // Delete the assignment
    await prisma.assignment.delete({
      where: {
        id: assignmentId,
      },
    });

    // Update the report status back to PENDING
    await prisma.report.update({
      where: {
        id: assignment.reportId,
      },
      data: {
        status: "PENDING",
      },
    });

    return NextResponse.json({
      message: "Assignment deleted and report status reset",
    });
  } catch (error) {
    console.error("[DRIVER_ASSIGNMENT_[ASSIGNMENTID]_DELETE]", error);
    return NextResponse.json(
      { message: "An unexpected error occurred. Please try again later." }, 
      { status: 500 }
    );
  }
}