import { currentUser } from "@/hooks/server-auth-utils";
import Client from "./components/client";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import prisma from "@/lib/prismadb";

export default async function Page() {
  const user = await currentUser()

  const reports = await prisma.report.findMany({
    where: {
      userId: user.id
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  const driversWithUserAssignments = await prisma.driver.findMany({
    where: {
      assignments: {
        some: {
          report: {
            userId: user.id // Directly check for reports belonging to this user
          }
        }
      }
    },
    include: {
      assignments: {
        include: {
          report: true // Include all their assignments
        }
      },
      user: true // Include driver's user details
    }
  });

  const formattedreports = reports.map((report) => ({
    id: report.id,
    description: report.description,
    imageUrl: report.imageUrl,
    latitude: report.latitude,
    longitude: report.longitude,
    status: report.status,
    createdAt: format(new Date(report.createdAt), "MMMM do, yyyy"), // Date format using date-fns
    time: format(new Date(report.createdAt), "hh:mm a") // 12-hour time format with AM/PM
  }));

  return (
    <div>
      <header className="mb-4 flex items-center gap-4">
        <div className="flex gap-4">
          <h1 className="text-xl font-semibold">Welcome back, <span className="text-2xl">{user.name || "User"}</span>!</h1>
          <Badge
            variant="secondary"
            className="text-sm"
          >
            {user.role}
          </Badge>
        </div>
      </header>
      <Client 
      reports = {formattedreports}
      driversWithUserAssignments={driversWithUserAssignments}
      />
    </div>
  );
}