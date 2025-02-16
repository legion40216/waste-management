"use client"
import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { 
  Tabs, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { 
  Alert, 
  AlertTitle,
   AlertDescription 
  } from "@/components/ui/alert"
import ReportCard from "./report-list/report-card";

export default function ReportsList({
  reports,
  currentLocation,
  onStatusUpdate,
  isUpdatingStatus,
  onReportSelect,
  calculateDistance,
  onDelete,
}) {
  const [activeTab, setActiveTab] = useState("pending");

  const filteredReports = reports.filter((report) => {
    switch (activeTab) {
      case "pending":
        return report.status === "PENDING";
      case "in-progress":
        return report.status === "ASSIGNED";
      case "completed":
        return report.status === "COMPLETED";
      default:
        return true;
    }
  });

  const getEmptyStateMessage = () => {
    switch (activeTab) {
      case "pending":
        return "No pending reports available.";
      case "in-progress":
        return "No reports in progress.";
      case "completed":
        return "No completed reports yet.";
      default:
        return "No reports found.";
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader>
        <CardTitle>Collection Reports</CardTitle>
        <CardDescription>Manage your assigned collections</CardDescription>
      </CardHeader>
      <CardContent className="p-0">
        <Tabs defaultValue="pending" onValueChange={setActiveTab}>
          <TabsList className="w-full">
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="in-progress">In Progress</TabsTrigger>
            <TabsTrigger value="completed">Completed</TabsTrigger>
          </TabsList>
          <div className="p-4 h-[calc(100vh-16rem)] overflow-auto">
            {filteredReports.length > 0 ? (
              filteredReports.map((report) => (
                <ReportCard
                  key={report.id}
                  report={report}
                  currentLocation={currentLocation}
                  onStatusUpdate={onStatusUpdate}
                  isUpdatingStatus={isUpdatingStatus}
                  onSelect={() => onReportSelect(report)}
                  calculateDistance={calculateDistance}
                  onDelete={onDelete}
                />
              ))
            ) : (
              <Alert>
                <AlertTitle>Empty</AlertTitle>
                  <AlertDescription>
                  {getEmptyStateMessage()}
                  </AlertDescription>
              </Alert>
            )}
          </div>
        </Tabs>
      </CardContent>
    </Card>
  );
}