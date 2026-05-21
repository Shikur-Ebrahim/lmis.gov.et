"use client"

import { useState, useEffect, useCallback } from "react"
import { collection, getDocs, deleteDoc, doc, updateDoc, query, orderBy } from "firebase/firestore"
import { db } from "../../config/firebase"
import {
  MessageSquare,
  Mail,
  MailOpen,
  Star,
  Trash2,
  Eye,
  Reply,
  Calendar,
  User,
  Phone,
  X,
} from "lucide-react"

export default function MessagesList() {
  const [messages, setMessages] = useState([])
  const [filteredMessages, setFilteredMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedMessages, setSelectedMessages] = useState([])
  const [selectedMessage, setSelectedMessage] = useState(null)
  const [showMessageDetail, setShowMessageDetail] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)

  useEffect(() => {
    fetchMessages()
  }, [])

  const filterMessages = useCallback(() => {
    setFilteredMessages(messages)
  }, [messages])

  useEffect(() => {
    filterMessages()
  }, [filterMessages])

  const fetchMessages = async () => {
    try {
      const querySnapshot = await getDocs(query(collection(db, "messages"), orderBy("createdAt", "desc")))
      const messagesData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      setMessages(messagesData)
    } catch (error) {
      console.error("Error fetching messages:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleMarkAsRead = async (id, isRead = true) => {
    try {
      await updateDoc(doc(db, "messages", id), {
        isRead,
        readAt: isRead ? new Date() : null,
      })
      setMessages(messages.map((msg) => (msg.id === id ? { ...msg, isRead, readAt: isRead ? new Date() : null } : msg)))
    } catch (error) {
      console.error("Error updating message:", error)
    }
  }

  const handleStarMessage = async (id, isStarred) => {
    try {
      await updateDoc(doc(db, "messages", id), {
        isStarred,
        starredAt: isStarred ? new Date() : null,
      })
      setMessages(
        messages.map((msg) => (msg.id === id ? { ...msg, isStarred, starredAt: isStarred ? new Date() : null } : msg)),
      )
    } catch (error) {
      console.error("Error starring message:", error)
    }
  }

  const handleReplyMessage = async (id) => {
    try {
      await updateDoc(doc(db, "messages", id), {
        isReplied: true,
        repliedAt: new Date(),
      })
      setMessages(messages.map((msg) => (msg.id === id ? { ...msg, isReplied: true, repliedAt: new Date() } : msg)))
    } catch (error) {
      console.error("Error marking as replied:", error)
    }
  }

  const handleDeleteMessage = async (id) => {
    if (window.confirm("Are you sure you want to delete this message?")) {
      try {
        await deleteDoc(doc(db, "messages", id))
        setMessages(messages.filter((msg) => msg.id !== id))
      } catch (error) {
        console.error("Error deleting message:", error)
      }
    }
  }

  const handleBulkAction = async (action) => {
    try {
      const updatePromises = selectedMessages.map((id) => {
        switch (action) {
          case "markRead":
            return updateDoc(doc(db, "messages", id), { isRead: true, readAt: new Date() })
          case "markUnread":
            return updateDoc(doc(db, "messages", id), { isRead: false, readAt: null })
          case "star":
            return updateDoc(doc(db, "messages", id), { isStarred: true, starredAt: new Date() })
          case "unstar":
            return updateDoc(doc(db, "messages", id), { isStarred: false, starredAt: null })
          case "delete":
            return deleteDoc(doc(db, "messages", id))
          default:
            return Promise.resolve()
        }
      })

      await Promise.all(updatePromises)

      if (action === "delete") {
        setMessages(messages.filter((msg) => !selectedMessages.includes(msg.id)))
      } else {
        setMessages(
          messages.map((msg) => {
            if (selectedMessages.includes(msg.id)) {
              switch (action) {
                case "markRead":
                  return { ...msg, isRead: true, readAt: new Date() }
                case "markUnread":
                  return { ...msg, isRead: false, readAt: null }
                case "star":
                  return { ...msg, isStarred: true, starredAt: new Date() }
                case "unstar":
                  return { ...msg, isStarred: false, starredAt: null }
                default:
                  return msg
              }
            }
            return msg
          }),
        )
      }

      setSelectedMessages([])
    } catch (error) {
      console.error("Error performing bulk action:", error)
    }
  }

  const formatDate = (timestamp) => {
    if (!timestamp) return "Unknown"
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  const getMessageIcon = (message) => {
    if (message.isStarred) return <Star className="w-4 h-4 text-yellow-500 fill-current" />
    if (message.isReplied) return <Reply className="w-4 h-4 text-green-500" />
    if (message.isRead) return <MailOpen className="w-4 h-4 text-gray-500" />
    return <Mail className="w-4 h-4 text-blue-500" />
  }

  const getInquiryTypeColor = (type) => {
    switch (type) {
      case "Job Application":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "General Inquiry":
        return "bg-green-100 text-green-800 border-green-200"
      case "Complaint":
        return "bg-red-100 text-red-800 border-red-200"
      case "Support":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const openMessageDetail = (message) => {
    setSelectedMessage(message)
    setShowMessageDetail(true)
    if (!message.isRead) {
      handleMarkAsRead(message.id)
    }
  }

  const closeMessageDetail = () => {
    setShowMessageDetail(false)
    setSelectedMessage(null)
  }

  // Pagination
  const totalPages = Math.ceil(filteredMessages.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentMessages = filteredMessages.slice(startIndex, endIndex)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="spinner h-16 w-16 mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">Loading messages...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 flex items-center">
                <MessageSquare className="w-8 h-8 mr-3 text-primary-600" />
                Message Management
              </h1>
              <p className="text-gray-600 mt-2 text-lg">
                Manage contact form submissions and inquiries ({filteredMessages.length} total)
              </p>
            </div>
          </div>
        </div>

        {/* Bulk Actions */}
        <div className="card p-6 mb-8">
          {/* Bulk Actions */}
          {selectedMessages.length > 0 && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <p className="text-blue-800 font-medium">{selectedMessages.length} message(s) selected</p>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleBulkAction("markRead")}
                    className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                  >
                    Mark Read
                  </button>
                  <button
                    onClick={() => handleBulkAction("markUnread")}
                    className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                  >
                    Mark Unread
                  </button>
                  <button
                    onClick={() => handleBulkAction("star")}
                    className="px-3 py-1 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700"
                  >
                    Star
                  </button>
                  <button
                    onClick={() => handleBulkAction("delete")}
                    className="px-3 py-1 bg-red-600 text-white rounded text-sm hover:bg-red-700"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => setSelectedMessages([])}
                    className="px-3 py-1 bg-gray-300 text-gray-700 rounded text-sm hover:bg-gray-400"
                  >
                    Clear
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Select All Checkbox */}
        {currentMessages.length > 0 && (
          <div className="card p-4 mb-6">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={selectedMessages.length === currentMessages.length && currentMessages.length > 0}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedMessages(currentMessages.map((m) => m.id))
                  } else {
                    setSelectedMessages([])
                  }
                }}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="text-sm text-gray-700">Select All ({currentMessages.length} messages)</span>
            </label>
          </div>
        )}

        {/* Messages Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentMessages.map((message) => (
            <div
              key={message.id}
              className={`bg-white rounded-xl shadow-md border-2 transition-all duration-300 hover:shadow-xl hover:scale-[1.02] cursor-pointer ${!message.isRead ? "border-blue-300 bg-blue-50/30" : "border-gray-200"
                }`}
              onClick={() => openMessageDetail(message)}
            >
              <div className="p-6 h-full flex flex-col">
                {/* Header with Checkbox and Status */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3 flex-1">
                    <div onClick={(e) => e.stopPropagation()}>
                      <input
                        type="checkbox"
                        checked={selectedMessages.includes(message.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedMessages([...selectedMessages, message.id])
                          } else {
                            setSelectedMessages(selectedMessages.filter((id) => id !== message.id))
                          }
                        }}
                        className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                    </div>
                    <div className="flex items-center space-x-2">
                      {getMessageIcon(message)}
                      {!message.isRead && (
                        <div className="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                      )}
                    </div>
                  </div>
                  <span
                    className={`inline-flex px-2 py-1 text-xs font-medium rounded-full border flex-shrink-0 ${getInquiryTypeColor(message.inquiryType)}`}
                  >
                    {message.inquiryType || "General"}
                  </span>
                </div>

                {/* From - Sender Name */}
                <h3 className="text-lg font-bold text-gray-900 mb-3">
                  <span className="text-gray-600 font-normal">From: </span>
                  {message.fullName}
                </h3>

                {/* Phone if available */}
                {message.phone && (
                  <div className="flex items-center space-x-2 text-sm mb-3">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">{message.phone}</span>
                  </div>
                )}

                {/* Date and Actions */}
                <div className="mt-auto pt-4 border-t border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-xs text-gray-500">
                      <Calendar className="w-4 h-4 mr-1" />
                      {formatDate(message.createdAt)}
                    </div>
                    <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => openMessageDetail(message)}
                        className="text-blue-600 hover:text-blue-900 p-1.5 rounded hover:bg-blue-50"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleMarkAsRead(message.id, !message.isRead)}
                        className="text-green-600 hover:text-green-900 p-1.5 rounded hover:bg-green-50"
                        title={message.isRead ? "Mark Unread" : "Mark Read"}
                      >
                        {message.isRead ? <Mail className="w-4 h-4" /> : <MailOpen className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => handleDeleteMessage(message.id)}
                        className="text-red-600 hover:text-red-900 p-1.5 rounded hover:bg-red-50"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="card p-4 mt-4">
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Showing {startIndex + 1} to {Math.min(endIndex, filteredMessages.length)} of {filteredMessages.length}{" "}
                results
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Previous
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`px-3 py-1 border rounded text-sm ${currentPage === page
                      ? "bg-primary-600 text-white border-primary-600"
                      : "border-gray-300 hover:bg-gray-50"
                      }`}
                  >
                    {page}
                  </button>
                ))}
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Empty State */}
        {filteredMessages.length === 0 && (
          <div className="card p-12 text-center">
            <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No messages found</h3>
            <p className="text-gray-600">No messages have been received yet.</p>
          </div>
        )}
      </div>

      {/* Message Detail Modal */}
      {showMessageDetail && selectedMessage && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900 flex items-center">
                  <MessageSquare className="w-6 h-6 mr-2 text-primary-600" />
                  Message Details
                </h2>
                <button onClick={closeMessageDetail} className="text-gray-400 hover:text-gray-600">
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Message Info */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
                  <p className="text-gray-900">{selectedMessage.email}</p>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Date Received</label>
                  <p className="text-gray-900">{formatDate(selectedMessage.createdAt)}</p>
                </div>

                {selectedMessage.phone && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Phone</label>
                    <p className="text-gray-900">{selectedMessage.phone}</p>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Message</label>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-900 whitespace-pre-wrap">{selectedMessage.message}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
