"use client"

import { useState, useEffect } from "react"
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore"
import { db } from "../../config/firebase"
import {
  Search,
  Plus,
  Trash2,
  Upload,
  Building2,
  CreditCard,
  X,
  CheckCircle,
  AlertCircle,
  Image as ImageIcon,
  Edit,
} from "lucide-react"
import { CLOUDINARY_CONFIG } from "../../utils/cloudinary"

const uploadToCloudinary = async (file) => {
  const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`
  const formData = new FormData()
  formData.append("file", file)
  formData.append("upload_preset", CLOUDINARY_CONFIG.uploadPresets.profile)
  formData.append("folder", "lmis/account-logos")

  try {
    const response = await fetch(url, {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`)
    }

    const data = await response.json()
    return {
      url: data.secure_url,
      secure_url: data.secure_url,
      publicId: data.public_id,
      public_id: data.public_id,
      format: data.format,
      size: data.bytes,
    }
  } catch (error) {
    console.error("Image upload error:", error)
    throw new Error("Failed to upload image")
  }
}

const validateFile = (file) => {
  const maxSize = 2 * 1024 * 1024 // 2MB
  const allowedTypes = ["image/jpeg", "image/png", "image/webp", "image/gif"]

  if (file.size > maxSize) {
    throw new Error("File size must be less than 2MB")
  }

  if (!allowedTypes.includes(file.type)) {
    throw new Error("Invalid file type. Allowed: JPEG, PNG, WebP, GIF")
  }

  return true
}

