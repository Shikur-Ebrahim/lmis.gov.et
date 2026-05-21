"use client"

import { useState, useEffect } from "react"
import {
  collection,
  addDoc,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
  onSnapshot,
  limit,
} from "firebase/firestore"
import { db } from "../../config/firebase.js"
import { uploadToCloudinary, getOptimizedImageUrl, validateFile } from "../../utils/cloudinary.js"

const AdminNotifications = () => {
  const [activeTab, setActiveTab] = useState("send")
  const [loading, setLoading] = useState(false)
  const [users, setUsers] = useState([])
  const [notifications, setNotifications] = useState([])
  const [filteredNotifications, setFilteredNotifications] = useState([])
  const [dailyStats, setDailyStats] = useState({ registrations: 0, notifications: 0 })
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterPriority, setFilterPriority] = useState("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [notificationsPerPage] = useState(10)
  const [recipientSearchTerm, setRecipientSearchTerm] = useState("")

  // Form states
  const [formData, setFormData] = useState({
    title: "",
    message: "",
    priority: "medium",
    type: "general",
    selectedUsers: [],
    imageFile: null,
    imageUrl: "",
    allowDownload: true,
    expiresIn: 3, // days
    scheduledFor: "",
    template: "custom",
  })

  // Settings states
  const [settings, setSettings] = useState({
    autoWelcome: true,
    welcomeTitle: "Welcome to Our Platform!",
    welcomeMessage: "Thank you for joining us. We're excited to have you on board!",
    welcomeImage: "",
    welcomeExpiry: 24, // hours
    enablePushNotifications: true,
    enableEmailNotifications: false,
    maxNotificationsPerUser: 50,
    autoDeleteAfterDays: 30,
  })

  const [selectedNotifications, setSelectedNotifications] = useState([])
  const [showBulkActions, setShowBulkActions] = useState(false)
  const [templates, setTemplates] = useState([
    {
      id: "welcome",
      name: "Welcome Message",
      title: "Welcome to Our Platform!",
      message: "Thank you for joining us. We're excited to have you on board!",
      type: "general",
      priority: "medium",
    },
    {
      id: "update",
      name: "System Update",
      title: "System Update Available",
      message: "We've released a new update with exciting features and improvements.",
      type: "update",
      priority: "medium",
    },
    {
      id: "promotion",
      name: "Special Offer",
      title: "Limited Time Offer!",
      message: "Don't miss out on our special promotion. Act now!",
      type: "promotion",
      priority: "high",
    },
  ])

  // Edit modal state
  const [editingNotification, setEditingNotification] = useState(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [showTemplateModal, setShowTemplateModal] = useState(false)
  const [showScheduleModal, setShowScheduleModal] = useState(false)

  // Load users and notifications on component mount
  useEffect(() => {
    loadUsers()
    loadNotifications()
    loadDailyStats()
    loadSettings()
    loadTemplates()
  }, [])

  useEffect(() => {
    const unsubscribe = onSnapshot(
      query(collection(db, "notifications"), orderBy("createdAt", "desc"), limit(100)),
      (snapshot) => {
        const notificationsList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
        }))
        setNotifications(notificationsList)
        setFilteredNotifications(notificationsList)
      },
    )

    return () => unsubscribe()
  }, [])

  useEffect(() => {
    let filtered = notifications

    if (searchTerm) {
      filtered = filtered.filter(
        (notification) =>
          notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          notification.message.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (filterStatus !== "all") {
      filtered = filtered.filter((notification) => {
        if (filterStatus === "read") return notification.isRead
        if (filterStatus === "unread") return !notification.isRead
        if (filterStatus === "expired") return new Date() > notification.expiresAt?.toDate()
        return true
      })
    }

    if (filterPriority !== "all") {
      filtered = filtered.filter((notification) => notification.priority === filterPriority)
    }

    setFilteredNotifications(filtered)
    setCurrentPage(1)
  }, [notifications, searchTerm, filterStatus, filterPriority])

  const loadUsers = async () => {
    try {
      const usersSnapshot = await getDocs(collection(db, "users"))
      const usersList = usersSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      setUsers(usersList)
    } catch (error) {
      console.error("Error loading users:", error)
    }
  }

  const loadNotifications = async () => {
    try {
      const notificationsSnapshot = await getDocs(query(collection(db, "notifications"), orderBy("createdAt", "desc")))
      const notificationsList = notificationsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate(),
      }))
      setNotifications(notificationsList)
    } catch (error) {
      console.error("Error loading notifications:", error)
    }
  }

  const loadDailyStats = async () => {
    try {
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      // Count today's registrations
      const registrationsQuery = query(
        collection(db, "users"),
        where("createdAt", ">=", Timestamp.fromDate(today)),
      )
      const registrationsSnapshot = await getDocs(registrationsQuery)

      // Count today's notifications
      const notificationsQuery = query(
        collection(db, "notifications"),
        where("createdAt", ">=", Timestamp.fromDate(today)),
      )
      const notificationsSnapshot = await getDocs(notificationsQuery)

      setDailyStats({
        registrations: registrationsSnapshot.size,
        notifications: notificationsSnapshot.size,
        readRate:
          notifications.length > 0
            ? Math.round((notifications.filter((n) => n.isRead).length / notifications.length) * 100)
            : 0,
        activeUsers: users.filter(
          (u) => u.lastActive && new Date(u.lastActive.toDate ? u.lastActive.toDate() : u.lastActive) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
        ).length,
      })
    } catch (error) {
      console.error("Error loading daily stats:", error)
    }
  }

  const loadSettings = async () => {
    try {
      const settingsSnapshot = await getDocs(collection(db, "notificationSettings"))
      if (!settingsSnapshot.empty) {
        const settingsData = settingsSnapshot.docs[0].data()
        setSettings((prev) => ({ ...prev, ...settingsData }))
      }
    } catch (error) {
      console.error("Error loading settings:", error)
    }
  }

  const loadTemplates = async () => {
    try {
      const templatesSnapshot = await getDocs(collection(db, "notificationTemplates"))
      if (!templatesSnapshot.empty) {
        const templatesList = templatesSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }))
        setTemplates((prev) => [...prev, ...templatesList])
      }
    } catch (error) {
      console.error("Error loading templates:", error)
    }
  }

  const handleImageUpload = async (file) => {
    try {
      validateFile(file, "image")
      setLoading(true)
      const uploadResult = await uploadToCloudinary(file, {
        folder: "notifications",
        transformation: [{ width: 800, height: 600, crop: "limit" }, { quality: "auto" }, { format: "auto" }],
      })
      setFormData((prev) => ({
        ...prev,
        imageFile: file,
        imageUrl: uploadResult.url,
      }))
    } catch (error) {
      alert(error.message)
    } finally {
      setLoading(false)
    }
  }

  const sendNotification = async () => {
    if (!formData.title || !formData.message) {
      alert("Please fill in title and message")
      return
    }

    if (formData.selectedUsers.length === 0) {
      alert("Please select at least one user")
      return
    }

    setLoading(true)
    try {
      const expiryDate = new Date()
      expiryDate.setDate(expiryDate.getDate() + formData.expiresIn)

      const scheduledDate = formData.scheduledFor ? new Date(formData.scheduledFor) : new Date()

      for (const userId of formData.selectedUsers) {
        // Find the user data to get their email
        const selectedUser = users.find((user) => user.id === userId)
        if (!selectedUser) {
          console.error(`User not found for ID: ${userId}`)
          continue
        }

        await addDoc(collection(db, "notifications"), {
          userId,
          userEmail: selectedUser.email, // Store email for querying
          title: formData.title,
          message: formData.message,
          priority: formData.priority,
          type: formData.type,
          imageUrl: formData.imageUrl,
          allowDownload: formData.allowDownload,
          isRead: false,
          createdAt: Timestamp.now(),
          scheduledFor: Timestamp.fromDate(scheduledDate),
          expiresAt: Timestamp.fromDate(expiryDate),
          sentBy: "admin",
          status: formData.scheduledFor ? "scheduled" : "sent",
          template: formData.template,
          readAt: null,
          clickCount: 0,
          downloadCount: 0,
        })
      }

      // Reset form
      setFormData({
        title: "",
        message: "",
        priority: "medium",
        type: "general",
        selectedUsers: [],
        imageFile: null,
        imageUrl: "",
        allowDownload: true,
        expiresIn: 3,
        scheduledFor: "",
        template: "custom",
      })

      alert(`Notifications ${formData.scheduledFor ? "scheduled" : "sent"} successfully!`)
      loadDailyStats()
    } catch (error) {
      console.error("Error sending notification:", error)
      alert("Error sending notification")
    } finally {
      setLoading(false)
    }
  }

  const handleBulkAction = async (action) => {
    if (selectedNotifications.length === 0) {
      alert("Please select notifications first")
      return
    }

    if (!confirm(`Are you sure you want to ${action} ${selectedNotifications.length} notifications?`)) return

    setLoading(true)
    try {
      for (const notificationId of selectedNotifications) {
        if (action === "delete") {
          await deleteDoc(doc(db, "notifications", notificationId))
        } else if (action === "markRead") {
          await updateDoc(doc(db, "notifications", notificationId), {
            isRead: true,
            readAt: Timestamp.now(),
          })
        } else if (action === "markUnread") {
          await updateDoc(doc(db, "notifications", notificationId), {
            isRead: false,
            readAt: null,
          })
        }
      }

      setSelectedNotifications([])
      setShowBulkActions(false)
      alert(`Bulk ${action} completed successfully`)
    } catch (error) {
      console.error(`Error performing bulk ${action}:`, error)
      alert(`Error performing bulk ${action}`)
    } finally {
      setLoading(false)
    }
  }

  const deleteNotification = async (notificationId) => {
    if (!confirm("Are you sure you want to delete this notification?")) return

    try {
      await deleteDoc(doc(db, "notifications", notificationId))
      alert("Notification deleted successfully")
    } catch (error) {
      console.error("Error deleting notification:", error)
      alert("Error deleting notification")
    }
  }

  const editNotification = async () => {
    if (!editingNotification) return

    try {
      await updateDoc(doc(db, "notifications", editingNotification.id), {
        title: editingNotification.title,
        message: editingNotification.message,
        priority: editingNotification.priority,
        type: editingNotification.type,
        imageUrl: editingNotification.imageUrl,
        allowDownload: editingNotification.allowDownload,
        updatedAt: Timestamp.now(),
      })

      setShowEditModal(false)
      setEditingNotification(null)
      alert("Notification updated successfully")
    } catch (error) {
      console.error("Error updating notification:", error)
      alert("Error updating notification")
    }
  }

  const saveSettings = async () => {
    try {
      const settingsSnapshot = await getDocs(collection(db, "notificationSettings"))

      if (settingsSnapshot.empty) {
        await addDoc(collection(db, "notificationSettings"), {
          ...settings,
          updatedAt: Timestamp.now(),
        })
      } else {
        const settingsDoc = settingsSnapshot.docs[0]
        await updateDoc(doc(db, "notificationSettings", settingsDoc.id), {
          ...settings,
          updatedAt: Timestamp.now(),
        })
      }

      alert("Settings saved successfully")
    } catch (error) {
      console.error("Error saving settings:", error)
      alert("Error saving settings")
    }
  }

  const applyTemplate = (template) => {
    setFormData((prev) => ({
      ...prev,
      title: template.title,
      message: template.message,
      type: template.type,
      priority: template.priority,
      template: template.id,
    }))
    setShowTemplateModal(false)
  }

  // Auto-cleanup expired notifications
  useEffect(() => {
    const cleanupExpiredNotifications = async () => {
      try {
        const now = Timestamp.now()
        const expiredQuery = query(collection(db, "notifications"), where("expiresAt", "<=", now))
        const expiredSnapshot = await getDocs(expiredQuery)

        for (const docSnapshot of expiredSnapshot.docs) {
          await deleteDoc(doc(db, "notifications", docSnapshot.id))
        }
      } catch (error) {
        console.error("Error cleaning up expired notifications:", error)
      }
    }

    // Run cleanup every hour
    const interval = setInterval(cleanupExpiredNotifications, 60 * 60 * 1000)
    return () => clearInterval(interval)
  }, [])

  const indexOfLastNotification = currentPage * notificationsPerPage
  const indexOfFirstNotification = indexOfLastNotification - notificationsPerPage
  const currentNotifications = filteredNotifications.slice(indexOfFirstNotification, indexOfLastNotification)
  const totalPages = Math.ceil(filteredNotifications.length / notificationsPerPage)

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl mb-6 border border-gray-100">
          <div className="flex flex-wrap border-b border-gray-200">
            {[
              { id: "send", label: "Send Notification", icon: "🚀", color: "blue" },
              { id: "history", label: "History", icon: "📋", color: "green" },
              { id: "settings", label: "Settings", icon: "⚙️", color: "purple" },
              { id: "analytics", label: "Analytics", icon: "📊", color: "orange" },
              { id: "templates", label: "Templates", icon: "📝", color: "pink" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 min-w-0 px-4 py-4 text-sm font-medium text-center border-b-2 transition-all duration-300 transform hover:scale-105 ${activeTab === tab.id
                  ? `border-${tab.color}-500 text-${tab.color}-600 bg-${tab.color}-50`
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50"
                  }`}
              >
                <span className="text-lg mr-2">{tab.icon}</span>
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
          {activeTab === "send" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-2xl font-bold text-gray-900 mb-4 sm:mb-0">Send New Notification</h2>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setShowTemplateModal(true)}
                    className="px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 transition-colors"
                  >
                    📝 Use Template
                  </button>
                  <button
                    onClick={() => setShowScheduleModal(true)}
                    className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                  >
                    ⏰ Schedule
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Content</h3>

                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
                        <input
                          type="text"
                          value={formData.title}
                          onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder="Enter notification title"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Message *</label>
                        <textarea
                          value={formData.message}
                          onChange={(e) => setFormData((prev) => ({ ...prev, message: e.target.value }))}
                          rows={4}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                          placeholder="Enter notification message"
                        />
                        <div className="text-sm text-gray-500 mt-1">{formData.message.length}/500 characters</div>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Notification Settings</h3>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                        <select
                          value={formData.priority}
                          onChange={(e) => setFormData((prev) => ({ ...prev, priority: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="low">🟢 Low</option>
                          <option value="medium">🟡 Medium</option>
                          <option value="high">🟠 High</option>
                          <option value="urgent">🔴 Urgent</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                        <select
                          value={formData.type}
                          onChange={(e) => setFormData((prev) => ({ ...prev, type: e.target.value }))}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="general">📢 General</option>
                          <option value="announcement">📣 Announcement</option>
                          <option value="update">🔄 Update</option>
                          <option value="warning">⚠️ Warning</option>
                          <option value="promotion">🎉 Promotion</option>
                          <option value="reminder">⏰ Reminder</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Expires in (days)</label>
                      <input
                        type="number"
                        min="1"
                        max="30"
                        value={formData.expiresIn}
                        onChange={(e) =>
                          setFormData((prev) => ({ ...prev, expiresIn: Number.parseInt(e.target.value) }))
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Image Upload</h3>

                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => e.target.files[0] && handleImageUpload(e.target.files[0])}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
                    />

                    {formData.imageUrl && (
                      <div className="space-y-3">
                        <img
                          src={
                            getOptimizedImageUrl(formData.imageUrl, {
                              width: 300,
                              height: 200 || "/placeholder.svg",
                            }) || "/placeholder.svg"
                          }
                          alt="Preview"
                          className="w-full h-48 object-cover rounded-lg border border-gray-200"
                        />
                        <label className="flex items-center space-x-2">
                          <input
                            type="checkbox"
                            checked={formData.allowDownload}
                            onChange={(e) => setFormData((prev) => ({ ...prev, allowDownload: e.target.checked }))}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className="text-sm text-gray-700">Allow users to download this image</span>
                        </label>
                      </div>
                    )}
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="bg-gray-50 rounded-xl p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Recipients *</h3>

                    <div className="space-y-4">
                      <div>
                        <input
                          type="text"
                          placeholder="Search by name or email..."
                          value={recipientSearchTerm}
                          onChange={(e) => setRecipientSearchTerm(e.target.value)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
                        />
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
                        <div className="flex items-center space-x-4">
                          <button
                            onClick={() => {
                              const filteredUsers = users.filter((user) => {
                                const searchLower = recipientSearchTerm.toLowerCase()
                                const fullName = `${user.firstName} ${user.lastName}`.toLowerCase()
                                const email = (user.email || "").toLowerCase()
                                return (
                                  !recipientSearchTerm ||
                                  fullName.includes(searchLower) ||
                                  email.includes(searchLower)
                                )
                              })
                              const allUserIds = filteredUsers.map((user) => user.id)
                              const allFilteredSelected = allUserIds.every((id) =>
                                formData.selectedUsers.includes(id),
                              )
                              setFormData((prev) => ({
                                ...prev,
                                selectedUsers: allFilteredSelected
                                  ? prev.selectedUsers.filter((id) => !allUserIds.includes(id))
                                  : [...new Set([...prev.selectedUsers, ...allUserIds])],
                              }))
                            }}
                            className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                          >
                            {(() => {
                              const filteredUsers = users.filter((user) => {
                                const searchLower = recipientSearchTerm.toLowerCase()
                                const fullName = `${user.firstName} ${user.lastName}`.toLowerCase()
                                const email = (user.email || "").toLowerCase()
                                return (
                                  !recipientSearchTerm ||
                                  fullName.includes(searchLower) ||
                                  email.includes(searchLower)
                                )
                              })
                              const allFilteredSelected = filteredUsers.every((user) =>
                                formData.selectedUsers.includes(user.id),
                              )
                              return allFilteredSelected ? "Deselect All" : "Select All"
                            })()}
                          </button>
                          <span className="text-sm text-gray-500">
                            ({formData.selectedUsers.length} of {users.length} selected)
                          </span>
                        </div>
                      </div>

                      <div className="border border-gray-300 rounded-lg max-h-80 overflow-y-auto">
                        <div className="space-y-1 p-2">
                          {users
                            .filter((user) => {
                              if (!recipientSearchTerm) return true
                              const searchLower = recipientSearchTerm.toLowerCase()
                              const fullName = `${user.firstName} ${user.lastName}`.toLowerCase()
                              const email = (user.email || "").toLowerCase()
                              return fullName.includes(searchLower) || email.includes(searchLower)
                            })
                            .map((user) => (
                              <label
                                key={user.id}
                                className="flex items-center p-3 hover:bg-blue-50 rounded-lg cursor-pointer transition-colors"
                              >
                                <input
                                  type="checkbox"
                                  checked={formData.selectedUsers.includes(user.id)}
                                  onChange={(e) => {
                                    if (e.target.checked) {
                                      setFormData((prev) => ({
                                        ...prev,
                                        selectedUsers: [...prev.selectedUsers, user.id],
                                      }))
                                    } else {
                                      setFormData((prev) => ({
                                        ...prev,
                                        selectedUsers: prev.selectedUsers.filter((id) => id !== user.id),
                                      }))
                                    }
                                  }}
                                  className="mr-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <div className="flex-1">
                                  <div className="font-medium text-gray-900">
                                    {user.firstName} {user.lastName}
                                  </div>
                                  <div className="text-sm text-gray-500">{user.email}</div>
                                  <div className="text-xs text-gray-400">
                                    Joined: {user.createdAt?.toDate?.()?.toLocaleDateString() || "N/A"}
                                  </div>
                                </div>
                              </label>
                            ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={sendNotification}
                    disabled={loading || formData.selectedUsers.length === 0}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-lg transition-all transform hover:scale-105 shadow-lg"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Sending...
                      </div>
                    ) : (
                      `🚀 Send to ${formData.selectedUsers.length} User${formData.selectedUsers.length !== 1 ? "s" : ""}`
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeTab === "history" && (
            <div className="space-y-6">
              <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                <h2 className="text-2xl font-bold text-gray-900">Notification History</h2>

                <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-4">
                  <input
                    type="text"
                    placeholder="Search notifications..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Status</option>
                    <option value="read">Read</option>
                    <option value="unread">Unread</option>
                    <option value="expired">Expired</option>
                  </select>
                  <select
                    value={filterPriority}
                    onChange={(e) => setFilterPriority(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="all">All Priorities</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              {selectedNotifications.length > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-blue-800 font-medium">
                      {selectedNotifications.length} notification{selectedNotifications.length !== 1 ? "s" : ""}{" "}
                      selected
                    </span>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleBulkAction("markRead")}
                        className="px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200 text-sm"
                      >
                        Mark Read
                      </button>
                      <button
                        onClick={() => handleBulkAction("markUnread")}
                        className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 text-sm"
                      >
                        Mark Unread
                      </button>
                      <button
                        onClick={() => handleBulkAction("delete")}
                        className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 text-sm"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {currentNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`border rounded-xl p-6 hover:shadow-lg transition-all ${notification.isRead ? "border-gray-200 bg-gray-50" : "border-blue-200 bg-blue-50"
                      }`}
                  >
                    <div className="flex items-start space-x-4">
                      <input
                        type="checkbox"
                        checked={selectedNotifications.includes(notification.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedNotifications((prev) => [...prev, notification.id])
                          } else {
                            setSelectedNotifications((prev) => prev.filter((id) => id !== notification.id))
                          }
                        }}
                        className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />

                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-3">
                          <h3 className="font-semibold text-gray-900 text-lg">{notification.title}</h3>
                          <span
                            className={`px-3 py-1 text-xs rounded-full font-medium ${notification.priority === "urgent"
                              ? "bg-red-100 text-red-800"
                              : notification.priority === "high"
                                ? "bg-orange-100 text-orange-800"
                                : notification.priority === "medium"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-green-100 text-green-800"
                              }`}
                          >
                            {notification.priority}
                          </span>
                          <span className="px-3 py-1 text-xs bg-blue-100 text-blue-800 rounded-full font-medium">
                            {notification.type}
                          </span>
                          {!notification.isRead && (
                            <span className="px-3 py-1 text-xs bg-red-100 text-red-800 rounded-full font-medium">
                              Unread
                            </span>
                          )}
                        </div>

                        <p className="text-gray-700 mb-4 leading-relaxed">{notification.message}</p>

                        {notification.imageUrl && (
                          <div className="mb-4">
                            <img
                              src={
                                getOptimizedImageUrl(notification.imageUrl, {
                                  width: 200,
                                  height: 150 || "/placeholder.svg",
                                }) || "/placeholder.svg"
                              }
                              alt="Notification"
                              className="w-32 h-24 object-cover rounded-lg border border-gray-200 shadow-sm"
                            />
                            {notification.allowDownload && (
                              <a
                                href={notification.imageUrl}
                                download
                                className="inline-block mt-2 text-sm text-blue-600 hover:text-blue-800"
                              >
                                📥 Download Image
                              </a>
                            )}
                          </div>
                        )}

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm text-gray-600 mb-4">
                          <div>
                            <span className="font-medium">Sent:</span> {notification.createdAt?.toLocaleDateString()}{" "}
                            {notification.createdAt?.toLocaleTimeString()}
                          </div>
                          <div>
                            <span className="font-medium">Expires:</span>{" "}
                            {notification.expiresAt?.toDate?.()?.toLocaleDateString() || "Never"}
                          </div>
                          <div>
                            <span className="font-medium">Clicks:</span> {notification.clickCount || 0}
                          </div>
                          <div>
                            <span className="font-medium">Downloads:</span> {notification.downloadCount || 0}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col space-y-2">
                        <button
                          onClick={() => {
                            setEditingNotification(notification)
                            setShowEditModal(true)
                          }}
                          className="px-4 py-2 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                        >
                          ✏️ Edit
                        </button>
                        <button
                          onClick={() => deleteNotification(notification.id)}
                          className="px-4 py-2 text-sm bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {filteredNotifications.length === 0 && (
                  <div className="text-center py-12">
                    <div className="text-6xl mb-4">📭</div>
                    <div className="text-xl text-gray-500 mb-2">No notifications found</div>
                    <div className="text-gray-400">Try adjusting your search or filters</div>
                  </div>
                )}
              </div>

              {totalPages > 1 && (
                <div className="flex items-center justify-center space-x-2 mt-8">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Previous
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-4 py-2 border rounded-lg ${currentPage === page
                        ? "bg-blue-600 text-white border-blue-600"
                        : "border-gray-300 hover:bg-gray-50"
                        }`}
                    >
                      {page}
                    </button>
                  ))}

                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === "settings" && (
            <div className="space-y-8">
              <h2 className="text-2xl font-bold text-gray-900">Notification Settings</h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                    <span className="text-2xl mr-2">👋</span>
                    Auto Welcome Messages
                  </h3>

                  <div className="space-y-6">
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={settings.autoWelcome}
                        onChange={(e) => setSettings((prev) => ({ ...prev, autoWelcome: e.target.checked }))}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="font-medium text-gray-700">Enable automatic welcome messages for new users</span>
                    </label>

                    {settings.autoWelcome && (
                      <div className="space-y-4 pl-6 border-l-2 border-blue-300">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Welcome Title</label>
                          <input
                            type="text"
                            value={settings.welcomeTitle}
                            onChange={(e) => setSettings((prev) => ({ ...prev, welcomeTitle: e.target.value }))}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Welcome Message</label>
                          <textarea
                            value={settings.welcomeMessage}
                            onChange={(e) => setSettings((prev) => ({ ...prev, welcomeMessage: e.target.value }))}
                            rows={4}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">Expires in (hours)</label>
                          <input
                            type="number"
                            min="1"
                            max="168"
                            value={settings.welcomeExpiry}
                            onChange={(e) =>
                              setSettings((prev) => ({ ...prev, welcomeExpiry: Number.parseInt(e.target.value) }))
                            }
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                    <span className="text-2xl mr-2">🔔</span>
                    Notification Preferences
                  </h3>

                  <div className="space-y-6">
                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={settings.enablePushNotifications}
                        onChange={(e) =>
                          setSettings((prev) => ({ ...prev, enablePushNotifications: e.target.checked }))
                        }
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                      <span className="font-medium text-gray-700">Enable push notifications</span>
                    </label>

                    <label className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        checked={settings.enableEmailNotifications}
                        onChange={(e) =>
                          setSettings((prev) => ({ ...prev, enableEmailNotifications: e.target.checked }))
                        }
                        className="rounded border-gray-300 text-green-600 focus:ring-green-500"
                      />
                      <span className="font-medium text-gray-700">Enable email notifications</span>
                    </label>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Max notifications per user</label>
                      <input
                        type="number"
                        min="10"
                        max="200"
                        value={settings.maxNotificationsPerUser}
                        onChange={(e) =>
                          setSettings((prev) => ({ ...prev, maxNotificationsPerUser: Number.parseInt(e.target.value) }))
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Auto-delete after (days)</label>
                      <input
                        type="number"
                        min="7"
                        max="365"
                        value={settings.autoDeleteAfterDays}
                        onChange={(e) =>
                          setSettings((prev) => ({ ...prev, autoDeleteAfterDays: Number.parseInt(e.target.value) }))
                        }
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-center">
                <button
                  onClick={saveSettings}
                  className="bg-gradient-to-r from-green-600 to-emerald-600 text-white py-3 px-8 rounded-xl hover:from-green-700 hover:to-emerald-700 font-medium text-lg transition-all transform hover:scale-105 shadow-lg"
                >
                  💾 Save Settings
                </button>
              </div>
            </div>
          )}

          {activeTab === "analytics" && (
            <div className="space-y-8">
              <h2 className="text-2xl font-bold text-gray-900">Analytics & Statistics</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl p-6 text-white transform hover:scale-105 transition-transform">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-3xl font-bold mb-2">{notifications.length}</div>
                      <div className="text-blue-100">Total Notifications</div>
                    </div>
                    <div className="text-4xl opacity-80">📧</div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-xl p-6 text-white transform hover:scale-105 transition-transform">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-3xl font-bold mb-2">{users.length}</div>
                      <div className="text-green-100">Total Users</div>
                    </div>
                    <div className="text-4xl opacity-80">👥</div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl p-6 text-white transform hover:scale-105 transition-transform">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-3xl font-bold mb-2">{notifications.filter((n) => !n.isRead).length}</div>
                      <div className="text-yellow-100">Unread Notifications</div>
                    </div>
                    <div className="text-4xl opacity-80">📬</div>
                  </div>
                </div>

                <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl p-6 text-white transform hover:scale-105 transition-transform">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-3xl font-bold mb-2">
                        {Math.round(
                          (notifications.filter((n) => n.isRead).length / Math.max(notifications.length, 1)) * 100,
                        )}
                        %
                      </div>
                      <div className="text-purple-100">Read Rate</div>
                    </div>
                    <div className="text-4xl opacity-80">📊</div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                    <span className="text-2xl mr-2">📈</span>
                    Priority Distribution
                  </h3>
                  <div className="space-y-4">
                    {["urgent", "high", "medium", "low"].map((priority) => {
                      const count = notifications.filter((n) => n.priority === priority).length
                      const percentage = notifications.length > 0 ? Math.round((count / notifications.length) * 100) : 0
                      return (
                        <div key={priority} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span
                              className={`w-3 h-3 rounded-full ${priority === "urgent"
                                ? "bg-red-500"
                                : priority === "high"
                                  ? "bg-orange-500"
                                  : priority === "medium"
                                    ? "bg-yellow-500"
                                    : "bg-green-500"
                                }`}
                            ></span>
                            <span className="capitalize font-medium">{priority}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-gray-600">{count}</span>
                            <span className="text-sm text-gray-500">({percentage}%)</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                  <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                    <span className="text-2xl mr-2">🏷️</span>
                    Type Distribution
                  </h3>
                  <div className="space-y-4">
                    {["general", "announcement", "update", "warning", "promotion", "reminder"].map((type) => {
                      const count = notifications.filter((n) => n.type === type).length
                      const percentage = notifications.length > 0 ? Math.round((count / notifications.length) * 100) : 0
                      return (
                        <div key={type} className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="capitalize font-medium">{type}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <span className="text-gray-600">{count}</span>
                            <span className="text-sm text-gray-500">({percentage}%)</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                  <span className="text-2xl mr-2">⏰</span>
                  Recent Activity
                </h3>
                <div className="space-y-3">
                  {notifications.slice(0, 10).map((notification) => (
                    <div
                      key={notification.id}
                      className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0"
                    >
                      <div className="flex items-center space-x-3">
                        <span
                          className={`w-2 h-2 rounded-full ${notification.isRead ? "bg-green-500" : "bg-red-500"}`}
                        ></span>
                        <div>
                          <span className="font-medium text-gray-900">{notification.title}</span>
                          <div className="text-sm text-gray-500">
                            {notification.createdAt?.toLocaleDateString()} at{" "}
                            {notification.createdAt?.toLocaleTimeString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${notification.priority === "urgent"
                            ? "bg-red-100 text-red-800"
                            : notification.priority === "high"
                              ? "bg-orange-100 text-orange-800"
                              : notification.priority === "medium"
                                ? "bg-yellow-100 text-yellow-800"
                                : "bg-green-100 text-green-800"
                            }`}
                        >
                          {notification.priority}
                        </span>
                        <span
                          className={`px-2 py-1 rounded-full text-xs ${notification.isRead ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                            }`}
                        >
                          {notification.isRead ? "Read" : "Unread"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "templates" && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Notification Templates</h2>
                <button
                  onClick={() => setShowTemplateModal(true)}
                  className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors"
                >
                  ➕ Create Template
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className="bg-white border border-gray-200 rounded-xl p-6 hover:shadow-lg transition-shadow"
                  >
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="font-semibold text-gray-900 text-lg">{template.name}</h3>
                      <span
                        className={`px-2 py-1 text-xs rounded-full ${template.priority === "urgent"
                          ? "bg-red-100 text-red-800"
                          : template.priority === "high"
                            ? "bg-orange-100 text-orange-800"
                            : template.priority === "medium"
                              ? "bg-yellow-100 text-yellow-800"
                              : "bg-green-100 text-green-800"
                          }`}
                      >
                        {template.priority}
                      </span>
                    </div>

                    <div className="mb-4">
                      <h4 className="font-medium text-gray-700 mb-1">{template.title}</h4>
                      <p className="text-gray-600 text-sm line-clamp-3">{template.message}</p>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">{template.type}</span>
                      <button
                        onClick={() => applyTemplate(template)}
                        className="text-sm text-purple-600 hover:text-purple-800 font-medium"
                      >
                        Use Template
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {showEditModal && editingNotification && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-8 max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Edit Notification</h3>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Title</label>
                <input
                  type="text"
                  value={editingNotification.title}
                  onChange={(e) => setEditingNotification((prev) => ({ ...prev, title: e.target.value }))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
                <textarea
                  value={editingNotification.message}
                  onChange={(e) => setEditingNotification((prev) => ({ ...prev, message: e.target.value }))}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                  <select
                    value={editingNotification.priority}
                    onChange={(e) => setEditingNotification((prev) => ({ ...prev, priority: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Type</label>
                  <select
                    value={editingNotification.type}
                    onChange={(e) => setEditingNotification((prev) => ({ ...prev, type: e.target.value }))}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="general">General</option>
                    <option value="announcement">Announcement</option>
                    <option value="update">Update</option>
                    <option value="warning">Warning</option>
                    <option value="promotion">Promotion</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => {
                    setShowEditModal(false)
                    setEditingNotification(null)
                  }}
                  className="px-6 py-3 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={editNotification}
                  className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Template Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-4xl w-full p-8 max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold text-gray-900 mb-6">Choose Template</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {templates.map((template) => (
                <div
                  key={template.id}
                  className="border border-gray-200 rounded-xl p-6 hover:border-purple-300 cursor-pointer transition-colors"
                  onClick={() => applyTemplate(template)}
                >
                  <h4 className="font-semibold text-gray-900 mb-2">{template.name}</h4>
                  <h5 className="font-medium text-gray-700 mb-1">{template.title}</h5>
                  <p className="text-gray-600 text-sm mb-3">{template.message}</p>
                  <div className="flex items-center space-x-2">
                    <span
                      className={`px-2 py-1 text-xs rounded-full ${template.priority === "urgent"
                        ? "bg-red-100 text-red-800"
                        : template.priority === "high"
                          ? "bg-orange-100 text-orange-800"
                          : template.priority === "medium"
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-green-100 text-green-800"
                        }`}
                    >
                      {template.priority}
                    </span>
                    <span className="px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full">{template.type}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setShowTemplateModal(false)}
                className="px-6 py-3 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminNotifications
