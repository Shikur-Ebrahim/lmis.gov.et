"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { doc, getDoc, updateDoc } from "firebase/firestore"
import { db } from "../config/firebase"
import {
  User, Phone, MapPin, Briefcase, Calendar, Globe,
  FileText, ArrowLeft, CheckCircle, Clock, XCircle,
  AlertCircle, DollarSign, Shield, PenTool, ClipboardCheck,
  Eye, Home, Truck, Coffee, Plane, X, Loader2
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

export default function ApplicantDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [applicant, setApplicant] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

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
    } catch (err) {
      console.error("Error fetching applicant:", err)
      setError("Error loading applicant data")
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => { fetchApplicant() }, [fetchApplicant])

  const handleStatusUpdate = async () => {
    if (!applicant || !newStatus) return
    setUpdatingStatus(true)
    try {
      await updateDoc(doc(db, "users", applicant.id), { status: newStatus })
      setApplicant(prev => ({ ...prev, status: newStatus }))
      setShowUpdateStatusModal(false)
    } catch (err) {
      console.error("Error updating status:", err)
      alert("Error updating status.")
    } finally {
      setUpdatingStatus(false)
    }
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-500 font-medium">Loading profile...</p>
      </div>
    </div>
  )

  if (error || !applicant) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white max-w-md w-full rounded-2xl shadow-lg p-8 text-center border border-gray-100">
        <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-6">
          <XCircle className="h-8 w-8 text-red-600" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">Not Found</h3>
        <p className="text-gray-500 mb-6">{error || "Applicant not found."}</p>
        <button onClick={() => navigate(-1)} className="w-full py-2 bg-blue-600 text-white rounded-xl font-bold">Go Back</button>
      </div>
    </div>
  )

  const fullName = applicant.fullName || `${applicant.firstName || ""} ${applicant.lastName || ""}`.trim()
  const getStatusColor = (s) => {
    switch ((s || "").toLowerCase()) {
      case "accepted": return "bg-green-100 text-green-800 border-green-200"
      case "rejected": return "bg-red-100 text-red-800 border-red-200"
      case "under review": return "bg-blue-100 text-blue-800 border-blue-200"
      default: return "bg-yellow-100 text-yellow-800 border-yellow-200"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">

      {/* ── Sticky Header ── */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600">
            <ArrowLeft size={24} />
          </button>
          <div className="text-center font-bold text-gray-900 truncate max-w-[200px]">{fullName}</div>
          <div className="w-10"></div> {/* Placeholder to balance the flex layout */}
        </div>
      </div>

      {/* ── Hero Profile Card ── */}
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="relative bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
          <div className="h-28 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600" />
          <div className="px-6 pb-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-end -mt-12 gap-4">
              <div className="w-28 h-28 rounded-full border-4 border-white shadow-lg overflow-hidden bg-gray-100 flex-shrink-0">
                <img
                  src={applicant.profilePhoto || applicant.profileImageUrl || applicant.profileImage || "/placeholder.svg"}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 text-center sm:text-left min-w-0">
                <h1 className="text-2xl font-black text-gray-900">{fullName}</h1>
                <p className="text-gray-500 font-medium text-sm">{applicant.jobTitle || applicant.jobCategory || "—"}</p>
                <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-2">
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700">
                    <MapPin className="w-3 h-3" /> {applicant.city || "—"}, {applicant.region || "—"}
                  </span>
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold border ${getStatusColor(applicant.status)}`}>
                    {applicant.status || "Pending"}
                  </span>
                </div>
              </div>
              <div className="shrink-0">
                <p className="text-xs text-gray-400 font-mono text-center">{applicant.applicationNumber || ""}</p>
                <p className="text-xs text-gray-400 text-center">{applicant.createdAt ? new Date(applicant.createdAt).toLocaleDateString() : ""}</p>
              </div>
            </div>
          </div>
        </div>

        {/* ── Grid of Detail Sections ── */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          {/* Section 1: Personal Information */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
            <div className="flex items-center gap-2 text-blue-600 pb-2 border-b border-gray-100">
              <User size={18} /> <h3 className="font-bold text-gray-800">Personal Information</h3>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <Field label="Full Name" value={fullName} />
              <Field label="Date of Birth" value={applicant.dateOfBirth} />
              <Field label="Gender" value={applicant.gender} />
              <Field label="Phone" value={applicant.phoneNumber} />
              <Field label="Region" value={applicant.region} />
              <Field label="City" value={applicant.city} />
            </div>
            {applicant.hasPassport === "Yes" && (
              <div className="pt-2 border-t mt-2">
                <p className="text-xs text-gray-400 font-bold mb-1">Passport Number</p>
                <p className="font-bold text-indigo-600">{applicant.passportNumber || "—"}</p>
              </div>
            )}
          </div>

          {/* Section 2: Job Information */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
            <div className="flex items-center gap-2 text-purple-600 pb-2 border-b border-gray-100">
              <Briefcase size={18} /> <h3 className="font-bold text-gray-800">Job Information</h3>
            </div>
            <div className="space-y-3 text-sm">
              <Field label="Job Title" value={applicant.jobTitle || applicant.jobCategory} />
              <Field label="Contract Type" value={applicant.contractType} />
              <Field label="Contract Length" value={applicant.contractLength} />
              <div className="pt-2 border-t">
                <p className="text-xs text-gray-400 font-bold mb-2">Target Countries &amp; Cities</p>
                <div className="space-y-2">
                  {(applicant.selectedCountries || []).length > 0 ? (
                    (applicant.selectedCountries || []).map(c => (
                      <div key={c} className="flex justify-between items-center p-2.5 bg-gray-50 rounded-xl border border-gray-100 shadow-sm">
                        <div className="flex items-center gap-2">
                          {flagMapping[c] && (
                            <div className="w-8 h-5 rounded overflow-hidden border shadow-sm bg-white">
                              <img src={`/images/${flagMapping[c]}`} alt="" className="w-full h-full object-cover" />
                            </div>
                          )}
                          <span className="text-xs font-bold text-gray-700">{c}</span>
                        </div>
                        <span className="text-xs font-black text-blue-600 px-3 py-1 bg-white rounded-lg border shadow-sm">
                          {applicant.selectedCities?.[c] || "N/A"}
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-gray-400 italic">No countries selected</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Section 4 & 5: Salary & Benefits + International Process */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
            <div>
              <div className="flex items-center gap-2 text-green-600 mb-4">
                <DollarSign size={18} /> <h3 className="font-bold text-gray-800">Salary &amp; Benefits</h3>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <Field label="Monthly Salary" value={applicant.monthlySalary} highlight="text-green-700" />
                <Field label="Working Hours" value={applicant.workingHours} />
                <div className="flex items-center gap-2">
                  <Home size={14} className="text-gray-400 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400">Accommodation</p>
                    <p className={`font-semibold text-sm ${applicant.accommodation === "Yes" ? "text-green-600" : "text-red-500"}`}>{applicant.accommodation || "—"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Truck size={14} className="text-gray-400 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400">Transport</p>
                    <p className={`font-semibold text-sm ${applicant.transport === "Yes" ? "text-green-600" : "text-red-500"}`}>{applicant.transport || "—"}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Coffee size={14} className="text-gray-400 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400">Food</p>
                    <p className={`font-semibold text-sm ${applicant.food === "Yes" ? "text-green-600" : "text-red-500"}`}>{applicant.food || "—"}</p>
                  </div>
                </div>
              </div>
            </div>
            <div className="pt-4 border-t">
              <div className="flex items-center gap-2 text-indigo-600 mb-4">
                <Globe size={18} /> <h3 className="font-bold text-gray-800">International Process</h3>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <Field label="Visa by Company" value={applicant.visaProvidedByCompany} />
                <Field label="Work Permit" value={applicant.workPermit} />
                <div className="flex items-center gap-2">
                  <Plane size={14} className="text-gray-400 shrink-0" />
                  <div>
                    <p className="text-xs text-gray-400">Flight Ticket</p>
                    <p className="font-bold text-indigo-600 text-sm">{applicant.flightTicket || "—"}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 6, 7 & 8: Verification & Signature */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-6">
            <div>
              <div className="flex items-center gap-2 text-orange-600 mb-4">
                <Shield size={18} /> <h3 className="font-bold text-gray-800">Verification &amp; Agreement</h3>
              </div>
              <div className="space-y-3 text-sm">
                <div className="flex items-center gap-2 text-gray-600">
                  <ClipboardCheck size={16} className="text-green-500" />
                  <span className="font-semibold">Declaration Confirmed</span>
                </div>
                {applicant.faceVerified && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <CheckCircle size={16} className="text-blue-500" />
                    <span className="font-semibold">Face Verified</span>
                  </div>
                )}
              </div>
            </div>
            <div className="pt-4 border-t">
              <div className="flex items-center gap-2 text-blue-900 mb-4">
                <PenTool size={18} /> <h3 className="font-bold text-gray-800">Digital Signature</h3>
              </div>
              <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 flex justify-center min-h-[80px]">
                {applicant.signatureData ? (
                  <img src={applicant.signatureData} alt="Applicant Signature" className="max-h-24 object-contain" />
                ) : (
                  <p className="text-gray-400 italic text-sm self-center">No signature captured</p>
                )}
              </div>
              {applicant.signatureApplicantName && (
                <p className="text-xs text-gray-400 mt-2 text-center italic">Signed by: {applicant.signatureApplicantName}</p>
              )}
            </div>
          </div>

          {/* Documents Section — full width */}
          <div className="md:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 text-gray-800 mb-6">
              <FileText size={20} /> <h3 className="font-bold">Uploaded Documents</h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-6">
              {[
                { label: "Profile Photo", url: applicant.profilePhoto || applicant.profileImageUrl },
                { label: "ID Front", url: applicant.idCardFront || applicant.identificationCardUrl },
                { label: "ID Back", url: applicant.idCardBack },
                { label: "Certificate", url: applicant.educationalCertificate || applicant.finalCertificateUrl }
              ].map(d => (
                <div key={d.label} className="space-y-2 group">
                  <p className="text-xs font-bold text-gray-400 uppercase text-center">{d.label}</p>
                  <div className="aspect-square bg-gray-50 rounded-xl border-2 border-dashed border-gray-200 overflow-hidden relative">
                    {d.url ? (
                      d.url.toLowerCase().endsWith('.pdf') ? (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-gray-100 text-gray-500 group-hover:bg-gray-200 transition-colors">
                          <FileText size={32} className="mb-2" />
                          <span className="text-[10px] font-bold uppercase">PDF Document</span>
                          <a href={d.url} target="_blank" rel="noopener noreferrer" className="absolute inset-0 z-10" />
                        </div>
                      ) : (
                        <>
                          <img src={d.url} className="w-full h-full object-contain p-2 transition-transform group-hover:scale-105" alt={d.label} />
                          <a href={d.url} target="_blank" rel="noopener noreferrer" className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity z-10 rounded-xl">
                            <Eye className="text-white" size={32} />
                          </a>
                        </>
                      )
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-200">
                        <X size={32} />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

function Field({ label, value, highlight }) {
  return (
    <div>
      <p className="text-xs text-gray-400 mb-0.5">{label}</p>
      <p className={`font-semibold text-sm ${highlight || "text-gray-800"}`}>{value || "—"}</p>
    </div>
  )
}
