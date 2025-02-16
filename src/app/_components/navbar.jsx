"use client"
import React from 'react'
import NavLeft from './navbar/nav-left'
import NavMain from './navbar/nav-main'
import NavRight from './navbar/nav-right'

export default function Navbar() {
  return (
    <div>
      <div className=' flex items-center justify-between 
      container mx-auto py-2 p-4 border-b'
      >
        <NavLeft/>

        <div className='hidden md:block'>
          <NavMain/>
        </div>
        
        <NavRight/>
      </div>
    </div>
  )
}
