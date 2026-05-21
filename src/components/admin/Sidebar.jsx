import { useState, useEffect } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { useAuth } from "../../hooks/useAuth"
import { collection, onSnapshot } from "firebase/firestore"
import { db, auth } from "../../config/firebase"
import {
  Users,
  CheckCircle,
  MessageSquare,
  UserPlus,
  Bell,
  Menu,
  X,
  Activity,
  Settings,
  CreditCard,
  LogOut,
  Building2,
  Video
} from "lucide-react"

export default function Sidebar() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [stats, setStats] = useState({
    unreadRegistrations: 0,
    unreadMessages: 0,
    unreadNotifications: 0,
    pendingBiometric: 0,
    unreadRegistrationFees: 0,
    unreadPayments: 0,
  })

  const handleLogout = async () => {
    try {
      await logout()
      navigate("/")
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  useEffect(() => {
    // Listen for user changes (Registrations)
    const unsubUsers = onSnapshot(collection(db, "users"), (snapshot) => {
      const currentUserId = auth.currentUser?.uid
      const unread = snapshot.docs.filter(doc => {
        const data = doc.data()
        const role = data.role ? data.role.toLowerCase() : ""
        const isAdmin = role === 'admin'
        const isCurrentUser = currentUserId && doc.id === currentUserId
        return !isAdmin && !isCurrentUser && !data.isRead
      }).length
      
      setStats((prev) => ({
        ...prev,
        unreadRegistrations: unread,
      }))
    })

    // Listen for biometric status in registrations
    const unsubBiometric = onSnapshot(collection(db, "registrations"), (snapshot) => {
      const pendingBiometricCount = snapshot.docs.filter(doc => doc.data().biometricStatus === "pending").length
      setStats((prev) => ({
        ...prev,
        pendingBiometric: pendingBiometricCount,
      }))
    })

    // Listen for registration fees
    const unsubFees = onSnapshot(collection(db, "registration-fees"), (snapshot) => {
      const pendingFeesCount = snapshot.docs.filter(doc => doc.data().status === "pending").length
      setStats((prev) => ({
        ...prev,
        unreadRegistrationFees: pendingFeesCount,
      }))
    })

    // Listen for messages
    const unsubMessages = onSnapshot(collection(db, "messages"), (snapshot) => {
      const unreadCount = snapshot.docs.filter(doc => !doc.data().isRead).length
      setStats((prev) => ({
        ...prev,
        unreadMessages: unreadCount,
      }))
    })

    // Listen for verified documents (Payments)
    const unsubPayments = onSnapshot(collection(db, "verified-documents"), (snapshot) => {
      const unread = snapshot.docs.filter(doc => !doc.data().isRead).length
      setStats((prev) => ({
        ...prev,
        unreadPayments: unread,
      }))
    })

    return () => {
      unsubUsers()
      unsubBiometric()
      unsubFees()
      unsubMessages()
      unsubPayments()
    }
  }, [])

  const navItems = [
    { to: "/admin/dashboard", icon: Settings, label: "Dashboard" },
    { to: "/admin/registration-fees", icon: CreditCard, label: "Registration Fees", badge: stats.unreadRegistrationFees, badgeColor: "bg-yellow-500 text-black animate-bounce", extraClass: "text-cyan-400 font-bold" },
    { to: "/admin/RegisterDetail", icon: UserPlus, label: "Registrations", badge: stats.unreadRegistrations, badgeColor: "bg-red-500" },
    { to: "/admin/applicants", icon: Users, label: "Applicants" },
    { to: "/admin/messages", icon: MessageSquare, label: "Messages", badge: stats.unreadMessages, badgeColor: "bg-red-500" },
    { to: "/admin/Payment", icon: CreditCard, label: "Payments", badge: stats.unreadPayments, badgeColor: "bg-red-500" },
    { to: "/admin/Notifications", icon: Bell, label: "Notifications", badge: stats.unreadNotifications, badgeColor: "bg-red-500" },
    { to: "/admin/videos", icon: Video, label: "Videos", iconColor: "text-indigo-400" },
    { to: "/admin/Biometric", icon: Activity, label: "Biometric", badge: stats.pendingBiometric, badgeColor: "bg-red-500" },
    { to: "/admin/account", icon: Building2, label: "Accounts" },
  ]

  return (
    <>
      {/* Mobile Sidebar Toggle */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-gray-900 border-b border-gray-800 px-4 py-4 flex items-center justify-between">
        <h1 className="text-xl font-bold text-cyan-400">Admin Panel</h1>
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 transition"
        >
          {sidebarOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Sidebar - Mobile & Desktop */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 w-64 bg-gray-900 border-r border-gray-800 transform transition-transform duration-300 lg:translate-x-0 flex flex-col ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-6 border-b border-gray-800">
          <h1 className="text-2xl font-bold text-cyan-400">Admin Panel</h1>
        </div>
        <nav className="p-4 space-y-2 overflow-y-auto flex-1 no-scrollbar" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.to
            return (
              <Link
                key={item.to}
                to={item.to}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition ${
                  isActive ? (item.extraClass || "bg-gray-800 text-cyan-400") : "hover:bg-gray-800"
                }`}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon className={`w-5 h-5 ${item.iconColor || ""}`} />
                <span>{item.label}</span>
                {item.badge > 0 && (
                  <span className={`ml-auto font-black px-2 py-0.5 rounded-full ${item.badgeColor || "bg-red-500 text-white text-xs"}`} style={!item.badgeColor ? { fontSize: '10px' } : {}}>
                    {item.badge}
                  </span>
                )}
              </Link>
            )
          })}

          {/* Logout Button */}
          <div className="pt-4 mt-4 border-t border-gray-800">
            <button
              onClick={() => {
                handleLogout()
                setSidebarOpen(false)
              }}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg hover:bg-red-900/50 transition text-red-400 hover:text-red-300"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </nav>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/70 z-30 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </>
  )
}
