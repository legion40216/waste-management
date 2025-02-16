import React from 'react'
import Brandname from './nav-left/brandname'
import NavMobile from './nav-left/nav-mobile'
import NavBlock from './nav-left/nav-block'

export default function NavLeft() {
  return (
    <div className='flex gap-3 items-center'>
      <div className='hidden md:block'>
        <Brandname/>
      </div>
        <NavMobile/>
        <NavBlock />
    </div>
  )
}
