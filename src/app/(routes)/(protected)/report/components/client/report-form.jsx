import { useState, useEffect } from "react";
import { toast } from "sonner";
import axios from "axios";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import ImageUpload from "@/components/Global-UI/image-upload";
import { MapPin, Crosshair } from 'lucide-react';
import { useRouter } from "next/navigation";

export default function ReportForm({ 
  selectedLocation, 
  currentLocation, 
  center, // Receive the center state
  onFlyTo 
}) {
  const [location, setLocation] = useState(null);
  const router = useRouter();

  const form = useForm({
    defaultValues: {
      description: "",
      imageUrl: "",
      latitude: 0,
      longitude: 0,
    },
  });

  const { isSubmitting } = form.formState;

  // Update location when map selection or current location changes
  useEffect(() => {
    if (selectedLocation) {
      setLocation(selectedLocation);
    } else if (currentLocation) {
      setLocation(currentLocation);
    }
  }, [selectedLocation, currentLocation]);

  const onSubmit = async (values) => {
    const toastId = toast.loading("Creating report...");
    try {
      if (!location) {
        toast.error("Please select a location on the map or use current location");
        return;
      }

      const reportData = {
        ...values,
        latitude: location.lat,
        longitude: location.lng,
      };

      await axios.post('/api/reports', reportData);
      toast.success("Report created successfully");
      form.reset();
      setLocation(null);
      router.refresh();
    }  catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong!");
    } finally {
      toast.dismiss(toastId);
    }
  };

  return (
    <div className="space-y-5 p-4 bg-white rounded-lg shadow-sm">
      <h2 className="text-xl font-semibold">Report Trash Collection</h2>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <FormField
            control={form.control}
            name="imageUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Upload Image</FormLabel>
                <FormControl>
                  <ImageUpload
                    value={field.value ? [field.value] : []}
                    disabled={isSubmitting}
                    onChange={(url) => field.onChange(url)}
                    onRemove={() => field.onChange("")}
                    limitValue={1}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    placeholder="Describe the waste collection needed..."
                    disabled={isSubmitting}
                    className="resize-none"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-3">
            {/* Location Status */}
            {location && (
              <div className="text-sm text-muted-foreground flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>
                  Location selected: {location.lat.toFixed(6)}, {location.lng.toFixed(6)}
                </span>
              </div>
            )}
            
            {/* Location Selection Buttons */}
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setLocation(currentLocation);
                  onFlyTo(currentLocation);
                }}
                disabled={!currentLocation || 
                  (center && currentLocation && 
                    Math.abs(center.lat - currentLocation.lat) < 0.001 && 
                    Math.abs(center.lng - currentLocation.lng) < 0.001)} // Disable if map is very close to current location
                className="w-full"
              >
                <Crosshair className="mr-2 h-4 w-4" />
                Use Current Location
              </Button>

              <Button
                type="button"
                variant="outline"
                disabled={!selectedLocation || 
                  (center && selectedLocation && 
                    Math.abs(center.lat - selectedLocation.lat) < 0.001 && 
                    Math.abs(center.lng - selectedLocation.lng) < 0.001)} // Disable if map is very close to selected location
                onClick={() => {
                  setLocation(selectedLocation);
                  onFlyTo(selectedLocation);
                }}
                className="w-full"
              >
                <MapPin className="mr-2 h-4 w-4" />
                Use Selected Location
              </Button>
              </div>

            <Button
              type="submit"
              disabled={isSubmitting || !location}
              className="w-full"
            >
              Submit Report
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
