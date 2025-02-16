import { format } from "date-fns";
import prisma from "@/lib/prismadb";
import Client from "./components/client";
import { useRoleProtection } from "@/hooks/use-role-protection";
import { redirect } from "next/navigation";
import { currentUser } from "@/hooks/server-auth-utils";
import { Badge } from "@/components/ui/badge";

export default async function Page() {
  const hasAccess = await useRoleProtection("DRIVER");
  if (!hasAccess) {
    redirect("/unauthorized"); // Redirect user to the unauthorized page
  }
  const user = await currentUser()

  // Fetch the driver record for the current user
  const driver = await prisma.driver.findUnique({
    where: {
      userId: user?.id, // Find the driver by userId
    },
    include: {
      currentLocation: true, // Include the driver's current location
    },
  });

  // Fetch pending reports and reports accepted by the current driver
  const reports = await prisma.report.findMany({
    where: {
      OR: [
        { status: "PENDING" }, // Pending reports
        {
          assignment: {
            driverId: driver?.id, // Reports accepted by the current driver
          },
        },
      ],
    },
    include: {
      assignment: true, // Include assignment details
    },
  });

  // Format the reports for display
  const formattedReports = reports.map((report) => ({
    id: report.id,
    description: report.description,
    imageUrl: report.imageUrl,
    latitude: report.latitude,
    longitude: report.longitude,
    status: report.status,
    assignmentStatus: report.assignment?.status || null, // Include assignment status
    assignmentId: report.assignment?.id,
    createdAt: format(new Date(report.createdAt), "MMMM do, yyyy"),
    time: format(new Date(report.createdAt), "hh:mm a"),
  }));

  // Include the driver's current location in the data passed to the Client component
  const driverLocation = driver?.currentLocation
    ? {
        lat: driver.currentLocation.latitude,
        lng: driver.currentLocation.longitude,
      }
    : null;

  return (
    <div>
      <header className="mb-4 flex items-center gap-4">
        <div className="flex gap-4">
          <h1 className="text-xl font-semibold"><span>Welcome back,</span>
            <span className="ml-2 text-2xl">
              {user.name || "User"}
            </span>!
          </h1>
          <Badge
            variant="secondary"
            className="text-sm"
          >
            {user.role}
          </Badge>
        </div>
      </header>
      <Client
        reports={formattedReports}
        driverLocation={driverLocation} // Pass the driver's current location
        driverId={driver.id}
      />
    </div>
  );
}