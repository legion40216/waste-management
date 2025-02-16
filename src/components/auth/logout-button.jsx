"use client"
import { signOut } from 'next-auth/react'
import React from 'react'

export default function LogoutButton({children}) {

  return (
    <span onClick={signOut}>
      {children}
    </span>
  )
}
