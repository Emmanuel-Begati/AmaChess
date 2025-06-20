import React from 'react'
import { useLocation } from 'react-router-dom'
import Navbar from './Navbar'
import Footer from './Footer'

interface BaseLayoutProps {
  children: React.ReactNode
}

const BaseLayout: React.FC<BaseLayoutProps> = ({ children }) => {
  const location = useLocation()
  
  // Don't show footer on certain pages where it might interfere
  const hideFooter = ['/practice', '/puzzles'].includes(location.pathname)

  return (
    <div className="min-h-screen bg-[#121621] text-white flex flex-col">
      <Navbar />
      
      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      {!hideFooter && <Footer />}
    </div>
  )
}

export default BaseLayout
