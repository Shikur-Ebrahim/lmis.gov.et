"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, Link, useNavigate } from "react-router-dom"
import { doc, getDoc } from "firebase/firestore"
import { db } from "../config/firebase"
import {
  User, Mail, Phone, MapPin, Briefcase, Calendar, Globe,
  FileText, ArrowLeft, CheckCircle, Clock, XCircle,
  GraduationCap, AlertCircle, DollarSign, Plane, Languages,
  CreditCard, Hash, Shield, Download, ExternalLink, ChevronRight,
  Eye, Menu
} from "lucide-react"

export default function ApplicantDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [applicant, setApplicant] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [activeTab, setActiveTab] = useState("overview")

  const fetchApplicant = useCallback(async () => {
    if (!id) return
    try {
      setLoading(true)
      const docRef = doc(db, "users", id)
      const docSnap = await getDoc(docRef)
      if (docSnap.exists()) {
        setApplicant({ id: docSnap.id, ...docSnap.data() })
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

  const formatDate = (timestamp) => {
    if (!timestamp) return "Not specified"
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
      return date.toLocaleDateString("en-US", {
        year: "numeric", month: "long", day: "numeric"
      })
    } catch { return "Invalid date" }
  }

  if (loading) return <LoadingState />
  if (error) return <ErrorState error={error} />
  if (!applicant) return <NotFoundState />

  const tabs = [
    { id: "overview", label: "Overview", icon: User },
    { id: "professional", label: "Professional", icon: Briefcase },
    { id: "location", label: "Location & Travel", icon: Globe },
    { id: "documents", label: "Documents", icon: FileText },
  ]

  return (
    <div className="min-h-screen bg-gray-50/50 pb-12 font-sans text-gray-900">
      {/* 
        --------------------------------------------------
        Mobile-First Sticky Header 
        --------------------------------------------------
      */}
      <div className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => navigate(-1)}
              className="p-2 -ml-2 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div className="text-sm font-semibold text-gray-900 truncate max-w-[200px]">
              {applicant.firstName} {applicant.lastName}
            </div>
            <StatusBadge status={applicant.status} />
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">

        {/* 
          --------------------------------------------------
          Hero Profile Card
          --------------------------------------------------
        */}
        <div className="relative bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          {/* Gradient Banner */}
          <div className="h-32 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 opacity-90" />

          <div className="relative px-6 pb-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-end -mt-12 mb-4">

              {/* Profile Image */}
              <div className="relative group">
                <div className="w-32 h-32 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gray-100">
                  <img
                    src={applicant.profileImageUrl || applicant.profileImage || "/placeholder.svg"}
                    alt="Profile"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  />
                </div>
                {/* Online Indicator (Visual only for now) */}
                <div className="absolute bottom-2 right-2 w-5 h-5 bg-green-500 border-2 border-white rounded-full" title="Active" />
              </div>

              {/* Name & Title */}
              <div className="mt-4 sm:mt-0 sm:ml-6 text-center sm:text-left flex-1 min-w-0">
                <h1 className="text-3xl font-bold text-gray-900 truncate">
                  {applicant.firstName} {applicant.lastName}
                </h1>
                <p className="text-gray-500 font-medium">
                  {applicant.jobCategory || "No Job Title"}
                </p>

                {/* Quick Info Badges */}
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-3">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                    <MapPin className="w-3 h-3 mr-1" />
                    {applicant.city}, {applicant.country}
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-50 text-purple-700">
                    <DollarSign className="w-3 h-3 mr-1" />
                    Expected: ${applicant.expectedSalary || "N/A"}
                  </span>
                </div>
              </div>

              {/* Action Buttons (Desktop) */}
              <div className="mt-6 sm:mt-0 flex gap-3 w-full sm:w-auto">
                <a
                  href={`tel:${applicant.phoneNumber}`}
                  className="flex-1 sm:flex-none justify-center btn-secondary inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Phone className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Call</span>
                </a>
                <a
                  href={`mailto:${applicant.email}`}
                  className="flex-1 sm:flex-none justify-center btn-primary inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <Mail className="w-4 h-4 sm:mr-2" />
                  <span className="hidden sm:inline">Email</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* 
          --------------------------------------------------
          Navigation Tabs
          --------------------------------------------------
        */}
        <div className="border-b border-gray-200 overflow-x-auto scrollbar-hide">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {tabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    group inline-flex items-center py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap transition-colors duration-200
                    ${isActive
                      ? "border-blue-500 text-blue-600"
                      : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    }
                  `}
                >
                  <Icon className={`
                    -ml-0.5 mr-2 h-4 w-4
                    ${isActive ? "text-blue-500" : "text-gray-400 group-hover:text-gray-500"}
                  `} />
                  {tab.label}
                </button>
              )
            })}
          </nav>
        </div>

        {/* 
          --------------------------------------------------
          Tab Content 
          --------------------------------------------------
        */}
        <div className="animate-fade-in-up">
          {activeTab === "overview" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left Column: Personal Details & Emergency Contact */}
              <div className="lg:col-span-2 space-y-6">
                <SectionCard title="Personal Information" icon={User}>
                  <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6">
                    <DetailItem label="Full Name" value={`${applicant.firstName} ${applicant.lastName}`} />
                    <DetailItem label="Email" value={applicant.email} isEmail />
                    <DetailItem label="Phone" value={applicant.phoneNumber} />
                    <DetailItem label="Date of Birth" value={formatDate(applicant.dateOfBirth)} />
                    <DetailItem label="Gender" value={applicant.gender} />
                    <DetailItem label="Marital Status" value={applicant.maritalStatus} />
                    <DetailItem label="Religion" value={applicant.religion} />
                  </dl>
                </SectionCard>

                <SectionCard title="Emergency Contact" icon={AlertCircle} color="text-red-600">
                  <div className="bg-red-50 rounded-lg p-4 border border-red-100">
                    <div className="flex items-start">
                      <div className="flex-shrink-0">
                        <Phone className="h-5 w-5 text-red-400" aria-hidden="true" />
                      </div>
                      <div className="ml-3 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-red-800">
                            {applicant.emergencyContactName || applicant.emergencyContact}
                          </dt>
                          <dd className="mt-1 text-sm text-red-900">
                            {applicant.emergencyContactPhone || applicant.emergencyPhone} ({applicant.emergencyContactRelation})
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </div>
                </SectionCard>
              </div>

              {/* Right Column: Quick Stats or Summary */}
              <div className="space-y-6">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                  <h3 className="text-base font-semibold text-gray-900 mb-4">Application Summary</h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-500">Status</span>
                      <StatusBadge status={applicant.status} />
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-500">Applied On</span>
                      <span className="text-sm font-medium text-gray-900">{formatDate(applicant.createdAt)}</span>
                    </div>
                    <div className="flex items-center justify-between py-2 border-b border-gray-100">
                      <span className="text-sm text-gray-500">Updated On</span>
                      <span className="text-sm font-medium text-gray-900">{formatDate(applicant.updatedAt)}</span>
                    </div>
                    <div className="pt-2">
                      <span className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Application Number</span>
                      <div className="mt-1 flex items-center justify-between bg-gray-50 p-2 rounded border border-gray-200">
                        <code className="text-sm font-mono text-blue-600 font-bold">{applicant.applicationNumber}</code>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "professional" && (
            <div className="space-y-6">
              <SectionCard title="Professional Details" icon={Briefcase}>
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6">
                  <DetailItem label="Job Category" value={applicant.jobCategory} />
                  <DetailItem label="Desired Job Title" value={applicant.desiredJobTitle} />
                  <DetailItem label="Experience Level" value={applicant.experience} />
                  <DetailItem label="Education" value={applicant.education} icon={GraduationCap} />
                  <DetailItem label="Expected Salary" value={applicant.expectedSalary ? `$${applicant.expectedSalary}` : null} />
                  <DetailItem label="Work Preference" value={applicant.workPreference} />
                </dl>
              </SectionCard>

              <SectionCard title="Skills & Languages" icon={Languages} color="text-indigo-600">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-3 uppercase tracking-wider">Skills</h4>
                    <div className="flex flex-wrap gap-2">
                      {applicant.skills ? (
                        applicant.skills.split(',').map((skill, i) => (
                          <span key={i} className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-50 text-blue-700 border border-blue-100">
                            {skill.trim()}
                          </span>
                        ))
                      ) : (
                        <span className="text-gray-400 italic">No skills listed</span>
                      )}
                    </div>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-gray-500 mb-3 uppercase tracking-wider">Languages</h4>
                    <dl className="space-y-2">
                      <div className="flex justify-between">
                        <dt className="text-sm font-medium text-gray-900">{applicant.languages || "Not specified"}</dt>
                        <dd className="text-sm text-gray-500">{applicant.languageProficiency}</dd>
                      </div>
                    </dl>
                  </div>
                </div>
              </SectionCard>
            </div>
          )}

          {activeTab === "location" && (
            <div className="space-y-6">
              <SectionCard title="Location Information" icon={MapPin} color="text-red-500">
                <dl className="grid grid-cols-1 sm:grid-cols-3 gap-x-4 gap-y-6">
                  <DetailItem label="Country" value={applicant.country} />
                  <DetailItem label="State/Region" value={applicant.state} />
                  <DetailItem label="City" value={applicant.city} />
                  <div className="sm:col-span-3">
                    <DetailItem label="Full Address" value={applicant.address} />
                  </div>
                </dl>
              </SectionCard>

              <SectionCard title="Travel Preferences" icon={Plane} color="text-blue-500">
                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-6">
                  <DetailItem label="Willing to Relocate" value={applicant.willingToRelocate} />
                  <DetailItem label="Preferred Countries" value={applicant.preferredCountries} />
                  <DetailItem label="Preferred Shift" value={applicant.preferredShift} />
                  <DetailItem label="Preferred Contract" value={applicant.preferredContractLength} />
                  <DetailItem label="Travel Experience" value={applicant.travelExperience} />
                </dl>
              </SectionCard>
            </div>
          )}

          {activeTab === "documents" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Profile Image Document Card */}
              <DocumentCard
                title="Profile Photo"
                subtitle="Primary Identification"
                url={applicant.profileImageUrl || applicant.profileImage}
                type="image"
              />
              {/* ID Card */}
              <DocumentCard
                title="Identification Card"
                subtitle="Government ID"
                url={applicant.identificationCardUrl}
                type="id"
              />
              {/* Certificate */}
              <DocumentCard
                title="Final Certificate"
                subtitle="Education/Skill Proof"
                url={applicant.finalCertificateUrl}
                type="cert"
              />
              {/* Passport */}
              <div className="col-span-1 sm:col-span-2 lg:col-span-3">
                <SectionCard title="Passport & Visa Details" icon={Globe}>
                  <dl className="grid grid-cols-1 sm:grid-cols-3 gap-x-4 gap-y-6">
                    <DetailItem label="Passport Number" value={applicant.passportNumber || applicant.passport} />
                    <DetailItem label="Passport Expiry" value={formatDate(applicant.passportExpiryDate)} />
                    <DetailItem label="Issuing Country" value={applicant.passportIssuingCountry} />
                    <DetailItem label="Visa Status" value={applicant.visaStatus} />
                    <DetailItem label="Visa Expiry" value={formatDate(applicant.visaExpiryDate)} />
                  </dl>
                </SectionCard>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  )
}

/* -------------------------------------------------------------------------- */
/*                               Sub-Components                               */
/* -------------------------------------------------------------------------- */

function LoadingState() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-500 font-medium">Loading profile...</p>
      </div>
    </div>
  )
}

function ErrorState({ error }) {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white max-w-md w-full rounded-2xl shadow-lg p-8 text-center border border-gray-100">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
          <XCircle className="h-8 w-8 text-red-600" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">Failed to Load</h3>
        <p className="text-gray-500 mb-6">{error}</p>
        <Link to="/" className="btn-primary w-full justify-center inline-flex items-center px-4 py-2 rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition">
          Go Back Home
        </Link>
      </div>
    </div>
  )
}

function NotFoundState() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white max-w-md w-full rounded-2xl shadow-lg p-8 text-center border border-gray-100">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-gray-100 mb-6">
          <User className="h-8 w-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">Applicant Not Found</h3>
        <p className="text-gray-500 mb-6">The requested applicant profile could not be located.</p>
        <Link to="/" className="btn-primary w-full justify-center inline-flex items-center px-4 py-2 rounded-lg text-white bg-blue-600 hover:bg-blue-700 transition">
          Return Home
        </Link>
      </div>
    </div>
  )
}

function StatusBadge({ status }) {
  const getStyle = (s) => {
    switch (s) {
      case "Accepted": return "bg-green-100 text-green-800 border-green-200"
      case "Rejected": return "bg-red-100 text-red-800 border-red-200"
      case "Under Review": return "bg-yellow-100 text-yellow-800 border-yellow-200"
      default: return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  const getIcon = (s) => {
    switch (s) {
      case "Accepted": return <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
      case "Rejected": return <XCircle className="w-3.5 h-3.5 mr-1.5" />
      case "Under Review": return <Clock className="w-3.5 h-3.5 mr-1.5" />
      default: return <Clock className="w-3.5 h-3.5 mr-1.5" />
    }
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getStyle(status)}`}>
      {getIcon(status)}
      {status || "Pending"}
    </span>
  )
}

