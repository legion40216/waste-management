import { calculateDistance } from "@/app/(routes)/(protected)/driver/dashboard/components/utils/distance";

export function calculateOptimizedRoute(locations) {
  let route = [locations[0]];
  let unvisited = locations.slice(1);

  while (unvisited.length > 0) {
    const last = route[route.length - 1];
    let nearestIndex = 0;
    let nearestDistance = Infinity;

    unvisited.forEach((loc, index) => {
      const dist = calculateDistance(last.lat, last.lng, loc.lat, loc.lng);
      if (dist < nearestDistance) {
        nearestDistance = dist;
        nearestIndex = index;
      }
    });

    route.push(unvisited[nearestIndex]);
    unvisited = unvisited.filter((_, i) => i !== nearestIndex);
  }

  return route;
}