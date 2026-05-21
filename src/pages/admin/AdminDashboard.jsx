"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../../hooks/useAuth"
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
} from "firebase/firestore"
import { db, auth } from "../../config/firebase"
import {
  Users,
  CheckCircle,
  MessageSquare,
  TrendingUp,
  UserPlus,
  FileText,
  Bell,
  Eye,
  Calendar,
  Briefcase,
  Menu,
  X,
  Activity,
  Settings,
  CreditCard,
  LogOut,
  Building2,
} from "lucide-react"
import Sidebar from "../../components/admin/Sidebar"

export default function AdminDashboard() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [stats, setStats] = useState({
    totalApplicants: 0,
    acceptedApplicants: 0,
    pendingApplicants: 0,
    unreadMessages: 0,
    totalRegistrations: 0,
    unreadRegistrations: 0,
    todayRegistrations: 0,
    thisWeekRegistrations: 0,
    unreadPayments: 0,
    unreadNotifications: 0,
    pendingBiometric: 0,
    unreadRegistrationFees: 0,
  })
  const [recentRegistrations, setRecentRegistrations] = useState([])
  const [recentMessages, setRecentMessages] = useState([])
  const [loading, setLoading] = useState(true)

  const handleLogout = async () => {
    try {
      await logout()
      navigate("/")
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  useEffect(() => {
    fetchDashboardData()

    // Listen for user changes and calculate counts
    const unsubscribe = onSnapshot(collection(db, "users"), (snapshot) => {
      const usersData = []
      const currentUserId = auth.currentUser?.uid

      snapshot.forEach((doc) => {
        const data = { id: doc.id, ...doc.data() }

        // Filter out admin users (case-insensitive) and current logged-in user
        const role = data.role ? data.role.toLowerCase() : "";
        const isAdmin = role === 'admin';
        const isCurrentUser = currentUserId && data.id === currentUserId;

        if (!isAdmin && !isCurrentUser) {
          usersData.push(data)
        }
      })

      const totalRegistrations = usersData.length
      const unreadRegistrations = usersData.filter((u) => !u.isRead).length

      // Applicants stats
      const applicants = usersData.filter((u) => u.status && u.status !== "Pending")
      const totalApplicants = applicants.length
      const acceptedApplicants = usersData.filter((u) => u.status === "Approved" || u.status === "Accepted").length
      const pendingApplicants = usersData.filter((u) => u.status === "Pending").length

      // Date based stats
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)

      const todayRegistrations = usersData.filter((u) => {
        const regDate = u.createdAt?.toDate ? u.createdAt.toDate() : new Date(u.createdAt)
        return regDate >= today
      }).length

      const thisWeekRegistrations = usersData.filter((u) => {
        const regDate = u.createdAt?.toDate ? u.createdAt.toDate() : new Date(u.createdAt)
        return regDate >= weekAgo
      }).length

      const pendingBiometricCount = usersData.filter((u) => u.biometricStatus === "pending").length

      // Derive recent registrations from the same data source (client-side sort)
      const sortedUsers = [...usersData].sort((a, b) => {
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0)
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0)
        return dateB - dateA
      })
      const recentRegs = sortedUsers.slice(0, 5)
      setRecentRegistrations(recentRegs)

      setStats((prev) => ({
        ...prev,
        totalRegistrations,
        unreadRegistrations,
        totalApplicants,
        acceptedApplicants,
        pendingApplicants,
        todayRegistrations,
        thisWeekRegistrations,
        pendingBiometric: pendingBiometricCount,
      }))
    })

    // Listen for registration fees changes
    const unsubscribeFees = onSnapshot(collection(db, "registration-fees"), (snapshot) => {
      const pendingFeesCount = snapshot.docs.filter(doc => doc.data().status === "pending").length
      setStats((prev) => ({
        ...prev,
        unreadRegistrationFees: pendingFeesCount,
      }))
    })

    // Listen for messages changes to track unread count
    const unsubscribeMessages = onSnapshot(collection(db, "messages"), (snapshot) => {
      const unreadCount = snapshot.docs.filter(doc => !doc.data().isRead).length
      setStats((prev) => ({
        ...prev,
        unreadMessages: unreadCount,
      }))
    })

    // Listen for verified documents (Payments)
    const unsubscribePayments = onSnapshot(collection(db, "verified-documents"), (snapshot) => {
      const unread = snapshot.docs.filter(doc => !doc.data().isRead).length
      setStats((prev) => ({
        ...prev,
        unreadPayments: unread,
      }))
    })

    return () => {
      unsubscribe()
      unsubscribeFees()
      unsubscribeMessages()
      unsubscribePayments()
    }
  }, [])

  const fetchDashboardData = async () => {
    try {
      // onSnapshot handles user stats now

      const registrationFeesSnapshot = await getDocs(collection(db, "registration-fees"))
      const unreadRegistrationFees = registrationFeesSnapshot.docs.filter(doc => doc.data().status === "pending").length

      const recentMessagesQuery = query(collection(db, "messages"), orderBy("createdAt", "desc"), limit(5))
      const recentMessagesSnapshot = await getDocs(recentMessagesQuery)
      const recentMessagesData = recentMessagesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))

      const recentRegistrationsQuery = query(collection(db, "users"), orderBy("createdAt", "desc"), limit(5))
      const recentRegistrationsSnapshot = await getDocs(recentRegistrationsQuery)
      const currentUserId = auth.currentUser?.uid
      const recentRegistrationsData = recentRegistrationsSnapshot.docs
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        .filter(user => {
          const role = user.role ? user.role.toLowerCase() : "";
          const isAdmin = role === 'admin';
          const isCurrentUser = currentUserId && user.id === currentUserId;
          return !isAdmin && !isCurrentUser;
        })

      setRecentMessages(recentMessagesData)
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (timestamp) => {
    if (!timestamp) return "Unknown date"
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-cyan-500 border-t-transparent mx-auto mb-6"></div>
          <p className="text-gray-400 text-lg">Loading Dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <Sidebar />

      {/* Main Content */}
      <div className="lg:ml-64 pt-16 lg:pt-0">
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          <h1 className="hidden lg:block text-3xl font-bold mb-8 text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">
            Admin Dashboard
          </h1>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {/* Total Registrations */}
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 hover:border-cyan-500/50 transition">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-500/10 rounded-lg">
                  <UserPlus className="w-6 h-6 text-blue-400" />
                </div>
                {stats.unreadRegistrations > 0 && (
                  <span className="bg-red-500/10 text-red-500 text-xs font-bold px-2 py-1 rounded-full">
                    {stats.unreadRegistrations} New
                  </span>
                )}
              </div>
              <h3 className="text-gray-400 text-sm font-medium">Total Registrations</h3>
              <p className="text-2xl font-bold text-white mt-1">{stats.totalRegistrations}</p>
              <div className="mt-2 text-xs text-gray-500">
                <span className="text-green-400">{stats.todayRegistrations}</span> today
              </div>
            </div>

            {/* Total Applicants */}
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 hover:border-purple-500/50 transition">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-purple-500/10 rounded-lg">
                  <Users className="w-6 h-6 text-purple-400" />
                </div>
              </div>
              <h3 className="text-gray-400 text-sm font-medium">Total Applicants</h3>
              <p className="text-2xl font-bold text-white mt-1">{stats.totalApplicants}</p>
              <div className="mt-2 text-xs text-gray-500">
                Processed users
              </div>
            </div>

            {/* Accepted/Approved */}
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 hover:border-green-500/50 transition">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-500/10 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-400" />
                </div>
              </div>
              <h3 className="text-gray-400 text-sm font-medium">Accepted</h3>
              <p className="text-2xl font-bold text-white mt-1">{stats.acceptedApplicants}</p>
              <div className="mt-2 text-xs text-gray-500">
                {((stats.acceptedApplicants / (stats.totalApplicants || 1)) * 100).toFixed(0)}% approval rate
              </div>
            </div>

            {/* Pending Biometric */}
            <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 hover:border-yellow-500/50 transition">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-yellow-500/10 rounded-lg">
                  <Activity className="w-6 h-6 text-yellow-400" />
                </div>
              </div>
              <h3 className="text-gray-400 text-sm font-medium">Pending Biometric</h3>
              <p className="text-2xl font-bold text-white mt-1">{stats.pendingBiometric}</p>
              <div className="mt-2 text-xs text-gray-500">
                Awaiting enrollment
              </div>
            </div>
          </div>

          {/* Recent Sections */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Recent Registrations */}
            <div className="bg-gray-900 lg:col-span-2 rounded-2xl p-6 border border-gray-800">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Recent Registrations</h2>
                <Link to="/admin/RegisterDetail" className="text-cyan-400 hover:underline text-sm flex items-center">
                  View All <Eye className="w-4 h-4 ml-1" />
                </Link>
              </div>
              <div className="space-y-4">
                {recentRegistrations.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No registrations yet</p>
                ) : (
                  recentRegistrations.map((reg) => (
                    <div key={reg.id} className="flex items-center space-x-4 bg-gray-800/50 rounded-xl p-4">
                      <img
                        src={reg.profileImageUrl || "/placeholder.svg"}
                        alt={reg.firstName}
                        className="w-12 h-12 rounded-full object-cover border-2 border-gray-700"
                      />
                      <div className="flex-1">
                        <p className="font-medium">{reg.firstName} {reg.lastName}</p>
                        <p className="text-sm text-gray-400">{reg.jobCategory} • {reg.country}</p>
                      </div>
                      <div className="text-right">
                        <span className={`text-xs px-2 py-1 rounded-full ${reg.status === "Approved" || reg.status === "Accepted" ? "bg-green-900/50 text-green-400" :
                          reg.status === "Rejected" ? "bg-red-900/50 text-red-400" :
                            "bg-yellow-900/50 text-yellow-400"
                          }`}>
                          {reg.status || "Pending"}
                        </span>
                        {!reg.isRead && <div className="w-2 h-2 bg-red-500 rounded-full mt-2 mx-auto animate-pulse" />}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Recent Messages */}
            <div className="bg-gray-900 rounded-2xl p-6 border border-gray-800">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">Recent Messages</h2>
                <Link to="/admin/messages" className="text-cyan-400 hover:underline text-sm flex items-center">
                  View All <Eye className="w-4 h-4 ml-1" />
                </Link>
              </div>
              <div className="space-y-4">
                {recentMessages.map((msg) => (
                  <div key={msg.id} className="bg-gray-800/50 rounded-xl p-4">
                    <div className="flex justify-between">
                      <p className="font-medium">{msg.fullName}</p>
                      <p className="text-xs text-gray-500">{formatDate(msg.createdAt)}</p>
                    </div>
                    <p className="text-sm text-gray-400 mt-1">{msg.email}</p>
                    <p className="text-sm text-gray-300 mt-2 line-clamp-2">{msg.message}</p>
                    {!msg.isRead && <div className="w-2 h-2 bg-red-500 rounded-full mt-3 animate-pulse" />}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}