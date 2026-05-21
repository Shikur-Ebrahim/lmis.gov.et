"use client"

import { useState, useEffect, useCallback } from "react"
import { Link } from "react-router-dom"
import { collection, getDocs, deleteDoc, doc, updateDoc, query, orderBy } from "firebase/firestore"
import { db, auth } from "../../config/firebase"
import { uploadToCloudinary } from "../../utils/cloudinary"
import {
  Users,
  Search,
  Trash2,
  Eye,
  CheckCircle,
  Clock,
  XCircle,
  Calendar,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  GraduationCap,
  Star,
  AlertCircle,
  X,
  User,
  Heart,
  FileText,
  Upload,
  Award,
  Camera,
} from "lucide-react"
import Sidebar from "../../components/admin/Sidebar"

export default function ApplicantsList() {
  const [applicants, setApplicants] = useState([])
  const [filteredApplicants, setFilteredApplicants] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("All")
  const [countryFilter, setCountryFilter] = useState("All")
  const [jobFilter, setJobFilter] = useState("All")
  const [sortBy, setSortBy] = useState("createdAt")
  const [sortOrder, setSortOrder] = useState("desc")
  const [selectedApplicants, setSelectedApplicants] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingApplicant, setEditingApplicant] = useState(null)
  const [formData, setFormData] = useState({})
  const [errors, setErrors] = useState({})
  const [uploading, setUploading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)

  const fetchApplicants = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, "users"))

      const applicantsData = querySnapshot.docs
        .map((doc) => {
          const data = doc.data()
          return {
            id: doc.id,
            ...data,
            fullName: data.fullName || `${data.firstName || ""} ${data.lastName || ""}`.trim(),
            phone: data.phoneNumber || data.phone || "",
            job: data.jobTitle || data.jobCategory || ""
          }
        })
        .filter(user => {
          const currentUserId = auth.currentUser?.uid
          const role = user.role ? user.role.toLowerCase() : ""
          const isAdmin = role === 'admin'
          const isCurrentUser = currentUserId && user.id === currentUserId

          if (isAdmin || isCurrentUser) return false
          if (!user.status || user.status === 'Pending') return false

          return true
        })
        .sort((a, b) => {
          const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0)
          const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0)
          return dateB - dateA
        })

      setApplicants(applicantsData)
    } catch (error) {
      console.error("Error fetching applicants:", error)
    } finally {
      setLoading(false)
    }
  }

  const filterAndSortApplicants = useCallback(() => {
    const filtered = applicants.filter((applicant) => {
      const matchesSearch =
        (applicant.fullName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        applicant.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        applicant.phone?.includes(searchTerm) ||
        (applicant.job || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (applicant.country || "").toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus = statusFilter === "All" || applicant.status === statusFilter
      const matchesCountry = countryFilter === "All" || (applicant.country === countryFilter)
      const matchesJob = jobFilter === "All" || (applicant.job === jobFilter)

      return matchesSearch && matchesStatus && matchesCountry && matchesJob
    })

    // Sort applicants
    filtered.sort((a, b) => {
      let aValue = a[sortBy]
      let bValue = b[sortBy]

      if (sortBy === "createdAt") {
        aValue = aValue?.toDate ? aValue.toDate() : new Date(aValue)
        bValue = bValue?.toDate ? bValue.toDate() : new Date(bValue)
      } else if (sortBy === "fullName") {
        aValue = a.fullName || ""
        bValue = b.fullName || ""
      }

      if (typeof aValue === "string") {
        aValue = aValue.toLowerCase()
        bValue = bValue.toLowerCase()
      }

      if (sortOrder === "asc") {
        return aValue > bValue ? 1 : -1
      } else {
        return aValue < bValue ? 1 : -1
      }
    })

    setFilteredApplicants(filtered)
  }, [applicants, searchTerm, statusFilter, countryFilter, jobFilter, sortBy, sortOrder])

  useEffect(() => {
    fetchApplicants()
  }, [])

  useEffect(() => {
    filterAndSortApplicants()
  }, [filterAndSortApplicants])

  // Edit functionality
  const openEditModal = (applicant) => {
    setEditingApplicant(applicant)
    setFormData({
      fullName: applicant.fullName || '',
      email: applicant.email || '',
      phone: applicant.phone || '',
      dateOfBirth: applicant.dateOfBirth ? applicant.dateOfBirth.toDate().toISOString().split('T')[0] : '',
      gender: applicant.gender || '',
      nationality: applicant.nationality || '',
      country: applicant.country || '',
      city: applicant.city || '',
      address: applicant.address || '',
      job: applicant.job || '',
      experience: applicant.experience || '',
      education: applicant.education || '',
      skills: applicant.skills || '',
      languages: applicant.languages || '',
      maritalStatus: applicant.maritalStatus || '',
      emergencyContact: applicant.emergencyContact || '',
      emergencyPhone: applicant.emergencyPhone || '',
      medicalConditions: applicant.medicalConditions || '',
      previousWork: applicant.previousWork || '',
      references: applicant.references || '',
      motivation: applicant.motivation || '',
      status: applicant.status || 'Pending',
      profileImage: typeof applicant.profileImage === 'string' ? applicant.profileImage : (applicant.profileImage?.url || ''),
      resume: applicant.resume || '',
      passport: applicant.passport || '',
      medicalCertificate: applicant.medicalCertificate || '',
      policeRecord: applicant.policeRecord || '',
      certificates: applicant.certificates || [],
      notes: applicant.notes || '',
    })
    setErrors({})
    setIsEditModalOpen(true)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ""
      }))
    }
  }

  const handleFileInputChange = async (e, fieldName) => {
    const file = e.target.files[0]
    if (!file) return

    try {
      setUploading(true)
      const uploadedUrl = await uploadToCloudinary(file)

      if (fieldName === "certificates") {
        setFormData(prev => ({
          ...prev,
          certificates: [...prev.certificates, uploadedUrl]
        }))
      } else {
        setFormData(prev => ({
          ...prev,
          [fieldName]: uploadedUrl
        }))
      }

      // Clear the input
      e.target.value = ''
    } catch (error) {
      console.error("Error uploading file:", error)
      alert("Error uploading file. Please try again.")
    } finally {
      setUploading(false)
    }
  }

  const removeCertificate = (index) => {
    setFormData(prev => ({
      ...prev,
      certificates: prev.certificates.filter((_, i) => i !== index)
    }))
  }

  const validateForm = () => {
    const newErrors = {}

    // Required fields
    const requiredFields = [
      "fullName",
      "email",
      "phone",
      "dateOfBirth",
      "gender",
      "nationality",
      "country",
      "city",
      "job",
      "experience",
      "education",
    ]

    requiredFields.forEach((field) => {
      if (!formData[field] || formData[field].toString().trim() === "") {
        newErrors[field] = "This field is required"
      }
    })

    // Email validation
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address"
    }

    // Phone validation
    if (formData.phone && !/^\+?[\d\s-()]+$/.test(formData.phone)) {
      newErrors.phone = "Please enter a valid phone number"
    }

    // Age validation (must be 18+)
    if (formData.dateOfBirth) {
      const birthDate = new Date(formData.dateOfBirth)
      const today = new Date()
      let age = today.getFullYear() - birthDate.getFullYear()
      const monthDiff = today.getMonth() - birthDate.getMonth()
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--
      }
      if (age < 18) {
        newErrors.dateOfBirth = "Applicant must be at least 18 years old"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!editingApplicant || !validateForm()) return

    setIsSaving(true)
    try {
      const updateData = {
        fullName: formData.fullName,
        email: formData.email,
        phone: formData.phone,
        dateOfBirth: formData.dateOfBirth ? new Date(formData.dateOfBirth) : null,
        gender: formData.gender,
        nationality: formData.nationality,
        country: formData.country,
        city: formData.city,
        address: formData.address,
        job: formData.job,
        experience: parseInt(formData.experience) || 0,
        education: formData.education,
        skills: formData.skills,
        languages: formData.languages,
        maritalStatus: formData.maritalStatus,
        emergencyContact: formData.emergencyContact,
        emergencyPhone: formData.emergencyPhone,
        medicalConditions: formData.medicalConditions,
        previousWork: formData.previousWork,
        references: formData.references,
        motivation: formData.motivation,
        status: formData.status,
        profileImage: formData.profileImage,
        resume: formData.resume,
        passport: formData.passport,
        medicalCertificate: formData.medicalCertificate,
        policeRecord: formData.policeRecord,
        certificates: formData.certificates,
        notes: formData.notes,
        updatedAt: new Date(),
      }

      await updateDoc(doc(db, "users", editingApplicant.id), updateData)

      // Update local state
      setApplicants(prev =>
        prev.map(applicant =>
          applicant.id === editingApplicant.id
            ? { ...applicant, ...updateData }
            : applicant
        )
      )

      setIsEditModalOpen(false)
      setEditingApplicant(null)
      setFormData({})
      setErrors({})

      alert('Applicant updated successfully!')
    } catch (error) {
      console.error("Error updating applicant:", error)
      alert('Error updating applicant. Please try again.')
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this applicant? This will remove them from the users collection.")) {
      try {
        await deleteDoc(doc(db, "users", id))
        setApplicants(applicants.filter((a) => a.id !== id))
        alert("Applicant deleted successfully")
      } catch (error) {
        console.error("Error deleting applicant:", error)
        alert("Error deleting applicant")
      }
    }
  }

  const handleStatusUpdate = async (id, newStatus) => {
    try {
      await updateDoc(doc(db, "users", id), {
        status: newStatus,
        updatedAt: new Date(),
      })
      setApplicants(
        applicants.map((applicant) =>
          applicant.id === id ? { ...applicant, status: newStatus, updatedAt: new Date() } : applicant,
        ),
      )
    } catch (error) {
      console.error("Error updating status:", error)
    }
  }

  const handleBulkStatusUpdate = async (newStatus) => {
    try {
      const updatePromises = selectedApplicants.map((id) =>
        updateDoc(doc(db, "users", id), { status: newStatus }),
      )
      await Promise.all(updatePromises)
      setApplicants(
        applicants.map((a) => (selectedApplicants.includes(a.id) ? { ...a, status: newStatus } : a)),
      )
      setSelectedApplicants([])
      alert(`Updated status for ${selectedApplicants.length} applicant(s)`)
    } catch (error) {
      console.error("Error performing bulk update:", error)
      alert("Error performing bulk update")
    }
  }

  const handleBulkDelete = async () => {
    if (window.confirm(`Are you sure you want to delete ${selectedApplicants.length} applicant(s)?`)) {
      try {
        const deletePromises = selectedApplicants.map((id) => deleteDoc(doc(db, "users", id)))
        await Promise.all(deletePromises)
        setApplicants(applicants.filter((a) => !selectedApplicants.includes(a.id)))
        setSelectedApplicants([])
        alert("Applicants deleted successfully")
      } catch (error) {
        console.error("Error performing bulk delete:", error)
        alert("Error performing bulk delete")
      }
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

  const getStatusIcon = (status) => {
    switch (status) {
      case "Accepted":
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case "Rejected":
        return <XCircle className="w-4 h-4 text-red-600" />
      case "Under Review":
        return <AlertCircle className="w-4 h-4 text-yellow-600" />
      default:
        return <Clock className="w-4 h-4 text-gray-600" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "Accepted":
        return "bg-green-100 text-green-800 border-green-200"
      case "Rejected":
        return "bg-red-100 text-red-800 border-red-200"
      case "Under Review":
        return "bg-yellow-100 text-yellow-800 border-yellow-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const uniqueCountries = [...new Set(applicants.map((a) => a.country).filter(Boolean))]
  const uniqueJobs = [...new Set(applicants.map((a) => a.job).filter(Boolean))]

  // Job and Country options from ApplicantForm
  const jobOptions = [
    // Driving & Transportation
    "Light Vehicle Driver", "Heavy Vehicle Driver", "House Driver", "Trolley Operator",
    // Security & Safety
    "Security Guard", "CCTV Surveillance Operator", "Office Security Personnel", "Plumber", "Electrician",
    "HVAC Technician", "AC Technician", "Pumper",
    // Domestic & Facility Services
    "Housekeeper", "House Maid", "House Cleaner", "Housekeeping Supervisor", "Houseman", "Caretaker",
    "Steward", "Laundry Attendant", "Bellman",
    // Hospitality & Food Services
    "Receptionist", "Waiter/Waitress", "Barista", "Sous Chef", "Pastry Chef", "Garde Manger Chef",
    "Arabica Cuisine Chef", "Kitchen Assistant", "Private Cook", "Room Attendant", "Hotel Assistant Manager",
    // Healthcare & Caregiving
    "Nurse", "Junior Nurse", "Home Care Nurse", "Private Nurse", "Junior Midwife", "Clinical Nurse",
    "Elderly Care Assistant", "Live-in Support Assistant", "NICU Nurse", "Junior Physiotherapist",
    // Childcare Services
    "Babysitter", "Childcare Worker",
    // Beauty & Salon Services
    "Hairdresser", "Hairstylist", "Beauty Therapist", "Salon Manager", "Nail Technician",
    "Nail Art Instructor", "Massage Therapist", "Makeup Artist",
    // Agriculture & Farming
    "Indoor Farmer", "General Farm Worker",
    // Administrative & Marketing
    "Junior Administrative Assistant", "Junior Marketing Assistant", "Junior Account Manager",
    "Sales Representative", "Purchaser",
    // Skilled Labor
    "Construction Worker", "Laborer", "Tailor", "Storekeeper", "Supervisor",
    // Retail & Customer Services
    "Cashier", "Promoter"
  ]

  const countryOptions = [
    "Afghanistan", "Albania", "Algeria", "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan",
    "Bahrain", "Bangladesh", "Belarus", "Belgium", "Bolivia", "Bosnia and Herzegovina", "Brazil", "Bulgaria",
    "Cambodia", "Canada", "Chile", "China", "Colombia", "Croatia", "Czech Republic", "Denmark", "Ecuador",
    "Egypt", "Estonia", "Finland", "France", "Georgia", "Germany", "Ghana", "Greece", "Hungary", "Iceland",
    "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Japan", "Jordan", "Kazakhstan",
    "Kenya", "Kuwait", "Latvia", "Lebanon", "Lithuania", "Luxembourg", "Malaysia", "Mexico", "Morocco",
    "Netherlands", "New Zealand", "Nigeria", "Norway", "Pakistan", "Peru", "Philippines", "Poland",
    "Portugal", "Qatar", "Romania", "Russia", "Saudi Arabia", "Singapore", "Slovakia", "Slovenia",
    "South Africa", "South Korea", "Spain", "Sri Lanka", "Sweden", "Switzerland", "Thailand", "Turkey",
    "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Venezuela", "Vietnam"
  ]

  const educationOptions = [
    "Elementary School", "High School", "Diploma/Certificate", "Bachelor's Degree", "Master's Degree",
    "PhD", "Vocational Training", "Other"
  ]

  // Pagination
  const totalPages = Math.ceil(filteredApplicants.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentApplicants = filteredApplicants.slice(startIndex, endIndex)

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="spinner h-16 w-16 mx-auto mb-4"></div>
          <p className="text-xl text-gray-600">Loading applicants...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950">
      <Sidebar />
      <div className="lg:ml-64 px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 flex items-center">
                <Users className="w-8 h-8 mr-3 text-primary-600" />
                Applicant Management
              </h1>
              <p className="text-gray-600 mt-2 text-lg">
                Manage and track all applicant records ({filteredApplicants.length} total)
              </p>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="card p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
            {/* Search */}
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search applicants..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="input-field pl-10"
                />
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="input-field">
                <option value="All">All Status</option>
                <option value="Pending">Pending</option>
                <option value="Under Review">Under Review</option>
                <option value="Accepted">Accepted</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>

            {/* Country Filter */}
            <div>
              <select value={countryFilter} onChange={(e) => setCountryFilter(e.target.value)} className="input-field">
                <option value="All">All Countries</option>
                {uniqueCountries.map((country) => (
                  <option key={country} value={country}>
                    {country}
                  </option>
                ))}
              </select>
            </div>

            {/* Job Filter */}
            <div>
              <select value={jobFilter} onChange={(e) => setJobFilter(e.target.value)} className="input-field">
                <option value="All">All Jobs</option>
                {uniqueJobs.map((job) => (
                  <option key={job} value={job}>
                    {job}
                  </option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div>
              <select
                value={`${sortBy}-${sortOrder}`}
                onChange={(e) => {
                  const [field, order] = e.target.value.split("-")
                  setSortBy(field)
                  setSortOrder(order)
                }}
                className="input-field"
              >
                <option value="createdAt-desc">Newest First</option>
                <option value="createdAt-asc">Oldest First</option>
                <option value="fullName-asc">Name A-Z</option>
                <option value="fullName-desc">Name Z-A</option>
                <option value="status-asc">Status A-Z</option>
                <option value="country-asc">Country A-Z</option>
              </select>
            </div>
          </div>

          {/* Bulk Actions */}
          {selectedApplicants.length > 0 && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <p className="text-blue-800 font-medium">{selectedApplicants.length} applicant(s) selected</p>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleBulkStatusUpdate("Accepted")}
                    className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                  >
                    Accept All
                  </button>
                  <button
                    onClick={() => handleBulkStatusUpdate("Pending")}
                    className="px-3 py-1 bg-gray-500 text-white rounded text-sm hover:bg-gray-600"
                  >
                    All Status Pending
                  </button>
                  <button
                    onClick={() => handleBulkStatusUpdate("Under Review")}
                    className="px-3 py-1 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700"
                  >
                    All Status Under Review
                  </button>
                  <button
                    onClick={handleBulkDelete}
                    className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700"
                  >
                    Delete All
                  </button>
                  <button
                    onClick={() => setSelectedApplicants([])}
                    className="px-3 py-1 bg-gray-300 text-gray-700 rounded text-sm hover:bg-gray-400"
                  >
                    Clear Selection
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Applicants Cards */}
        <div className="card overflow-hidden">
          {/* Select All Header */}
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center">
              <input
                type="checkbox"
                checked={selectedApplicants.length === currentApplicants.length && currentApplicants.length > 0}
                onChange={(e) => {
                  if (e.target.checked) {
                    setSelectedApplicants(currentApplicants.map((a) => a.id))
                  } else {
                    setSelectedApplicants([])
                  }
                }}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500"
              />
              <span className="ml-2 text-sm font-medium text-gray-700">Select All</span>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentApplicants.map((applicant) => (
                <div
                  key={applicant.id}
                  className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-shadow"
                >
                  {/* Card Header with Checkbox */}
                  <div className="flex items-start justify-between mb-4">
                    <input
                      type="checkbox"
                      checked={selectedApplicants.includes(applicant.id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedApplicants([...selectedApplicants, applicant.id])
                        } else {
                          setSelectedApplicants(selectedApplicants.filter((id) => id !== applicant.id))
                        }
                      }}
                      className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 mt-1"
                    />
                    <div className="flex items-center space-x-2">
                      <Link
                        to={`/applicant/${applicant.id}`}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                        title="View Details"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDelete(applicant.id)}
                        className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Applicant Profile */}
                  <div className="flex items-center mb-4">
                    <img
                      src={
                        applicant.profileImageUrl || applicant.profileImage || "/placeholder.svg?height=120&width=120&query=profile"
                      }
                      alt={`${applicant.firstName} ${applicant.lastName}`}
                      className="w-20 h-20 rounded-full object-cover border-4 border-gray-200 shadow-lg"
                    />
                    <div className="ml-4 flex-1">
                      <div className="text-lg font-semibold text-gray-900 mb-1">
                        {applicant.firstName} {applicant.lastName}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center mb-1">
                        <GraduationCap className="w-3 h-3 mr-1" />
                        {applicant.education}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center">
                        <Star className="w-3 h-3 mr-1" />
                        {applicant.experience} years exp.
                      </div>
                    </div>
                  </div>

                  {/* Contact Information */}
                  <div className="mb-4 space-y-2">
                    <div className="text-sm text-gray-500 flex items-center">
                      <Phone className="w-4 h-4 mr-2 text-gray-400" />
                      {applicant.phoneNumber || applicant.phone}
                    </div>
                  </div>

                  {/* Job & Location */}
                  <div className="mb-4 space-y-2">
                    <div className="text-sm font-medium text-gray-900 flex items-center">
                      <Briefcase className="w-4 h-4 mr-2 text-gray-400" />
                      <span className="truncate">{applicant.jobCategory || applicant.job}</span>
                    </div>
                    <div className="text-sm text-gray-500 flex items-center">
                      <MapPin className="w-4 h-4 mr-2 text-gray-400" />
                      {applicant.country}
                    </div>
                  </div>

                  {/* Status */}
                  <div className="mb-4">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(applicant.status)}
                      <select
                        value={applicant.status}
                        onChange={(e) => handleStatusUpdate(applicant.id, e.target.value)}
                        className={`text-xs font-medium px-3 py-1 rounded-full border flex-1 ${getStatusColor(
                          applicant.status,
                        )} cursor-pointer`}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Under Review">Under Review</option>
                        <option value="Accepted">Accepted</option>
                        <option value="Rejected">Rejected</option>
                      </select>
                    </div>
                  </div>

                  {/* Applied Date */}
                  <div className="text-sm text-gray-500 flex items-center pt-4 border-t border-gray-200">
                    <Calendar className="w-4 h-4 mr-2" />
                    {formatDate(applicant.createdAt)}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing {startIndex + 1} to {Math.min(endIndex, filteredApplicants.length)} of{" "}
                  {filteredApplicants.length} results
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
        </div>

        {/* Empty State */}
        {filteredApplicants.length === 0 && (
          <div className="card p-12 text-center">
            <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No applicants found</h3>
            <p className="text-gray-600 mb-6">
              {searchTerm || statusFilter !== "All" || countryFilter !== "All" || jobFilter !== "All"
                ? "Try adjusting your search criteria or filters."
                : "No applicants have been added yet."}
            </p>
          </div>
        )}
      </div>
    </div>
  </div>
  )
}