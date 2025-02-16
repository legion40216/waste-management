"use client"
import React from 'react'
import UserMenu from './user-actions/user-menu'

export default function UserActions() {
  return (
    <div className=" flex justify-between items-center px-4 py-2">
      <div className='flex items-center gap-2'>
        <UserMenu/>
      </div>
    </div>
  )
}