const AccountManagement = () => {
  const [accounts, setAccounts] = useState([])
  const [filteredAccounts, setFilteredAccounts] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingAccount, setEditingAccount] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)

  // Form state
  const [bankName, setBankName] = useState("")
  const [accountNumber, setAccountNumber] = useState("")
  const [paymentMethod, setPaymentMethod] = useState("Commercial Bank of Ethiopia")
  const [registrationFee, setRegistrationFee] = useState("")
  const [selectedLogo, setSelectedLogo] = useState(null)
  const [logoPreview, setLogoPreview] = useState(null)
  const [errorMessage, setErrorMessage] = useState("")
  const [successMessage, setSuccessMessage] = useState("")

  const paymentMethods = [
    "Commercial Bank of Ethiopia",
    "Dashen Bank",
    "Awash Bank",
    "Bank of Abyssinia",
    "Nib Bank",
    "Hibret Bank",
    "Zemen Bank",
    "M-Pesa",
    "Telebirr",
    "M-Birr",
    "Other",
  ]

  useEffect(() => {
    const accountsQuery = query(collection(db, "account"), orderBy("createdAt", "desc"))
    const unsubscribe = onSnapshot(accountsQuery, (snapshot) => {
      const accountsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      setAccounts(accountsData)
      setFilteredAccounts(accountsData)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  useEffect(() => {
    if (searchTerm) {
      const filtered = accounts.filter(
        (account) =>
          account.bankName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          account.accountNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          account.paymentMethod?.toLowerCase().includes(searchTerm.toLowerCase())
      )
      setFilteredAccounts(filtered)
    } else {
      setFilteredAccounts(accounts)
    }
  }, [searchTerm, accounts])

  const handleLogoSelect = (e) => {
    const file = e.target.files?.[0]
    if (!file) return

    try {
      validateFile(file)
      setSelectedLogo(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setLogoPreview(reader.result)
      }
      reader.readAsDataURL(file)
      setErrorMessage("")
    } catch (error) {
      setErrorMessage(error.message)
      setSelectedLogo(null)
      setLogoPreview(null)
    }
  }

  const handleRemoveLogo = () => {
    setSelectedLogo(null)
    setLogoPreview(null)
    setErrorMessage("")
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setErrorMessage("")
    setSuccessMessage("")

    if (!bankName.trim() || !accountNumber.trim() || !paymentMethod.trim() || !registrationFee.trim()) {
      setErrorMessage("Please fill in all required fields")
      return
    }

    const feeAmount = parseFloat(registrationFee)
    if (isNaN(feeAmount) || feeAmount <= 0) {
      setErrorMessage("Please enter a valid registration fee amount")
      return
    }

    if (!selectedLogo) {
      setErrorMessage("Please upload a logo")
      return
    }

    setIsSubmitting(true)
    setIsUploading(true)
    setUploadProgress(0)

    try {
      // Upload logo to Cloudinary
      setUploadProgress(30)
      const uploadResult = await uploadToCloudinary(selectedLogo)
      setUploadProgress(70)

      // Save to Firestore
      const accountData = {
        bankName: bankName.trim(),
        accountNumber: accountNumber.trim(),
        paymentMethod: paymentMethod.trim(),
        registrationFee: parseFloat(registrationFee),
        logo: {
          url: uploadResult.secure_url,
          publicId: uploadResult.public_id,
          format: uploadResult.format,
          size: uploadResult.size,
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      }

      await addDoc(collection(db, "account"), accountData)
      setUploadProgress(100)

      // Reset form
      setBankName("")
      setAccountNumber("")
      setPaymentMethod("Commercial Bank of Ethiopia")
      setRegistrationFee("")
      setSelectedLogo(null)
      setLogoPreview(null)
      setShowAddModal(false)
      setSuccessMessage("Account added successfully!")
      setTimeout(() => setSuccessMessage(""), 3000)
    } catch (error) {
      console.error("Error adding account:", error)
      setErrorMessage(error.message || "Failed to add account. Please try again.")
    } finally {
      setIsSubmitting(false)
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const handleDelete = async (accountId) => {
    if (!window.confirm("Are you sure you want to delete this account?")) return

    try {
      await deleteDoc(doc(db, "account", accountId))
      setSuccessMessage("Account deleted successfully!")
      setTimeout(() => setSuccessMessage(""), 3000)
    } catch (error) {
      console.error("Error deleting account:", error)
      setErrorMessage("Failed to delete account. Please try again.")
      setTimeout(() => setErrorMessage(""), 3000)
    }
  }

  const handleEdit = (account) => {
    setEditingAccount(account)
    setBankName(account.bankName)
    setAccountNumber(account.accountNumber)
    setPaymentMethod(account.paymentMethod)
    setRegistrationFee(account.registrationFee?.toString() || "")
    setLogoPreview(account.logo?.url || null)
    setShowEditModal(true)
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    setErrorMessage("")
    setSuccessMessage("")

    if (!bankName.trim() || !accountNumber.trim() || !paymentMethod.trim() || !registrationFee.trim()) {
      setErrorMessage("Please fill in all required fields")
      return
    }

    const feeAmount = parseFloat(registrationFee)
    if (isNaN(feeAmount) || feeAmount <= 0) {
      setErrorMessage("Please enter a valid registration fee amount")
      return
    }

    setIsSubmitting(true)

    try {
      let logoData = editingAccount.logo

      // If a new logo was selected, upload it
      if (selectedLogo) {
        setIsUploading(true)
        setUploadProgress(30)
        const uploadResult = await uploadToCloudinary(selectedLogo)
        setUploadProgress(70)
        logoData = {
          url: uploadResult.secure_url,
          publicId: uploadResult.public_id,
          format: uploadResult.format,
          size: uploadResult.size,
        }
      }

      // Update Firestore
      const accountData = {
        bankName: bankName.trim(),
        accountNumber: accountNumber.trim(),
        paymentMethod: paymentMethod.trim(),
        registrationFee: parseFloat(registrationFee),
        logo: logoData,
        updatedAt: serverTimestamp(),
      }

      await updateDoc(doc(db, "account", editingAccount.id), accountData)
      setUploadProgress(100)

      // Reset form
      setBankName("")
      setAccountNumber("")
      setPaymentMethod("Commercial Bank of Ethiopia")
      setRegistrationFee("")
      setSelectedLogo(null)
      setLogoPreview(null)
      setShowEditModal(false)
      setEditingAccount(null)
      setSuccessMessage("Account updated successfully!")
      setTimeout(() => setSuccessMessage(""), 3000)
    } catch (error) {
      console.error("Error updating account:", error)
      setErrorMessage(error.message || "Failed to update account. Please try again.")
    } finally {
      setIsSubmitting(false)
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-cyan-500 border-t-transparent mx-auto mb-6"></div>
          <p className="text-gray-400 text-lg">Loading accounts...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400 mb-2">
              Account Management
            </h1>
            <p className="text-gray-400">Manage payment accounts and bank details</p>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="mt-4 sm:mt-0 flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-600 hover:to-indigo-600 rounded-lg transition-all duration-300 transform hover:scale-105"
          >
            <Plus className="w-5 h-5" />
            <span>Add Account</span>
          </button>
        </div>

        {/* Messages */}
        {errorMessage && (
          <div className="mb-6 p-4 bg-red-900/50 border border-red-700 rounded-lg flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            <p className="text-red-300">{errorMessage}</p>
          </div>
        )}

        {successMessage && (
          <div className="mb-6 p-4 bg-green-900/50 border border-green-700 rounded-lg flex items-center space-x-3">
            <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
            <p className="text-green-300">{successMessage}</p>
          </div>
        )}

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by bank name, account number, or payment method..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-800 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
            />
          </div>
        </div>

        {/* Accounts Grid */}
        {filteredAccounts.length === 0 ? (
          <div className="text-center py-16 bg-gray-900 rounded-2xl border border-gray-800">
            <Building2 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
            <p className="text-gray-400 text-lg">No accounts found</p>
            <p className="text-gray-500 text-sm mt-2">
              {searchTerm ? "Try a different search term" : "Add your first account to get started"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredAccounts.map((account) => (
              <div
                key={account.id}
                className="bg-gray-900 rounded-2xl p-6 border border-gray-800 hover:border-cyan-500 transition-all duration-300"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    {account.logo?.url ? (
                      <img
                        src={account.logo.url}
                        alt={account.bankName}
                        className="w-12 h-12 object-contain rounded-lg bg-white p-1"
                      />
                    ) : (
                      <div className="w-12 h-12 bg-gray-800 rounded-lg flex items-center justify-center">
                        <Building2 className="w-6 h-6 text-gray-600" />
                      </div>
                    )}
                    <div>
                      <h3 className="font-bold text-lg text-cyan-400">{account.bankName}</h3>
                      <p className="text-sm text-gray-400">{account.paymentMethod}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEdit(account)}
                      className="p-2 hover:bg-cyan-900/50 rounded-lg transition-colors text-cyan-400 hover:text-cyan-300"
                      title="Edit account"
                    >
                      <Edit className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => handleDelete(account.id)}
                      className="p-2 hover:bg-red-900/50 rounded-lg transition-colors text-red-400 hover:text-red-300"
                      title="Delete account"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-gray-300">
                    <CreditCard className="w-4 h-4 text-gray-500" />
                    <span className="text-sm">Account Number:</span>
                  </div>
                  <p className="text-lg font-mono font-semibold text-cyan-300 bg-gray-800 px-3 py-2 rounded-lg">
                    {account.accountNumber}
                  </p>
                </div>

                {account.registrationFee && (
                  <div className="space-y-2 mt-4">
                    <div className="flex items-center space-x-2 text-gray-300">
                      <CreditCard className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">Registration Fee:</span>
                    </div>
                    <p className="text-lg font-semibold text-green-300 bg-gray-800 px-3 py-2 rounded-lg">
                      {account.registrationFee.toLocaleString()} Birr
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Add Account Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-900 rounded-2xl border border-gray-800 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-gray-900 border-b border-gray-800 p-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-cyan-400">Add New Account</h2>
                <button
                  onClick={() => {
                    setShowAddModal(false)
                    setBankName("")
                    setAccountNumber("")
                    setPaymentMethod("Commercial Bank of Ethiopia")
                    setRegistrationFee("")
                    setSelectedLogo(null)
                    setLogoPreview(null)
                    setErrorMessage("")
                  }}
                  className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {/* Payment Method */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Payment Method <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    required
                  >
                    {paymentMethods.map((method) => (
                      <option key={method} value={method}>
                        {method}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Bank Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Bank Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder="e.g., Commercial Bank of Ethiopia"
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    required
                  />
                </div>

                {/* Account Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Account Number <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder="Enter account number"
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-mono"
                    required
                  />
                </div>

                {/* Registration Fee */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Registration Fee (Birr) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    value={registrationFee}
                    onChange={(e) => setRegistrationFee(e.target.value)}
                    placeholder="e.g., 500"
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    required
                  />
                </div>

                {/* Logo Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Bank Logo <span className="text-red-400">*</span>
                  </label>
                  {logoPreview ? (
                    <div className="relative">
                      <img
                        src={logoPreview}
                        alt="Logo preview"
                        className="w-32 h-32 object-contain bg-gray-800 rounded-lg p-4 border border-gray-700"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveLogo}
                        className="absolute -top-2 -right-2 p-1 bg-red-500 rounded-full hover:bg-red-600 transition-colors"
                      >
                        <X className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-700 rounded-lg cursor-pointer hover:border-cyan-500 transition-colors bg-gray-800">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-2 text-gray-400" />
                        <p className="mb-2 text-sm text-gray-400">
                          <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">PNG, JPG, GIF up to 2MB</p>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoSelect}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                {/* Upload Progress */}
                {isUploading && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm text-gray-400">
                      <span>Uploading logo...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-cyan-500 to-indigo-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Error Message */}
                {errorMessage && (
                  <div className="p-4 bg-red-900/50 border border-red-700 rounded-lg flex items-center space-x-3">
                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                    <p className="text-red-300 text-sm">{errorMessage}</p>
                  </div>
                )}

                {/* Submit Button */}
                <div className="flex space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowAddModal(false)
                      setBankName("")
                      setAccountNumber("")
                      setPaymentMethod("Commercial Bank of Ethiopia")
                      setRegistrationFee("")
                      setSelectedLogo(null)
                      setLogoPreview(null)
                      setErrorMessage("")
                    }}
                    className="flex-1 px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || isUploading}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-600 hover:to-indigo-600 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting || isUploading ? "Adding..." : "Add Account"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Account Modal */}
        {showEditModal && editingAccount && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
            <div className="bg-gray-900 rounded-2xl border border-gray-800 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-gray-900 border-b border-gray-800 p-6 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-cyan-400">Edit Account</h2>
                <button
                  onClick={() => {
                    setShowEditModal(false)
                    setEditingAccount(null)
                    setBankName("")
                    setAccountNumber("")
                    setPaymentMethod("Commercial Bank of Ethiopia")
                    setRegistrationFee("")
                    setSelectedLogo(null)
                    setLogoPreview(null)
                    setErrorMessage("")
                  }}
                  className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleUpdate} className="p-6 space-y-6">
                {/* Payment Method */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Payment Method <span className="text-red-400">*</span>
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    required
                  >
                    {paymentMethods.map((method) => (
                      <option key={method} value={method}>
                        {method}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Bank Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Bank Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder="e.g., Commercial Bank of Ethiopia"
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    required
                  />
                </div>

                {/* Account Number */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Account Number <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value)}
                    placeholder="Enter account number"
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-mono"
                    required
                  />
                </div>

                {/* Registration Fee */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Registration Fee (Birr) <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="number"
                    value={registrationFee}
                    onChange={(e) => setRegistrationFee(e.target.value)}
                    placeholder="e.g., 500"
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-cyan-500"
                    required
                  />
                </div>

                {/* Logo Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Bank Logo {!selectedLogo && "(Optional - keep current or upload new)"}
                  </label>
                  {logoPreview ? (
                    <div className="relative">
                      <img
                        src={logoPreview}
                        alt="Logo preview"
                        className="w-32 h-32 object-contain bg-gray-800 rounded-lg p-4 border border-gray-700"
                      />
                      <button
                        type="button"
                        onClick={handleRemoveLogo}
                        className="absolute -top-2 -right-2 p-1 bg-red-500 rounded-full hover:bg-red-600 transition-colors"
                      >
                        <X className="w-4 h-4 text-white" />
                      </button>
                    </div>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-700 rounded-lg cursor-pointer hover:border-cyan-500 transition-colors bg-gray-800">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <Upload className="w-8 h-8 mb-2 text-gray-400" />
                        <p className="mb-2 text-sm text-gray-400">
                          <span className="font-semibold">Click to upload</span> or drag and drop
                        </p>
                        <p className="text-xs text-gray-500">PNG, JPG, GIF up to 2MB</p>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleLogoSelect}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                {/* Upload Progress */}
                {isUploading && (
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm text-gray-400">
                      <span>Uploading logo...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-800 rounded-full h-2">
                      <div
                        className="bg-gradient-to-r from-cyan-500 to-indigo-500 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Error Message */}
                {errorMessage && (
                  <div className="p-4 bg-red-900/50 border border-red-700 rounded-lg flex items-center space-x-3">
                    <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
                    <p className="text-red-300 text-sm">{errorMessage}</p>
                  </div>
                )}

                {/* Submit Button */}
                <div className="flex space-x-4 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditModal(false)
                      setEditingAccount(null)
                      setBankName("")
                      setAccountNumber("")
                      setPaymentMethod("Commercial Bank of Ethiopia")
                      setRegistrationFee("")
                      setSelectedLogo(null)
                      setLogoPreview(null)
                      setErrorMessage("")
                    }}
                    className="flex-1 px-6 py-3 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || isUploading}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-500 to-indigo-500 hover:from-cyan-600 hover:to-indigo-600 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting || isUploading ? "Updating..." : "Update Account"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AccountManagement

