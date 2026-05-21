"use client"

import { useState } from "react"
import { collection, addDoc, serverTimestamp } from "firebase/firestore"
import { db } from "../config/firebase"
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Send,
  CheckCircle,
  AlertCircle,
  MessageSquare,
  User,
  Building,
  Globe,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
} from "lucide-react"

export default function Contact() {
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    inquiryType: "",
    message: "",
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  const inquiryTypes = [
    "General Inquiry",
    "Job Application",
    "Visa Information",
    "Document Verification",
    "Complaint",
    "Support",
    "Partnership",
    "Media Inquiry",
  ]

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess(false)

    try {
      // Make sure this writes to the same collection your admin dashboard reads from: "messages"
      await addDoc(collection(db, "messages"), {
        ...formData,
        isRead: false,
        isStarred: false,
        isReplied: false,
        createdAt: serverTimestamp(),
      })

      setSuccess(true)
      setFormData({
        fullName: "",
        phone: "",
        inquiryType: "",
        message: "",
      })

      setTimeout(() => {
        setSuccess(false)
      }, 5000)
    } catch (error) {
      console.error("Error sending message:", error)
      setError(error?.message || "Failed to send message. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="relative bg-gradient-to-br from-blue-900 via-indigo-900 to-blue-800 py-16 px-6 lg:px-16 rounded-3xl shadow-2xl overflow-hidden">
          {/* Overlay to soften background */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm"></div>

          <div className="relative">
            {/* Contact Form */}
            <div className="p-8 rounded-2xl shadow-xl bg-white/10 backdrop-blur-lg border border-white/20">
              <h2 className="text-3xl font-extrabold mb-8 flex items-center text-white">
                <MessageSquare className="w-7 h-7 mr-2 text-cyan-400" />
                Send us a Message
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Full Name */}
                  <div>
                    <label className="block text-sm font-semibold text-cyan-300 mb-2">
                      Full Name *
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-400 w-5 h-5" />
                      <input
                        type="text"
                        name="fullName"
                        value={formData.fullName}
                        onChange={handleInputChange}
                        required
                        className="w-full rounded-lg bg-white/20 border border-white/30 pl-10 py-3 text-white placeholder-white/70 focus:ring-2 focus:ring-cyan-400 focus:outline-none"
                        placeholder="Enter your full name"
                      />
                    </div>
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="block text-sm font-semibold text-cyan-300 mb-2">
                      Phone Number
                    </label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-400 w-5 h-5" />
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full rounded-lg bg-white/20 border border-white/30 pl-10 py-3 text-white placeholder-white/70 focus:ring-2 focus:ring-cyan-400 focus:outline-none"
                        placeholder="Enter your phone number"
                      />
                    </div>
                  </div>

                  {/* Inquiry Type */}
                  <div>
                    <label className="block text-sm font-semibold text-cyan-300 mb-2">
                      Inquiry Type *
                    </label>
                    <div className="relative">
                      <Building className="absolute left-3 top-1/2 -translate-y-1/2 text-cyan-400 w-5 h-5" />
                      <select
                        name="inquiryType"
                        value={formData.inquiryType}
                        onChange={handleInputChange}
                        required
                        className="w-full rounded-lg bg-white/20 border border-white/30 pl-10 py-3 text-white focus:ring-2 focus:ring-cyan-400 focus:outline-none"
                      >
                        <option value="">Select inquiry type</option>
                        {inquiryTypes.map((type) => (
                          <option key={type} value={type} className="text-gray-900">
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-semibold text-cyan-300 mb-2">
                    Message *
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleInputChange}
                    required
                    rows={6}
                    className="w-full rounded-lg bg-white/20 border border-white/30 py-3 px-4 text-white placeholder-white/70 focus:ring-2 focus:ring-cyan-400 focus:outline-none"
                    placeholder="Please provide details..."
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 text-lg font-semibold text-white rounded-xl shadow-lg bg-gradient-to-r from-cyan-400 to-blue-500 hover:scale-105 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="spinner h-6 w-6"></div>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      <span>Send Message</span>
                    </>
                  )}
                </button>

                {/* Error message */}
                {error && (
                  <p className="mt-4 text-red-300 text-center animate-fadeIn">
                    {error}
                  </p>
                )}

                {/* Success Message */}
                {success && (
                  <p className="mt-4 text-green-600 text-center animate-fadeIn">
                    Message sent successfully!
                  </p>
                )}
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
