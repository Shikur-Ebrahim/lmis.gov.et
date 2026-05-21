"use client"
import { useState, useEffect } from "react"
import { Navigate, useLocation } from "react-router-dom"
import { useAuth } from "../hooks/useAuth"
import { auth } from "../config/firebase"

export default function ProtectedRoute({ children }) {
  const { currentUser } = useAuth()
  const location = useLocation()
  const [isAdmin, setIsAdmin] = useState(null)
  const [loading, setLoading] = useState(true)

  // Check if the route requires admin access
  const isAdminRoute = location.pathname.startsWith("/admin")

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!currentUser) {
        setLoading(false)
        setIsAdmin(false)
        return
      }

      try {
        // Get ID token result which contains custom claims
        const idTokenResult = await currentUser.getIdTokenResult()
        setIsAdmin(idTokenResult.claims.admin === true)
      } catch (error) {
        console.error("Error checking admin status:", error)
        setIsAdmin(false)
      } finally {
        setLoading(false)
      }
    }

    checkAdminStatus()
  }, [currentUser])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-950">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-cyan-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-400">Verifying access...</p>
        </div>
      </div>
    )
  }

  // If not authenticated, redirect to login
  if (!currentUser) {
    return <Navigate to="/admin/login" />
  }

  // If accessing admin route but not an admin, redirect to personal page
  if (isAdminRoute && !isAdmin) {
    return <Navigate to="/personal" />
  }

  return children
}
