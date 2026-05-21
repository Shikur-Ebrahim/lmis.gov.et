"use client"

import { useState, useEffect, useRef } from "react"
import { useNavigate } from "react-router-dom"
import {
  collection,
  onSnapshot,
  query,
  where,
  addDoc,
  orderBy,
  updateDoc,
  doc,
  serverTimestamp,
  limit,
  getDocs,
} from "firebase/firestore"
import { onAuthStateChanged, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth"
import { auth, db } from "../config/firebase"
import {
  Home,
  MessageSquare,
  Bell,
  Settings,
  User,
  Calendar,
  Download,
  X,
  Eye,
  Info,
  AlertCircle,
  CheckCircle,
  Clock,
  Briefcase,
  MapPin,
  Fingerprint,
  LogOut,
  Edit3,
  Save,
  Shield,
  Ban,
  Building2,
  Globe,
  DollarSign,
  Truck,
  Coffee,
  Ticket,
  ClipboardCheck,
  Loader2,
  Mail,
  Phone
} from "lucide-react"
import { uploadToCloudinary, uploadDocument } from "../utils/cloudinary"

const flagMapping = {
  "Canada": "canada flag.png",
  "Germany": "Germany flag.jpg",
  "United Kingdom": "United Kingdom flag.jpg",
  "France": "France flag.png",
  "Netherlands": "Netherlands flag.jpg",
  "Sweden": "Sweden flag.webp",
  "Norway": "Norway flag.jpg",
  "Denmark": "Denmark flag.png",
  "Switzerland": "Switzerland flag.png",
  "Ireland": "Ireland flag.png",
  "Poland": "Poland flag.png",
  "Romania": "Romania flag.jpg",
  "Hungary": "Hungary flag.png",
  "Czech Republic": "Czech Republic flag.png",
  "Slovakia": "Slovakia flag.jpg",
  "Portugal": "Portugal flag.png",
  "United Arab Emirates (UAE)": "United Arab Emirates (UAE) flag.jpg",
  "Saudi Arabia": "Saudi Arabia flag.png",
  "Qatar": "Qatar flag.webp",
  "Kuwait": "Kuwait flag.webp",
  "Oman": "Oman flag.png"
}

const Personal = () => {
  const navigate = useNavigate()
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState(null)
  const [activeTab, setActiveTab] = useState("dashboard")
  const [notifications, setNotifications] = useState([])
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0)
  const [updateMessage, setUpdateMessage] = useState("")
  const [updateLoading, setUpdateLoading] = useState(false)
  const [currentTime, setCurrentTime] = useState(new Date())

  // Settings state
  const [isEditingName, setIsEditingName] = useState(false)
  const [editFullName, setEditFullName] = useState("")
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user)
      if (!user) {
        setLoading(false)
        navigate("/login")
      }
    })
    return () => unsubscribeAuth()
  }, [navigate])

  useEffect(() => {
    if (!currentUser) return

    const userDocRef = doc(db, "users", currentUser.uid)
    const unsubscribeUser = onSnapshot(userDocRef, (docSnapshot) => {
      if (docSnapshot.exists()) {
        const data = docSnapshot.data()
        setUserData({ id: docSnapshot.id, ...data })
        setEditFullName(data.fullName || `${data.firstName || ""} ${data.lastName || ""}`)
      }
      setLoading(false)
    })

    return () => unsubscribeUser()
  }, [currentUser])

  useEffect(() => {
    if (!userData?.email) return
    const q = query(collection(db, "notifications"), where("userEmail", "==", userData.email), orderBy("createdAt", "desc"), limit(20))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setNotifications(list)
      setUnreadNotificationsCount(list.filter(n => !n.isRead).length)
    })
    return () => unsubscribe()
  }, [userData?.email])

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  const handleSaveName = async () => {
    if (!editFullName.trim()) return
    setUpdateLoading(true)
    try {
      await updateDoc(doc(db, "users", userData.id), { fullName: editFullName.trim() })
      setIsEditingName(false)
      setUpdateMessage("Name updated successfully!")
    } catch (error) {
      setUpdateMessage("Error updating name.")
    } finally {
      setUpdateLoading(false)
      setTimeout(() => setUpdateMessage(""), 3000)
    }
  }

  const handleLogout = async () => {
    await auth.signOut()
    navigate("/")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-blue-600 flex items-center justify-center">
        <Loader2 className="w-12 h-12 text-white animate-spin" />
      </div>
    )
  }

  if (!userData) return null

  const displayName = userData.fullName || `${userData.firstName || ""} ${userData.lastName || ""}`

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* Header */}
      <header className="bg-white border-b sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg overflow-hidden">
              {userData.profilePhoto ? <img src={userData.profilePhoto} className="w-full h-full object-cover" /> : <User />}
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 leading-tight">{displayName}</h1>
              <p className="text-xs text-gray-500 font-mono">{userData.applicationNumber}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
             <div className="hidden md:block text-right mr-4">
                <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">Local Time</p>
                <p className="text-sm font-bold text-blue-600">{currentTime.toLocaleTimeString()}</p>
             </div>
             <button onClick={() => setActiveTab("notifications")} className="p-2.5 rounded-xl bg-gray-50 text-gray-600 relative hover:bg-blue-50 hover:text-blue-600 transition-all">
                <Bell size={20} />
                {unreadNotificationsCount > 0 && <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>}
             </button>
             <button onClick={handleLogout} className="p-2.5 rounded-xl bg-red-50 text-red-600 hover:bg-red-600 hover:text-white transition-all">
                <LogOut size={20} />
             </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Navigation Tabs */}
        <div className="flex gap-2 sm:gap-4 mb-8 overflow-x-auto pb-2 scrollbar-hide">
          {[
            { id: "dashboard", label: "Dashboard", icon: Home },
            { id: "profile", label: "My Profile", icon: User },
            { id: "notifications", label: "Inbox", icon: Bell, count: unreadNotificationsCount },
            { id: "settings", label: "Security", icon: Shield }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold text-sm whitespace-nowrap transition-all ${activeTab === tab.id ? "bg-blue-600 text-white shadow-lg shadow-blue-200" : "bg-white text-gray-500 hover:bg-gray-100 border border-transparent hover:border-gray-200"}`}
            >
              <tab.icon size={18} /> {tab.label}
              {tab.count > 0 && <span className="bg-red-500 text-white text-[10px] px-1.5 py-0.5 rounded-lg">{tab.count}</span>}
            </button>
          ))}
        </div>

        {activeTab === "dashboard" && (
          <div className="space-y-8 animate-in fade-in duration-500">
            
            {/* Status Card */}
            <div className="bg-gradient-to-br from-blue-700 to-indigo-900 rounded-[2.5rem] p-8 sm:p-12 text-white relative overflow-hidden shadow-2xl">
              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-widest mb-6">
                  <Activity size={14} /> Application Status
                </div>
                <h2 className="text-4xl sm:text-5xl font-black mb-4">
                  {userData.status || "Pending Review"}
                </h2>
                <p className="text-blue-100 max-w-lg text-lg leading-relaxed">
                  Your application for <span className="text-white font-bold">{userData.jobTitle || userData.jobCategory}</span> is currently in the <span className="text-white font-bold">{userData.status || "initial"}</span> stage. We will notify you of any updates.
                </p>
                
                <div className="mt-10 grid grid-cols-2 sm:grid-cols-4 gap-4">
                   <div className="bg-white/10 p-4 rounded-3xl backdrop-blur-sm border border-white/10">
                      <p className="text-[10px] uppercase font-bold text-blue-200 tracking-widest mb-1">Contract</p>
                      <p className="font-bold">{userData.contractType || "N/A"}</p>
                   </div>
                   <div className="bg-white/10 p-4 rounded-3xl backdrop-blur-sm border border-white/10">
                      <p className="text-[10px] uppercase font-bold text-blue-200 tracking-widest mb-1">Salary</p>
                      <p className="font-bold">{userData.monthlySalary || "N/A"}</p>
                   </div>
                   <div className="bg-white/10 p-4 rounded-3xl backdrop-blur-sm border border-white/10">
                      <p className="text-[10px] uppercase font-bold text-blue-200 tracking-widest mb-1">Visa</p>
                      <p className="font-bold">{userData.visaProvidedByCompany || "N/A"}</p>
                   </div>
                   <div className="bg-white/10 p-4 rounded-3xl backdrop-blur-sm border border-white/10">
                      <p className="text-[10px] uppercase font-bold text-blue-200 tracking-widest mb-1">Permit</p>
                      <p className="font-bold">{userData.workPermit || "N/A"}</p>
                   </div>
                </div>
              </div>
              <div className="absolute top-0 right-0 w-96 h-96 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl animate-pulse"></div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Job Preferences */}
              <div className="lg:col-span-2 bg-white rounded-[2rem] p-8 border shadow-sm">
                <div className="flex items-center gap-3 mb-8 border-b pb-4">
                  <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><Globe size={24} /></div>
                  <h3 className="text-xl font-bold text-gray-900">Country Preferences</h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {(userData.selectedCountries || []).map(country => (
                    <div key={country} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 flex flex-col gap-2 hover:bg-blue-50 hover:border-blue-100 transition-all group">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-7 rounded overflow-hidden border shadow-sm bg-white flex-shrink-0">
                           <img src={`/images/${flagMapping[country]}`} alt="" className="w-full h-full object-cover" />
                        </div>
                        <span className="text-sm font-bold text-gray-700">{country}</span>
                      </div>
                      {userData.selectedCities?.[country] && (
                        <div className="flex items-center gap-2 pl-1">
                          <MapPin size={12} className="text-blue-400" />
                          <span className="text-xs font-bold text-blue-600">{userData.selectedCities[country]}</span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Benefits Summary */}
              <div className="bg-white rounded-[2rem] p-8 border shadow-sm space-y-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-green-50 text-green-600 rounded-2xl"><DollarSign size={24} /></div>
                  <h3 className="text-xl font-bold text-gray-900">Employment Benefits</h3>
                </div>
                <div className="space-y-4">
                  {[
                    { label: "Accommodation / House for living", value: userData.accommodation, icon: Building2 },
                    { label: "Transport", value: userData.transport, icon: Truck },
                    { label: "Food", value: userData.food, icon: Coffee },
                    { label: "Flight Ticket", value: userData.flightTicket, icon: Ticket }
                  ].map(benefit => (
                    <div key={benefit.label} className="flex justify-between items-center p-4 bg-gray-50 rounded-2xl">
                      <div className="flex items-center gap-3 text-gray-600">
                        <benefit.icon size={18} />
                        <span className="text-sm font-bold">{benefit.label}</span>
                      </div>
                      <span className={`px-3 py-1 rounded-lg text-xs font-black uppercase ${benefit.value === "Yes" || benefit.value === "Company" ? "bg-green-100 text-green-700" : "bg-gray-200 text-gray-500"}`}>
                        {benefit.value || "N/A"}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "profile" && (
          <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-8 duration-500">
             <div className="bg-white rounded-[2.5rem] overflow-hidden border shadow-sm">
                <div className="h-40 bg-gradient-to-r from-blue-600 to-indigo-700"></div>
                <div className="px-8 pb-8 relative">
                   <div className="absolute -top-16 left-8">
                      <div className="w-32 h-32 rounded-[2.5rem] bg-white p-1 shadow-2xl">
                         <div className="w-full h-full rounded-[2.2rem] bg-blue-50 flex items-center justify-center overflow-hidden border-2 border-blue-100">
                            {userData.profilePhoto ? <img src={userData.profilePhoto} className="w-full h-full object-cover" /> : <User size={48} className="text-blue-300" />}
                         </div>
                      </div>
                   </div>
                   <div className="pt-20 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                         <h2 className="text-3xl font-black text-gray-900">{displayName}</h2>
                         <p className="text-blue-600 font-bold tracking-widest text-xs uppercase mt-1">{userData.jobTitle}</p>
                      </div>
                      <button onClick={() => setActiveTab("settings")} className="px-6 py-2 bg-gray-100 hover:bg-gray-200 rounded-xl font-bold text-sm text-gray-600 transition-all">Edit Profile</button>
                   </div>

                   <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-12">
                      <div className="space-y-6">
                         <h3 className="font-bold text-gray-900 border-b pb-2 flex items-center gap-2"><User size={18} className="text-blue-500"/> Personal Details</h3>
                         <div className="space-y-4">
                            <div><p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">Full Name</p><p className="font-bold text-gray-700">{displayName}</p></div>
                            <div><p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">Phone Number</p><p className="font-bold text-gray-700">{userData.phoneNumber}</p></div>
                            <div><p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">Location</p><p className="font-bold text-gray-700">{userData.city}, {userData.region}</p></div>
                         </div>
                      </div>
                      <div className="space-y-6">
                         <h3 className="font-bold text-gray-900 border-b pb-2 flex items-center gap-2"><Globe size={18} className="text-indigo-500"/> Documentation</h3>
                         <div className="space-y-4">
                            <div><p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">Passport Status</p><p className="font-bold text-gray-700">{userData.hasPassport === "Yes" ? `Yes (${userData.passportNumber})` : "No Passport"}</p></div>
                            <div><p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">Submission Code</p><p className="font-mono font-bold text-indigo-600 tracking-wider bg-indigo-50 px-3 py-1 rounded-lg inline-block mt-1">{userData.submissionCode}</p></div>
                            <div>
                               <p className="text-[10px] uppercase font-bold text-gray-400 tracking-widest mb-2">Signatures</p>
                               <div className="p-4 border border-gray-100 rounded-2xl bg-white shadow-sm flex flex-col items-center">
                                  {userData.signatureData ? (
                                     <img src={userData.signatureData} alt="Signature" className="max-h-20 object-contain" />
                                  ) : (
                                     <p className="font-serif italic text-xl text-blue-900">{userData.signatureText || "Digitally Signed"}</p>
                                  )}
                                  <p className="text-[10px] text-gray-400 mt-2 italic">Finger Signature verification</p>
                               </div>
                            </div>
                         </div>
                      </div>
                   </div>
                </div>
             </div>
          </div>
        )}

        {activeTab === "notifications" && (
           <div className="max-w-4xl mx-auto space-y-4 animate-in fade-in duration-500">
              <div className="flex justify-between items-center mb-6">
                 <h2 className="text-2xl font-black text-gray-900">Message Center</h2>
                 <span className="px-4 py-1 bg-blue-100 text-blue-700 rounded-full font-bold text-xs">{notifications.length} Messages</span>
              </div>
              {notifications.length === 0 ? (
                 <div className="bg-white p-20 rounded-[2.5rem] border shadow-sm text-center">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6 text-gray-300"><Bell size={40} /></div>
                    <h3 className="text-xl font-bold text-gray-900">All caught up!</h3>
                    <p className="text-gray-500 mt-2">You don't have any new notifications at the moment.</p>
                 </div>
              ) : (
                 notifications.map(n => (
                    <div key={n.id} className={`bg-white p-6 rounded-[2rem] border shadow-sm transition-all hover:shadow-md flex gap-6 ${!n.isRead ? "border-blue-500 shadow-blue-50" : "border-gray-100"}`}>
                       <div className={`p-4 rounded-2xl flex-shrink-0 ${!n.isRead ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-400"}`}><Bell size={24} /></div>
                       <div className="flex-1">
                          <div className="flex justify-between items-start mb-2">
                             <h4 className="font-bold text-gray-900 text-lg">{n.title || "Admin Update"}</h4>
                             <span className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{new Date(n.createdAt?.toDate?.() || n.createdAt).toLocaleDateString()}</span>
                          </div>
                          <p className="text-gray-600 leading-relaxed">{n.message}</p>
                       </div>
                    </div>
                 ))
              )}
           </div>
        )}

        {activeTab === "settings" && (
           <div className="max-w-2xl mx-auto space-y-8 animate-in fade-in duration-500">
              <div className="bg-white p-8 sm:p-12 rounded-[2.5rem] border shadow-sm space-y-8">
                 <div>
                    <h3 className="text-2xl font-black text-gray-900 mb-6">Security & Preferences</h3>
                    
                    <div className="space-y-6">
                       <div className="space-y-2">
                          <label className="text-sm font-bold text-gray-700">Display Name</label>
                          <div className="flex gap-4">
                             <input
                                type="text"
                                value={editFullName}
                                onChange={(e) => setEditFullName(e.target.value)}
                                className="flex-1 px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 transition-all font-bold text-gray-700"
                                placeholder="Full Name"
                             />
                             <button onClick={handleSaveName} disabled={updateLoading} className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all flex items-center justify-center min-w-[100px]">
                                {updateLoading ? <Loader2 className="animate-spin" /> : "Save"}
                             </button>
                          </div>
                       </div>

                       <div className="pt-6 border-t space-y-4">
                          <p className="text-sm font-bold text-gray-700">Account Protection</p>
                          <button onClick={() => setIsChangingPassword(!isChangingPassword)} className="w-full p-4 bg-gray-50 hover:bg-blue-50 text-gray-600 hover:text-blue-600 rounded-2xl font-bold text-left transition-all border border-transparent hover:border-blue-100 flex justify-between items-center group">
                             Change Password <Edit3 size={18} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                          </button>
                          
                          {isChangingPassword && (
                             <div className="space-y-4 p-6 bg-gray-50 rounded-2xl animate-in slide-in-from-top-4 duration-300">
                                <input type="password" placeholder="Current Password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200" />
                                <input type="password" placeholder="New Password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200" />
                                <input type="password" placeholder="Confirm New Password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200" />
                                <button className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold">Update Password</button>
                             </div>
                          )}
                       </div>
                    </div>
                 </div>

                 {updateMessage && (
                    <div className={`p-4 rounded-xl font-bold text-sm text-center ${updateMessage.includes("success") ? "bg-green-50 text-green-700 border border-green-100" : "bg-red-50 text-red-700 border border-red-100"}`}>
                       {updateMessage}
                    </div>
                 )}
              </div>
           </div>
        )}

      </main>
    </div>
  )
}

export default Personal
