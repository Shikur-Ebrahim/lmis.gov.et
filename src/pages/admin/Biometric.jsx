"use client"

import { useState, useEffect } from "react"
import {
  collection,
  getDocs,
  doc,
  updateDoc,
  query,
  where,
  orderBy,
  onSnapshot,
  Timestamp,
} from "firebase/firestore"
import { db } from "../../config/firebase.js"
import {
  Fingerprint,
  User,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Filter,
  Download,
  Upload,
  Shield,
  AlertCircle,
  Eye,
  Ban,
  Unlock,
  Calendar,
  Mail,
  Phone,
  ChevronDown,
} from "lucide-react"
import Sidebar from "../../components/admin/Sidebar"

const AdminBiometric = () => {
  const [users, setUsers] = useState([])
  const [filteredUsers, setFilteredUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [selectedUser, setSelectedUser] = useState(null)
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showActionMenu, setShowActionMenu] = useState(null) // Track which card's action menu is open
  const [actionMessage, setActionMessage] = useState({ userId: null, message: "", type: "" }) // Message state for action feedback

  useEffect(() => {
    setLoading(true)

    // Try to load users with onSnapshot (real-time updates)
    const unsubscribe = onSnapshot(
      collection(db, "registrations"),
      (snapshot) => {
        try {
          const usersList = snapshot.docs.map((doc) => {
            const data = doc.data()
            return {
              id: doc.id,
              ...data,
              createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
              biometricEnrolledAt: data.biometricEnrolledAt?.toDate
                ? data.biometricEnrolledAt.toDate()
                : data.biometricEnrolledAt,
              biometricStatusUpdatedAt: data.biometricStatusUpdatedAt?.toDate
                ? data.biometricStatusUpdatedAt.toDate()
                : data.biometricStatusUpdatedAt,
            }
          })
          setUsers(usersList)
          setFilteredUsers(usersList)
          setLoading(false)
        } catch (error) {
          console.error("Error processing users data:", error)
          setLoading(false)
          // Fallback to loadUsers if processing fails
          loadUsers()
        }
      },
      (error) => {
        console.error("Error loading users from Firebase:", error)
        setLoading(false)
        // Fallback to loadUsers if onSnapshot fails
        console.log("Falling back to loadUsers...")
        loadUsers()
      },
    )

    return () => unsubscribe()
  }, [])

  useEffect(() => {
    let filtered = users

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          `${user.firstName} ${user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.phone?.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Status filter
    if (filterStatus !== "all") {
      filtered = filtered.filter((user) => {
        const biometricStatus = user.biometricStatus || "not_enrolled"
        if (filterStatus === "enrolled") return biometricStatus === "enrolled"
        if (filterStatus === "pending") return biometricStatus === "pending"
        if (filterStatus === "blocked") return biometricStatus === "blocked"
        if (filterStatus === "not_enrolled") return biometricStatus === "not_enrolled"
        return true
      })
    }

    // Sort: pending status comes first, then others
    filtered.sort((a, b) => {
      const statusA = a.biometricStatus || "not_enrolled"
      const statusB = b.biometricStatus || "not_enrolled"

      if (statusA === "pending" && statusB !== "pending") return -1
      if (statusA !== "pending" && statusB === "pending") return 1
      return 0
    })

    setFilteredUsers(filtered)
  }, [users, searchTerm, filterStatus])

  // Close action menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showActionMenu && !event.target.closest('.action-menu-container')) {
        setShowActionMenu(null)
      }
    }
    if (showActionMenu) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showActionMenu])

  const loadUsers = async () => {
    try {
      setLoading(true)
      const usersSnapshot = await getDocs(collection(db, "users"))
      const usersList = usersSnapshot.docs.map((doc) => {
        const data = doc.data()
        return {
          id: doc.id,
          ...data,
          createdAt: data.createdAt?.toDate ? data.createdAt.toDate() : data.createdAt,
          biometricEnrolledAt: data.biometricEnrolledAt?.toDate
            ? data.biometricEnrolledAt.toDate()
            : data.biometricEnrolledAt,
          biometricStatusUpdatedAt: data.biometricStatusUpdatedAt?.toDate
            ? data.biometricStatusUpdatedAt.toDate()
            : data.biometricStatusUpdatedAt,
        }
      })
      setUsers(usersList)
      setFilteredUsers(usersList)
    } catch (error) {
      console.error("Error loading users:", error)
      // Show user-friendly error messages
      if (error.code === "permission-denied") {
        console.error("Permission denied. Please check your Firebase security rules.")
        alert("Permission denied. Please check your Firebase security rules.")
      } else if (error.code === "unavailable") {
        console.error("Firebase service is unavailable. Please check your internet connection.")
        alert("Firebase service is unavailable. Please check your internet connection.")
      } else {
        console.error("Error details:", error.message || error)
        // Only show alert for unexpected errors
        if (!error.code) {
          alert(`Error loading users: ${error.message || "Unknown error"}`)
        }
      }
    } finally {
      setLoading(false)
    }
  }

  const updateBiometricStatus = async (userId, status, reason = "") => {
    try {
      const userRef = doc(db, "users", userId)
      await updateDoc(userRef, {
        biometricStatus: status,
        biometricStatusUpdatedAt: Timestamp.now(),
        biometricStatusReason: reason,
        biometricStatusUpdatedBy: "admin",
      })

      // Also update in biometrics collection if exists
      const biometricsQuery = query(collection(db, "biometrics"), where("userId", "==", userId))
      const biometricsSnapshot = await getDocs(biometricsQuery)
      if (!biometricsSnapshot.empty) {
        const biometricDoc = biometricsSnapshot.docs[0]
        await updateDoc(doc(db, "biometrics", biometricDoc.id), {
          status: status,
          updatedAt: Timestamp.now(),
          reason: reason,
        })
      }

      // Show success message
      setActionMessage({
        userId: userId,
        message: `Status updated to ${status} successfully`,
        type: "success",
      })
      setShowDetailModal(false)

      // Close menu and clear message after 3 seconds
      setTimeout(() => {
        setShowActionMenu(null)
        setActionMessage({ userId: null, message: "", type: "" })
      }, 3000)
    } catch (error) {
      console.error("Error updating biometric status:", error)
      // Show error message
      setActionMessage({
        userId: userId,
        message: "Error updating biometric status",
        type: "error",
      })

      // Close menu and clear message after 3 seconds
      setTimeout(() => {
        setShowActionMenu(null)
        setActionMessage({ userId: null, message: "", type: "" })
      }, 3000)
    }
  }

  const viewUserDetails = (user) => {
    setSelectedUser(user)
    setShowDetailModal(true)
  }

  const getStatusBadge = (status) => {
    const badges = {
      enrolled: {
        color: "bg-green-100 text-green-800 border-green-300",
        icon: CheckCircle,
        text: "Enrolled",
      },
      pending: {
        color: "bg-yellow-100 text-yellow-800 border-yellow-300",
        icon: Clock,
        text: "Pending",
      },
      blocked: {
        color: "bg-red-100 text-red-800 border-red-300",
        icon: Ban,
        text: "Blocked",
      },
      not_enrolled: {
        color: "bg-gray-100 text-gray-800 border-gray-300",
        icon: XCircle,
        text: "Not Enrolled",
      },
    }

    const badge = badges[status] || badges.not_enrolled
    const Icon = badge.icon

    return (
      <span
        className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${badge.color}`}
      >
        <Icon className="w-3 h-3 mr-1" />
        {badge.text}
      </span>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <Sidebar />
      <div className="lg:ml-64 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 border border-gray-100">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
            <div className="mb-6 lg:mb-0">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2 flex items-center">
                <Fingerprint className="w-10 h-10 mr-3 text-blue-600" />
                Biometric Management
              </h1>
              <p className="text-gray-600 text-lg">
                Control and manage user fingerprint enrollment and access
              </p>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 border border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0 md:space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search by name, email, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Filter className="text-gray-400 w-5 h-5" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="enrolled">Enrolled</option>
                <option value="pending">Pending</option>
                <option value="blocked">Blocked</option>
                <option value="not_enrolled">Not Enrolled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Users Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full flex justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-500">
              <User className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p>No users found</p>
            </div>
          ) : (
            filteredUsers.map((user) => (
              <div
                key={user.id}
                className="bg-white rounded-xl shadow-lg border border-gray-200 p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0 h-12 w-12 rounded-full bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                      {user.firstName?.[0] || "U"}
                      {user.lastName?.[0] || ""}
                    </div>
                    <div>
                      <div className="text-lg font-semibold text-gray-900">
                        {user.firstName} {user.lastName}
                      </div>
                      <div className="text-xs text-gray-500 font-mono">ID: {user.id.substring(0, 8)}</div>
                    </div>
                  </div>
                  {getStatusBadge(user.biometricStatus || "not_enrolled")}
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center space-x-2 text-sm text-gray-600">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <span className="truncate">{user.email || "N/A"}</span>
                  </div>
                  {user.phone && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span>{user.phone}</span>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-gray-200 relative action-menu-container">
                  <button
                    onClick={() => setShowActionMenu(showActionMenu === user.id ? null : user.id)}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 px-4 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-all flex items-center justify-center space-x-2 font-medium"
                  >
                    <span>Action</span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${showActionMenu === user.id ? 'rotate-180' : ''}`} />
                  </button>

                  {showActionMenu === user.id && (
                    <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-lg shadow-xl border border-gray-200 z-10 overflow-hidden action-menu-container">
                      <button
                        onClick={() => {
                          updateBiometricStatus(user.id, "enrolled", "Approved by admin")
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-green-50 text-green-700 flex items-center space-x-2 transition-colors"
                      >
                        <CheckCircle className="w-4 h-4" />
                        <span>Approve Enrollment</span>
                      </button>
                      <button
                        onClick={() => {
                          updateBiometricStatus(user.id, "pending", "Pending review")
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-yellow-50 text-yellow-700 flex items-center space-x-2 transition-colors"
                      >
                        <Clock className="w-4 h-4" />
                        <span>Set Pending</span>
                      </button>
                      <button
                        onClick={() => {
                          updateBiometricStatus(user.id, "blocked", "Blocked by admin")
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-red-50 text-red-700 flex items-center space-x-2 transition-colors"
                      >
                        <Ban className="w-4 h-4" />
                        <span>Block Access</span>
                      </button>
                      <button
                        onClick={() => {
                          updateBiometricStatus(user.id, "not_enrolled", "Reset by admin")
                        }}
                        className="w-full px-4 py-3 text-left hover:bg-gray-50 text-gray-700 flex items-center space-x-2 transition-colors"
                      >
                        <Unlock className="w-4 h-4" />
                        <span>Reset Status</span>
                      </button>
                    </div>
                  )}

                  {/* Action Message Display */}
                  {actionMessage.userId === user.id && actionMessage.message && (
                    <div className={`mt-2 p-3 rounded-lg text-sm ${actionMessage.type === "success"
                        ? "bg-green-50 text-green-700 border border-green-200"
                        : "bg-red-50 text-red-700 border border-red-200"
                      }`}>
                      <div className="flex items-center space-x-2">
                        {actionMessage.type === "success" ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : (
                          <XCircle className="w-4 h-4" />
                        )}
                        <span>{actionMessage.message}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {/* User Detail Modal */}
        {showDetailModal && selectedUser && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-2xl max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900 flex items-center">
                  <Fingerprint className="w-6 h-6 mr-2 text-blue-600" />
                  User Biometric Details
                </h3>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                {/* User Info */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">User Information</h4>
                  <div className="flex items-center space-x-4 mb-4">
                    <div className="flex-shrink-0 h-16 w-16">
                      {selectedUser.profileImageUrl ? (
                        <img className="h-16 w-16 rounded-full object-cover" src={selectedUser.profileImageUrl} alt="" />
                      ) : (
                        <div className="h-16 w-16 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 text-2xl font-bold">
                          {selectedUser.firstName?.[0] || "U"}
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="text-xl font-semibold text-gray-900">
                        {selectedUser.firstName} {selectedUser.lastName}
                      </div>
                      <div className="text-sm text-gray-500">{selectedUser.email || "N/A"}</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Phone</label>
                      <p className="text-gray-900">{selectedUser.phone || "N/A"}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700">User ID</label>
                      <p className="text-gray-900 font-mono text-sm">{selectedUser.id}</p>
                    </div>
                  </div>
                </div>

                {/* Biometric Status */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Biometric Status</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700">Current Status</label>
                      <div className="mt-2">
                        {getStatusBadge(selectedUser.biometricStatus || "not_enrolled")}
                      </div>
                    </div>
                    {selectedUser.biometricEnrolledAt && (
                      <div>
                        <label className="text-sm font-medium text-gray-700">Enrollment Date</label>
                        <p className="text-gray-900">
                          {new Date(selectedUser.biometricEnrolledAt.toDate()).toLocaleString()}
                        </p>
                      </div>
                    )}
                    {selectedUser.biometricStatusUpdatedAt && (
                      <div>
                        <label className="text-sm font-medium text-gray-700">Last Updated</label>
                        <p className="text-gray-900">
                          {new Date(selectedUser.biometricStatusUpdatedAt.toDate()).toLocaleString()}
                        </p>
                      </div>
                    )}
                    {selectedUser.biometricStatusReason && (
                      <div>
                        <label className="text-sm font-medium text-gray-700">Reason</label>
                        <p className="text-gray-900">{selectedUser.biometricStatusReason}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Actions */}
                <div className="bg-gray-50 rounded-xl p-6">
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">Actions</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={() => updateBiometricStatus(selectedUser.id, "enrolled", "Approved by admin")}
                      className="px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center space-x-2"
                    >
                      <CheckCircle className="w-5 h-5" />
                      <span>Approve Enrollment</span>
                    </button>
                    <button
                      onClick={() => updateBiometricStatus(selectedUser.id, "pending", "Pending review")}
                      className="px-4 py-3 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors flex items-center justify-center space-x-2"
                    >
                      <Clock className="w-5 h-5" />
                      <span>Set Pending</span>
                    </button>
                    <button
                      onClick={() => updateBiometricStatus(selectedUser.id, "blocked", "Blocked by admin")}
                      className="px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors flex items-center justify-center space-x-2"
                    >
                      <Ban className="w-5 h-5" />
                      <span>Block Access</span>
                    </button>
                    <button
                      onClick={() => updateBiometricStatus(selectedUser.id, "not_enrolled", "Reset by admin")}
                      className="px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center space-x-2"
                    >
                      <Unlock className="w-5 h-5" />
                      <span>Reset Status</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  </div>
  )
}

export default AdminBiometric

