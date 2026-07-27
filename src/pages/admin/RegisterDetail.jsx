"use client"

import { useState, useEffect } from "react"
import { collection, doc, deleteDoc, updateDoc, onSnapshot, query, orderBy, addDoc, where, getDocs } from "firebase/firestore"
import { db, auth } from "../../config/firebase"
import {
  Search,
  Eye,
  Trash2,
  Bell,
  User,
  MapPin,
  Briefcase,
  FileText,
  Phone,
  Calendar,
  Globe,
  AlertCircle,
  CheckCircle,
  Clock,
  X,
  Mail,
  Edit3,
  Award,
  DollarSign,
  Home as HomeIcon,
  Truck,
  Coffee,
  Shield,
  PenTool,
  ClipboardCheck,
  Loader2
} from "lucide-react"

const flagMapping = {
  "Canada": "canada flag.png",
  "Germany": "Germany flag.jpg",
  "United Kingdom": "United Kingdom flag.jpg",
  "France": "France flag.png",
  "Netherlands": "Netherlands flag.jpg",
  "Sweden": "Sweden flag.webp",
  "Norway": "Norway flag.jpg",
  "Denmark": "Denmark flag.png",
  "Switzerland": "Switzerland flag.png",
  "Ireland": "Ireland flag.png",
  "Poland": "Poland flag.png",
  "Romania": "Romania flag.jpg",
  "Hungary": "Hungary flag.png",
  "Czech Republic": "Czech Republic flag.png",
  "Slovakia": "Slovakia flag.jpg",
  "Portugal": "Portugal flag.png",
  "United Arab Emirates (UAE)": "United Arab Emirates (UAE) flag.jpg",
  "Saudi Arabia": "Saudi Arabia flag.png",
  "Qatar": "Qatar flag.webp",
  "Kuwait": "Kuwait flag.webp",
  "Oman": "Oman flag.png"
}

