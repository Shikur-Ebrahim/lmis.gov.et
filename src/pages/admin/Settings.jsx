import React, { useState } from "react"
import { auth } from "../../config/firebase"
import { reauthenticateWithCredential, EmailAuthProvider, updatePassword } from "firebase/auth"
import { Lock, AlertCircle, CheckCircle, Eye, EyeOff } from "lucide-react"
import Sidebar from "../../components/admin/Sidebar"

export default function Settings() {
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState({ type: "", text: "" })

  const handleChangePassword = async (e) => {
    e.preventDefault()
    setMessage({ type: "", text: "" })

    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", text: "New passwords do not match." })
      return
    }

    if (newPassword.length < 6) {
      setMessage({ type: "error", text: "New password must be at least 6 characters long." })
      return
    }

    setLoading(true)
    try {
      const user = auth.currentUser
      if (!user) {
        throw new Error("No user is currently logged in.")
      }

      // Re-authenticate
      const credential = EmailAuthProvider.credential(user.email, currentPassword)
      await reauthenticateWithCredential(user, credential)

      // Update password
      await updatePassword(user, newPassword)

      setMessage({ type: "success", text: "Password changed successfully." })
      setCurrentPassword("")
      setNewPassword("")
      setConfirmPassword("")
    } catch (error) {
      console.error("Password change error:", error)
      if (error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password') {
        setMessage({ type: "error", text: "Incorrect current password." })
      } else {
        setMessage({ type: "error", text: "Failed to change password. " + error.message })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 lg:ml-64 p-4 lg:p-8">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
              <Lock className="w-8 h-8 text-cyan-500" />
              Settings
            </h1>
            <p className="text-gray-500 mt-2">Manage your admin account settings.</p>
          </div>

          <div className="bg-white rounded-[2rem] p-8 shadow-xl border-2 border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Change Password</h2>

            {message.text && (
              <div className={`p-4 rounded-xl flex items-center gap-3 mb-6 ${
                message.type === 'error' ? 'bg-red-50 text-red-700 border border-red-200' : 'bg-green-50 text-green-700 border border-green-200'
              }`}>
                {message.type === 'error' ? <AlertCircle className="w-5 h-5" /> : <CheckCircle className="w-5 h-5" />}
                <p className="font-bold text-sm">{message.text}</p>
              </div>
            )}

            <form onSubmit={handleChangePassword} className="space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Current Password</label>
                <div className="relative">
                  <input
                    type={showCurrent ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    required
                    className="w-full pl-4 pr-12 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none transition-all font-medium"
                    placeholder="Enter current password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrent(!showCurrent)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                  >
                    {showCurrent ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">New Password</label>
                <div className="relative">
                  <input
                    type={showNew ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    minLength={6}
                    className="w-full pl-4 pr-12 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none transition-all font-medium"
                    placeholder="Enter new password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                  >
                    {showNew ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-1">Confirm New Password</label>
                <input
                  type={showNew ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none transition-all font-medium"
                  placeholder="Confirm new password"
                />
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-4 bg-gray-900 hover:bg-gray-800 text-white rounded-xl font-bold transition-all transform active:scale-[0.98] disabled:opacity-50 flex justify-center"
                >
                  {loading ? (
                    <div className="animate-spin w-6 h-6 border-2 border-white border-t-transparent rounded-full" />
                  ) : (
                    "Update Password"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
