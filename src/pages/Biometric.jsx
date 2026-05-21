"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  doc,
  onSnapshot,
  Timestamp,
} from "firebase/firestore"
import { onAuthStateChanged } from "firebase/auth"
import { auth, db } from "../config/firebase"
import {
  Fingerprint,
  Home,
  MessageSquare,
  Bell,
  Settings,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Shield,
  Upload,
  Download,
  Eye,
  RefreshCw,
  Lock,
  Unlock,
} from "lucide-react"

const Biometric = () => {
  const navigate = useNavigate()
  const [currentUser, setCurrentUser] = useState(null)
  const [userData, setUserData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("biometric")
  const [biometricStatus, setBiometricStatus] = useState("not_enrolled")
  const [enrollmentProgress, setEnrollmentProgress] = useState(0)
  const [isEnrolling, setIsEnrolling] = useState(false)
  const [showInstructions, setShowInstructions] = useState(false)
  const [enrollmentMessage, setEnrollmentMessage] = useState({ message: "", type: "" }) // Message state for enrollment feedback

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user)
      if (!user) {
        navigate("/")
      }
    })

    return () => unsubscribeAuth()
  }, [navigate])

  useEffect(() => {
    if (!currentUser?.email) return

    const userQuery = query(collection(db, "users"), where("email", "==", currentUser.email))

    const unsubscribeUser = onSnapshot(
      userQuery,
      (querySnapshot) => {
        if (!querySnapshot.empty) {
          const userDoc = querySnapshot.docs[0]
          const data = { id: userDoc.id, ...userDoc.data() }
          setUserData(data)
          setBiometricStatus(data.biometricStatus || "not_enrolled")
        }
        setLoading(false)
      },
      (error) => {
        console.error("Error fetching user data:", error)
        setLoading(false)
      },
    )

    return () => unsubscribeUser()
  }, [currentUser])

  const simulateFingerprintEnrollment = async () => {
    setIsEnrolling(true)
    setEnrollmentProgress(0)

    // Simulate enrollment process
    for (let i = 0; i <= 100; i += 10) {
      await new Promise((resolve) => setTimeout(resolve, 300))
      setEnrollmentProgress(i)
    }

    try {
      // Update user status to pending
      if (userData?.id) {
        await updateDoc(doc(db, "users", userData.id), {
          biometricStatus: "pending",
          biometricEnrollmentRequestedAt: Timestamp.now(),
          biometricEnrollmentProgress: 100,
        })

        // Create biometric record
        await addDoc(collection(db, "biometrics"), {
          userId: userData.id,
          userEmail: userData.email,
          status: "pending",
          enrollmentDate: Timestamp.now(),
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now(),
        })

        setBiometricStatus("pending")
        setEnrollmentMessage({
          message: "Fingerprint enrollment request submitted! Waiting for admin approval.",
          type: "success",
        })
        // Clear message after 5 seconds
        setTimeout(() => {
          setEnrollmentMessage({ message: "", type: "" })
        }, 5000)
      }
    } catch (error) {
      console.error("Error submitting enrollment:", error)
      setEnrollmentMessage({
        message: "Error submitting enrollment request. Please try again.",
        type: "error",
      })
      // Clear message after 5 seconds
      setTimeout(() => {
        setEnrollmentMessage({ message: "", type: "" })
      }, 5000)
    } finally {
      setIsEnrolling(false)
      setEnrollmentProgress(0)
    }
  }

  const getStatusInfo = (status) => {
    const statuses = {
      enrolled: {
        color: "text-green-600",
        bgColor: "bg-green-50",
        borderColor: "border-green-200",
        icon: CheckCircle,
        title: "Fingerprint Enrolled",
        description: "Your fingerprint has been successfully enrolled and is active.",
        action: null,
      },
      pending: {
        color: "text-yellow-600",
        bgColor: "bg-yellow-50",
        borderColor: "border-yellow-200",
        icon: Clock,
        title: "Enrollment Pending",
        description: "Your fingerprint enrollment is pending admin approval.",
        action: null,
      },
      blocked: {
        color: "text-red-600",
        bgColor: "bg-red-50",
        borderColor: "border-red-200",
        icon: XCircle,
        title: "Access Blocked",
        description: "Your fingerprint access has been blocked. Please contact admin.",
        action: null,
      },
      not_enrolled: {
        color: "text-gray-600",
        bgColor: "bg-gray-50",
        borderColor: "border-gray-200",
        icon: Fingerprint,
        title: "Not Enrolled",
        description: "You haven't enrolled your fingerprint yet. Click below to start enrollment.",
        action: "enroll",
      },
    }

    return statuses[status] || statuses.not_enrolled
  }

  const statusInfo = getStatusInfo(biometricStatus)
  const StatusIcon = statusInfo.icon

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Navigation */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="-mb-px flex space-x-4 sm:space-x-8 overflow-x-auto">
            {[
              { id: "dashboard", label: "Dashboard", icon: Home, path: "/personal" },
              { id: "documents", label: "Documents", icon: MessageSquare, path: "/personal" },
              { id: "notifications", label: "Notifications", icon: Bell, path: "/personal" },
              { id: "biometric", label: "Biometric", icon: Fingerprint, path: "/biometric" },
              { id: "settings", label: "Settings", icon: Settings, path: "/personal" },
            ].map((tab) => {
              const Icon = tab.icon
              const isActive = tab.id === activeTab
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    if (tab.path === "/personal") {
                      navigate("/personal", { state: { activeTab: tab.id } })
                    } else {
                      navigate(tab.path)
                    }
                  }}
                  className={`${isActive
                    ? "border-blue-500 text-blue-600 bg-blue-50"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                    } whitespace-nowrap py-4 px-4 border-b-2 font-medium text-sm flex items-center space-x-2 transition-all duration-300`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-6 border border-gray-100">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent flex items-center">
                <Fingerprint className="w-8 h-8 mr-3 text-blue-600" />
                Biometric Enrollment
              </h1>
              <p className="text-gray-600 mt-2">Manage your fingerprint authentication</p>
            </div>
          </div>
        </div>

        {/* Status Card */}
        <div
          className={`bg-white rounded-2xl shadow-xl p-8 mb-6 border-2 ${statusInfo.borderColor}`}
        >
          <div className="flex items-start space-x-4">
            <div
              className={`p-4 rounded-full ${statusInfo.bgColor} ${statusInfo.color} flex-shrink-0`}
            >
              <StatusIcon className="w-8 h-8" />
            </div>
            <div className="flex-1">
              <h2 className={`text-2xl font-bold mb-2 ${statusInfo.color}`}>{statusInfo.title}</h2>
              <p className="text-gray-600 mb-4">{statusInfo.description}</p>

              {biometricStatus === "not_enrolled" && (
                <div className="space-y-4">
                  <button
                    onClick={() => setShowInstructions(!showInstructions)}
                    className="text-blue-600 hover:text-blue-800 flex items-center space-x-2 text-sm font-medium"
                  >
                    <Eye className="w-4 h-4" />
                    <span>{showInstructions ? "Hide" : "Show"} Instructions</span>
                  </button>

                  {showInstructions && (
                    <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
                      <h3 className="font-semibold text-blue-900 mb-2">Enrollment Instructions:</h3>
                      <ol className="list-decimal list-inside space-y-2 text-sm text-blue-800">
                        <li>Make sure your device supports fingerprint scanning</li>
                        <li>Place your finger on the scanner when prompted</li>
                        <li>Hold your finger steady until the scan is complete</li>
                        <li>You may need to scan your finger multiple times</li>
                        <li>Wait for admin approval after enrollment</li>
                      </ol>
                    </div>
                  )}

                  <button
                    onClick={simulateFingerprintEnrollment}
                    disabled={isEnrolling}
                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium text-lg transition-all transform hover:scale-105 shadow-lg flex items-center justify-center space-x-2"
                  >
                    {isEnrolling ? (
                      <>
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        <span>Enrolling...</span>
                      </>
                    ) : (
                      <>
                        <Fingerprint className="w-5 h-5" />
                        <span>Start Fingerprint Enrollment</span>
                      </>
                    )}
                  </button>

                  {isEnrolling && (
                    <div className="mt-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-600">Enrollment Progress</span>
                        <span className="text-sm font-medium text-gray-900">{enrollmentProgress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className="bg-gradient-to-r from-blue-600 to-purple-600 h-3 rounded-full transition-all duration-300"
                          style={{ width: `${enrollmentProgress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {/* Enrollment Message Display */}
                  {enrollmentMessage.message && (
                    <div className={`mt-4 p-3 rounded-lg text-sm ${enrollmentMessage.type === "success"
                      ? "bg-green-50 text-green-700 border border-green-200"
                      : "bg-red-50 text-red-700 border border-red-200"
                      }`}>
                      <div className="flex items-center space-x-2">
                        {enrollmentMessage.type === "success" ? (
                          <CheckCircle className="w-4 h-4" />
                        ) : (
                          <XCircle className="w-4 h-4" />
                        )}
                        <span>{enrollmentMessage.message}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {biometricStatus === "pending" && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <div className="flex items-start space-x-2">
                    <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5" />
                    <div>
                      <p className="text-sm text-yellow-800">
                        Your enrollment request is being reviewed by an administrator. You will be notified
                        once it's approved.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {biometricStatus === "enrolled" && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
                    <div>
                      <p className="text-sm text-green-800">
                        Your fingerprint is enrolled and active. You can use it for authentication.
                      </p>
                      {userData?.biometricEnrolledAt && (
                        <p className="text-xs text-green-700 mt-2">
                          Enrolled on: {new Date(userData.biometricEnrolledAt.toDate ? userData.biometricEnrolledAt.toDate() : userData.biometricEnrolledAt).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {biometricStatus === "blocked" && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-start space-x-2">
                    <XCircle className="w-5 h-5 text-red-600 mt-0.5" />
                    <div>
                      <p className="text-sm text-red-800">
                        Your fingerprint access has been blocked. Please contact the administrator for
                        assistance.
                      </p>
                      {userData?.biometricStatusReason && (
                        <p className="text-xs text-red-700 mt-2">
                          Reason: {userData.biometricStatusReason}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Information Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
            <div className="flex items-center space-x-3 mb-4">
              <Shield className="w-6 h-6 text-blue-600" />
              <h3 className="text-lg font-semibold text-gray-900">Security Benefits</h3>
            </div>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Enhanced security with biometric authentication</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Quick and convenient access</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Unique identification</span>
              </li>
              <li className="flex items-start space-x-2">
                <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                <span>Reduced risk of unauthorized access</span>
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
            <div className="flex items-center space-x-3 mb-4">
              <AlertCircle className="w-6 h-6 text-yellow-600" />
              <h3 className="text-lg font-semibold text-gray-900">Important Notes</h3>
            </div>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                <span>Enrollment requires admin approval</span>
              </li>
              <li className="flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                <span>Keep your fingerprint scanner clean</span>
              </li>
              <li className="flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                <span>Contact admin if you have issues</span>
              </li>
              <li className="flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                <span>One fingerprint per user account</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Biometric

