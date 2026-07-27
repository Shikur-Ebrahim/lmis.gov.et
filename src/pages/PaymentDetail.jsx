"use client"

import { useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import {
    ChevronLeft,
    Copy,
    CheckCircle2,
    Upload,
    Image as ImageIcon,
    ShieldCheck,
    ArrowRight,
    Info,
    CreditCard
} from "lucide-react"
import { db } from "../config/firebase"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"
import { CLOUDINARY_CONFIG } from "../utils/cloudinary"
import { useToast } from "../contexts/ToastContext"

const uploadToCloudinary = async (file) => {
    const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`
    const formData = new FormData()
    formData.append("file", file)
    formData.append("upload_preset", CLOUDINARY_CONFIG.uploadPresets.profile)
    formData.append("folder", "lmis/registration-receipts")

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
        console.error("Image upload error:", error)
        throw new Error("Failed to upload receipt")
    }
}

export default function PaymentDetail() {
    const location = useLocation()
    const navigate = useNavigate()
    const account = location.state?.account
    const phoneNumber = location.state?.phoneNumber
    const applicantData = location.state?.applicantData
    const { showToast } = useToast()

    const [copiedField, setCopiedField] = useState(null)
    const [screenshot, setScreenshot] = useState(null)
    const [screenshotPreview, setScreenshotPreview] = useState(null)
    const [uploading, setUploading] = useState(false)
    const [error, setError] = useState("")
    const [isSuccess, setIsSuccess] = useState(false)

    if (!account) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6 text-center">
                <div>
                    <p className="text-gray-500 mb-4 font-bold">ምንም የክፍያ ዘዴ አልተመረጠም።</p>
                    <button onClick={() => navigate("/payment-methods")} className="text-blue-600 font-black underline tracking-widest text-xs">ወደ ክፍያ ዘዴዎች ይመለሱ</button>
                </div>
            </div>
        )
    }

    const handleCopy = (text, field) => {
        navigator.clipboard.writeText(text)
        setCopiedField(field)
        showToast("ወደ ክሊፕቦርድ ተቀድቷል", "success")
        setTimeout(() => setCopiedField(null), 2000)
    }

    const handleFileChange = (e) => {
        setError("")
        const file = e.target.files[0]
        if (file) {
            setScreenshot(file)
            const reader = new FileReader()
            reader.onloadend = () => {
                setScreenshotPreview(reader.result)
            }
            reader.readAsDataURL(file)
        }
    }

    const handleFinish = async () => {
        if (!screenshot) {
            setError("እባክዎ የክፍያ ቅጽበታዊ ገጽ እይታ (ስክሪንሾት) ይስቀሉ።")
            return
        }

        setUploading(true)
        setError("")

        try {
            // 1. Upload to Cloudinary
            const receiptUrl = await uploadToCloudinary(screenshot)

            // 2. Save to Firestore
            const paymentData = {
                phoneNumber: phoneNumber || "",
                accountNumber: account.accountNumber,
                receiptUrl,
                status: "pending",
                createdAt: serverTimestamp(),
                applicantData: applicantData || null
            }

            await addDoc(collection(db, "registration-fees"), paymentData)

            setIsSuccess(true)
        } catch (err) {
            console.error("Payment submission error:", err)
            setError("የክፍያ ዝርዝሮችን ማቅረብ አልተሳካም። እባክዎ እንደገና ይሞክሩ።")
            showToast("የክፍያ ዝርዝሮችን ማቅረብ አልተሳካም።", "error")
        } finally {
            setUploading(false)
        }
    }

    if (isSuccess) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center animate-in zoom-in duration-500">
                <div className="bg-white rounded-[2rem] shadow-xl p-8 max-w-md w-full space-y-6">
                    <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto shadow-inner">
                        <CheckCircle2 className="w-10 h-10 text-green-600" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-black text-gray-900 mb-2">ማቅረቡ ተሳክቷል!</h2>
                        <p className="text-gray-500 font-medium text-sm leading-relaxed">
                            የክፍያዎ ቅጽበታዊ ገጽ እይታ እና የአመልካች መረጃዎ ደህንነቱ በተጠበቀ ሁኔታ ገብተዋል።
                            አሁን <strong>በአስተዳዳሪ ማረጋገጫ በመጠባበቅ ላይ</strong> ደረጃ ላይ ነዎት። 
                        </p>
                    </div>
                    <div className="bg-blue-50 border-2 border-blue-100 p-4 rounded-2xl text-left">
                        <h4 className="font-black text-blue-900 text-sm mb-1">ቀጣዩ ምንድን ነው?</h4>
                        <p className="text-xs text-blue-700 leading-relaxed font-semibold">
                            አስተዳዳሪ ክፍያዎን ይገመግማል። አንዴ ከተረጋገጠ፣ የእርስዎ ይፋዊ መገለጫ በራስ ሰር ይፈጠራል እናም ያሳውቆታል።
                        </p>
                    </div>
                    <button
                        onClick={() => navigate("/")}
                        className="w-full py-4 bg-gray-900 text-white font-black rounded-2xl shadow-xl hover:bg-black transition-all active:scale-95 text-sm"
                    >
                        ወደ መነሻ ይመለሱ
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center">
            {/* Header */}
            <div className="w-full max-w-md bg-white sticky top-0 z-50 px-6 py-4 flex items-center justify-between border-b border-gray-100 shadow-sm">
                <button
                    onClick={() => navigate("/payment-methods", { state: { phoneNumber: location.state?.phoneNumber, applicantData: location.state?.applicantData } })}
                    className="p-2 hover:bg-gray-50 rounded-full transition-colors"
                >
                    <ChevronLeft className="w-6 h-6 text-gray-900" />
                </button>
                <h2 className="text-xl font-black text-gray-900 tracking-tight">የ {account.paymentMethod} ክፍያ</h2>
                <div className="w-10" />
            </div>

            <div className="w-full max-w-md px-6 py-8 pb-32 space-y-8">
                {/* Top Section: Enhanced Instructions */}
                <div className="text-center space-y-3">
                    <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-[2rem] mb-2 shadow-xl shadow-blue-100/50 border border-gray-100 p-4">
                        {account.logo?.url ? (
                            <img src={account.logo.url} alt={account.paymentMethod} className="w-full h-full object-contain" />
                        ) : (
                            <CreditCard className="w-10 h-10 text-blue-600" />
                        )}
                    </div>
                    <h1 className="text-xl sm:text-2xl font-black text-gray-900 leading-tight">ክፍያዎን ያጠናቅቁ</h1>
                    <div className="bg-blue-50/50 p-4 rounded-3xl border border-blue-100/50">
                        <p className="text-sm font-bold text-blue-900 leading-relaxed">
                            ይህን የ{account.paymentMethod?.toLowerCase() === 'telebirr' ? 'ስልክ' : 'አካውንት'} ቁጥር ኮፒ አድርገው ይክፈሉ። ክፍያውን ከፈጸሙ በኋላ፣ የክፍያውን ቅጽበታዊ ገጽ እይታ (ስክሪንሾት) ይላኩ።
                        </p>
                    </div>
                </div>

                {/* Unified Account Card */}
                <div className="bg-white rounded-[2.5rem] overflow-hidden shadow-2xl shadow-blue-100/50 border border-white">
                    <div className="bg-blue-600 p-8 text-white">
                        <div className="flex items-center justify-between mb-8">
                            <span className="text-xs font-semibold opacity-90">ይፋዊ የክፍያ መንገድ</span>
                            <ShieldCheck className="w-5 h-5 text-blue-200" />
                        </div>

                        <div className="space-y-6">
                            {/* Combine Holder and Number in Same View */}
                            <div className="space-y-1">
                                <p className="text-xs font-semibold opacity-80">የአካውንት ባለቤት ስም</p>
                                <div className="flex items-center justify-between">
                                    <p className="text-xl font-black truncate">{account.bankName}</p>
                                    <button
                                        onClick={() => handleCopy(account.bankName, 'bank')}
                                        className="p-2 rounded-xl bg-blue-500/30 hover:bg-white hover:text-blue-600 transition-all"
                                    >
                                        {copiedField === 'bank' ? <CheckCircle2 className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                                    </button>
                                </div>
                            </div>

                            <div className="h-px bg-white/20" />

                            <div className="space-y-1">
                                <p className="text-xs font-semibold opacity-80">
                                    {account.paymentMethod?.toLowerCase() === 'telebirr' ? 'ስልክ ቁጥር' : 'አካውንት ቁጥር'}
                                </p>
                                <div className="flex items-center justify-between">
                                    <p className="text-2xl sm:text-3xl font-black font-mono tracking-tighter">{account.accountNumber}</p>
                                    <button
                                        onClick={() => handleCopy(account.accountNumber, 'account')}
                                        className="p-3 rounded-2xl bg-white text-blue-600 shadow-lg hover:bg-blue-50 transition-all active:scale-90"
                                    >
                                        {copiedField === 'account' ? <CheckCircle2 className="w-6 h-6" /> : <Copy className="w-6 h-6" />}
                                    </button>
                                </div>
                            </div>
                            
                            {account.registrationFee && (
                                <>
                                    <div className="h-px bg-white/20" />
                                    <div className="space-y-1 bg-blue-700/50 p-4 rounded-2xl border border-blue-500/30">
                                        <p className="text-xs font-semibold opacity-90 uppercase tracking-wider text-blue-200">የሚከፈል መጠን</p>
                                        <p className="text-3xl font-black">{account.registrationFee} <span className="text-lg opacity-80">ETB</span></p>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="px-8 py-4 bg-gray-50 flex items-center justify-center space-x-2">
                        <Info className="w-4 h-4 text-gray-400" />
                        <span className="text-xs font-semibold text-gray-500">ዝርዝሮችን ወዲያውኑ ኮፒ ለማድረግ ይጫኑ</span>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border border-red-100 p-4 rounded-3xl flex items-start space-x-3 text-red-700">
                        <Info className="w-5 h-5 flex-shrink-0" />
                        <p className="text-xs font-bold tracking-tight">{error}</p>
                    </div>
                )}

                {/* Bottom Section: Upload Screenshot */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2 text-gray-900 font-bold text-sm">
                            <Upload className="w-4 h-4" />
                            <span>Payment Receipt</span>
                        </div>
                        {screenshot && (
                            <span className="text-xs font-semibold text-green-500 flex items-center">
                                <CheckCircle2 className="w-3 h-3 mr-1" /> ለማጠናቀቅ ዝግጁ ነው
                            </span>
                        )}
                    </div>

                    <label className={`relative flex flex-col items-center justify-center w-full h-56 border-4 border-dashed rounded-[2.5rem] transition-all cursor-pointer overflow-hidden ${screenshotPreview ? "border-green-500 bg-green-50/10" : "border-gray-200 hover:border-blue-400 bg-white shadow-inner"
                        }`}>
                        {screenshotPreview ? (
                            <>
                                <img src={screenshotPreview} alt="Receipt" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                                    <div className="bg-white/20 backdrop-blur-md p-4 rounded-full mb-2">
                                        <ImageIcon className="w-8 h-8 text-white" />
                                    </div>
                                    <span className="text-white font-bold text-sm">ደረሰኙን ለመቀየር ይጫኑ</span>
                                </div>
                            </>
                        ) : (
                            <div className="flex flex-col items-center text-center px-6">
                                <div className="w-16 h-16 bg-blue-50 rounded-3xl flex items-center justify-center mb-4">
                                    <ImageIcon className="w-8 h-8 text-blue-500" />
                                </div>
                                <p className="text-sm font-black text-gray-800 tracking-tight">ቅጽበታዊ ገጽ እይታ (ስክሪንሾት) ይስቀሉ</p>
                                <p className="text-xs text-gray-500 font-medium mt-2 leading-relaxed">
                                    የክፍያውን ማረጋገጫ ምስል <br /> ከጋለሪዎ ይምረጡ
                                </p>
                            </div>
                        )}
                        <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
                    </label>
                </div>
            </div>

            {/* Fixed Footer */}
            <div className="w-full max-w-md fixed bottom-0 px-6 py-6 bg-white/80 backdrop-blur-2xl border-t border-gray-100 shadow-[0_-15px_40px_rgba(0,0,0,0.08)]">
                <button
                    onClick={handleFinish}
                    disabled={!screenshot || uploading}
                    className="w-full py-5 bg-gray-900 text-white font-black rounded-[2rem] shadow-2xl shadow-gray-200 hover:bg-black transition-all active:scale-95 disabled:opacity-20 flex items-center justify-center space-x-3 text-sm"
                >
                    {uploading ? (
                        <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                    ) : (
                        <>
                            <span>ክፍያውን ያስገቡ</span>
                            <ArrowRight className="w-6 h-6" />
                        </>
                    )}
                </button>
            </div>
        </div>
    )
}
