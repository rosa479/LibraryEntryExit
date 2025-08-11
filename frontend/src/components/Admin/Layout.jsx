import React from 'react'
import Navbar from '../Navbar.jsx'
import Sidebar from './Sidebar.jsx'
import { Outlet } from "react-router-dom";

const Layout = () => {
  return (
    <div>
      <Navbar />
      <div className='flex gap-5 min-h-[calc(100vh-70px)]'>
        <Sidebar />
      <Outlet />
      </div>
    </div>
  )
}

export default Layout
