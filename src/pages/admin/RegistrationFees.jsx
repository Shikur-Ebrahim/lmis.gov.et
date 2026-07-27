"use client"

import { useState, useEffect } from "react"
import { collection, onSnapshot, query, orderBy, doc, updateDoc, deleteDoc, setDoc } from "firebase/firestore"
import { initializeApp, deleteApp } from "firebase/app"
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth"
import { db, firebaseConfig } from "../../config/firebase"
import {
    Search,
    Eye,
    CheckCircle,
    XCircle,
    Clock,
    ExternalLink,
    Phone,
    CreditCard,
    X,
    Filter,
    AlertTriangle
} from "lucide-react"
import Sidebar from "../../components/admin/Sidebar"
import { useToast } from "../../contexts/ToastContext"

export default function RegistrationFees() {
    const { showToast } = useToast()
    const [fees, setFees] = useState([])
    const [filteredFees, setFilteredFees] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState("")
    const [statusFilter, setStatusFilter] = useState("all")
    const [selectedFee, setSelectedFee] = useState(null)
    const [showModal, setShowModal] = useState(false)
    const [confirmModal, setConfirmModal] = useState({ show: false, type: '', fee: null })

    useEffect(() => {
        const q = query(collection(db, "registration-fees"), orderBy("createdAt", "desc"))
        const unsubscribe = onSnapshot(q, (snapshot) => {
            const feesData = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }))
            
            // Sort client-side: Pending first, then Approved/Rejected, then by date
            const sortedData = [...feesData].sort((a, b) => {
                // Priority: pending > approved > rejected
                const statusOrder = { pending: 0, approved: 1, rejected: 2 };
                const orderA = statusOrder[a.status] !== undefined ? statusOrder[a.status] : 99;
                const orderB = statusOrder[b.status] !== undefined ? statusOrder[b.status] : 99;
                
                if (orderA !== orderB) return orderA - orderB;
                
                // Same status, sort by newest first
                const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
                const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
                return dateB - dateA;
            });
            
            setFees(sortedData)
            setLoading(false)
        })
        return () => unsubscribe()
    }, [])

    useEffect(() => {
        let result = fees.filter(fee => {
            const matchesSearch = fee.phoneNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                fee.accountNumber?.toLowerCase().includes(searchTerm.toLowerCase())
            const matchesStatus = statusFilter === "all" || fee.status === statusFilter
            return matchesSearch && matchesStatus
        })
        setFilteredFees(result)
    }, [searchTerm, statusFilter, fees])

    const handleUpdateStatus = (fee, newStatus) => {
        setConfirmModal({
            show: true,
            type: newStatus,
            fee: fee
        });
    }

    const executeUpdateStatus = async () => {
        const { type: newStatus, fee } = confirmModal;
        setConfirmModal({ ...confirmModal, show: false });

        if (newStatus === 'approved') {
            try {
                // Secondary app to create user without logging out admin
                const secondaryApp = initializeApp(firebaseConfig, `secondary-${Date.now()}`);
                const secondaryAuth = getAuth(secondaryApp);

                // Format phone: remove '+' if exists and use as email prefix
                const phonePrefix = fee.phoneNumber.startsWith('+') ? fee.phoneNumber.substring(1) : fee.phoneNumber;
                const email = `${phonePrefix}@lmis.gov.et`;
                const password = fee.phoneNumber; // Use phone number as default password

                const userCredential = await createUserWithEmailAndPassword(secondaryAuth, email, password);
                
                // If the fee document contains the full applicant data, register them as a user
                if (fee.applicantData) {
                    const registrationData = {
                        uid: userCredential.user.uid,
                        ...fee.applicantData,
                        email: email,
                        createdAt: new Date().toISOString(),
                        status: "Pending", // Admin will review their full application later
                        applicationNumber: `APP-${Date.now()}`,
                        isRead: false
                    };
                    
                    // Remove sensitive fields
                    delete registrationData.password;
                    delete registrationData.confirmPassword;
                    
                    await setDoc(doc(db, "users", userCredential.user.uid), registrationData);
                }

                // Update the fee document to show it's approved
                await updateDoc(doc(db, "registration-fees", fee.id), {
                    status: 'approved',
                    approvedAt: new Date(),
                    authUid: userCredential.user.uid
                });

                // Cleanup secondary app
                await deleteApp(secondaryApp);

                showToast(`User verified: ${email}`, "success");
            } catch (error) {
                console.error("Error during approval/registration:", error);
                showToast("Failed to verify user. Please try again.", "error");
            }
        } else if (newStatus === 'rejected') {
            try {
                await deleteDoc(doc(db, "registration-fees", fee.id));
                showToast("Record rejected and deleted.", "success");
            } catch (error) {
                console.error("Error deleting rejected record:", error);
                showToast("Failed to delete record.", "error");
            }
        }
    }


    const formatDate = (timestamp) => {
        if (!timestamp) return "N/A"
        const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
        return date.toLocaleDateString() + " " + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center p-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-950">
            <Sidebar />
            <div className="lg:ml-64 p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400 uppercase tracking-tight">
                            Registration Fees
                        </h1>
                        <p className="text-gray-400 text-sm font-medium mt-1">Manage and track applicant payment submissions</p>
                    </div>

                    <div className="flex items-center space-x-3 bg-gray-800/50 p-1.5 rounded-2xl border border-gray-700">
                        <div className="flex items-center space-x-2 px-3 py-1.5 bg-gray-900 rounded-xl border border-gray-700">
                            <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />
                            <span className="text-xs font-black text-gray-300 uppercase tracking-widest">
                                {fees.filter(f => f.status === 'pending').length} Pending
                            </span>
                        </div>
                    </div>
                </div>

                {/* Filters */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="relative group md:col-span-2">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Search by phone or account number..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-gray-800/50 border border-gray-700 rounded-2xl focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none transition-all font-medium"
                        />
                    </div>

                    <div className="relative">
                        <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="w-full pl-12 pr-4 py-4 bg-gray-800/50 border border-gray-700 rounded-2xl focus:ring-2 focus:ring-cyan-500/20 focus:border-cyan-500 outline-none transition-all font-bold appearance-none uppercase text-xs tracking-widest"
                        >
                            <option value="all">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                        </select>
                    </div>
                </div>

                {/* Fees Table/Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredFees.length === 0 ? (
                        <div className="md:col-span-2 lg:col-span-3 bg-gray-800/30 border-2 border-dashed border-gray-800 rounded-3xl p-12 text-center">
                            <CreditCard className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                            <p className="text-gray-500 font-bold uppercase tracking-widest text-sm">No matching payments found</p>
                        </div>
                    ) : (
                        filteredFees.map((fee) => (
                            <div key={fee.id} className="bg-gray-800/40 border border-gray-800 rounded-[2.5rem] overflow-hidden flex flex-col group hover:border-gray-700 transition-all shadow-xl">
                                {/* Photo Header (Prominent) */}
                                <div
                                    className="aspect-video w-full bg-gray-900 overflow-hidden cursor-pointer relative group-hover:bg-black transition-colors"
                                    onClick={() => { setSelectedFee(fee); setShowModal(true); }}
                                >
                                    <img src={fee.receiptUrl} alt="Payment Receipt" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                                    <div className="absolute top-4 right-4 capitalize px-3 py-1 rounded-full text-[10px] font-black tracking-widest bg-black/60 backdrop-blur-md border border-white/10 flex items-center space-x-1.5">
                                        <div className={`w-1.5 h-1.5 rounded-full ${fee.status === 'pending' ? 'bg-yellow-500 animate-pulse' :
                                            fee.status === 'approved' ? 'bg-green-500' : 'bg-red-500'
                                            }`} />
                                        <span>{fee.status}</span>
                                    </div>
                                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
                                        <Eye className="w-8 h-8 text-white drop-shadow-lg" />
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-6 flex-1 flex flex-col justify-between space-y-6">
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em]">Applicant Phone</p>
                                                <div className="flex items-center space-x-2">
                                                    <Phone className="w-4 h-4 text-cyan-400" />
                                                    <p className="text-xl font-black tracking-tight">{fee.phoneNumber}</p>
                                                </div>
                                            </div>
                                            <div className="h-10 w-10 bg-gray-900 rounded-2xl flex items-center justify-center border border-gray-700 group-hover:bg-cyan-600/10 group-hover:border-cyan-600/30 transition-all">
                                                <CreditCard className="w-5 h-5 text-gray-500 group-hover:text-cyan-400 transition-colors" />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-1">
                                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Account</p>
                                                <p className="text-sm font-bold truncate">{fee.accountNumber}</p>
                                            </div>
                                            <div className="space-y-1 text-right">
                                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Date</p>
                                                <p className="text-sm font-medium text-gray-400">{formatDate(fee.createdAt).split(' ')[0]}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="pt-6 border-t border-gray-700/50">
                                        <div className="grid grid-cols-2 gap-2">
                                            <button
                                                onClick={() => handleUpdateStatus(fee, 'approved')}
                                                disabled={fee.status === 'approved'}
                                                className="flex flex-col items-center justify-center py-3 bg-green-500/10 text-green-500 rounded-2xl hover:bg-green-600 hover:text-white transition-all disabled:hidden"
                                            >
                                                <CheckCircle className="w-5 h-5 mb-1" />
                                                <span className="text-[8px] font-black uppercase tracking-widest">Approve</span>
                                            </button>
                                            <button
                                                onClick={() => handleUpdateStatus(fee, 'rejected')}
                                                disabled={fee.status === 'rejected'}
                                                className="flex flex-col items-center justify-center py-3 bg-red-500/10 text-red-500 rounded-2xl hover:bg-red-600 hover:text-white transition-all disabled:hidden"
                                            >
                                                <XCircle className="w-5 h-5 mb-1" />
                                                <span className="text-[8px] font-black uppercase tracking-widest">Reject</span>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Screenshot Modal */}
            {showModal && selectedFee && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
                    <div className="relative w-full max-w-2xl bg-gray-900 rounded-[2.5rem] overflow-hidden shadow-2xl border border-gray-800">
                        <div className="absolute top-6 right-6 z-10">
                            <button onClick={() => setShowModal(false)} className="p-2 bg-black/50 text-white rounded-full hover:bg-white hover:text-black transition-all">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-8">
                            <h3 className="text-xl font-black text-white mb-6 uppercase tracking-tight">Payment Receipt</h3>
                            <div className="aspect-[4/5] w-full bg-gray-800 rounded-3xl overflow-hidden border border-gray-700">
                                <img src={selectedFee.receiptUrl} alt="Full Receipt" className="w-full h-full object-contain" />
                            </div>

                            <div className="mt-8 flex items-center justify-between">
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Phone Number</p>
                                    <p className="text-xl font-black text-white">{selectedFee.phoneNumber}</p>
                                </div>
                                <a
                                    href={selectedFee.receiptUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center space-x-2 px-6 py-3 bg-cyan-600 text-white rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-cyan-500 transition-all"
                                >
                                    <span>Open Original</span>
                                    <ExternalLink className="w-4 h-4" />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            {/* Custom Confirmation Modal */}
            {confirmModal.show && (
                <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className={`relative w-full max-w-md bg-gray-900 rounded-[2rem] overflow-hidden shadow-2xl border-2 animate-in zoom-in-95 duration-300 ${
                        confirmModal.type === 'rejected' ? 'border-red-500/50' : 'border-green-500/50'
                    }`}>
                        <div className="p-8 text-center">
                            <div className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center mb-6 ${
                                confirmModal.type === 'rejected' ? 'bg-red-500/20 text-red-500' : 'bg-green-500/20 text-green-500'
                            }`}>
                                {confirmModal.type === 'rejected' ? (
                                    <AlertTriangle className="w-10 h-10" />
                                ) : (
                                    <CheckCircle className="w-10 h-10" />
                                )}
                            </div>

                            <h3 className={`text-2xl font-black uppercase tracking-tight mb-2 ${
                                confirmModal.type === 'rejected' ? 'text-red-500' : 'text-green-500'
                            }`}>
                                {confirmModal.type === 'rejected' ? 'Warning: Permanent Deletion' : 'Verify Payment'}
                            </h3>
                            
                            <p className="text-gray-400 font-medium mb-8">
                                {confirmModal.type === 'rejected' 
                                    ? "Are you sure you want to reject this record? This action will permanently delete the data and cannot be undone."
                                    : `Are you sure you want to approve this payment and register user ${confirmModal.fee?.phoneNumber}?`
                                }
                            </p>

                            <div className="grid grid-cols-2 gap-4">
                                <button
                                    onClick={() => setConfirmModal({ ...confirmModal, show: false })}
                                    className="px-6 py-4 bg-gray-800 text-gray-300 rounded-2xl font-black uppercase text-xs tracking-widest hover:bg-gray-700 transition-all border border-gray-700"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={executeUpdateStatus}
                                    className={`px-6 py-4 text-white rounded-2xl font-black uppercase text-xs tracking-widest transition-all shadow-lg ${
                                        confirmModal.type === 'rejected' 
                                            ? 'bg-red-600 hover:bg-red-500 shadow-red-500/20' 
                                            : 'bg-green-600 hover:bg-green-500 shadow-green-500/20'
                                    }`}
                                >
                                    {confirmModal.type === 'rejected' ? 'Delete Permanently' : 'Approve & Register'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
            </div>
        </div>
    )
}
