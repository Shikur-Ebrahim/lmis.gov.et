"use client"

import { useState, useEffect } from "react"
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore"
import { db } from "../../config/firebase"
import Sidebar from "../../components/admin/Sidebar"
import {
  Share2,
  Building2,
  Phone,
  Mail,
  Send,
  MessageCircle,
  Save,
  CheckCircle,
  AlertCircle,
  CreditCard,
  UserCheck,
  Loader2,
  MessageSquare
} from "lucide-react"

export default function SocialMediaSettings() {
  const [formData, setFormData] = useState({
    bankName: "Commercial Bank of Ethiopia",
    accountHolder: "Bezawit",
    accountNumber: "1000539193205",
    phone: "+251900000000",
    email: "info@lmis.gov.et",
    telegram: "lmis_support",
    whatsapp: "+251900000000",
    sms: "+251900000000"
  })

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setLoading(true)
        const docRef = doc(db, "settings", "support")
        const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
          setFormData(prev => ({ ...prev, ...docSnap.data() }))
        }
      } catch (err) {
        console.error("Error fetching support settings:", err)
        setErrorMessage("Failed to load current settings")
      } finally {
        setLoading(false)
      }
    }

    fetchSettings()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    setSuccessMessage("")
    setErrorMessage("")

    try {
      const docRef = doc(db, "settings", "support")
      await setDoc(docRef, {
        ...formData,
        updatedAt: serverTimestamp()
      }, { merge: true })

      setSuccessMessage("Bank statement account and social media contact info saved successfully!")
      setTimeout(() => setSuccessMessage(""), 4000)
    } catch (err) {
      console.error("Error saving settings:", err)
      setErrorMessage("Failed to save settings. Please try again.")
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-950 text-gray-100">
      <Sidebar />

      <div className="flex-1 lg:ml-64 p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">

        {/* Page Title Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-800 pb-6">
          <div>
            <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">
              Social Media & Bank Account Settings
            </h1>
            <p className="text-gray-400 text-sm mt-1">
              Manage the official Bank Statement account details and user support contact channels
            </p>
          </div>
          <div className="p-3 rounded-2xl bg-gray-900 border border-gray-800 text-cyan-400">
            <Share2 size={24} />
          </div>
        </div>

        {/* Notifications */}
        {successMessage && (
          <div className="p-4 bg-emerald-950/80 border border-emerald-700/60 text-emerald-300 rounded-2xl flex items-center gap-3 animate-in fade-in">
            <CheckCircle className="shrink-0 text-emerald-400" size={20} />
            <span className="font-bold text-sm">{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-4 bg-red-950/80 border border-red-700/60 text-red-300 rounded-2xl flex items-center gap-3 animate-in fade-in">
            <AlertCircle className="shrink-0 text-red-400" size={20} />
            <span className="font-bold text-sm">{errorMessage}</span>
          </div>
        )}

        {loading ? (
          <div className="py-20 text-center space-y-3">
            <Loader2 className="w-10 h-10 animate-spin text-cyan-400 mx-auto" />
            <p className="text-gray-400 text-sm font-medium">Loading settings...</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">

            {/* ── Section 1: Bank Statement Account Details ── */}
            <div className="bg-gray-900 rounded-3xl p-6 sm:p-8 border border-gray-800 space-y-6 shadow-xl">
              <div className="flex items-center gap-3 border-b border-gray-800 pb-4 text-cyan-400">
                <Building2 size={22} />
                <h2 className="text-xl font-bold text-gray-100">Official Bank Statement Account</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Bank Name */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400">
                    Bank Name
                  </label>
                  <div className="relative">
                    <Building2 className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input
                      type="text"
                      name="bankName"
                      value={formData.bankName}
                      onChange={handleChange}
                      placeholder="e.g. Commercial Bank of Ethiopia"
                      className="w-full pl-11 pr-4 py-3.5 bg-gray-950 border border-gray-800 rounded-xl text-gray-100 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-semibold text-sm"
                      required
                    />
                  </div>
                </div>

                {/* Account Holder Name */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400">
                    Account Holder Name
                  </label>
                  <div className="relative">
                    <UserCheck className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input
                      type="text"
                      name="accountHolder"
                      value={formData.accountHolder}
                      onChange={handleChange}
                      placeholder="e.g. Bezawit"
                      className="w-full pl-11 pr-4 py-3.5 bg-gray-950 border border-gray-800 rounded-xl text-gray-100 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-semibold text-sm"
                      required
                    />
                  </div>
                </div>

                {/* Account Number */}
                <div className="md:col-span-2 space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400">
                    Account Number
                  </label>
                  <div className="relative">
                    <CreditCard className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input
                      type="text"
                      name="accountNumber"
                      value={formData.accountNumber}
                      onChange={handleChange}
                      placeholder="e.g. 1000539193205"
                      className="w-full pl-11 pr-4 py-3.5 bg-gray-950 border border-gray-800 rounded-xl text-emerald-400 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-mono text-lg font-bold"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* ── Section 2: Social Media & Contact Info ── */}
            <div className="bg-gray-900 rounded-3xl p-6 sm:p-8 border border-gray-800 space-y-6 shadow-xl">
              <div className="flex items-center gap-3 border-b border-gray-800 pb-4 text-emerald-400">
                <Share2 size={22} />
                <h2 className="text-xl font-bold text-gray-100">Social Media & Support Contacts</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Phone Call */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400">
                    Support Phone Number (Call)
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+251900000000"
                      className="w-full pl-11 pr-4 py-3.5 bg-gray-950 border border-gray-800 rounded-xl text-gray-100 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-semibold text-sm"
                    />
                  </div>
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400">
                    Support Email
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="info@lmis.gov.et"
                      className="w-full pl-11 pr-4 py-3.5 bg-gray-950 border border-gray-800 rounded-xl text-gray-100 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-semibold text-sm"
                    />
                  </div>
                </div>

                {/* Telegram Username */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400">
                    Telegram Username / Channel
                  </label>
                  <div className="relative">
                    <Send className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sky-400" size={18} />
                    <input
                      type="text"
                      name="telegram"
                      value={formData.telegram}
                      onChange={handleChange}
                      placeholder="lmis_support"
                      className="w-full pl-11 pr-4 py-3.5 bg-gray-950 border border-gray-800 rounded-xl text-gray-100 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-semibold text-sm"
                    />
                  </div>
                </div>

                {/* WhatsApp Phone */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400">
                    WhatsApp Phone Number
                  </label>
                  <div className="relative">
                    <MessageCircle className="absolute left-3.5 top-1/2 -translate-y-1/2 text-emerald-400" size={18} />
                    <input
                      type="text"
                      name="whatsapp"
                      value={formData.whatsapp}
                      onChange={handleChange}
                      placeholder="+251900000000"
                      className="w-full pl-11 pr-4 py-3.5 bg-gray-950 border border-gray-800 rounded-xl text-gray-100 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-semibold text-sm"
                    />
                  </div>
                </div>

                {/* SMS / Message Phone */}
                <div className="space-y-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-400">
                    SMS / Message Phone Number
                  </label>
                  <div className="relative">
                    <MessageSquare className="absolute left-3.5 top-1/2 -translate-y-1/2 text-blue-400" size={18} />
                    <input
                      type="text"
                      name="sms"
                      value={formData.sms}
                      onChange={handleChange}
                      placeholder="+251900000000"
                      className="w-full pl-11 pr-4 py-3.5 bg-gray-950 border border-gray-800 rounded-xl text-gray-100 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-semibold text-sm"
                    />
                  </div>
                </div>

              </div>
            </div>

            {/* Save Button */}
            <div className="flex justify-end pt-2">
              <button
                type="submit"
                disabled={saving}
                className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-600 hover:to-indigo-600 text-white font-extrabold text-base rounded-2xl shadow-lg shadow-cyan-950 flex items-center gap-2 active:scale-95 transition-all disabled:opacity-60"
              >
                {saving ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    <span>Saving Settings...</span>
                  </>
                ) : (
                  <>
                    <Save size={20} />
                    <span>Save Settings</span>
                  </>
                )}
              </button>
            </div>

          </form>
        )}
      </div>
    </div>
  )
}
