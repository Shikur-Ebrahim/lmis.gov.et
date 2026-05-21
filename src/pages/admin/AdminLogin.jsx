"use client"

import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useAuth } from "../../hooks/useAuth"
import { auth } from "../../config/firebase"
import { LogIn, Eye, EyeOff, Shield, Lock, Mail, ArrowRight } from "lucide-react"

export default function AdminLogin() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      let finalLoginId = email.trim()

      // Transform phone number to internal email format if it's a 9-digit number starting with 9 or 7
      const isPhone = /^[79]\d{8}$/.test(finalLoginId)
      if (isPhone) {
        finalLoginId = `251${finalLoginId}@lmis.gov.et`
      }

      // Authenticate with Firebase Auth
      await login(finalLoginId, password)

      // Get the current user and check for admin custom claims
      const user = auth.currentUser
      if (user) {
        // Get ID token result which contains custom claims
        const idTokenResult = await user.getIdTokenResult()

        // Check if user has admin custom claim
        if (idTokenResult.claims.admin === true) {
          // User is an admin, navigate to admin dashboard
          navigate("/admin/dashboard")
        } else {
          // Regular user, navigate to personal page
          navigate("/personal")
        }
      } else {
        setError("Authentication failed. Please try again.")
      }
    } catch (err) {
      console.error("Login error:", err)
      setError("Invalid credentials. Please check your email and password.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 font-sans p-4 relative overflow-hidden">
      {/* Subtle Background Elements */}
      <div className="absolute top-0 right-0 w-1/2 h-1/2 bg-blue-50 rounded-full blur-[120px] -mr-32 -mt-32 opacity-60"></div>
      <div className="absolute bottom-0 left-0 w-1/2 h-1/2 bg-indigo-50 rounded-full blur-[120px] -ml-32 -mb-32 opacity-60"></div>

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md bg-white rounded-[2.5rem] shadow-[0_20px_50px_rgba(0,0,0,0.08)] border border-gray-100 p-8 sm:p-12 flex flex-col items-center">
        {/* Official Logo */}
        <div className="mb-8 flex justify-center">
          <img 
            src="/images/lmis-logo.png" 
            alt="LMIS Logo" 
            className="h-16 w-auto object-contain"
          />
        </div>

        {/* Title & Subtitle */}
        <div className="text-center mb-10 space-y-2">
          <h2 className="text-3xl font-black text-gray-900 tracking-tight uppercase">
            See Your Agreement
          </h2>
          <p className="text-gray-500 font-medium text-sm">
            Enter your credentials to access your official work agreement profile.
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 w-full p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm flex items-center gap-3 animate-shake">
            <Lock className="w-5 h-5 flex-shrink-0" />
            <span className="font-bold">{error}</span>
          </div>
        )}

        {/* Form */}
        <form className="w-full space-y-6" onSubmit={handleSubmit}>
          {/* Phone Number Field */}
          <div className="space-y-2">
            <label htmlFor="email" className="block text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
              Phone Number
            </label>
            <div className="relative group">
              <div className="absolute left-4 top-1/2 transform -translate-y-1/2 flex items-center pr-3 border-r border-gray-200">
                <span className="text-gray-900 font-black text-sm">+251</span>
              </div>
              <input
                type="text"
                id="email"
                value={email}
                onChange={(e) => {
                  const val = e.target.value
                  if (/^\d*$/.test(val)) {
                    if (val.length <= 9) setEmail(val)
                  } else {
                    setEmail(val)
                  }
                }}
                placeholder="912345678"
                className="w-full pl-20 pr-4 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:bg-white focus:border-blue-500 text-gray-900 font-bold transition-all duration-300 outline-none"
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <label htmlFor="password" className="block text-xs font-black text-gray-400 uppercase tracking-widest ml-1">
              Secret Password
            </label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-12 pr-12 py-4 rounded-2xl bg-gray-50 border-2 border-transparent focus:bg-white focus:border-blue-500 text-gray-900 font-bold transition-all duration-300 outline-none"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-blue-600 transition-colors"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-lg flex items-center justify-center gap-3 shadow-xl shadow-blue-100 hover:shadow-blue-200 transform transition-all active:scale-95 disabled:opacity-50 disabled:transform-none"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Shield className="w-5 h-5 animate-spin" /> Verifying...
              </span>
            ) : (
              <>
                <span>Secure Login</span>
                <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        {/* Footer Links */}
        <div className="mt-10 pt-8 border-t border-gray-50 w-full text-center space-y-4">
          <p className="text-sm text-gray-500 font-medium">
            Don’t have an account?{" "}
            <Link to="/register" className="text-blue-600 hover:text-blue-700 font-black underline underline-offset-4">
              Agreement
            </Link>
          </p>
          
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-gray-600 text-xs font-bold uppercase tracking-widest transition-all"
          >
            ← Back to Home
          </Link>
        </div>

        {/* Legal Copyright */}
        <p className="mt-8 text-[10px] text-gray-300 font-black uppercase tracking-[0.2em]">
          Official LMIS &copy; {new Date().getFullYear()}
        </p>
      </div>
    </div>
  )
}
