"use client"

import { useNavigate, useLocation } from "react-router-dom"
import {
    Clock,
    ChevronLeft,
    ShieldCheck,
    MessageSquare,
    RefreshCw,
    Home
} from "lucide-react"

export default function PaymentPending() {
    const navigate = useNavigate()
    const location = useLocation()
    const phoneNumber = location.state?.phoneNumber

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
            <div className="w-full max-w-md space-y-6 text-center">
                {/* Icon */}
                <div className="relative inline-flex items-center justify-center">
                    <div className="w-20 h-20 bg-white rounded-3xl shadow-lg flex items-center justify-center border border-gray-100">
                        <Clock className="w-10 h-10 text-blue-600 animate-pulse" />
                    </div>
                </div>

                {/* Content */}
                <div className="space-y-4">
                    <h1 className="text-2xl font-bold text-gray-900">
                        Checking your payment
                    </h1>
                    <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100 space-y-4">
                        <p className="text-sm text-gray-600 leading-relaxed font-medium">
                            The payment for phone number {phoneNumber} is currently being checked. This usually takes about 15 to 30 minutes.
                        </p>
                        <div className="h-px bg-gray-50 w-full" />
                        <p className="text-sm font-bold text-blue-600">
                            Please do not pay again.
                        </p>
                    </div>
                </div>

                {/* Buttons */}
                <div className="space-y-3">
                    <button
                        onClick={() => window.location.reload()}
                        className="w-full py-4 bg-white border border-gray-200 hover:border-blue-500 rounded-2xl shadow-sm flex items-center justify-center space-x-2 transition-all active:scale-95"
                    >
                        <RefreshCw className="w-4 h-4 text-blue-600" />
                        <span className="font-bold text-gray-800">Check status again</span>
                    </button>

                    <div className="flex space-x-3">
                        <button
                            onClick={() => navigate("/")}
                            className="flex-1 py-4 bg-gray-900 text-white rounded-2xl shadow-lg flex items-center justify-center space-x-2 active:scale-95 transition-all text-sm font-bold"
                        >
                            <Home className="w-4 h-4" />
                            <span>Home</span>
                        </button>
                        <button
                            onClick={() => navigate("/contact")}
                            className="flex-1 py-4 bg-blue-600 text-white rounded-2xl shadow-lg flex items-center justify-center space-x-2 active:scale-95 transition-all text-sm font-bold"
                        >
                            <MessageSquare className="w-4 h-4" />
                            <span>Contact us</span>
                        </button>
                    </div>
                </div>

                <p className="text-xs text-gray-400 font-medium">
                    Official verification system
                </p>
            </div>
        </div>
    )
}
