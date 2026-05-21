"use client"
import { useState, useEffect } from "react"
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  doc,
  deleteDoc,
  updateDoc,
  addDoc,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore"
import { db } from "../../config/firebase"
import Sidebar from "../../components/admin/Sidebar"
import {
  Download,
  Eye,
  Trash2,
  User,
  Calendar,
  Phone,
  Clock,
  CheckCircle,
  XCircle,
  MoreVertical,
  RefreshCw,
  Ban,
  Shield,
  ShieldOff,
} from "lucide-react"

const AdminDocumentVerification = () => {
  const [documents, setDocuments] = useState([])
  const [blockedPhones, setBlockedPhones] = useState(new Set()) // Set of blocked PHONE numbers
  const [loading, setLoading] = useState(true)
  const [selectedDocument, setSelectedDocument] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [bulkSelected, setBulkSelected] = useState(new Set())

  useEffect(() => {
    let unsubscribeBlocked = null
    let unsubscribeDocuments = null

    // Listen to blocked users
    const blockedQuery = query(collection(db, "blocked-users"), where("isBlocked", "==", true))
    unsubscribeBlocked = onSnapshot(blockedQuery, (snapshot) => {
      const blockedSet = new Set(snapshot.docs.map((doc) => doc.id)) // doc.id = phone
      setBlockedPhones(blockedSet)
    })

    // Listen to documents
    const docsQuery = query(collection(db, "verified-documents"), orderBy("document.uploadedAt", "desc"))
    unsubscribeDocuments = onSnapshot(docsQuery, (snapshot) => {
      const docsData = snapshot.docs.map((doc) => {
        const data = doc.data()
        return {
          id: doc.id,
          ...data,
          isBlocked: blockedPhones.has(data.phone), // Use current blocked set
        }
      })
      setDocuments(docsData)
      setLoading(false)
    })

    return () => {
      unsubscribeDocuments?.()
      unsubscribeBlocked?.()
    }
  }, [])

  const handleStatusUpdate = async (documentId, newStatus, reason = "") => {
    try {
      const document = documents.find((d) => d.id === documentId)
      if (!document) return

      await updateDoc(doc(db, "verified-documents", documentId), {
        status: newStatus,
        updatedAt: new Date().toISOString(),
        updatedBy: "admin",
        adminReason: reason || null,
      })

      await addDoc(collection(db, "notifications"), {
        type: "document_status",
        title: `Document ${newStatus.charAt(0).toUpperCase() + newStatus.slice(1)}`,
        message: `Your document "${document.document?.name || "uploaded document"}" has been ${newStatus}${reason ? `. Reason: ${reason}` : "."}`,
        status: newStatus,
        documentId,
        createdAt: serverTimestamp(),
        read: false,
        adminAction: true,
        documentName: document.document?.name,
        adminReason: reason,
        userName: document.name,
        userPhone: document.phone,
      })

      alert(`Document ${newStatus} successfully!`)
    } catch (error) {
      console.error(error)
      alert("Failed to update status.")
    }
  }

  const handleBlockUser = async (phone, block = true) => {
    if (!phone) return alert("Phone number missing.")

    try {
      await setDoc(
        doc(db, "blocked-users", phone),
        {
          phone,
          isBlocked: block,
          blockedAt: block ? new Date().toISOString() : null,
          blockedBy: block ? "admin" : null,
          updatedAt: new Date().toISOString(),
        },
        { merge: true }
      )

      alert(`User ${block ? "blocked" : "unblocked"} successfully!`)
    } catch (error) {
      console.error(error)
      alert("Failed to update block status.")
    }
  }

  const handleDelete = async (documentId) => {
    if (!window.confirm("Delete this document permanently?")) return
    try {
      await deleteDoc(doc(db, "verified-documents", documentId))
      alert("Deleted successfully.")
    } catch (error) {
      console.error(error)
      alert("Delete failed.")
    }
  }

  const handleToggleRead = async (documentId, currentStatus) => {
    try {
      await updateDoc(doc(db, "verified-documents", documentId), {
        isRead: !currentStatus,
      })
    } catch (error) {
      console.error("Error toggling read status:", error)
    }
  }

  const handleBulkAction = async (action) => {
    if (bulkSelected.size === 0) return alert("No documents selected.")

    if (!window.confirm(`Perform ${action} on ${bulkSelected.size} documents?`)) return

    try {
      const promises = Array.from(bulkSelected).map((id) =>
        action === "delete"
          ? deleteDoc(doc(db, "verified-documents", id))
          : handleStatusUpdate(id, action)
      )
      await Promise.all(promises)
      setBulkSelected(new Set())
      alert(`Bulk ${action} completed.`)
    } catch (error) {
      alert("Bulk action failed.")
    }
  }

  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-3">
          <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
          <span className="text-xl font-medium">Loading documents...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="lg:ml-64 p-6">
        <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Document Verification Dashboard</h1>
          <p className="text-gray-600">Review and manage user verification documents</p>
        </div>

        {/* Bulk Actions */}
        {bulkSelected.size > 0 && (
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6 border">
            <div className="flex gap-2 items-center">
              <span className="text-sm text-gray-600 py-2">{bulkSelected.size} selected</span>
              <button onClick={() => handleBulkAction("approved")} className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                Approve
              </button>
              <button onClick={() => handleBulkAction("rejected")} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
                Reject
              </button>
              <button onClick={() => handleBulkAction("delete")} className="px-4 py-2 bg-gray-700 text-white rounded hover:bg-gray-800">
                Delete
              </button>
            </div>
          </div>
        )}

        {/* Document Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {documents.map((document) => (
            <div
              key={document.id}
              className={`bg-white rounded-xl shadow-md border-2 transition-all hover:shadow-xl hover:scale-[1.02] ${
                document.isBlocked ? "border-red-300" : document.isRead ? "border-gray-200" : "border-cyan-400"
              }`}
            >
              <div className="p-6 flex flex-col h-full relative">
                {!document.isRead && (
                  <div className="absolute -top-2 -right-2 bg-cyan-500 text-white text-[10px] font-black px-2 py-1 rounded-lg border-2 border-white shadow-lg animate-bounce">
                    NEW
                  </div>
                )}
                <div className="flex items-start justify-between mb-4">
                  <input
                    type="checkbox"
                    checked={bulkSelected.has(document.id)}
                    onChange={(e) => {
                      const newSet = new Set(bulkSelected)
                      e.target.checked ? newSet.add(document.id) : newSet.delete(document.id)
                      setBulkSelected(newSet)
                    }}
                    className="mt-1"
                  />
                  <div className="flex items-center gap-2">
                    {document.isBlocked && (
                      <Ban className="w-5 h-5 text-red-600" title="User Blocked" />
                    )}
                  </div>
                </div>

                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900">{document.name || "Unknown"}</h3>
                  <p className="text-sm text-gray-600 flex items-center mt-1">
                    <Phone className="w-4 h-4 mr-1" />
                    {document.phone}
                  </p>
                </div>

                <div className="mt-auto pt-4 border-t">
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      {formatDate(document.document?.uploadedAt)}
                    </span>
                    <div className="flex gap-2">
                      <button
                        onClick={async () => {
                          setSelectedDocument({ ...document, isBlocked: blockedPhones.has(document.phone) })
                          setShowModal(true)
                          if (!document.isRead) {
                            try {
                              await updateDoc(doc(db, "verified-documents", document.id), { isRead: true })
                            } catch (e) {
                              console.error("Error marking as read:", e)
                            }
                          }
                        }}
                        className="p-2 hover:bg-blue-50 rounded"
                      >
                        <Eye className="w-4 h-4 text-blue-600" />
                      </button>
                      <a
                        href={document.document?.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 hover:bg-green-50 rounded"
                      >
                        <Download className="w-4 h-4 text-green-600" />
                      </a>
                      <div className="relative group">
                        <button className="p-2 hover:bg-gray-100 rounded">
                          <MoreVertical className="w-4 h-4" />
                        </button>
                        <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg z-10 opacity-0 invisible group-hover:opacity-100 group-hover:visible">
                          <button onClick={() => handleStatusUpdate(document.id, "approved")} className="w-full text-left px-4 py-2 text-sm hover:bg-green-50 flex items-center">
                            <CheckCircle className="w-4 h-4 mr-2" /> Approve
                          </button>
                          <button onClick={() => handleStatusUpdate(document.id, "rejected")} className="w-full text-left px-4 py-2 text-sm hover:bg-red-50 text-white flex items-center">
                            <XCircle className="w-4 h-4 mr-2" /> Reject
                          </button>
                          <hr className="border-gray-700" />
                          <button onClick={() => handleToggleRead(document.id, document.isRead)} className="w-full text-left px-4 py-2 text-sm hover:bg-blue-900/30 text-blue-400 flex items-center">
                            <Eye className="w-4 h-4 mr-2" /> {document.isRead ? "Mark as Unread" : "Mark as Read"}
                          </button>
                          <hr className="border-gray-700" />
                          <button onClick={() => handleDelete(document.id)} className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-red-900/30 flex items-center">
                            <Trash2 className="w-4 h-4 mr-2" /> Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Detail Modal */}
        {showModal && selectedDocument && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-bold">Document Details</h3>
                <button onClick={() => setShowModal(false)} className="text-gray-500 hover:text-gray-700">
                  <XCircle className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-6">
                <div>
                  <p className="text-sm text-gray-600">User</p>
                  <p className="font-medium">{selectedDocument.name}</p>
                  <p className="text-sm text-gray-600 mt-1">{selectedDocument.phone}</p>
                  {selectedDocument.isBlocked && <p className="text-red-600 text-sm mt-1 flex items-center"><Ban className="w-4 h-4 mr-1" /> User is blocked</p>}
                </div>

                <div>
                  <p className="text-sm text-gray-600">Reason</p>
                  <p className="p-3 bg-gray-50 rounded">{selectedDocument.reason || "None provided"}</p>
                </div>

                {selectedDocument.document?.url && (
                  <div>
                    <p className="text-sm text-gray-600 mb-2">Preview</p>
                    <img src={selectedDocument.document.url} alt="Document" className="w-full rounded border bg-gray-50" />
                  </div>
                )}

                <div className="flex flex-wrap gap-3 pt-4 border-t">
                  <a href={selectedDocument.document?.url} target="_blank" rel="noopener noreferrer" className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center">
                    <Download className="w-4 h-4 mr-2" /> Download
                  </a>

                  <button
                    onClick={() => {
                      if (window.confirm(`Are you sure you want to ${selectedDocument.isBlocked ? "unblock" : "block"} this user?`)) {
                        handleBlockUser(selectedDocument.phone, !selectedDocument.isBlocked)
                      }
                    }}
                    className={`px-4 py-2 rounded flex items-center ${
                      selectedDocument.isBlocked
                        ? "bg-green-600 hover:bg-green-700 text-white"
                        : "bg-red-600 hover:bg-red-700 text-white"
                    }`}
                  >
                    {selectedDocument.isBlocked ? (
                      <> <Shield className="w-4 h-4 mr-2" /> Unblock User </>
                    ) : (
                      <> <Ban className="w-4 h-4 mr-2" /> Block User </>
                    )}
                  </button>

                  <button onClick={() => handleDelete(selectedDocument.id)} className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 flex items-center">
                    <Trash2 className="w-4 h-4 mr-2" /> Delete
                  </button>
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

export default AdminDocumentVerification