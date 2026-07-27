"use client"

import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { doc, getDoc, collection, addDoc, serverTimestamp } from "firebase/firestore"
import { db } from "../config/firebase"
import {
  ArrowLeft,
  CheckCircle2,
  Upload,
  Copy,
  Info,
  ShieldCheck,
  AlertTriangle,
  Phone,
  Mail,
  Send,
  MessageCircle,
  HelpCircle,
  Loader2,
  FileCheck
} from "lucide-react"
import { CLOUDINARY_CONFIG } from "../utils/cloudinary"
import { useToast } from "../contexts/ToastContext"

const uploadToCloudinary = async (file) => {
  const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`
  const formData = new FormData()
  formData.append("file", file)
  formData.append("upload_preset", CLOUDINARY_CONFIG.uploadPresets.profile)
  formData.append("folder", "lmis/bank-statements")

  try {
    const response = await fetch(url, {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`)
    }

    const data = await response.json()
    return data.secure_url
  } catch (error) {
    console.error("Upload error:", error)
    throw new Error("Failed to upload document")
  }
}

export default function FinancialVerification() {
  const navigate = useNavigate()
  const location = useLocation()
  const { showToast } = useToast()

  const [supportData, setSupportData] = useState({
    accountNumber: "1000539193205",
    accountHolder: "Bezawit",
    phone: "+251900000000",
    email: "info@lmis.gov.et",
    telegram: "lmis_support",
    whatsapp: "+251900000000"
  })

  const [loading, setLoading] = useState(false)
  const [statementFile, setStatementFile] = useState(null)
  const [statementPreview, setStatementPreview] = useState(null)
  const [uploadingStatement, setUploadingStatement] = useState(false)

  const [receiptFile, setReceiptFile] = useState(null)
  const [receiptPreview, setReceiptPreview] = useState(null)
  const [uploadingReceipt, setUploadingReceipt] = useState(false)

  const [copied, setCopied] = useState(false)

  useEffect(() => {
    // Fetch latest account & support settings from Firestore settings/support
    const fetchSettings = async () => {
      try {
        const docRef = doc(db, "settings", "support")
        const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
          setSupportData(prev => ({ ...prev, ...docSnap.data() }))
        }
      } catch (err) {
        console.error("Error fetching support settings:", err)
      }
    }
    fetchSettings()
  }, [])

  const handleCopyAccount = () => {
    navigator.clipboard.writeText(supportData.accountNumber || "1000539193205")
    setCopied(true)
    showToast("Account number copied to clipboard", "success")
    setTimeout(() => setCopied(false), 2500)
  }

  const handleStatementUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setStatementFile(file)
    setUploadingStatement(true)

    try {
      const url = await uploadToCloudinary(file)
      await addDoc(collection(db, "verified-documents"), {
        type: "bank_statement",
        fileUrl: url,
        status: "pending",
        createdAt: serverTimestamp(),
        isRead: false
      })
      showToast("Bank statement uploaded successfully!", "success")
    } catch (err) {
      console.error("Error uploading statement:", err)
      showToast("Failed to upload statement. Please try again.", "error")
    } finally {
      setUploadingStatement(false)
    }
  }

  const handleReceiptUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    setReceiptFile(file)
    setUploadingReceipt(true)

    try {
      const url = await uploadToCloudinary(file)
      await addDoc(collection(db, "verified-documents"), {
        type: "support_program_payment",
        fileUrl: url,
        status: "pending",
        createdAt: serverTimestamp(),
        isRead: false
      })
      showToast("Payment screenshot uploaded successfully!", "success")
    } catch (err) {
      console.error("Error uploading receipt:", err)
      showToast("Failed to upload screenshot. Please try again.", "error")
    } finally {
      setUploadingReceipt(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans pb-24">

      {/* Sticky Header */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm px-4 py-3">
        <div className="max-w-xl mx-auto flex items-center justify-between">
          <button onClick={() => navigate(-1)} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-700">
            <ArrowLeft size={22} />
          </button>
          <h1 className="text-base sm:text-lg font-black text-gray-900">Financial Verification</h1>
          <div className="w-9" />
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-xl mx-auto px-4 pt-6 space-y-6">

        {/* Title Header */}
        <div className="text-center space-y-1">
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            Bank Statement Requirements
          </h2>
          <h3 className="text-xl font-bold text-gray-800">
            የባንክ መግለጫ መስፈርቶች
          </h3>
          <p className="text-sm font-semibold text-gray-500 pt-1">
            Please choose one of the options below to proceed.
          </p>
        </div>

        {/* ── Option 1 Card: Standard Verification ── */}
        <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm space-y-0">
          {/* Header Banner */}
          <div className="bg-blue-600 px-6 py-3.5 text-white flex items-center gap-3">
            <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-black uppercase tracking-wider">Option 1</span>
            <span className="font-extrabold text-base sm:text-lg">Standard Verification</span>
          </div>

          <div className="p-6 space-y-5">
            {/* Description */}
            <div className="space-y-2 text-sm text-gray-700 font-semibold leading-relaxed">
              <p>
                Upload a recent bank statement showing an available balance between <strong className="text-gray-900 font-black">500,000 ETB</strong> and <strong className="text-gray-900 font-black">2,000,000 ETB</strong>.
              </p>
              <p className="text-gray-600 font-medium">
                ከ500,000 ብር እስከ 2,000,000 ብር ያለውን ቀሪ ሒሳብ የሚያሳይ የቅርብ ጊዜ የባንክ መግለጫ ይስቀሉ።
              </p>
            </div>

            {/* Requirements Box */}
            <div className="bg-blue-50/70 border border-blue-100 rounded-2xl p-4 space-y-2 text-xs sm:text-sm text-blue-950 font-bold">
              <div className="flex items-center gap-2 text-blue-700 font-extrabold text-sm mb-1">
                <CheckCircle2 size={18} className="text-blue-600" /> Requirements:
              </div>
              <ul className="space-y-1.5 pl-6 list-disc font-semibold text-blue-900">
                <li>Recent bank statement (last 3 months)</li>
                <li>Clear and readable document</li>
                <li>Balance: 500,000–2,000,000 ETB</li>
                <li>PDF, JPG, or PNG format</li>
              </ul>
            </div>

            <p className="text-xs text-gray-400 italic text-center font-medium">
              Your information will be kept secure and used only for application verification.
            </p>

            {/* Upload Button */}
            <label className="block">
              <input
                type="file"
                accept="image/*,application/pdf"
                onChange={handleStatementUpload}
                disabled={uploadingStatement}
                className="hidden"
              />
              <div className="w-full py-4 bg-blue-600 hover:bg-blue-700 active:scale-98 text-white font-black text-sm sm:text-base rounded-2xl shadow-lg shadow-blue-200 flex items-center justify-center gap-2 cursor-pointer transition-all">
                {uploadingStatement ? (
                  <Loader2 size={20} className="animate-spin" />
                ) : (
                  <>
                    <Upload size={20} />
                    <span>Upload Statement / መግለጫ ይስቀሉ</span>
                  </>
                )}
              </div>
            </label>
          </div>
        </div>

        {/* ── Option 2 Card: Optional Applicant Support Program ── */}
        <div className="bg-white rounded-3xl border border-gray-200 overflow-hidden shadow-sm relative">
          {/* Recommended Badge */}
          <div className="absolute top-2 right-2 z-10">
            <span className="bg-emerald-500 text-white font-black text-[11px] uppercase tracking-wider px-3 py-1 rounded-full shadow-md">
              Recommended
            </span>
          </div>

          {/* Header Banner */}
          <div className="bg-emerald-600 px-6 py-3.5 text-white flex items-center gap-3">
            <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-black uppercase tracking-wider">Option 2</span>
            <span className="font-extrabold text-sm sm:text-base pr-16 truncate">Optional Applicant Support Program</span>
          </div>

          <div className="p-6 space-y-6">
            {/* Description */}
            <div className="space-y-3 text-sm text-gray-700 font-semibold leading-relaxed">
              <p>
                If you need assistance with meeting the financial requirements, you may apply for our Optional Applicant Support Program.
              </p>
              <p className="text-gray-600 font-medium">
                የፋይናንስ መስፈርቶችን ለማሟላት እርዳታ ከፈለጉ፣ ለኛ አማራጭ የአመልካች ድጋፍ ፕሮግራም ማመልከት ይችላሉ።
              </p>
              <p className="pt-1">
                Participants may contribute a refundable service fee of <strong className="text-gray-900 font-black">40,000 ETB</strong> for bank statement preparation and related document support.
              </p>
              <p className="text-gray-600 font-medium">
                ተሳታፊዎች 40,000 ብር ተመላሽ የሚደረግ የአገልግሎት ክፍያ ማበርከት ይችላሉ።
              </p>
            </div>

            {/* Warning Notice Box */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 space-y-2">
              <div className="flex items-center gap-2 text-amber-800 font-black text-sm">
                <AlertTriangle size={18} className="text-amber-600 shrink-0" />
                <span>Important Notice / አስፈላጊ ማሳሰቢያ</span>
              </div>
              <p className="text-xs sm:text-sm font-bold text-amber-900 leading-snug">
                Please make payment <strong className="underline">ONLY</strong> to the official account listed below. We are not responsible for payments made to unauthorized accounts.
              </p>
              <p className="text-xs text-amber-800 font-semibold leading-snug">
                ክፍያዎን <strong className="underline">ብቻ</strong> ከዚህ በታች ለተዘረዘረው ህጋዊ ሒሳብ ይክፈሉ።
              </p>
            </div>

            {/* Payment Details Box */}
            <div className="bg-emerald-50/60 border border-emerald-200 rounded-3xl p-6 text-center space-y-4">
              <h4 className="font-black text-emerald-800 text-sm sm:text-base uppercase tracking-wider">
                PAYMENT DETAILS / የክፍያ ዝርዝሮች
              </h4>

              {/* CBE Emblem Logo */}
              <div className="w-16 h-16 bg-white rounded-2xl p-2 mx-auto border border-emerald-100 shadow-md flex items-center justify-center">
                <img
                  src="https://res.cloudinary.com/dscjhy7qv/image/upload/v1780730781/lmis/account-logos/uzgxzpzbe74pfarlufe5.jpg"
                  alt="CBE Logo"
                  className="w-full h-full object-contain"
                />
              </div>

              <div>
                <h5 className="font-black text-xl text-gray-900 leading-tight">Commercial Bank of Ethiopia</h5>
                <p className="text-sm font-bold text-gray-600 mt-0.5">{supportData.accountHolder || "Bezawit"}</p>
              </div>

              {/* Account Number & Copy */}
              <div className="flex items-center justify-center gap-2 max-w-sm mx-auto pt-1">
                <div className="flex-1 py-3 px-4 bg-white border-2 border-emerald-300 rounded-2xl text-center font-mono text-xl sm:text-2xl font-black text-emerald-800 tracking-wider shadow-inner">
                  {supportData.accountNumber || "1000539193205"}
                </div>
                <button
                  onClick={handleCopyAccount}
                  className="py-3 px-4 bg-white border-2 border-gray-200 hover:border-emerald-500 rounded-2xl font-bold text-sm text-gray-700 hover:text-emerald-700 flex items-center gap-1.5 shadow-sm active:scale-95 transition-all"
                >
                  <Copy size={16} />
                  <span>{copied ? "Copied!" : "Copy"}</span>
                </button>
              </div>

              {/* Instructions */}
              <div className="pt-2 space-y-1">
                <p className="text-xs sm:text-sm font-bold text-gray-800">
                  After paying, upload your payment screenshot:
                </p>
                <p className="text-xs text-gray-500 font-semibold">
                  ከከፈሉ በኋላ የክፍያ ቅጂውን ይስቀሉ:
                </p>
              </div>

              {/* Upload Receipt Button */}
              <label className="block pt-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleReceiptUpload}
                  disabled={uploadingReceipt}
                  className="hidden"
                />
                <div className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-black text-sm sm:text-base rounded-2xl shadow-lg shadow-emerald-200 flex items-center justify-center gap-2 cursor-pointer transition-all">
                  {uploadingReceipt ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <>
                      <Upload size={20} />
                      <span>Upload Payment Screenshot / ፎቶ ይስቀሉ</span>
                    </>
                  )}
                </div>
              </label>
            </div>
          </div>
        </div>

        {/* ── Bottom Assistance Card ── */}
        <div className="bg-white rounded-3xl border border-gray-200 p-6 text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-1">
            <HelpCircle size={26} />
          </div>
          <div>
            <h4 className="font-black text-gray-900 text-lg">Need Assistance?</h4>
            <p className="text-xs sm:text-sm font-semibold text-gray-500">Contact our support team for help.</p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
            <a
              href={`tel:${supportData.phone}`}
              className="py-3 px-3 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl font-bold text-xs text-gray-800 flex items-center justify-center gap-1.5 shadow-sm transition"
            >
              <Phone size={16} /> Call
            </a>
            <a
              href={`mailto:${supportData.email}`}
              className="py-3 px-3 bg-blue-600 hover:bg-blue-700 rounded-xl font-bold text-xs text-white flex items-center justify-center gap-1.5 shadow-md shadow-blue-200 transition"
            >
              <Mail size={16} /> Email
            </a>
            <a
              href={`https://t.me/${supportData.telegram.replace('@', '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="py-3 px-3 bg-sky-500 hover:bg-sky-600 rounded-xl font-bold text-xs text-white flex items-center justify-center gap-1.5 shadow-md shadow-sky-200 transition"
            >
              <Send size={16} /> Telegram
            </a>
            <a
              href={`https://wa.me/${supportData.whatsapp.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="py-3 px-3 bg-emerald-500 hover:bg-emerald-600 rounded-xl font-bold text-xs text-white flex items-center justify-center gap-1.5 shadow-md shadow-emerald-200 transition"
            >
              <MessageCircle size={16} /> WhatsApp
            </a>
          </div>
        </div>

      </div>
    </div>
  )
}
