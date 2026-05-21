"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { doc, getDoc, updateDoc } from "firebase/firestore"
import { db } from "../../config/firebase"
import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Calendar,
  Globe,
  FileText,
  ArrowLeft,
  CheckCircle,
  Clock,
  XCircle,
  GraduationCap,
  AlertCircle,
  DollarSign,
  Plane,
  Languages,
  Save,
} from "lucide-react"

const hardcodedCountries = [
  "Afghanistan", "Albania", "Algeria", "Argentina", "Armenia", "Australia",
  "Austria", "Azerbaijan", "Bahrain", "Bangladesh", "Belarus", "Belgium",
  "Bolivia", "Bosnia and Herzegovina", "Brazil", "Bulgaria", "Cambodia",
  "Canada", "Chile", "China", "Colombia", "Croatia", "Czech Republic",
  "Denmark", "Ecuador", "Egypt", "Estonia", "Finland", "France", "Georgia",
  "Germany", "Ghana", "Greece", "Hungary", "Iceland", "India", "Indonesia",
  "Iran", "Iraq", "Ireland", "Israel", "Italy", "Japan", "Jordan",
  "Kazakhstan", "Kenya", "Kuwait", "Latvia", "Lebanon", "Lithuania",
  "Luxembourg", "Malaysia", "Mexico", "Morocco", "Netherlands", "New Zealand",
  "Nigeria", "Norway", "Pakistan", "Peru", "Philippines", "Poland",
  "Portugal", "Qatar", "Romania", "Russia", "Saudi Arabia", "Singapore",
  "Slovakia", "Slovenia", "South Africa", "South Korea", "Spain", "Sri Lanka",
  "Sweden", "Switzerland", "Thailand", "Turkey", "Ukraine",
  "United Arab Emirates", "United Kingdom", "United States", "Uruguay",
  "Venezuela", "Vietnam"
]

