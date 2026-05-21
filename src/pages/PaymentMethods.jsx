"use client"

import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { collection, getDocs, orderBy, query } from "firebase/firestore"
import { db } from "../config/firebase"
import {
    ChevronLeft,
    CreditCard,
    Building2,
    ArrowRight,
    ShieldCheck,
    CheckCircle2,
    Info
} from "lucide-react"

export default function PaymentMethods() {
    const [accounts, setAccounts] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedId, setSelectedId] = useState(null)
    const navigate = useNavigate()
    const location = useLocation()

    useEffect(() => {
        const fetchAccounts = async () => {
            try {
                const q = query(collection(db, "account"), orderBy("createdAt", "desc"))
                const snapshot = await getDocs(q)
                const accountsData = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                }))
                setAccounts(accountsData)
                if (accountsData.length > 0) {
                    setSelectedId(accountsData[0].id)
                }
            } catch (error) {
                console.error("Error fetching payment accounts:", error)
            } finally {
                setLoading(false)
            }
        }

        fetchAccounts()
    }, [])

    const handleProceed = () => {
        const selected = accounts.find(a => a.id === selectedId)
        if (selected) {
            // Navigate to final registration or confirmation step
            navigate("/register")
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center">
            {/* Mobile-Style Header */}
            <div className="w-full max-w-md bg-white sticky top-0 z-50 px-6 py-4 flex items-center justify-between border-b border-gray-100 shadow-sm">
                <button
                    onClick={() => navigate("/registration-payment")}
                    className="p-2 hover:bg-gray-50 rounded-full transition-colors"
                >
                    <ChevronLeft className="w-6 h-6 text-gray-900" />
                </button>
                <h2 className="text-xl font-bold text-gray-900">Choose payment</h2>
                <div className="w-10" /> {/* Spacer */}
            </div>

            <div className="w-full max-w-md px-6 py-8 pb-32">
                {/* Progress Stepper */}
                <div className="flex items-center justify-center mb-10">
                    <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center text-white text-sm font-bold shadow-lg shadow-green-100">
                            <CheckCircle2 className="w-6 h-6" />
                        </div>
                        <div className="w-10 h-1 bg-green-500" />
                        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white text-base font-black shadow-lg shadow-blue-200">2</div>
                        <div className="w-10 h-1 bg-gray-200" />
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-400 text-base font-black">3</div>
                    </div>
                </div>

                <div className="mb-8">
                    <h1 className="text-3xl font-black text-gray-900 mb-2 leading-tight">Payment <br />methods</h1>
                    <p className="text-gray-500 font-semibold">Select your preferred payment channel to continue.</p>
                </div>

                {/* Loading State */}
                {loading ? (
                    <div className="space-y-6">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-24 bg-white rounded-3xl animate-pulse border border-gray-100" />
                        ))}
                    </div>
                ) : accounts.length === 0 ? (
                    <div className="bg-white rounded-3xl p-16 text-center border-2 border-dashed border-gray-200">
                        <CreditCard className="w-16 h-16 text-gray-200 mx-auto mb-6" />
                        <p className="text-gray-400 font-black uppercase tracking-wider">No payment channels found</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {accounts.map((account) => (
                            <div
                                key={account.id}
                                onClick={() => setSelectedId(account.id)}
                                className={`relative overflow-hidden bg-white rounded-3xl transition-all duration-300 cursor-pointer border-4 ${selectedId === account.id
                                    ? "border-blue-600 shadow-xl shadow-blue-50 scale-[1.01]"
                                    : "border-transparent shadow-md shadow-gray-200/50 hover:border-gray-100"
                                    }`}
                            >
                                <div
                                    className="p-5 flex items-center justify-between"
                                    onClick={() => navigate("/payment-detail", {
                                        state: {
                                            account,
                                            phoneNumber: location.state?.phoneNumber
                                        }
                                    })}
                                >
                                    <div className="flex items-center space-x-5">
                                        <div className="w-16 h-16 bg-gray-50 rounded-2xl p-2 flex items-center justify-center border border-gray-100">
                                            {account.logo?.url ? (
                                                <img src={account.logo.url} alt={account.paymentMethod} className="w-full h-full object-contain" />
                                            ) : (
                                                <Building2 className="w-8 h-8 text-gray-300" />
                                            )}
                                        </div>
                                        <div>
                                            <h3 className="font-black text-xl text-gray-900 leading-none mb-1">{account.paymentMethod}</h3>
                                            <div className="flex items-center">
                                                <ShieldCheck className="w-3 h-3 mr-1 text-blue-600" />
                                                <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Official</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Arrow Indicator */}
                                    <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
                                        <ArrowRight className="w-5 h-5" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

        </div>
    )
}
