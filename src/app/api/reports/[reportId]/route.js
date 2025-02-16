import { NextResponse } from 'next/server';
import prisma from "@/lib/prismadb";
import { auth } from '@/lib/auth';

export async function DELETE(request, { params }) {
  try {
    // Authenticate user
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" }, 
        { status: 401 }
      );
    }

    // Extract and validate reportId
    const { reportId } = await params;

    if (!reportId || typeof reportId !== 'string') {
      return NextResponse.json(
        { error: "Invalid or missing report ID" },
        { status: 400 }
      );
    }

    // Check if report exists and belongs to user
    const existingReport = await prisma.report.findUnique({
      where: { id: reportId },
      select: { userId: true }
    });

    if (!existingReport) {
      return NextResponse.json(
        { error: "Report not found" },
        { status: 404 }
      );
    }

    if (existingReport.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Not authorized to delete this report" },
        { status: 403 }
      );
    }

    // Delete the report
    await prisma.report.delete({
      where: { id: reportId }
    });

    return NextResponse.json(
      { success: true },
      { status: 200 }
    );

  } catch (error) {
    console.error("[REPORTS_DELETE]", error);
    
    // Handle Prisma-specific errors
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: "Report not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}