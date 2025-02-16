import { currentUser } from "@/hooks/server-auth-utils";
import Client from "./components/client";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import prisma from "@/lib/prismadb";

export default async function Page() {
  const user = await currentUser();

  // Get reports created by the current user.
  const reports = await prisma.report.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: 'desc' }
  });

  // Get drivers with assignments for reports (filtering assignments by report userId)
  const driversWithUserAssignments = await prisma.driver.findMany({
    where: {
      assignments: {
        some: {
          report: { userId: user.id }
        }
      }
    },
    include: {
      assignments: {
        include: { report: true }
      },
      user: true
    }
  });

  // Format current user's own reports.
  const formattedUserReports = reports.map((report) => ({
    id: report.id,
    userId: report.userId,
    description: report.description,
    imageUrl: report.imageUrl,
    latitude: report.latitude,
    longitude: report.longitude,
    status: report.status,
    createdAt: format(new Date(report.createdAt), "MMMM do, yyyy"),
    time: format(new Date(report.createdAt), "hh:mm a"),
    isCurrentUser: true,
    source: "owner" // indicates this is the user's own report
  }));

  // Format the reports coming from driver assignments.
  const formattedAssignmentReports = driversWithUserAssignments.flatMap(driver =>
    driver.assignments.map((assignment) => {
      const { report } = assignment;
      return {
        id: report.id,
        userId: report.userId,
        description: report.description,
        imageUrl: report.imageUrl,
        latitude: report.latitude,
        longitude: report.longitude,
        status: report.status,
        createdAt: format(new Date(report.createdAt), "MMMM do, yyyy"),
        time: format(new Date(report.createdAt), "hh:mm a"),
        assignmentStatus: assignment.status,
        driverId: assignment.driverId,
        isCurrentUser: report.userId === user.id,
        source: "assignment" // indicates this report comes from a driver assignment
      };
    })
  );

  // Remove duplicate reports (those that already exist in the user's own reports)
  const userReportIds = new Set(formattedUserReports.map(report => report.id));
  const uniqueAssignmentReports = formattedAssignmentReports.filter(
    report => !userReportIds.has(report.id)
  );

  // Combine both sets of reports.
  const combinedReports = [...formattedUserReports, ...uniqueAssignmentReports];

  return (
    <div>
      <header className="mb-4 flex items-center gap-4">
        <div className="flex gap-4">
          <h1 className="text-xl font-semibold">
            <span>Welcome back,</span>
            <span className="ml-2 text-2xl">{user.name || "User"}</span>!
          </h1>
          <Badge variant="secondary" className="text-sm">
            {user.role}
          </Badge>
        </div>
      </header>
      <Client 
        reports={formattedUserReports}
        geoTagsReports={combinedReports}
        driversWithUserAssignments={driversWithUserAssignments}
        currentUserId={user?.id}
      />
    </div>
  );
}