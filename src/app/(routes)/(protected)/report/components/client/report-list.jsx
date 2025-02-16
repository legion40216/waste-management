import React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { Button } from '@/components/ui/button';
import { Trash } from 'lucide-react'

export default function ReportList({ 
    reports, 
    onDelete 
}
) {
  return (
    <Card>
    <CardHeader>
      <CardTitle className="text-lg font-semibold">Today's Reports</CardTitle>
    </CardHeader>
    <CardContent>
      {
         reports.length === 0 ? (
        <Alert>
          <AlertTitle>No Reports</AlertTitle>
          <AlertDescription>
            No waste collection reports for today. Click on the map to create a new report.
          </AlertDescription>
        </Alert>
      ) : (
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">
            Total reports today: {reports.length}
          </p>
          <div className="max-h-[200px] overflow-y-auto space-y-2">
            {reports.map((item) => (
              <div 
                key={item.id}
                className="p-2 bg-secondary rounded-lg text-sm flex justify-between
                 items-center
                "
              >
                <div>
                  <p className="font-medium truncate">{item.description}</p>
                  <p className="text-xs text-muted-foreground">
                    {item.time}
                  </p>
                </div>

                <Button 
                  onClick={() =>{onDelete(item.id)}}
                  variant="destructive"
                  size="sm"
                >
                  <Trash className="w-4 h-4" />
                </Button>

              </div>
            ))}
          </div>
        </div>
      )}
    </CardContent>
  </Card>
  )
}
