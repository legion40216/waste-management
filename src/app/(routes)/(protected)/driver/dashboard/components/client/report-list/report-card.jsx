import {
    Card,
    CardContent
  } from "@/components/ui/card"
  import { Button } from "@/components/ui/button"
  
  export default function ReportCard({
    report,
    currentLocation,
    onStatusUpdate,
    isUpdatingStatus,
    onSelect,
    calculateDistance,
    onDelete,
  }) {
    
    return (
      <Card
        className="mb-4 cursor-pointer hover:shadow-md transition"
        onClick={() => onSelect(report)}
      >
        <CardContent className="p-4">
          <img
            src={report.imageUrl || "/api/placeholder/320/240"}
            alt="Report"
            className="w-full h-32 object-cover mb-2 rounded"
          />
          <p className="font-medium truncate">{report.description}</p>
          {currentLocation && (
            <p className="text-sm text-gray-500">
              Distance:{" "}
              {calculateDistance(
                currentLocation.lat,
                currentLocation.lng,
                report.latitude,
                report.longitude
              )}{" "}
              km
            </p>
          )}
          <div className="mt-2 space-x-2">
            {/* Show "Accept" button only for PENDING reports */}
            {report.status === "PENDING" && (
              <Button
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  onStatusUpdate(report.id, "PENDING");
                }}
                disabled={isUpdatingStatus}
              >
                Accept
              </Button>
            )}
  
            {/* Show "Complete" and "Cancel" buttons for ASSIGNED reports */}
            {report.status === "ASSIGNED" && (
              <div className="flex gap-2 justify-between">
                <Button
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onStatusUpdate(report.id, "COMPLETED");
                  }}
                  disabled={isUpdatingStatus}
                >
                  Complete
                </Button>
  
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(report.assignmentId);
                  }}
                  disabled={isUpdatingStatus}
                >
                  Cancel
                </Button>
              </div>
            )}
  
            {/* Show "Cancel" button for COMPLETED reports with an assignmentId */}
            {report.status === "COMPLETED" && (
              <div className="flex gap-2 justify-end">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(report.assignmentId);
                  }}
                  disabled={isUpdatingStatus}
                >
                  Cancel
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    );
  }