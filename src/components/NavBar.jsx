"use client"

import { useState } from "react"
import { Link, useLocation } from "react-router-dom"
import {
  Menu,
  X,
} from "lucide-react"

export default function NavBar() {
  const [isOpen, setIsOpen] = useState(false)
  const location = useLocation()
  const isAdminRoute = location.pathname.startsWith("/admin")

  // Don't render navigation on admin routes
  if (isAdminRoute) {
    return null
  }

  return (
    <>
      {/* Main Navigation */}
      <nav className="gov-nav sticky top-0 z-50 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20">
            <div className="flex items-center">
              <Link to="/" className="flex items-center space-x-4">
                <img
                  src="/images/lmis-logo.png"
                  alt="LMIS Logo"
                  className="w-40 h-auto object-contain"
                />

              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-8">
              <Link
                to="/"
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${location.pathname === "/"
                  ? "text-primary-600 bg-primary-50 shadow-sm"
                  : "text-gray-700 hover:text-primary-600 hover:bg-gray-50"
                  }`}
              >
                Home
              </Link>
              <Link
                to="/services"
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${location.pathname === "/services"
                  ? "text-primary-600 bg-primary-50 shadow-sm"
                  : "text-gray-700 hover:text-primary-600 hover:bg-gray-50"
                  }`}
              >
                Services
              </Link>
              <Link
                to="/news"
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${location.pathname === "/news"
                  ? "text-primary-600 bg-primary-50 shadow-sm"
                  : "text-gray-700 hover:text-primary-600 hover:bg-gray-50"
                  }`}
              >
                News & Updates
              </Link>
              <Link
                to="/about"
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${location.pathname === "/about"
                  ? "text-primary-600 bg-primary-50 shadow-sm"
                  : "text-gray-700 hover:text-primary-600 hover:bg-gray-50"
                  }`}
              >
                About
              </Link>
              <Link
                to="/contact"
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${location.pathname === "/contact"
                  ? "text-primary-600 bg-primary-50 shadow-sm"
                  : "text-gray-700 hover:text-primary-600 hover:bg-gray-50"
                  }`}
              >
                Contact
              </Link>

              {/* Login Button */}
              <Link to="/login">
                <button className="px-4 py-2 border border-lmis-blue-primary text-lmis-blue-primary bg-white rounded-md text-sm font-semibold">
                  Login
                </button>
              </Link>

              {/* Download App */}
              <button className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-semibold hover:bg-blue-700 transition-colors">
                Download App
              </button>


            </div>

            {/* Mobile menu button */}
            <div className="lg:hidden flex items-center">
              <button
                onClick={() => setIsOpen(!isOpen)}
                className="text-gray-700 hover:text-primary-600 focus:outline-none focus:text-primary-600 p-2"
              >
                {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isOpen && (
            <div className="lg:hidden">
              <div className="px-2 pt-2 pb-3 space-y-1 bg-white border-t shadow-lg">
                <Link
                  to="/"
                  className="block px-4 py-3 rounded-lg text-base font-semibold text-gray-700 hover:text-primary-600 hover:bg-primary-50 transition-all duration-200"
                  onClick={() => setIsOpen(false)}
                >
                  Home
                </Link>
                <Link
                  to="/services"
                  className="block px-4 py-3 rounded-lg text-base font-semibold text-gray-700 hover:text-primary-600 hover:bg-primary-50 transition-all duration-200"
                  onClick={() => setIsOpen(false)}
                >
                  Services
                </Link>
                <Link
                  to="/news"
                  className="block px-4 py-3 rounded-lg text-base font-semibold text-gray-700 hover:text-primary-600 hover:bg-primary-50 transition-all duration-200"
                  onClick={() => setIsOpen(false)}
                >
                  News & Updates
                </Link>
                <Link
                  to="/about"
                  className="block px-4 py-3 rounded-lg text-base font-semibold text-gray-700 hover:text-primary-600 hover:bg-primary-50 transition-all duration-200"
                  onClick={() => setIsOpen(false)}
                >
                  About
                </Link>
                <Link
                  to="/contact"
                  className="block px-4 py-3 rounded-lg text-base font-semibold text-gray-700 hover:text-primary-600 hover:bg-primary-50 transition-all duration-200"
                  onClick={() => setIsOpen(false)}
                >
                  Contact
                </Link>
                <Link
                  to="/login"
                  className="block px-6 py-2 rounded-lg text-base font-semibold bg-white text-blue-600 border border-blue-400 hover:bg-blue-50 transition-all duration-200 text-center"
                  onClick={() => setIsOpen(false)}
                >
                  Login
                </Link>
                <button
                  className="w-full block px-6 py-2 rounded-lg text-base font-semibold bg-blue-600 text-white hover:bg-blue-700 transition-all duration-200 text-center"
                  onClick={() => setIsOpen(false)}
                >
                  Download App
                </button>

              </div>
            </div>
          )}
        </div>
      </nav>
    </>
  )
}