const RegisterDetail = () => {
  const [registrations, setRegistrations] = useState([])
  const [filteredRegistrations, setFilteredRegistrations] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedRegistration, setSelectedRegistration] = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [showNotifications, setShowNotifications] = useState(false)
  const [statusFilter, setStatusFilter] = useState("All")
  const [unreadOnly, setUnreadOnly] = useState(false)
  const [sortBy, setSortBy] = useState("newest")
  const [showUpdateStatusModal, setShowUpdateStatusModal] = useState(false)
  const [newStatus, setNewStatus] = useState("")
  const [updatingStatus, setUpdatingStatus] = useState(false)

  // Real-time data fetching
  useEffect(() => {
    const q = query(collection(db, "users"))

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const registrationsData = []
      const currentUserId = auth.currentUser?.uid

      querySnapshot.forEach((doc) => {
        const data = { id: doc.id, ...doc.data() }
        const role = data.role ? data.role.toLowerCase() : ""
        const isAdmin = role === 'admin'
        const isCurrentUser = currentUserId && data.id === currentUserId

        if (!isAdmin && !isCurrentUser) {
          registrationsData.push(data)
        }
      })

      // Sort client-side
      registrationsData.sort((a, b) => {
        const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0)
        const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0)
        return dateB - dateA
      })

      setRegistrations(registrationsData)
      setFilteredRegistrations(registrationsData)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  useEffect(() => {
    const count = registrations.filter((reg) => !reg.isRead).length
    setUnreadCount(count)
  }, [registrations])

  useEffect(() => {
    let filtered = registrations.filter((reg) => {
      const fullName = (reg.fullName || `${reg.firstName || ""} ${reg.lastName || ""}`).toLowerCase()
      const email = reg.email?.toLowerCase() || ""
      const phone = reg.phoneNumber || ""
      const applicationNumber = reg.applicationNumber?.toLowerCase() || ""

      const matchesStatus = statusFilter === "All" || reg.status?.toLowerCase() === statusFilter.toLowerCase()
      const matchesUnread = !unreadOnly || !reg.isRead

      return (
        (fullName.includes(searchTerm.toLowerCase()) ||
          email.includes(searchTerm.toLowerCase()) ||
          phone.includes(searchTerm) ||
          applicationNumber.includes(searchTerm.toLowerCase())) &&
        matchesStatus &&
        matchesUnread
      )
    })

    // Sorting
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "newest": return new Date(b.createdAt) - new Date(a.createdAt)
        case "oldest": return new Date(a.createdAt) - new Date(b.createdAt)
        case "name": 
          const nameA = a.fullName || `${a.firstName || ""} ${a.lastName || ""}`
          const nameB = b.fullName || `${b.firstName || ""} ${b.lastName || ""}`
          return nameA.localeCompare(nameB)
        case "status": return (a.status || "").localeCompare(b.status || "")
        default: return 0
      }
    })

    setFilteredRegistrations(filtered)
  }, [searchTerm, registrations, sortBy, statusFilter, unreadOnly])

  const handleViewRegistration = async (registration) => {
    setSelectedRegistration(registration)
    setShowModal(true)

    if (!registration.isRead) {
      try {
        await updateDoc(doc(db, "users", registration.id), { isRead: true })
      } catch (error) {
        console.error("Error marking as read:", error)
      }
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this registration?")) {
      try {
        await deleteDoc(doc(db, "users", id))
      } catch (error) {
        console.error("Error deleting registration:", error)
        alert("Error deleting registration.")
      }
    }
  }

  const handleStatusUpdate = async () => {
    if (!selectedRegistration || !newStatus) return
    setUpdatingStatus(true)
    try {
      await updateDoc(doc(db, "users", selectedRegistration.id), { status: newStatus })
      setSelectedRegistration(prev => ({ ...prev, status: newStatus }))
      setShowUpdateStatusModal(false)
    } catch (error) {
      console.error("Error updating status:", error)
      alert("Error updating status.")
    } finally {
      setUpdatingStatus(false)
    }
  }

  const getStatusColor = (status) => {
    const s = (status || "pending").toLowerCase()
    switch (s) {
      case "pending": return "bg-yellow-100 text-yellow-800 border-yellow-200"
      case "accepted":
      case "approved": return "bg-green-100 text-green-800 border-green-200"
      case "rejected": return "bg-red-100 text-red-800 border-red-200"
      case "under review": return "bg-blue-100 text-blue-800 border-blue-200"
      default: return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 sm:p-8">
      <div className="max-w-7xl mx-auto">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Applicants Management</h1>
            <p className="text-gray-500">Manage all employment agreement registrations</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Bell className="w-6 h-6 text-gray-400" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full h-4 w-4 flex items-center justify-center font-bold">
                  {unreadCount}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl shadow-sm border p-6 mb-8 flex flex-col lg:flex-row gap-4 items-center">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search name, phone, application ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex gap-4 w-full lg:w-auto">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white"
            >
              <option value="All">All Status</option>
              <option value="Pending">Pending</option>
              <option value="Accepted">Accepted</option>
              <option value="Rejected">Rejected</option>
              <option value="Under Review">Under Review</option>
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-gray-200 bg-white"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="name">Sort by Name</option>
            </select>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredRegistrations.map((reg) => (
            <div key={reg.id} className={`bg-white rounded-2xl border-2 transition-all hover:shadow-lg ${!reg.isRead ? "border-blue-500 shadow-blue-50" : "border-gray-100 shadow-sm"}`}>
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center overflow-hidden border">
                      {reg.profilePhoto ? <img src={reg.profilePhoto} className="w-full h-full object-cover" /> : <User className="text-blue-500" />}
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{reg.fullName || `${reg.firstName || ""} ${reg.lastName || ""}`}</h3>
                      <p className="text-xs font-mono text-gray-400">{reg.applicationNumber}</p>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-bold border uppercase ${getStatusColor(reg.status)}`}>
                    {reg.status || "Pending"}
                  </span>
                </div>

                <div className="space-y-2 mb-6">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Briefcase className="w-4 h-4" />
                    <span>{reg.jobTitle || reg.jobCategory}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Phone className="w-4 h-4" />
                    <span>{reg.phoneNumber}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Globe className="w-4 h-4" />
                    <span>{(reg.selectedCountries || []).slice(0, 2).join(", ")}...</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-4 border-t">
                  <button
                    onClick={() => handleViewRegistration(reg)}
                    className="flex-1 py-2 bg-blue-600 text-white rounded-lg font-bold text-sm flex items-center justify-center gap-2 hover:bg-blue-700 transition-colors"
                  >
                    <Eye size={16} /> View Details
                  </button>
                  <button
                    onClick={() => handleDelete(reg.id)}
                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Modal */}
        {showModal && selectedRegistration && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-[2rem] w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl animate-in zoom-in duration-300">
              
              <div className="p-6 border-b flex justify-between items-center bg-gray-50/50">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-white shadow-sm border overflow-hidden">
                    {selectedRegistration.profilePhoto ? <img src={selectedRegistration.profilePhoto} className="w-full h-full object-cover" /> : <User className="w-full h-full p-3 text-gray-300" />}
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">{selectedRegistration.fullName || `${selectedRegistration.firstName || ""} ${selectedRegistration.lastName || ""}`}</h2>
                    <p className="text-sm font-mono text-gray-500">{selectedRegistration.applicationNumber}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => {
                      setNewStatus(selectedRegistration.status || "Pending")
                      setShowUpdateStatusModal(true)
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl font-bold text-gray-700 hover:bg-gray-50 transition-all shadow-sm"
                  >
                    <Edit3 size={18} /> Update Status
                  </button>
                  <button onClick={() => setShowModal(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-400">
                    <X size={24} />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-8 bg-gray-50/30">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  
                  {/* Section 1: Personal */}
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                    <div className="flex items-center gap-2 text-blue-600 mb-2">
                      <User size={20} /> <h3 className="font-bold">Personal Information</h3>
                    </div>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div><p className="text-gray-400">DOB</p><p className="font-semibold">{selectedRegistration.dateOfBirth}</p></div>
                      <div><p className="text-gray-400">Gender</p><p className="font-semibold">{selectedRegistration.gender}</p></div>
                      <div><p className="text-gray-400">Phone</p><p className="font-semibold">{selectedRegistration.phoneNumber}</p></div>
                      <div><p className="text-gray-400">Region</p><p className="font-semibold">{selectedRegistration.region}</p></div>
                      <div><p className="text-gray-400">City</p><p className="font-semibold">{selectedRegistration.city}</p></div>
                    </div>
                    {selectedRegistration.hasPassport === "Yes" && (
                      <div className="pt-2 border-t mt-2">
                        <p className="text-gray-400 text-sm">Passport Number</p>
                        <p className="font-bold text-indigo-600">{selectedRegistration.passportNumber}</p>
                      </div>
                    )}
                  </div>

                  {/* Section 2: Job Info */}
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
                    <div className="flex items-center gap-2 text-purple-600 mb-2">
                      <Briefcase size={20} /> <h3 className="font-bold">Job Information</h3>
                    </div>
                    <div className="space-y-3 text-sm">
                      <div><p className="text-gray-400">Job Title</p><p className="font-semibold">{selectedRegistration.jobTitle || selectedRegistration.jobCategory}</p></div>
                      <div><p className="text-gray-400">Contract Type</p><p className="font-semibold">{selectedRegistration.contractType}</p></div>
                      <div className="pt-2 border-t">
                        <p className="text-gray-400 mb-2 font-bold uppercase text-[10px] tracking-widest">Target Countries & Cities</p>
                        <div className="grid grid-cols-1 gap-2">
                          {(selectedRegistration.selectedCountries || []).map(c => (
                            <div key={c} className="flex justify-between items-center p-2.5 bg-gray-50 rounded-xl border border-gray-100 shadow-sm">
                              <div className="flex items-center gap-2">
                                <div className="w-8 h-5 rounded overflow-hidden border shadow-sm bg-white">
                                  <img src={`/images/${flagMapping[c]}`} alt="" className="w-full h-full object-cover" />
                                </div>
                                <span className="text-xs font-bold text-gray-700">{c}</span>
                              </div>
                              <span className="text-xs font-black text-blue-600 px-3 py-1 bg-white rounded-lg border shadow-sm">{selectedRegistration.selectedCities?.[c] || "N/A"}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Section 4 & 5: Salary & Process */}
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
                    <div>
                      <div className="flex items-center gap-2 text-green-600 mb-4">
                        <DollarSign size={20} /> <h3 className="font-bold">Salary & Benefits</h3>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div><p className="text-gray-400">Monthly Salary</p><p className="font-bold text-green-600">{selectedRegistration.monthlySalary}</p></div>
                        <div><p className="text-gray-400">Working Hours</p><p className="font-semibold">{selectedRegistration.workingHours}</p></div>
                        <div><p className="text-gray-400">Accommodation</p><p className="font-semibold">{selectedRegistration.accommodation}</p></div>
                        <div><p className="text-gray-400">Transport</p><p className="font-semibold">{selectedRegistration.transport}</p></div>
                        <div><p className="text-gray-400">Food</p><p className="font-semibold">{selectedRegistration.food}</p></div>
                      </div>
                    </div>
                    <div className="pt-4 border-t">
                      <div className="flex items-center gap-2 text-indigo-600 mb-4">
                        <Globe size={20} /> <h3 className="font-bold">International Process</h3>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div><p className="text-gray-400">Visa by Co.</p><p className="font-semibold">{selectedRegistration.visaProvidedByCompany}</p></div>
                        <div><p className="text-gray-400">Work Permit</p><p className="font-semibold">{selectedRegistration.workPermit}</p></div>
                        <div><p className="text-gray-400">Flight Ticket</p><p className="font-semibold text-indigo-600">{selectedRegistration.flightTicket}</p></div>
                      </div>
                    </div>
                  </div>

                  {/* Section 6, 7 & 8: Submission details */}
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
                    <div>
                      <div className="flex items-center gap-2 text-orange-600 mb-4">
                        <Shield size={20} /> <h3 className="font-bold">Verification & Agreement</h3>
                      </div>
                      <div className="space-y-3 text-sm">
                        <div className="flex justify-between bg-orange-50 p-3 rounded-xl border border-orange-100">
                          <span className="text-orange-700 font-bold">Submission Code</span>
                          <span className="font-mono font-bold text-orange-900 tracking-widest">{selectedRegistration.submissionCode}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <ClipboardCheck size={16} className="text-green-500" />
                          <span>Agreement Confirmed</span>
                        </div>
                      </div>
                    </div>
                    <div className="pt-4 border-t">
                      <div className="flex items-center gap-2 text-blue-900 mb-4">
                        <PenTool size={20} /> <h3 className="font-bold">Signature</h3>
                      </div>
                      <div className="space-y-2">
                        <p className="text-[10px] text-gray-400 uppercase font-bold tracking-widest">Digital Signature</p>
                        <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex justify-center">
                          {selectedRegistration.signatureData ? (
                            <img src={selectedRegistration.signatureData} alt="Applicant Signature" className="max-h-24 object-contain" />
                          ) : (
                            <p className="text-2xl font-serif italic text-blue-900">{selectedRegistration.signatureText || "Digitally Signed"}</p>
                          )}
                        </div>
                        <p className="text-[10px] text-gray-400 mt-2 italic text-center">Finger signature captured during registration</p>
                      </div>
                    </div>
                  </div>

                  {/* Documents Section */}
                  <div className="md:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-2 text-gray-800 mb-6">
                      <FileText size={20} /> <h3 className="font-bold">Uploaded Documents</h3>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
                      {[
                        { label: "Profile Photo", url: selectedRegistration.profilePhoto || selectedRegistration.profileImageUrl },
                        { label: "ID Front", url: selectedRegistration.idCardFront || selectedRegistration.identificationCardUrl },
                        { label: "ID Back", url: selectedRegistration.idCardBack },
                        { label: "Certificate", url: selectedRegistration.educationalCertificate || selectedRegistration.finalCertificateUrl }
                      ].map(doc => (
                        <div key={doc.label} className="space-y-2 group">
                          <p className="text-xs font-bold text-gray-400 uppercase text-center">{doc.label}</p>
                          <div className="aspect-square bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 overflow-hidden relative">
                            {doc.url ? (
                              doc.url.toLowerCase().endsWith('.pdf') ? (
                                <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 text-gray-500 group-hover:bg-gray-200 transition-colors">
                                  <FileText size={32} className="mb-2" />
                                  <span className="text-[10px] font-bold uppercase">PDF Document</span>
                                  <a href={doc.url} target="_blank" className="absolute inset-0 z-10" title="View PDF"></a>
                                </div>
                              ) : (
                                <>
                                  <img src={doc.url} className="w-full h-full object-cover transition-transform group-hover:scale-110" />
                                  <a href={doc.url} target="_blank" className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity z-10">
                                    <Eye className="text-white" />
                                  </a>
                                </>
                              )
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-gray-200"><X size={32} /></div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>
        )}

        {/* Update Status Modal */}
        {showUpdateStatusModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200">
              <div className="p-8">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Update Application Status</h3>
                <div className="space-y-4">
                  {["Pending", "Under Review", "Accepted", "Rejected"].map(status => (
                    <button
                      key={status}
                      onClick={() => setNewStatus(status)}
                      className={`w-full p-4 rounded-2xl border-2 text-left font-bold transition-all flex justify-between items-center ${newStatus === status ? "border-blue-600 bg-blue-50 text-blue-700" : "border-gray-100 hover:border-gray-200"}`}
                    >
                      {status}
                      {newStatus === status && <CheckCircle size={20} />}
                    </button>
                  ))}
                </div>
                <div className="flex gap-4 mt-8">
                  <button onClick={() => setShowUpdateStatusModal(false)} className="flex-1 py-3 bg-gray-100 rounded-xl font-bold text-gray-600">Cancel</button>
                  <button onClick={handleStatusUpdate} disabled={updatingStatus} className="flex-1 py-3 bg-blue-600 rounded-xl font-bold text-white shadow-lg shadow-blue-200 flex items-center justify-center">
                    {updatingStatus ? <Loader2 className="animate-spin text-white" /> : "Save Changes"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

export default RegisterDetail