export default function EditApplicant() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [applicant, setApplicant] = useState(null)
  const [formData, setFormData] = useState({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const [successMessage, setSuccessMessage] = useState("")
  const [isUploadingMock, setIsUploadingMock] = useState({ 1: false, 2: false, 3: false })
  const [mockProgress, setMockProgress] = useState({})

  const fetchApplicant = useCallback(async () => {
    if (!id) return

    try {
      setLoading(true)
      const docRef = doc(db, "users", id)
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        const data = { id: docSnap.id, ...docSnap.data() }
        setApplicant(data)
        // Initialize formData with all fields mapping to users collection
        setFormData({
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          email: data.email || "",
          phoneNumber: data.phoneNumber || data.phone || "",
          dateOfBirth: data.dateOfBirth ? (data.dateOfBirth.toDate ? data.dateOfBirth.toDate().toISOString().split("T")[0] : new Date(data.dateOfBirth).toISOString().split("T")[0]) : "",
          gender: data.gender || "",
          nationality: data.nationality || "",
          religion: data.religion || "",
          maritalStatus: data.maritalStatus || "",
          country: data.country || "",
          state: data.state || "",
          city: data.city || "",
          address: data.address || "",
          jobCategory: data.jobCategory || data.job || "",
          desiredJobTitle: data.desiredJobTitle || "",
          experience: data.experience || "",
          education: data.education || "",
          expectedSalary: data.expectedSalary || "",
          workPreference: data.workPreference || "",
          skills: data.skills || "",
          skillsCertificate1: data.skillsCertificate1 || "",
          skillsCertificate2: data.skillsCertificate2 || "",
          skillsCertificate3: data.skillsCertificate3 || "",
          languages: data.languages || "",
          languageProficiency: data.languageProficiency || "",
          preferredCountries: data.preferredCountries || "",
          preferredCountries1: data.preferredCountries1 || "",
          preferredCountries2: data.preferredCountries2 || "",
          preferredCountries3: data.preferredCountries3 || "",
          preferredCountries4: data.preferredCountries4 || "",
          preferredCities: data.preferredCities || "",
          preferredContractLength: data.preferredContractLength || "",
          preferredShift: data.preferredShift || "",
          willingToRelocate: data.willingToRelocate || "",
          travelExperience: data.travelExperience || "",
          overseasExperienceDetails: data.overseasExperienceDetails || "",
          passport: data.passport || "",
          passportExpiryDate: data.passportExpiryDate || "",
          passportIssuingCountry: data.passportIssuingCountry || "",
          visaStatus: data.visaStatus || "",
          visaExpiryDate: data.visaExpiryDate || "",
          emergencyContact: data.emergencyContact || "",
          emergencyPhone: data.emergencyPhone || "",
          emergencyContactRelation: data.emergencyContactRelation || "",
          status: data.status || "Pending",
        })
      } else {
        setError("Applicant not found")
      }
    } catch (error) {
      console.error("Error fetching applicant:", error)
      setError("Error loading applicant data")
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    fetchApplicant()
  }, [fetchApplicant])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setSuccessMessage("")
    setError(null)

    try {
      // Convert dateOfBirth back to Date if provided
      const updateData = { ...formData }
      if (updateData.dateOfBirth) {
        updateData.dateOfBirth = new Date(updateData.dateOfBirth)
      }
      updateData.updatedAt = new Date()

      await updateDoc(doc(db, "users", id), updateData)
      setSuccessMessage("User updated successfully!")

      // Refresh the data
      await fetchApplicant()

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage("")
      }, 3000)
    } catch (error) {
      console.error("Error updating user:", error)
      setError("Error updating user. Please try again.")
    } finally {
      setSaving(false)
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
      case "Pending":
        return "bg-gray-100 text-gray-800 border-gray-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case "Accepted":
        return <CheckCircle className="w-5 h-5 text-green-600" />
      case "Rejected":
        return <XCircle className="w-5 h-5 text-red-600" />
      case "Under Review":
        return <Clock className="w-5 h-5 text-yellow-600" />
      default:
        return <Clock className="w-5 h-5 text-gray-600" />
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading applicant details...</p>
        </div>
      </div>
    )
  }

  if (error && !applicant) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link to="/admin/dashboard" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Return to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  if (!applicant) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Applicant Not Found</h2>
          <p className="text-gray-600 mb-6">The requested applicant could not be found.</p>
          <Link to="/admin/dashboard" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            Return to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link
                to="/admin/dashboard"
                className="flex items-center text-blue-600 hover:text-blue-700 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Dashboard
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Edit Applicant</h1>
                <p className="text-sm text-gray-600 mt-1">{applicant.applicationNumber || "N/A"}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              {getStatusIcon(formData.status)}
              <select
                name="status"
                value={formData.status || "Pending"}
                onChange={handleChange}
                className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(formData.status)} bg-white`}
              >
                <option value="Pending">Pending</option>
                <option value="Under Review">Under Review</option>
                <option value="Accepted">Accepted</option>
                <option value="Rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Success/Error Messages */}
          {successMessage && (
            <div className="mb-6 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
              {successMessage}
            </div>
          )}
          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          {/* Profile Header */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6">
            <div className="flex flex-col md:flex-row items-start md:items-center space-y-4 md:space-y-0 md:space-x-6">
              {applicant.profileImage && (
                <img
                  src={applicant.profileImage}
                  alt={applicant.fullName || "Applicant"}
                  className="w-24 h-24 md:w-32 md:h-32 rounded-full object-cover border-4 border-gray-200 shadow-lg"
                />
              )}
              <div className="flex-1">
                <div className="flex space-x-4 mb-2">
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName || ""}
                    onChange={handleChange}
                    className="text-3xl font-bold text-gray-900 w-full border-b-2 border-transparent focus:border-blue-500 focus:outline-none bg-transparent"
                    placeholder="First Name"
                  />
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName || ""}
                    onChange={handleChange}
                    className="text-3xl font-bold text-gray-900 w-full border-b-2 border-transparent focus:border-blue-500 focus:outline-none bg-transparent"
                    placeholder="Last Name"
                  />
                </div>
                <div className="flex flex-wrap items-center gap-4 text-gray-600 mt-2">
                  {formData.jobCategory && (
                    <div className="flex items-center space-x-2">
                      <Briefcase className="w-4 h-4" />
                      <input
                        type="text"
                        name="jobCategory"
                        value={formData.jobCategory || ""}
                        onChange={handleChange}
                        className="border-b border-transparent focus:border-blue-500 focus:outline-none bg-transparent"
                        placeholder="Job Category"
                      />
                    </div>
                  )}
                  {formData.country && (
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4" />
                      <input
                        type="text"
                        name="country"
                        value={formData.country || ""}
                        onChange={handleChange}
                        className="border-b border-transparent focus:border-blue-500 focus:outline-none bg-transparent"
                        placeholder="Country"
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Personal Information */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <User className="w-5 h-5 mr-2 text-blue-600" />
                  Personal Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">First Name</label>
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName || ""}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Last Name</label>
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName || ""}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email || ""}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Phone</label>
                    <input
                      type="text"
                      name="phoneNumber"
                      value={formData.phoneNumber || ""}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Date of Birth</label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth || ""}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Gender</label>
                    <select
                      name="gender"
                      value={formData.gender || ""}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select Gender</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Nationality</label>
                    <input
                      type="text"
                      name="nationality"
                      value={formData.nationality || ""}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Religion</label>
                    <input
                      type="text"
                      name="religion"
                      value={formData.religion || ""}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Marital Status</label>
                    <select
                      name="maritalStatus"
                      value={formData.maritalStatus || ""}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">Select Status</option>
                      <option value="Single">Single</option>
                      <option value="Married">Married</option>
                      <option value="Divorced">Divorced</option>
                      <option value="Widowed">Widowed</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Location Information */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <MapPin className="w-5 h-5 mr-2 text-green-600" />
                  Location Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Country</label>
                    <input
                      type="text"
                      name="country"
                      value={formData.country || ""}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">State</label>
                    <input
                      type="text"
                      name="state"
                      value={formData.state || ""}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">City</label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city || ""}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-600 mb-1">Address</label>
                    <textarea
                      name="address"
                      value={formData.address || ""}
                      onChange={handleChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Professional Information */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <Briefcase className="w-5 h-5 mr-2 text-purple-600" />
                  Professional Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Job Category</label>
                    <input
                      type="text"
                      name="jobCategory"
                      value={formData.jobCategory || ""}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Desired Job Title</label>
                    <input
                      type="text"
                      name="desiredJobTitle"
                      value={formData.desiredJobTitle || ""}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Experience</label>
                    <input
                      type="text"
                      name="experience"
                      value={formData.experience || ""}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Education</label>
                    <input
                      type="text"
                      name="education"
                      value={formData.education || ""}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Expected Salary</label>
                    <input
                      type="text"
                      name="expectedSalary"
                      value={formData.expectedSalary || ""}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Work Preference</label>
                    <input
                      type="text"
                      name="workPreference"
                      value={formData.workPreference || ""}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="md:col-span-2 space-y-4">
                    <div className="space-y-1">
                      <label className="block text-sm font-medium text-gray-600 mb-1">Skills & Qualifications</label>
                      <textarea
                        name="skills"
                        value={formData.skills || ""}
                        onChange={handleChange}
                        rows={3}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                      />
                    </div>

                    <div className="bg-blue-50/50 border border-dashed border-blue-200 rounded-lg p-4 transition-all group relative overflow-hidden">
                      {isUploadingMock ? (
                        <div className="space-y-2 py-2">
                          <div className="flex justify-between text-[10px] font-bold text-blue-600">
                            <span>Uploading Certificate...</span>
                            <span>{mockProgress}%</span>
                          </div>
                          <div className="w-full bg-blue-100 rounded-full h-1.5 overflow-hidden">
                            <div
                              className="bg-blue-600 h-full transition-all duration-300"
                              style={{ width: `${mockProgress}%` }}
                            ></div>
                          </div>
                        </div>
                      ) : formData.skillsCertificate ? (
                        <div className="flex items-center justify-between bg-white p-2 rounded-lg border border-blue-100 shadow-sm animate-in zoom-in-95 duration-200">
                          <div className="flex items-center space-x-2">
                            <Award className="w-4 h-4 text-blue-500" />
                            <div className="flex flex-col">
                              <span className="text-xs font-semibold text-gray-900 truncate max-w-[150px]">{formData.skillsCertificate}</span>
                              <span className="text-[9px] text-blue-500 font-bold uppercase">Ready (Mock)</span>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => setFormData(prev => ({ ...prev, skillsCertificate: null }))}
                            className="p-1 hover:bg-red-50 rounded-full text-gray-400 hover:text-red-500 transition-colors"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center justify-center space-y-2">
                          <div className="p-2 bg-white rounded-full shadow-sm group-hover:scale-110 transition-transform duration-300 border border-blue-50">
                            <Upload className="w-5 h-5 text-blue-500" />
                          </div>
                          <div className="text-center">
                            <p className="text-xs font-semibold text-gray-900">Upload New Certificate</p>
                            <p className="text-[10px] text-gray-500 italic">Optional Mock UI</p>
                          </div>
                          <input
                            type="file"
                            onChange={(e) => {
                              const file = e.target.files[0]
                              if (file) {
                                setIsUploadingMock(true)
                                setMockProgress(0)
                                setFormData(prev => ({ ...prev, skillsCertificate: file.name }))
                                const interval = setInterval(() => {
                                  setMockProgress(p => {
                                    if (p >= 100) {
                                      clearInterval(interval)
                                      setIsUploadingMock(false)
                                      return 100
                                    }
                                    return p + 20
                                  })
                                }, 150)
                              }
                            }}
                            className="absolute inset-0 opacity-0 cursor-pointer"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Language Information */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <Languages className="w-5 h-5 mr-2 text-indigo-600" />
                  Language Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Languages</label>
                    <input
                      type="text"
                      name="languages"
                      value={formData.languages || ""}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Language Proficiency</label>
                    <input
                      type="text"
                      name="languageProficiency"
                      value={formData.languageProficiency || ""}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* International Job Preferences */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <Plane className="w-5 h-5 mr-2 text-blue-600" />
                  International Job Preferences
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-600 mb-2">Preferred Destination Countries (Up to 4 additional)</label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      {[1, 2, 3, 4].map((num) => {
                        const fieldName = `preferredCountries${num}`
                        const prevFieldName = num > 1 ? `preferredCountries${num - 1}` : null
                        const isVisible = num === 1 || (formData[prevFieldName] && formData[prevFieldName] !== "")

                        if (!isVisible) return null

                        const selectedCountries = [
                          formData.country,
                          formData.preferredCountries1,
                          formData.preferredCountries2,
                          formData.preferredCountries3,
                          formData.preferredCountries4
                        ].filter((c, index) => {
                          if (index === 0) return true
                          return index < num && c && c !== ""
                        })

                        return (
                          <div
                            key={num}
                            className="space-y-1 animate-in fade-in slide-in-from-top-1 duration-200"
                          >
                            <label className="text-xs font-medium text-gray-400">Option {num}</label>
                            <select
                              name={fieldName}
                              value={formData[fieldName] || ""}
                              onChange={handleChange}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent font-medium"
                            >
                              <option value="">Select Country</option>
                              {hardcodedCountries
                                .filter(c => !selectedCountries.includes(c))
                                .map((country) => (
                                  <option key={country} value={country}>
                                    {country}
                                  </option>
                                ))}
                            </select>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Preferred Cities</label>
                    <input
                      type="text"
                      name="preferredCities"
                      value={formData.preferredCities || ""}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Preferred Contract Length</label>
                    <input
                      type="text"
                      name="preferredContractLength"
                      value={formData.preferredContractLength || ""}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Preferred Shift</label>
                    <input
                      type="text"
                      name="preferredShift"
                      value={formData.preferredShift || ""}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Willing to Relocate</label>
                    <input
                      type="text"
                      name="willingToRelocate"
                      value={formData.willingToRelocate || ""}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Travel Experience</label>
                    <input
                      type="text"
                      name="travelExperience"
                      value={formData.travelExperience || ""}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-600 mb-1">Overseas Experience Details</label>
                    <textarea
                      name="overseasExperienceDetails"
                      value={formData.overseasExperienceDetails || ""}
                      onChange={handleChange}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Passport & Visa Information */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <Globe className="w-5 h-5 mr-2 text-indigo-600" />
                  Passport & Visa Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Passport Number</label>
                    <input
                      type="text"
                      name="passport"
                      value={formData.passport || ""}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Passport Expiry Date</label>
                    <input
                      type="date"
                      name="passportExpiryDate"
                      value={formData.passportExpiryDate || ""}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Passport Issuing Country</label>
                    <input
                      type="text"
                      name="passportIssuingCountry"
                      value={formData.passportIssuingCountry || ""}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Visa Status</label>
                    <input
                      type="text"
                      name="visaStatus"
                      value={formData.visaStatus || ""}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Visa Expiry Date</label>
                    <input
                      type="date"
                      name="visaExpiryDate"
                      value={formData.visaExpiryDate || ""}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                  <AlertCircle className="w-5 h-5 mr-2 text-red-600" />
                  Emergency Contact
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Contact Name</label>
                    <input
                      type="text"
                      name="emergencyContact"
                      value={formData.emergencyContact || ""}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Phone</label>
                    <input
                      type="text"
                      name="emergencyPhone"
                      value={formData.emergencyPhone || ""}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Relation</label>
                    <input
                      type="text"
                      name="emergencyContactRelation"
                      value={formData.emergencyContactRelation || ""}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* Save Button */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex items-center justify-end space-x-4">
                  <Link
                    to="/admin/dashboard"
                    className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </Link>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                  >
                    {saving ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                        <span>Saving...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        <span>Save Changes</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Application Information */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-blue-600" />
                  Application Information
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Application Number</label>
                    <p className="text-gray-900 font-mono">{applicant.applicationNumber || "N/A"}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">Registration ID</label>
                    <p className="text-gray-900 font-mono text-xs">{applicant.registrationId || "N/A"}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-1">User ID</label>
                    <p className="text-gray-900 font-mono text-xs break-all">{applicant.uid || "N/A"}</p>
                  </div>
                </div>
              </div>

              {/* Documents */}
              {(applicant.profileImage || applicant.identificationCardUrl || applicant.finalCertificateUrl) && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                    <FileText className="w-5 h-5 mr-2 text-blue-600" />
                    Documents
                  </h3>
                  <div className="space-y-4">
                    {applicant.profileImage && (
                      <div className="text-center">
                        <label className="block text-sm font-medium text-gray-600 mb-2">Profile Image</label>
                        <img
                          src={applicant.profileImage}
                          alt="Profile"
                          className="w-full h-48 object-cover rounded-lg border border-gray-200"
                        />
                        <a
                          href={applicant.profileImage}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 text-sm mt-2 inline-block"
                        >
                          View Full Size
                        </a>
                      </div>
                    )}
                    {applicant.identificationCardUrl && (
                      <div className="text-center">
                        <label className="block text-sm font-medium text-gray-600 mb-2">Identification Card</label>
                        <img
                          src={applicant.identificationCardUrl}
                          alt="ID Card"
                          className="w-full h-48 object-cover rounded-lg border border-gray-200"
                        />
                        <a
                          href={applicant.identificationCardUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 text-sm mt-2 inline-block"
                        >
                          View Full Size
                        </a>
                      </div>
                    )}
                    {applicant.finalCertificateUrl && (
                      <div className="text-center">
                        <label className="block text-sm font-medium text-gray-600 mb-2">Final Certificate</label>
                        <img
                          src={applicant.finalCertificateUrl}
                          alt="Certificate"
                          className="w-full h-48 object-cover rounded-lg border border-gray-200"
                        />
                        <a
                          href={applicant.finalCertificateUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:text-blue-800 text-sm mt-2 inline-block"
                        >
                          View Full Size
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}