function SectionCard({ title, icon: Icon, children, color = "text-blue-600" }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden transform transition-all hover:shadow-md duration-200">
      <div className="bg-gray-50/50 px-6 py-4 border-b border-gray-100 flex items-center">
        <Icon className={`w-5 h-5 mr-3 ${color}`} />
        <h3 className="text-lg font-bold text-gray-900">{title}</h3>
      </div>
      <div className="p-6">
        {children}
      </div>
    </div>
  )
}

function DetailItem({ label, value, icon: Icon, isEmail }) {
  if (!value) return null

  return (
    <div className="group">
      <dt className="text-sm font-medium text-gray-500 mb-1 flex items-center">
        {Icon && <Icon className="w-3.5 h-3.5 mr-1.5 text-gray-400" />}
        {label}
      </dt>
      <dd className="text-sm text-gray-900 font-medium break-words">
        {isEmail ? (
          <a href={`mailto:${value}`} className="text-blue-600 hover:underline">{value}</a>
        ) : (
          value
        )}
      </dd>
    </div>
  )
}

function DocumentCard({ title, subtitle, url, type }) {
  if (!url) return null

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden group">
      <div className="aspect-w-16 aspect-h-12 bg-gray-100 relative overflow-hidden">
        {type === 'image' || type === 'id' || type === 'cert' ? (
          <img src={url} alt={title} className="object-cover w-full h-48 transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className="flex items-center justify-center h-48">
            <FileText className="w-12 h-12 text-gray-400" />
          </div>
        )}
        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 bg-white rounded-lg text-sm font-medium text-gray-900 shadow-lg transform hover:scale-105 transition-all"
          >
            <Eye className="w-4 h-4 mr-2" />
            View Full Size
          </a>
        </div>
      </div>
      <div className="p-4">
        <h4 className="text-sm font-bold text-gray-900">{title}</h4>
        <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
      </div>
    </div>
  )
}
