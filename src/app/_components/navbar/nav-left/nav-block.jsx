"use client"
import { currentUser } from '@/hooks/use-current-user';
import { useEffect, useState } from 'react';
import Link from 'next/link'; // Import Next.js Link component
import { usePathname } from 'next/navigation'; // Hook to get the current pathname
import { buttonVariants } from '@/components/ui/button'; // Assuming you're using buttonVariants for styling
import React from 'react';

// Define all possible routes with their roles and subroutes
const allRoutes = [
  {
    label: "Report",
    href: "/report",
    role: ["USER", "DRIVER"], // Allow both USER and DRIVER roles
  },
  {
    label: "Drive",
    href: "/driver/dashboard",
    role: ["DRIVER"], // Only for DRIVER role
  }
];

export default function NavBlock() {
  const user = currentUser(); // Fetch current user info
  const pathname = usePathname(); // Get the current pathname
  const [activeLink, setActiveLink] = useState(null);

  // Filter routes based on the user's role
  const filteredRoutes = allRoutes.filter(route =>
    route.role.includes(user?.role) // Only include routes that match the user's role
  );

  // Determine if the item matches the current URL (active)
  useEffect(() => {
    filteredRoutes.forEach(route => {
      const isActive =
        pathname === route.href ||
        pathname?.startsWith(route.href); // Check if pathname starts with the route href

      if (isActive) {
        setActiveLink(route.href);
      }
    });
  }, [pathname, filteredRoutes]);

  return (
    <div className='flex gap-2'>
      {filteredRoutes.map((route, index) => (
        <div key={index}>
          <Link 
            href={route.href}
            className={`${buttonVariants({ variant: "link" })} ${
              activeLink === route.href ? 'underline' : '' // Apply underline if active
            }`}
          >
            {route.label}
          </Link>
        </div>
      ))}
    </div>
  );
}
