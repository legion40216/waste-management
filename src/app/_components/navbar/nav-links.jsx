import { cn } from '@/lib/utils'
import Link from 'next/link'
import React from 'react'

export default function NavLinks({ route, className }) {   
  return (   
        <Link 
            href={route.href}
            className={cn(
                "text-lg font-bold transition-colors hover:text-primary",
                route.active ? "text-primary" : "text-muted-foreground",
                className // Add custom className
            )}
        >
            {route.label}
        </Link>
  )
}