"use client"

import { useState, useEffect, useCallback } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { doc, getDoc, updateDoc } from "firebase/firestore"
import { db } from "../config/firebase"
import {
  User, Phone, MapPin, Briefcase, Calendar, Globe,
  FileText, ArrowLeft, CheckCircle, CheckCircle2, Clock, XCircle,
  AlertCircle, DollarSign, Shield, PenTool, ClipboardCheck,
  Eye, Home, Truck, Coffee, Plane, X, Loader2,
  Mail, Send, MessageCircle, MessageSquare
} from "lucide-react"
import { getOptimizedImageUrl } from "../utils/cloudinary"

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
  const [showCongratsModal, setShowCongratsModal] = useState(false)

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

  useEffect(() => {
    if (applicant) {
      const storageKey = `notification_count_${applicant.id}`
      const currentCount = parseInt(localStorage.getItem(storageKey) || "0", 10)
      const maxCount = applicant.notificationLimit ? parseInt(applicant.notificationLimit, 10) : 10

      if (currentCount < maxCount) {
        setShowCongratsModal(true)
        localStorage.setItem(storageKey, (currentCount + 1).toString())
      }
    }
  }, [applicant])

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
  const targetCountry = (applicant?.selectedCountries && applicant.selectedCountries.length > 0) 
    ? applicant.selectedCountries[0] 
    : applicant?.country

  const getStatusColor = (s) => {
    switch ((s || "").toLowerCase()) {
      case "accepted": return "bg-emerald-50 text-emerald-700 border-emerald-300"
      case "rejected": return "bg-red-50 text-red-700 border-red-300"
      case "under review": return "bg-blue-50 text-blue-700 border-blue-300"
      default: return "bg-amber-50 text-amber-700 border-amber-300"
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">

      {/* ── Sticky Header ── */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-600">
            <ArrowLeft size={22} />
          </button>
          <div className="text-center font-black text-gray-900 truncate max-w-[200px] text-base">{fullName}</div>
          <div className="flex items-center">
            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(applicant.status)}`}>
              <CheckCircle2 className="w-3.5 h-3.5" />
              {applicant.status || "Accepted"}
            </span>
          </div>
        </div>
      </div>

      {/* ── Hero Profile Card ── */}
      <div className="max-w-5xl mx-auto px-4 pt-4 pb-2">
        <div className="relative bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden mb-6">
          {/* Top Banner with Bank Statement Button */}
          <div className="h-28 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 relative flex items-start justify-center pt-2.5 p-4">
            <button 
              onClick={() => navigate('/financial-verification')}
              className="bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-extrabold px-6 py-1.5 rounded-full text-xs sm:text-sm shadow-lg shadow-emerald-900/20 transition-all duration-200"
            >
              Bank Statement
            </button>
          </div>

          <div className="px-6 pb-6 text-center">
            {/* Centered Profile Photo */}
            <div className="relative inline-block -mt-14 mb-3">
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full border-4 border-white shadow-xl overflow-hidden bg-gray-100 mx-auto">
                <img
                  src={applicant.profilePhoto || applicant.profileImageUrl || applicant.profileImage || "/placeholder.svg"}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute bottom-1 right-2 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full" />
            </div>

            {/* Name & Job */}
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900">{fullName}</h1>
            <p className="text-gray-500 font-semibold text-sm sm:text-base mt-0.5">{applicant.jobTitle || applicant.jobCategory || "—"}</p>

            {/* Target Country & Salary Badges */}
            <div className="flex flex-wrap items-center justify-center gap-2 mt-3">
              {/* Target Country */}
              {targetCountry && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100 shadow-sm">
                  <MapPin className="w-3.5 h-3.5 text-blue-500" />
                  {flagMapping[targetCountry] && (
                    <img src={`/images/${flagMapping[targetCountry]}`} alt="" className="w-4 h-3 rounded object-cover" />
                  )}
                  {targetCountry}
                </span>
              )}

              {/* Monthly Salary */}
              {(applicant.monthlySalary || applicant.salary) && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-700 border border-purple-100 shadow-sm">
                  <DollarSign className="w-3.5 h-3.5 text-purple-500" />
                  Salary: {applicant.monthlySalary || applicant.salary}
                </span>
              )}
            </div>

            {/* Social Media & Action Icons Bar */}
            <div className="flex items-center justify-center gap-3 mt-5 pt-4 border-t border-gray-100 max-w-sm mx-auto">
              <a href={`tel:${applicant.phoneNumber || ''}`} className="w-11 h-11 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl flex items-center justify-center shadow-sm transition-transform active:scale-90">
                <Phone size={18} />
              </a>
              <a href={`mailto:${applicant.email || 'info@lmis.gov.et'}`} className="w-11 h-11 bg-blue-600 text-white hover:bg-blue-700 rounded-xl flex items-center justify-center shadow-md shadow-blue-200 transition-transform active:scale-90">
                <Mail size={18} />
              </a>
              <a href={`https://t.me/${(applicant.phoneNumber || '').replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="w-11 h-11 bg-sky-500 text-white hover:bg-sky-600 rounded-xl flex items-center justify-center shadow-md shadow-sky-200 transition-transform active:scale-90">
                <Send size={18} />
              </a>
              <a href={`https://wa.me/${(applicant.phoneNumber || '').replace(/[^0-9]/g, '')}`} target="_blank" rel="noopener noreferrer" className="w-11 h-11 bg-emerald-500 text-white hover:bg-emerald-600 rounded-xl flex items-center justify-center shadow-md shadow-emerald-200 transition-transform active:scale-90">
                <MessageCircle size={18} />
              </a>
              <a href={`sms:${applicant.phoneNumber || ''}`} className="w-11 h-11 bg-blue-800 text-white hover:bg-blue-900 rounded-xl flex items-center justify-center shadow-md shadow-blue-300 transition-transform active:scale-90">
                <MessageSquare size={18} />
              </a>
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
                          <img 
                            src={getOptimizedImageUrl(d.url, { width: 800, height: 800, crop: 'fit', quality: 'auto' })} 
                            className="w-full h-full object-contain p-2 transition-transform group-hover:scale-105" 
                            alt={d.label} 
                            loading="lazy"
                          />
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

      {/* ── Congratulations Notification Modal ── */}
      {showCongratsModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-in fade-in duration-300" onClick={() => setShowCongratsModal(false)}>
          <div 
            className="bg-white rounded-3xl overflow-hidden shadow-2xl max-w-sm w-full animate-in zoom-in-95 duration-300 relative border border-gray-100"
            onClick={e => e.stopPropagation()}
          >
            {/* Top Green Header Banner */}
            <div className="h-28 bg-gradient-to-r from-emerald-500 to-green-500 relative flex items-center justify-center">
              <button 
                onClick={() => setShowCongratsModal(false)}
                className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
              
              {/* Floating Checkmark Icon */}
              <div className="absolute -bottom-8 w-16 h-16 rounded-full bg-white p-1 shadow-lg flex items-center justify-center">
                <div className="w-full h-full rounded-full bg-emerald-500 flex items-center justify-center text-white">
                  <CheckCircle size={38} className="text-white fill-emerald-500 stroke-white" />
                </div>
              </div>
            </div>

            {/* Modal Body Content */}
            <div className="p-6 pt-11 text-center space-y-4">
              {/* English Section */}
              <div className="space-y-1">
                <p className="text-base text-gray-800 font-semibold">
                  Dear <span className="text-emerald-600 font-extrabold">{applicant?.firstName || (applicant?.fullName ? applicant.fullName.split(" ")[0] : "Applicant")}</span>,
                </p>
                <h3 className="text-2xl font-black text-gray-900 tracking-tight">Congratulations!</h3>
                <p className="text-xs sm:text-sm text-gray-600 font-medium px-2 leading-relaxed">
                  You are accepted for the job. Please finish the bank statement process.
                </p>
              </div>

              {/* Subtle Divider */}
              <div className="w-2/3 mx-auto border-t border-gray-100 my-2" />

              {/* Amharic Section */}
              <div className="space-y-1">
                <p className="text-base text-gray-800 font-semibold">
                  ውድ <span className="text-emerald-600 font-extrabold">{applicant?.firstName || (applicant?.fullName ? applicant.fullName.split(" ")[0] : "Applicant")}</span>,
                </p>
                <h3 className="text-xl font-black text-gray-900 tracking-tight">እንኳን ደስ አለዎት!</h3>
                <p className="text-xs sm:text-sm text-gray-600 font-medium px-2 leading-relaxed">
                  ለስራው ተቀባይነት አግኝተዋል። እባክዎ የባንክ መግለጫ ሂደቱን ያጠናቅቁ።
                </p>
              </div>

              {/* Action Button */}
              <div className="pt-2">
                <button
                  onClick={() => setShowCongratsModal(false)}
                  className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-600 active:scale-95 text-white font-black text-base rounded-2xl shadow-lg shadow-emerald-200 transition-all duration-200"
                >
                  OK / እሺ
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
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
