"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Phone, ArrowRight, ShieldCheck, CreditCard, ChevronLeft, Copy, Check, Eye, EyeOff } from "lucide-react"

import { db, auth } from "../config/firebase"
import { collection, query, where, getDocs } from "firebase/firestore"
import { signInWithEmailAndPassword } from "firebase/auth"
import { useToast } from "../contexts/ToastContext"

export default function RegistrationPayment() {
    const [phoneNumber, setPhoneNumber] = useState("")
    const [error, setError] = useState("")
    const [loading, setLoading] = useState(false)
    const [verifiedUser, setVerifiedUser] = useState(null)
    const [copySuccess, setCopySuccess] = useState(false)
    const [showUid, setShowUid] = useState(false)
    const [registrationFee, setRegistrationFee] = useState(null)
    const navigate = useNavigate()
    const { showToast } = useToast()

    const handlePhoneChange = (e) => {
        const value = e.target.value.replace(/\D/g, "")
        // Limit to 9 digits after the prefix
        if (value.length <= 9) {
            setPhoneNumber(value)
            setError("")
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (phoneNumber.length !== 9) {
            setError("Please enter a valid 9-digit phone number.")
            return
        }

        const fullPhone = "+251" + phoneNumber
        setLoading(true)
        setError("")
        setVerifiedUser(null)

        try {
            // Check if phone number already exists in 'users' collection
            const userQuery = query(collection(db, "users"), where("phoneNumber", "==", fullPhone))
            const userSnapshot = await getDocs(userQuery)

            if (!userSnapshot.empty) {
                showToast(`This phone number ${fullPhone} registered before`, "success")
                setLoading(false)
                return
            }

            // 1. Try to sign in (check if already approved)
            // Email: 251911223344@lmis.gov.et (no +)
            // Password: +251911223344 (with +)
            const email = `251${phoneNumber}@lmis.gov.et`
            const password = fullPhone

            try {
                const userCredential = await signInWithEmailAndPassword(auth, email, password)
                // If successful, user is verified!
                setVerifiedUser(userCredential.user)
                setLoading(false)
                return
            } catch (authError) {
                // Not verified or wrong credentials, proceed to check pending
                // console.log("Not verified yet", authError)
            }

            // 2. Check if there's already a pending payment for this number
            const q = query(
                collection(db, "registration-fees"),
                where("phoneNumber", "==", fullPhone),
                where("status", "==", "pending")
            )
            const querySnapshot = await getDocs(q)

            if (!querySnapshot.empty) {
                // If pending exists, navigate to pending page
                navigate("/payment-pending", { state: { phoneNumber: fullPhone } })
            } else {
                // Otherwise proceed to payment methods
                navigate("/payment-methods", { state: { phoneNumber: fullPhone } })
            }
        } catch (err) {
            console.error("Error checking payment status:", err)
            setError("")
            showToast("Something went wrong. Please try again.", "error")
        } finally {
            if (!verifiedUser) setLoading(false)
        }
    }

    const copyToClipboard = () => {
        if (verifiedUser?.uid) {
            navigator.clipboard.writeText(verifiedUser.uid)
            setCopySuccess(true)
            showToast("Code copied to clipboard!", "success")
            setTimeout(() => setCopySuccess(false), 2000)
        }
    }

    // Fetch registration fee from account collection
    useEffect(() => {
        const fetchRegistrationFee = async () => {
            try {
                const accountsRef = collection(db, "account")
                const accountsSnapshot = await getDocs(accountsRef)

                if (!accountsSnapshot.empty) {
                    // Get the first account's registration fee
                    const firstAccount = accountsSnapshot.docs[0].data()
                    setRegistrationFee(firstAccount.registrationFee || null)
                }
            } catch (error) {
                console.error("Error fetching registration fee:", error)
            }
        }

        fetchRegistrationFee()
    }, [])

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            {/* Back Button */}
            <button
                onClick={() => navigate("/")}
                className="absolute top-8 left-8 flex items-center text-gray-600 hover:text-blue-600 transition-colors font-medium"
            >
                <ChevronLeft className="w-5 h-5 mr-1" />
                Back to Home
            </button>

            <div className="w-full max-w-md">
                {/* Header Section */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
                        <CreditCard className="w-8 h-8 text-blue-600" />
                    </div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Agreement Submission Fee</h1>
                    {registrationFee && (
                        <p className="text-2xl font-bold text-blue-600 mb-2">{registrationFee.toLocaleString()} Birr</p>
                    )}
                    <p className="text-gray-600">Enter your phone number to initiate the payment process.</p>
                </div>

                {/* Payment Card */}
                <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                                Phone number
                            </label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none">
                                    <span className="text-gray-500 font-bold border-r border-gray-200 pr-3">+251</span>
                                </div>
                                <input
                                    type="text"
                                    id="phone"
                                    value={phoneNumber}
                                    onChange={handlePhoneChange}
                                    className={`w-full pl-20 pr-4 py-4 rounded-xl border-2 transition-all duration-300 text-lg font-medium outline-none ${error ? "border-red-300 focus:border-red-500 bg-red-50" : "border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-50"
                                        }`}
                                />
                            </div>
                            {error && (
                                <p className="mt-2 text-sm text-red-600 flex items-center animate-shake">
                                    <ShieldCheck className="w-4 h-4 mr-1" />
                                    {error}
                                </p>
                            )}
                            <div className="mt-3 flex items-center space-x-3 text-[11px] font-bold text-gray-400 tracking-wider bg-gray-50/50 p-2 rounded-xl border border-gray-100/50">
                                <div className="flex items-center">
                                    <span className="w-2 h-2 bg-blue-500 rounded-full mr-1.5"></span>
                                    <span>Ethio: Starts with 9</span>
                                </div>
                                <div className="w-px h-3 bg-gray-200"></div>
                                <div className="flex items-center">
                                    <span className="w-2 h-2 bg-green-500 rounded-full mr-1.5"></span>
                                    <span>Safaricom: Starts with 7</span>
                                </div>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading || phoneNumber.length !== 9}
                            className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-bold rounded-xl shadow-lg hover:shadow-blue-200 hover:from-blue-700 hover:to-blue-800 transition-all duration-300 transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center space-x-2"
                        >
                            {loading ? (
                                <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                            ) : (
                                <>
                                    <span>Proceed to Payment</span>
                                    <ArrowRight className="w-5 h-5" />
                                </>
                            )}
                        </button>
                    </form>

                </div>

            </div>

            {/* Verified User Modal/Overlay */}
            {verifiedUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full relative border border-green-100 transform scale-100 transition-all">
                        <button
                            onClick={() => setVerifiedUser(null)}
                            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <ChevronLeft className="w-6 h-6 rotate-180" /> {/* Using ChevronLeft as X equivalent for style */}
                        </button>

                        <div className="text-center">
                            <div className="inline-flex items-center justify-center w-20 h-20 bg-green-100 text-green-600 rounded-full mb-6 shadow-inner">
                                <ShieldCheck className="w-10 h-10" />
                            </div>

                            <h2 className="text-2xl font-bold text-gray-900 mb-2">Payment Verified Successfully</h2>
                            <p className="text-gray-600 mb-8 leading-relaxed">
                                Sir/Madam, your phone number <strong className="text-green-600">+251{phoneNumber}</strong> is verified. 
                                You have already paid the <strong className="text-gray-900">Agreement Submission Fee</strong>.
                            </p>

                            <button
                                onClick={() => navigate("/register")}
                                className="w-full py-5 bg-gradient-to-r from-green-600 to-green-700 text-white font-black text-lg rounded-2xl shadow-xl shadow-green-100 hover:from-green-700 hover:to-green-800 transition-all flex items-center justify-center gap-3 group"
                            >
                                Go to Work Agreement <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
