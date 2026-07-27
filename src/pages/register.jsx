"use client"

import { useState, useEffect, useRef } from "react"
import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Upload,
  Camera,
  Shield,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  X,
  FileText,
  Loader2,
  Calendar,
  Globe,
  DollarSign,
  Clock,
  Home as HomeIcon,
  Truck,
  Coffee,
  Ticket,
  ClipboardCheck,
  PenTool,
  CreditCard,
  Bell,
  ShieldCheck
} from "lucide-react"
import { collection, addDoc, setDoc, doc, query, where, getDocs, Timestamp, deleteDoc } from "firebase/firestore"
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth"
import { useNavigate } from "react-router-dom"
import { auth, db } from "../config/firebase"
import { uploadToCloudinary, uploadDocument, validateFile } from "../utils/cloudinary"
import CustomSelect from "../components/CustomSelect"
import FaceVerification from "../components/FaceVerification"

const countryOptions = [
  "Canada", "Germany", "United Kingdom", "France", "Netherlands",
  "Sweden", "Norway", "Denmark", "Switzerland", "Ireland",
  "Poland", "Romania", "Hungary", "Czech Republic", "Slovakia",
  "Portugal", "United Arab Emirates (UAE)", "Saudi Arabia", "Qatar", "Kuwait", "Oman"
]

const jobOptions = [
  "Cleaner", "Security Guard", "Security Officer", "Driver (Heavy)", "Driver (Light)",
  "Domestic Worker", "Housemaid", "Caregiver", "Nurse", "Waitress", "Waiter",
  "Cook / Chef", "Kitchen Helper", "Dishwasher", "Receptionist", "Sales Associate",
  "Construction Worker", "Electrician", "Plumber", "Carpenter", "Mason",
  "Painter", "AC Technician", "General Labor", "Warehouse Worker", "Packer",
  "Factory Worker", "Agriculture Worker", "Gardener", "Tailor"
]

const cityMapping = {
  "Canada": ["Toronto", "Montreal", "Vancouver", "Calgary", "Edmonton", "Ottawa", "Winnipeg", "Quebec City", "Hamilton", "Kitchener"],
  "Germany": ["Berlin", "Hamburg", "Munich", "Cologne", "Frankfurt", "Stuttgart", "Düsseldorf", "Dortmund", "Essen", "Leipzig"],
  "United Kingdom": ["London", "Birmingham", "Glasgow", "Liverpool", "Bristol", "Manchester", "Sheffield", "Leeds", "Edinburgh", "Leicester"],
  "France": ["Paris", "Marseille", "Lyon", "Toulouse", "Nice", "Nantes", "Strasbourg", "Montpellier", "Bordeaux", "Lille"],
  "Netherlands": ["Amsterdam", "Rotterdam", "The Hague", "Utrecht", "Eindhoven", "Tilburg", "Groningen", "Almere", "Breda", "Nijmegen"],
  "Sweden": ["Stockholm", "Gothenburg", "Malmö", "Uppsala", "Västerås", "Örebro", "Linköping", "Helsingborg", "Jönköping", "Norrköping"],
  "Norway": ["Oslo", "Bergen", "Stavanger", "Trondheim", "Fredrikstad", "Drammen", "Porsgrunn", "Kristiansand", "Ålesund", "Tønsberg"],
  "Denmark": ["Copenhagen", "Aarhus", "Odense", "Aalborg", "Esbjerg", "Randers", "Kolding", "Horsens", "Vejle", "Roskilde"],
  "Switzerland": ["Zurich", "Geneva", "Basel", "Lausanne", "Bern", "Winterthur", "Lucerne", "St. Gallen", "Lugano", "Biel/Bienne"],
  "Ireland": ["Dublin", "Cork", "Limerick", "Galway", "Waterford", "Drogheda", "Dundalk", "Swords", "Bray", "Navan"],
  "Poland": ["Warsaw", "Kraków", "Łódź", "Wrocław", "Poznań", "Gdańsk", "Szczecin", "Bydgoszcz", "Lublin", "Białystok"],
  "Romania": ["Bucharest", "Cluj-Napoca", "Timișoara", "Iași", "Constanța", "Craiova", "Brașov", "Galați", "Ploiești", "Oradea"],
  "Hungary": ["Budapest", "Debrecen", "Szeged", "Miskolc", "Pécs", "Győr", "Nyíregyháza", "Kecskemét", "Székesfehérvár", "Szombathely"],
  "Czech Republic": ["Prague", "Brno", "Ostrava", "Pilsen", "Liberec", "Olomouc", "České Budějovice", "Hradec Králové", "Ústí nad Labem", "Pardubice"],
  "Slovakia": ["Bratislava", "Košice", "Prešov", "Žilina", "Nitra", "Banská Bystrica", "Trnava", "Martin", "Trenčín", "Poprad"],
  "Portugal": ["Lisbon", "Porto", "Vila Nova de Gaia", "Amadora", "Braga", "Funchal", "Coimbra", "Setúbal", "Almada", "Queluz"],
  "United Arab Emirates (UAE)": ["Dubai", "Abu Dhabi", "Sharjah", "Al Ain", "Ajman", "Ras Al Khaimah", "Fujairah", "Umm Al Quwain", "Khor Fakkan", "Kalba"],
  "Saudi Arabia": ["Riyadh", "Jeddah", "Mecca", "Medina", "Dammam", "Taif", "Tabuk", "Buraidah", "Khamis Mushait", "Abha"],
  "Qatar": ["Doha", "Al Rayyan", "Al Wakrah", "Al Khor", "Umm Salal", "Madinat ash Shamal", "Al Daayen", "Al Shahaniya", "Mesaieed", "Dukhan"],
  "Kuwait": ["Kuwait City", "Al Ahmadi", "Hawalli", "Al Jahra", "Al Farwaniyah", "Salmiya", "Mubarak Al-Kabeer", "Fahaheel", "Sabah Al-Salem", "Jaleeb Al-Shuyoukh"],
  "Oman": ["Muscat", "Salalah", "Seeb", "Bawshar", "Sohar", "As Suwayq", "Ibri", "Saham", "Barka", "Rustaq"]
}

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

export default function Register() {
  const navigate = useNavigate()
  const [currentSection, setCurrentSection] = useState(1) // 1-8
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  // Signature Pad Hooks (Moved to top level to avoid Rules of Hooks violation)
  const canvasRef = useRef(null)
  const [isDrawing, setIsDrawing] = useState(false)
  
  const [submitMessage, setSubmitMessage] = useState({ type: "", message: "", applicationNumber: "" })
  const [loading, setLoading] = useState(false)
  const [codeError, setCodeError] = useState(false)
  const [showManualInput, setShowManualInput] = useState(false)
  
  const [errors, setErrors] = useState({})
  const [uploadProgress, setUploadProgress] = useState({})
  const [showFaceModal, setShowFaceModal] = useState(false)

  const [previews, setPreviews] = useState({
    profilePhoto: null,
    idCardFront: null,
    idCardBack: null,
    educationalCertificate: null
  })

  const [formData, setFormData] = useState({
    // Section 1: Personal Information
    fullName: "",
    dateOfBirth: "",
    gender: "",
    phoneNumber: "",
    region: "",
    city: "",
    hasPassport: "", // "Yes" or "No"
    passportNumber: "",

    // Section 2: Job Information
    jobTitle: "",
    selectedCountries: [], // exactly 5
    selectedCities: {}, // { countryName: cityName }
    contractType: "",
    contractLength: "",

    // Section 3: Personal Documents
    profilePhoto: null,
    idCardFront: null,
    idCardBack: null,
    educationalCertificate: null,

    // Section 4: Salary & Benefits
    monthlySalary: "",
    workingHours: "",
    accommodation: "", // "Yes" or "No"
    transport: "", // "Yes" or "No"
    food: "", // "Yes" or "No"

    // Section 5: International Process
    visaProvidedByCompany: "", // "Yes" or "No"
    workPermit: "", // "Yes" or "No"
    flightTicket: "", // "Company" or "Employee"

    // Section 6: Agreement Submission Code
    submissionCode: "",
    codeConfirmed: false,

    // Section 7: Declaration
    declarationAgreed: false,

    // Section 8: Signature
    signatureApplicantName: "",
    signatureData: "", // Base64 signature
    signatureDate: "",
    
    // Section 9: Password
    password: "",
    confirmPassword: ""
  })

  // Handle signature pad initialization and data loading
  useEffect(() => {
    if (currentSection === 6 && formData.declarationAgreed) {
      // Small timeout to ensure canvas is in DOM
      const timer = setTimeout(() => {
        const canvas = canvasRef.current
        if (!canvas) return
        const ctx = canvas.getContext('2d')
        ctx.strokeStyle = '#2563eb'
        ctx.lineWidth = 3
        ctx.lineCap = 'round'
        
        // Load existing signature if any
        if (formData.signatureData) {
          const img = new Image()
          img.onload = () => ctx.drawImage(img, 0, 0)
          img.src = formData.signatureData
        }
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [currentSection, formData.declarationAgreed])

  const handleInputChange = (e) => {
    const { name, value, type, checked, files } = e.target

    if (type === "checkbox") {
      if (name === "selectedCountries") {
        const updatedCountries = checked
          ? [...formData.selectedCountries, value]
          : formData.selectedCountries.filter(c => c !== value)
        
        setFormData(prev => ({ ...prev, selectedCountries: updatedCountries }))
      } else {
        setFormData(prev => ({ ...prev, [name]: checked }))
      }
    } else if (name === "phoneNumber") {
      const val = value.replace(/\D/g, "").slice(0, 9)
      setFormData(prev => ({ ...prev, [name]: val }))
    } else if (type === "file") {
      const file = files[0]
      if (file) {
        // Basic validation
        const maxSize = 5 * 1024 * 1024 // 5MB
        if (file.size > maxSize) {
          setErrors(prev => ({ ...prev, [name]: "File size must be less than 5MB" }))
          return
        }

        setFormData(prev => ({ ...prev, [name]: file }))
        
        // Generate Preview
        if (file.type.startsWith("image/")) {
          const reader = new FileReader()
          reader.onloadend = () => {
            setPreviews(prev => ({ ...prev, [name]: reader.result }))
          }
          reader.readAsDataURL(file)
        } else {
          setPreviews(prev => ({ ...prev, [name]: "document" }))
        }
      }
    } else {
      setFormData(prev => ({ ...prev, [name]: value }))
    }

    // Clear error
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }))
    }
  }

  const validateSection = (section) => {
    const newErrors = {}

    if (section === 1) {
      if (!formData.fullName) newErrors.fullName = "Full Name is required"
      if (!formData.dateOfBirth) newErrors.dateOfBirth = "Date of Birth is required"
      if (!formData.gender) newErrors.gender = "Gender is required"
      if (!formData.phoneNumber) newErrors.phoneNumber = "Phone Number is required"
      else if (!/^[79]\d{8}$/.test(formData.phoneNumber)) {
        newErrors.phoneNumber = "Please enter a valid 9-digit number starting with 7 or 9"
      }
      if (!formData.region) newErrors.region = "Region is required"
      if (!formData.city) newErrors.city = "City is required"
      if (!formData.hasPassport) newErrors.hasPassport = "Please specify if you have a passport"
      if (formData.hasPassport === "Yes" && !formData.passportNumber) newErrors.passportNumber = "Passport Number is required"
    }

    if (section === 2) {
      if (!formData.jobTitle) newErrors.jobTitle = "Job Title is required"
      if (formData.selectedCountries.length !== 5) newErrors.selectedCountries = "You must select exactly 5 countries"
      
      // Validate that each selected country has a city selected
      formData.selectedCountries.forEach(country => {
        if (!formData.selectedCities[country]) {
          newErrors.selectedCities = `Please select a city for all countries`
        }
      })
      
      if (!formData.contractType) newErrors.contractType = "Contract Type is required"
      if (!formData.contractLength) newErrors.contractLength = "Contract Length is required"
    }

    if (section === 3) {
      if (!formData.profilePhoto) newErrors.profilePhoto = "Profile Photo is required"
      if (!formData.idCardFront) newErrors.idCardFront = "ID Card Front is required"
      if (!formData.idCardBack) newErrors.idCardBack = "ID Card Back is required"
    }

    if (section === 4) {
      if (!formData.monthlySalary) newErrors.monthlySalary = "Monthly Salary is required"
      if (!formData.workingHours) newErrors.workingHours = "Working Hours is required"
      if (!formData.accommodation) newErrors.accommodation = "Accommodation preference is required"
      if (!formData.transport) newErrors.transport = "Transport preference is required"
      if (!formData.food) newErrors.food = "Food preference is required"
    }

    if (section === 5) {
      if (!formData.visaProvidedByCompany) newErrors.visaProvidedByCompany = "Visa info is required"
      if (!formData.workPermit) newErrors.workPermit = "Work permit info is required"
      if (!formData.flightTicket) newErrors.flightTicket = "Flight ticket preference is required"
    }

    if (section === 6) {
      if (!formData.declarationAgreed) newErrors.declarationAgreed = "You must agree to the declaration"
      if (formData.declarationAgreed && !formData.signatureData) newErrors.signatureData = "Finger signature is required"
      if (formData.signatureData && !formData.faceVerified) newErrors.faceVerified = "Face verification is required to proceed"
    }

    if (section === 7) {
      // Summary page, no validation needed
      return true
    }

    if (section === 8) {
      if (!formData.submissionCode) newErrors.submissionCode = "Submission Code is required"
      if (!formData.codeConfirmed) newErrors.codeConfirmed = "You must confirm the code"
    }

    if (section === 9) {
      if (!formData.password) newErrors.password = "Password is required"
      if (formData.password.length < 6) newErrors.password = "Password must be at least 6 characters"
      if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords do not match"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleNext = async () => {
    // Advanced Auto-Verification for Step 7 (Summary Page)
    if (currentSection === 7) {
      setLoading(true)
      setSubmitMessage({ type: "info", message: "Auto-verifying your submission code..." })
      
      try {
        const fullPhone = `+251${formData.phoneNumber}`
        const generatedEmail = `251${formData.phoneNumber}@lmis.gov.et`
        
        // Try to auto-login with payment credentials
        const paymentCred = await signInWithEmailAndPassword(auth, generatedEmail, fullPhone)
        const verifiedUid = paymentCred.user.uid
        await auth.signOut()

        // If successful, auto-fill and jump to password (Step 9)
        setFormData(prev => ({ 
          ...prev, 
          submissionCode: verifiedUid,
          codeConfirmed: true 
        }))
        
        setSubmitMessage({ type: "success", message: "Payment verified successfully!" })
        setTimeout(() => {
          setSubmitMessage({ type: "", message: "" })
          setCurrentSection(9)
          window.scrollTo({ top: 0, behavior: "smooth" })
          setLoading(false)
        }, 1500)
        return
      } catch (err) {
        // If auto-verify fails, just go to manual entry (Step 8)
        setSubmitMessage({ type: "", message: "" })
        setLoading(false)
        setCurrentSection(8)
        window.scrollTo({ top: 0, behavior: "smooth" })
        return
      }
    }

    if (currentSection === 8) {
      setLoading(true)
      setSubmitMessage({ type: "info", message: "Verifying submission code..." })
      
      try {
        const fullPhone = `+251${formData.phoneNumber}`
        const generatedEmail = `251${formData.phoneNumber}@lmis.gov.et`
        
        const paymentCred = await signInWithEmailAndPassword(auth, generatedEmail, fullPhone)
        const verifiedUid = paymentCred.user.uid
        await auth.signOut()

        if (verifiedUid !== formData.submissionCode) {
          throw new Error("Invalid code")
        }
        
        setSubmitMessage({ type: "", message: "" })
        setCodeError(false)
      } catch (err) {
        setCodeError(true)
        setLoading(false)
        return
      }
      setLoading(false)
    }

    if (validateSection(currentSection)) {
      setCurrentSection(prev => prev + 1)
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  const handleBack = () => {
    if (currentSection === 9) {
      setCurrentSection(7)
    } else {
      setCurrentSection(prev => prev - 1)
    }
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleFileUpload = async (file, fieldName) => {
    if (!file) return null
    try {
      setUploadProgress(prev => ({ ...prev, [fieldName]: 10 }))
      const result = await (fieldName === "profilePhoto" || fieldName.includes("idCard") ? uploadToCloudinary(file) : uploadDocument(file))
      setUploadProgress(prev => ({ ...prev, [fieldName]: 100 }))
      return result.url
    } catch (error) {
      console.error(`Upload failed for ${fieldName}:`, error)
      setErrors(prev => ({ ...prev, [fieldName]: "Upload failed. Please try again." }))
      return null
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!validateSection(9)) return

    setLoading(true)
    setSubmitMessage({ type: "info", message: "Verifying submission code..." })

    try {
      // 1. Verify Submission Code
      const fullPhone = `+251${formData.phoneNumber}`
      const generatedEmail = `251${formData.phoneNumber}@lmis.gov.et`
      
      let verifiedUid = ""
      try {
        const paymentCred = await signInWithEmailAndPassword(auth, generatedEmail, fullPhone)
        verifiedUid = paymentCred.user.uid
        await auth.signOut()
      } catch (err) {
        throw new Error("Invalid submission code. Please ensure you have completed the payment.")
      }

      if (verifiedUid !== formData.submissionCode) {
        throw new Error("The submission code entered is incorrect for this phone number.")
      }

      setSubmitMessage({ type: "info", message: "Updating account security..." })
      
      // 2. Create/Update Firebase Auth User with NEW password
      let user;
      try {
        // Since the user already exists (from payment), we sign in with payment password and update it
        const userCredential = await signInWithEmailAndPassword(auth, generatedEmail, fullPhone)
        user = userCredential.user
        await updatePassword(user, formData.password)
      } catch (authError) {
        throw new Error("Failed to update account security. Please try again.")
      }

      // 2. Upload Files
      setSubmitMessage({ type: "info", message: "Uploading your documents..." })
      const uploadedUrls = {
        profilePhotoUrl: await handleFileUpload(formData.profilePhoto, "profilePhoto"),
        idCardFrontUrl: await handleFileUpload(formData.idCardFront, "idCardFront"),
        idCardBackUrl: await handleFileUpload(formData.idCardBack, "idCardBack"),
        educationalCertificateUrl: formData.educationalCertificate ? await handleFileUpload(formData.educationalCertificate, "educationalCertificate") : ""
      }

      if (!uploadedUrls.profilePhotoUrl || !uploadedUrls.idCardFrontUrl || !uploadedUrls.idCardBackUrl) {
        throw new Error("Required file uploads failed. Please check your internet connection.")
      }

      // 3. Save to Firestore
      setSubmitMessage({ type: "info", message: "Saving application details..." })
      
      const registrationData = {
        uid: user.uid,
        ...formData,
        email: generatedEmail,
        // Replace file objects with URLs
        profilePhoto: uploadedUrls.profilePhotoUrl,
        idCardFront: uploadedUrls.idCardFrontUrl,
        idCardBack: uploadedUrls.idCardBackUrl,
        educationalCertificate: uploadedUrls.educationalCertificateUrl,
        
        createdAt: new Date().toISOString(),
        status: "Pending",
        applicationNumber: `APP-${Date.now()}`,
        isRead: false
      }

      // Remove sensitive fields
      delete registrationData.password
      delete registrationData.confirmPassword

      await setDoc(doc(db, "users", user.uid), registrationData)

      // AUTO-CLEANUP
      try {
        const feesQuery = query(
          collection(db, "registration-fees"), 
          where("phoneNumber", "==", formData.phoneNumber),
          where("status", "==", "approved")
        );
        const feesSnapshot = await getDocs(feesQuery);
        const deletePromises = feesSnapshot.docs.map(feeDoc => deleteDoc(doc(db, "registration-fees", feeDoc.id)));
        await Promise.all(deletePromises);
      } catch (cleanupError) {
        console.warn("Cleanup of fee records failed:", cleanupError);
      }

      setSubmitMessage({
        type: "success",
        message: "Registration successful! Redirecting to login...",
        applicationNumber: registrationData.applicationNumber
      })

      setTimeout(() => {
        window.location.href = "/login"
      }, 3000)

    } catch (error) {
      console.error("Submission error:", error)
      setSubmitMessage({ type: "error", message: error.message || "An error occurred. Please try again." })
    } finally {
      setLoading(false)
    }
  }

  // --- RENDERERS ---

  const renderProgressBar = () => (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs font-bold text-gray-600">Section {currentSection} of 9</span>
        <span className="text-xs font-medium text-blue-600">
          {Math.round((currentSection / 9) * 100)}% Complete
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-1.5">
        <div
          className="bg-blue-600 h-1.5 rounded-full transition-all duration-500 ease-out shadow-sm"
          style={{ width: `${(currentSection / 9) * 100}%` }}
        ></div>
      </div>
    </div>
  )

  const renderSection1 = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-3 mb-4 pb-2 border-b">
        <User className="w-6 h-6 text-blue-600" />
        <h2 className="text-lg font-bold text-gray-800">Personal Information</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1">Full Name *</label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 text-sm rounded-lg border ${errors.fullName ? "border-red-500" : "border-gray-300"} focus:ring-2 focus:ring-blue-500 transition-all`}
            placeholder=""
          />
          {errors.fullName && <p className="text-red-500 text-xs mt-1">{errors.fullName}</p>}
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1">Date of Birth *</label>
          <input
            type="date"
            name="dateOfBirth"
            value={formData.dateOfBirth}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 text-sm rounded-lg border ${errors.dateOfBirth ? "border-red-500" : "border-gray-300"} focus:ring-2 focus:ring-blue-500 transition-all`}
          />
          {errors.dateOfBirth && <p className="text-red-500 text-xs mt-1">{errors.dateOfBirth}</p>}
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1">Gender *</label>
          <CustomSelect
            name="gender"
            value={formData.gender}
            onChange={handleInputChange}
            options={[
              { value: 'Male', label: 'Male' },
              { value: 'Female', label: 'Female' }
            ]}
            placeholder="Select Gender"
            error={errors.gender}
          />
          {errors.gender && <p className="text-red-500 text-xs mt-1">{errors.gender}</p>}
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-bold text-gray-700">Phone Number *</label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-bold border-r pr-3">+251</span>
            <input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              className={`w-full pl-16 pr-4 py-2.5 rounded-lg border ${errors.phoneNumber ? "border-red-500" : "border-gray-300"} focus:ring-2 focus:ring-blue-500 transition-all`}
              placeholder=""
            />
          </div>
          {errors.phoneNumber && <p className="text-red-500 text-xs mt-1">{errors.phoneNumber}</p>}
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1">Region *</label>
          <input
            type="text"
            name="region"
            value={formData.region}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 text-sm rounded-lg border ${errors.region ? "border-red-500" : "border-gray-300"} focus:ring-2 focus:ring-blue-500 transition-all`}
            placeholder=""
          />
          {errors.region && <p className="text-red-500 text-xs mt-1">{errors.region}</p>}
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1">City *</label>
          <input
            type="text"
            name="city"
            value={formData.city}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 text-sm rounded-lg border ${errors.city ? "border-red-500" : "border-gray-300"} focus:ring-2 focus:ring-blue-500 transition-all`}
            placeholder=""
          />
          {errors.city && <p className="text-red-500 text-xs mt-1">{errors.city}</p>}
        </div>

        <div className="md:col-span-2 space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-2">Do you have a Passport? *</label>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="hasPassport"
                  value="Yes"
                  checked={formData.hasPassport === "Yes"}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-sm font-medium">Yes</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="hasPassport"
                  value="No"
                  checked={formData.hasPassport === "No"}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-sm font-medium">No</span>
              </label>
            </div>
            {errors.hasPassport && <p className="text-red-500 text-xs mt-1">{errors.hasPassport}</p>}
          </div>

          {formData.hasPassport === "Yes" && (
            <div className="animate-in slide-in-from-top-2 duration-300">
              <label className="block text-xs font-bold text-gray-700 mb-1">Passport Number *</label>
              <input
                type="text"
                name="passportNumber"
                value={formData.passportNumber}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 text-sm rounded-lg border ${errors.passportNumber ? "border-red-500" : "border-gray-300"} focus:ring-2 focus:ring-blue-500 transition-all`}
                placeholder=""
              />
              {errors.passportNumber && <p className="text-red-500 text-xs mt-1">{errors.passportNumber}</p>}
            </div>
          )}
        </div>

      </div>
    </div>
  )

  const renderSection2 = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-3 mb-4 pb-2 border-b">
        <Briefcase className="w-6 h-6 text-blue-600" />
        <h2 className="text-lg font-bold text-gray-800">Job Information</h2>
      </div>

      <div className="space-y-8">
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1">Job Type *</label>
          <CustomSelect
            name="jobTitle"
            value={formData.jobTitle}
            onChange={handleInputChange}
            options={jobOptions.map(job => ({ value: job, label: job }))}
            placeholder="Select Job Type"
            error={errors.jobTitle}
          />
          {errors.jobTitle && <p className="text-red-500 text-xs mt-1">{errors.jobTitle}</p>}
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 mb-2">
            Select Exactly 5 Countries * 
            <span className="text-xs font-normal text-gray-500 ml-2">({formData.selectedCountries.length} selected)</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-gray-50 p-6 rounded-2xl border-2 border-gray-100">
            {countryOptions.map(country => (
              <label key={country} className="flex items-center gap-3 group cursor-pointer p-3 rounded-xl hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-100 transition-all">
                <input
                  type="checkbox"
                  name="selectedCountries"
                  value={country}
                  checked={formData.selectedCountries.includes(country)}
                  onChange={handleInputChange}
                  disabled={!formData.selectedCountries.includes(country) && formData.selectedCountries.length >= 5}
                  className="w-5 h-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 disabled:opacity-50"
                />
                <div className="flex items-center gap-2">
                  <div className="w-8 h-6 rounded overflow-hidden border shadow-sm flex-shrink-0 bg-gray-200">
                    <img 
                      src={`/images/${flagMapping[country]}`} 
                      alt={country} 
                      className="w-full h-full object-cover"
                      onError={(e) => e.target.style.display = 'none'}
                    />
                  </div>
                  <span className={`text-sm ${formData.selectedCountries.includes(country) ? "font-bold text-blue-700" : "text-gray-600"} group-hover:text-blue-600 transition-colors`}>
                    {country}
                  </span>
                </div>
              </label>
            ))}
          </div>
          {errors.selectedCountries && <p className="text-red-500 text-xs mt-2 font-bold">{errors.selectedCountries}</p>}
        </div>

        {formData.selectedCountries.length > 0 && (
          <div className="animate-in slide-in-from-top-4 duration-500">
            <h3 className="text-sm font-bold text-gray-600 mb-4 flex items-center gap-2">
              <MapPin className="w-4 h-4" /> Preferred Cities for Selected Countries
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {formData.selectedCountries.map(country => (
                <div key={country} className="p-4 bg-white border-2 border-blue-50 rounded-2xl shadow-sm flex flex-col gap-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-4 rounded-sm overflow-hidden border shadow-sm bg-gray-100">
                        <img src={`/images/${flagMapping[country]}`} alt="" className="w-full h-full object-cover" />
                      </div>
                      <span className="text-xs font-black text-blue-600 uppercase tracking-widest">{country}</span>
                    </div>
                    <Globe size={14} className="text-blue-200" />
                  </div>
                  <CustomSelect
                    name={`city_${country}`}
                    value={formData.selectedCities[country] || ""}
                    onChange={(e) => {
                      const newCities = { ...formData.selectedCities, [country]: e.target.value }
                      setFormData(prev => ({ ...prev, selectedCities: newCities }))
                    }}
                    options={(cityMapping[country] || []).map(city => ({ value: city, label: city }))}
                    placeholder={`Select City in ${country}`}
                    error={!formData.selectedCities[country] && errors.selectedCities}
                  />
                </div>
              ))}
            </div>
            {errors.selectedCities && <p className="text-red-500 text-xs mt-2 font-bold">{errors.selectedCities}</p>}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Contract Type *</label>
            <CustomSelect
              name="contractType"
              value={formData.contractType}
              onChange={handleInputChange}
              options={[
                { value: 'Full-time', label: 'Full-time' },
                { value: 'Part-time', label: 'Part-time' }
              ]}
              placeholder="Select Type"
              error={errors.contractType}
            />
            {errors.contractType && <p className="text-red-500 text-xs mt-1">{errors.contractType}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Contract Length *</label>
            <CustomSelect
              name="contractLength"
              value={formData.contractLength}
              onChange={handleInputChange}
              options={[
                { value: '1 Year', label: '1 Year' },
                { value: '2 Years', label: '2 Years' },
                { value: '3 Years', label: '3 Years' },
                { value: '4 Years', label: '4 Years' },
                { value: '5 Years', label: '5 Years' }
              ]}
              placeholder="Select Duration"
              error={errors.contractLength}
            />
            {errors.contractLength && <p className="text-red-500 text-xs mt-1">{errors.contractLength}</p>}
          </div>
        </div>
      </div>
    </div>
  )

  const renderSection3 = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-3 mb-4 pb-2 border-b">
        <Upload className="w-6 h-6 text-blue-600" />
        <h2 className="text-lg font-bold text-gray-800">Personal Documents</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
        {[
          { id: "profilePhoto", label: "Profile Photo *", icon: <Camera size={20} /> },
          { id: "idCardFront", label: "ID Card Front *", icon: <FileText size={20} /> },
          { id: "idCardBack", label: "ID Card Back *", icon: <FileText size={20} /> },
          { id: "educationalCertificate", label: "Educational Certificate (Optional)", icon: <Globe size={20} /> }
        ].map(doc => (
          <div key={doc.id} className="space-y-2">
            <label className="block text-xs font-bold text-gray-700">{doc.label}</label>
            <div className={`relative border-2 border-dashed rounded-xl p-6 transition-all ${errors[doc.id] ? "border-red-300 bg-red-50" : "border-gray-300 hover:border-blue-400 bg-gray-50"}`}>
              {previews[doc.id] ? (
                <div className="flex flex-col items-center gap-3">
                  {previews[doc.id] === "document" ? (
                    <div className="w-20 h-20 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
                      <FileText size={40} />
                    </div>
                  ) : (
                    <img src={previews[doc.id]} alt={doc.label} className="w-24 h-24 object-cover rounded-lg shadow-md border-2 border-white" />
                  )}
                  <span className="text-xs font-bold text-blue-600 truncate max-w-full">
                    {formData[doc.id]?.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({ ...prev, [doc.id]: null }))
                      setPreviews(prev => ({ ...prev, [doc.id]: null }))
                    }}
                    className="text-red-500 hover:text-red-700 text-xs font-bold flex items-center gap-1"
                  >
                    <X size={14} /> Remove
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3 py-4">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-gray-500">
                    {doc.icon}
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-bold text-gray-700">Click to upload</p>
                    <p className="text-xs text-gray-500 mt-1">JPG, PNG or PDF (Max 5MB)</p>
                  </div>
                  <input
                    type="file"
                    name={doc.id}
                    onChange={handleInputChange}
                    accept="image/*,.pdf"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
              )}
            </div>
            {errors[doc.id] && <p className="text-red-500 text-xs mt-1">{errors[doc.id]}</p>}
          </div>
        ))}
      </div>
    </div>
  )

  const renderSection4 = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-3 mb-4 pb-2 border-b">
        <DollarSign className="w-6 h-6 text-blue-600" />
        <h2 className="text-lg font-bold text-gray-800">Salary & Benefits</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1">Monthly Salary *</label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              name="monthlySalary"
              value={formData.monthlySalary}
              onChange={handleInputChange}
              className={`w-full pl-9 pr-4 py-2.5 rounded-lg border ${errors.monthlySalary ? "border-red-500" : "border-gray-300"} focus:ring-2 focus:ring-blue-500 transition-all`}
              placeholder=""
            />
          </div>
          {errors.monthlySalary && <p className="text-red-500 text-xs mt-1">{errors.monthlySalary}</p>}
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1">Hours per week *</label>
          <div className="relative">
            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              name="workingHours"
              value={formData.workingHours}
              onChange={handleInputChange}
              className={`w-full pl-9 pr-4 py-2.5 rounded-lg border ${errors.workingHours ? "border-red-500" : "border-gray-300"} focus:ring-2 focus:ring-blue-500 transition-all`}
              placeholder=""
            />
          </div>
          {errors.workingHours && <p className="text-red-500 text-xs mt-1">{errors.workingHours}</p>}
        </div>

        {["accommodation", "transport", "food"].map(benefit => (
          <div key={benefit} className="space-y-2">
            <label className="block text-xs font-bold text-gray-700 capitalize">
              {benefit === "accommodation" ? "Accommodation / House for living" : benefit} *
            </label>
            <div className="flex gap-6">
              {["Yes", "No"].map(option => (
                <label key={option} className="flex items-center gap-2 cursor-pointer group">
                  <input
                    type="radio"
                    name={benefit}
                    value={option}
                    checked={formData[benefit] === option}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium group-hover:text-blue-600 transition-colors">{option}</span>
                </label>
              ))}
            </div>
            {errors[benefit] && <p className="text-red-500 text-xs mt-1">{errors[benefit]}</p>}
          </div>
        ))}
      </div>
    </div>
  )

  const renderSection5 = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-3 mb-4 pb-2 border-b">
        <Globe className="w-6 h-6 text-blue-600" />
        <h2 className="text-lg font-bold text-gray-800">International Process</h2>
      </div>

      <div className="space-y-8">
        <div className="space-y-3">
          <label className="block text-xs font-bold text-gray-700">Visa Provided by Company? *</label>
          <div className="flex gap-8">
            {["Yes", "No"].map(option => (
              <label key={option} className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="radio"
                  name="visaProvidedByCompany"
                  value={option}
                  checked={formData.visaProvidedByCompany === option}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-bold group-hover:text-blue-600">{option}</span>
              </label>
            ))}
          </div>
          {errors.visaProvidedByCompany && <p className="text-red-500 text-xs mt-1">{errors.visaProvidedByCompany}</p>}
        </div>

        <div className="space-y-3">
          <label className="block text-xs font-bold text-gray-700">Work Permit *</label>
          <div className="flex gap-8">
            {["Yes", "No"].map(option => (
              <label key={option} className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="radio"
                  name="workPermit"
                  value={option}
                  checked={formData.workPermit === option}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-bold group-hover:text-blue-600">{option}</span>
              </label>
            ))}
          </div>
          {errors.workPermit && <p className="text-red-500 text-xs mt-1">{errors.workPermit}</p>}
        </div>

        <div className="space-y-3">
          <label className="block text-xs font-bold text-gray-700">Flight Ticket *</label>
          <div className="flex gap-8">
            {["Company", "Employee"].map(option => (
              <label key={option} className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="radio"
                  name="flightTicket"
                  value={option}
                  checked={formData.flightTicket === option}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-bold group-hover:text-blue-600">{option}</span>
              </label>
            ))}
          </div>
          {errors.flightTicket && <p className="text-red-500 text-xs mt-1">{errors.flightTicket}</p>}
        </div>
      </div>
    </div>
  )

  const renderSection6 = () => {
    if (codeError) {
      return (
        <div className="animate-in zoom-in duration-500">
          <div className="bg-red-50 border-2 border-red-200 rounded-[2rem] p-8 text-center space-y-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-2">
              <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <h3 className="text-2xl font-black text-red-900">Verification Failed</h3>
            <p className="text-red-700 font-medium leading-relaxed max-w-md mx-auto">
              No active payment was found for the phone number <span className="font-bold underline">+251{formData.phoneNumber}</span>. 
              Please pay the submission fee to proceed.
            </p>
            
            <div className="flex justify-center pt-4">
              <button
                type="button"
                onClick={() => navigate("/registration-payment")}
                className="px-12 py-4 bg-red-600 text-white rounded-2xl font-black text-lg hover:bg-red-700 shadow-xl shadow-red-200 transition-all flex items-center justify-center gap-3"
              >
                <CreditCard size={22} /> Pay Now
              </button>
            </div>
          </div>
        </div>
      )
    }

    return (
      <div className="animate-in fade-in slide-in-from-bottom-10 duration-700">
        <div className="bg-white rounded-[2rem] border-2 border-gray-100 shadow-xl overflow-hidden">
          {/* Header Banner - White & Clean */}
          <div className="p-10 text-center border-b border-gray-100 relative">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-50 rounded-2xl mb-4">
              <Bell className="w-7 h-7 text-blue-600 animate-bounce" />
            </div>
            <h3 className="text-2xl font-black uppercase tracking-tight text-gray-900">Official Notification</h3>
            <p className="text-gray-400 font-bold text-xs uppercase tracking-widest mt-1">Legally Required Action</p>
          </div>

          <div className="p-8 sm:p-12 space-y-10 text-center">
            <div className="space-y-6">
              <p className="text-lg font-bold text-gray-800">
                Dear <span className="text-blue-600">{formData.fullName || "Sir/Madam"}</span>,
              </p>
              <p className="text-gray-600 leading-relaxed font-medium">
                You have officially agreed to work in your selected countries. To send your agreement for acceptance, 
                you must pay the <span className="font-black text-blue-700">Submission Fee</span> yourself.
              </p>
              
              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 space-y-4">
                <div className="flex items-center gap-3 text-blue-800 font-black text-sm uppercase tracking-widest justify-center">
                  <ShieldCheck size={20} className="text-blue-600" />
                  International Company Benefits
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-xl shadow-sm border border-blue-100">
                    <Truck className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                    <span className="text-[10px] font-black text-gray-500 uppercase block">Visa Process</span>
                  </div>
                  <div className="bg-white p-4 rounded-xl shadow-sm border border-blue-100">
                    <Ticket className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                    <span className="text-[10px] font-black text-gray-500 uppercase block">Flight Ticket</span>
                  </div>
                </div>
                <p className="text-xs text-blue-700 font-bold leading-relaxed px-2">
                  The hiring company in your selected country covers all subsequent process costs starting from flight tickets and visa fees. 
                  You will repay these costs from your monthly salary after you start working there.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate("/registration-payment")}
              className="w-full py-5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl font-black text-xl shadow-xl shadow-blue-200 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 group"
            >
              <CreditCard size={26} /> Pay Submission Fee <ArrowRight className="group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    )
  }

  const renderSection7 = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-3 mb-4 pb-2 border-b">
        <ClipboardCheck className="w-6 h-6 text-blue-600" />
        <h2 className="text-lg font-bold text-gray-800">My Confirmation</h2>
      </div>

      <div className="bg-gray-50 border-2 border-gray-200 rounded-2xl p-8 space-y-8">
        <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 shadow-sm">
          <p className="text-gray-700 leading-relaxed text-sm font-semibold text-center italic">
            “I agree that all my information is true and correct. I officially accept all the terms of this work agreement.”
          </p>
        </div>

        <label className="flex items-center gap-3 cursor-pointer group bg-white p-3.5 rounded-xl border-2 border-transparent hover:border-blue-500 transition-all shadow-sm ring-1 ring-gray-100">
          <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all flex-shrink-0 ${formData.declarationAgreed ? "bg-blue-600 border-blue-600" : "border-gray-300 group-hover:border-blue-500"}`}>
            {formData.declarationAgreed && <CheckCircle size={16} className="text-white" />}
          </div>
          <input
            type="checkbox"
            name="declarationAgreed"
            checked={formData.declarationAgreed}
            onChange={handleInputChange}
            className="hidden"
          />
          <span className="text-sm font-bold text-gray-800 group-hover:text-blue-600">I Agree *</span>
        </label>
        {errors.declarationAgreed && <p className="text-red-500 text-sm mt-1 font-bold text-center">{errors.declarationAgreed}</p>}
      </div>
    </div>
  )

  const renderSection9 = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-3 mb-4 pb-2 border-b">
        <Shield className="w-6 h-6 text-blue-600" />
        <h2 className="text-lg font-bold text-gray-800">Account Security</h2>
      </div>

      <div className="bg-white border-2 border-gray-100 rounded-2xl p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Create Password *</label>
            <div className="relative">
              <Shield className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className={`w-full pl-9 pr-10 py-2.5 rounded-lg border ${errors.password ? "border-red-500" : "border-gray-300"} focus:ring-2 focus:ring-blue-500`}
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">Confirm Password *</label>
            <div className="relative">
              <Shield className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type={showPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleInputChange}
                className={`w-full pl-9 pr-10 py-2.5 rounded-lg border ${errors.confirmPassword ? "border-red-500" : "border-gray-300"} focus:ring-2 focus:ring-blue-500`}
                placeholder="••••••••"
              />
            </div>
            {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
          </div>
        </div>
        <p className="text-xs text-gray-500 italic">This password will be used to access your application dashboard later.</p>
      </div>
    </div>
  )

  const renderSignaturePad = () => {
    const startDrawing = (e) => {
      const canvas = canvasRef.current
      const rect = canvas.getBoundingClientRect()
      const clientX = e.clientX || (e.touches && e.touches[0].clientX)
      const clientY = e.clientY || (e.touches && e.touches[0].clientY)
      
      if (clientX === undefined || clientY === undefined) return
      
      const x = clientX - rect.left
      const y = clientY - rect.top
      const ctx = canvas.getContext('2d')
      ctx.beginPath()
      ctx.moveTo(x, y)
      setIsDrawing(true)
    }

    const draw = (e) => {
      if (!isDrawing) return
      const canvas = canvasRef.current
      const rect = canvas.getBoundingClientRect()
      const clientX = e.clientX || (e.touches && e.touches[0].clientX)
      const clientY = e.clientY || (e.touches && e.touches[0].clientY)
      
      if (clientX === undefined || clientY === undefined) return

      const x = clientX - rect.left
      const y = clientY - rect.top
      const ctx = canvas.getContext('2d')
      ctx.lineTo(x, y)
      ctx.stroke()
    }

    const stopDrawing = () => {
      if (!isDrawing) return
      setIsDrawing(false)
      const canvas = canvasRef.current
      const dataUrl = canvas.toDataURL()
      setFormData(prev => ({ ...prev, signatureData: dataUrl }))
      // Auto-open face verification modal after signature is done
      setTimeout(() => setShowFaceModal(true), 600)
    }

    const clearCanvas = () => {
      const canvas = canvasRef.current
      const ctx = canvas.getContext('2d')
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      setFormData(prev => ({ ...prev, signatureData: "" }))
    }

    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3 mb-4 pb-2 border-b">
          <PenTool className="w-6 h-6 text-blue-600" />
          <h2 className="text-lg font-bold text-gray-800">Sign with your finger</h2>
        </div>
        
        <div className="bg-white border-2 border-dashed border-blue-200 rounded-2xl p-2 sm:p-4 flex flex-col items-center gap-3 shadow-sm">
          <canvas
            ref={canvasRef}
            width={320}
            height={160}
            className="bg-gray-50 rounded-xl shadow-inner cursor-crosshair touch-none border border-gray-100"
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseOut={stopDrawing}
            onTouchStart={startDrawing}
            onTouchMove={draw}
            onTouchEnd={stopDrawing}
          />
          <div className="flex justify-between w-full max-w-[600px] items-center">
            <p className="text-xs text-gray-500 font-medium italic">Please use your finger to sign here</p>
            <button
              type="button"
              onClick={clearCanvas}
              className="text-xs font-bold text-red-500 hover:text-red-700 flex items-center gap-1"
            >
              <X size={14} /> Clear Signature
            </button>
          </div>
        </div>
        {errors.signatureData && <p className="text-red-500 text-sm font-bold text-center">{errors.signatureData}</p>}
      </div>
    )
  }

  const renderSection = () => {
    switch (currentSection) {
      case 1: return renderSection1()
      case 2: return renderSection2()
      case 3: return renderSection3()
      case 4: return renderSection4()
      case 5: return renderSection5()
      case 6: return (
        <div className="space-y-12">
          {renderSection7()}
          {formData.declarationAgreed && (
            <div className="animate-in slide-in-from-top-8 duration-700">
              {renderSignaturePad()}
            </div>
          )}
          {formData.signatureData && formData.faceVerified && (
            <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-4 flex items-center gap-4 animate-in zoom-in duration-500">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
              </div>
              <div>
                <p className="font-bold text-green-800 text-sm">Identity Verified</p>
                <p className="text-xs text-green-600">Your face matched your profile photo.</p>
              </div>
            </div>
          )}
          {formData.signatureData && !formData.faceVerified && (
            <button
              type="button"
              onClick={() => setShowFaceModal(true)}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold flex items-center justify-center gap-3 shadow-lg shadow-blue-200 transition-all active:scale-95 animate-in slide-in-from-bottom-4 duration-500"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              Start Face Verification
            </button>
          )}
          {errors.faceVerified && <p className="text-red-500 text-sm font-bold text-center mt-2">{errors.faceVerified}</p>}
        </div>
      )
      case 7: return (
        <div className="animate-in zoom-in duration-500">
          <div className="bg-white rounded-[2rem] p-8 sm:p-10 border-2 border-gray-100 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-full blur-3xl -mr-16 -mt-16"></div>
            
            <div className="relative z-10 space-y-10">
              <div className="text-center space-y-3">
                <div className="inline-flex items-center justify-center w-14 h-14 bg-blue-50 rounded-2xl mb-2">
                  <ClipboardCheck className="w-7 h-7 text-blue-600" />
                </div>
                <h3 className="text-2xl font-black text-gray-900 tracking-tight uppercase">Work Agreement Summary</h3>
                <p className="text-gray-500 font-bold text-sm max-w-md mx-auto leading-relaxed">
                  I hereby confirm my readiness to work in any of the following 5 countries and their respective cities as part of this official agreement.
                </p>
              </div>

              <div className="space-y-4">
                {formData.selectedCountries.map((country, index) => (
                  <div key={country} className="flex items-center gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-200 group hover:border-blue-300 hover:bg-white transition-all duration-300">
                    <div className="w-12 h-12 rounded-xl overflow-hidden shadow-sm border border-gray-200 flex-shrink-0">
                      <img 
                        src={`/images/${flagMapping[country] || 'placeholder.png'}`} 
                        alt={country}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-black text-blue-600 uppercase tracking-widest mb-1">{country}</p>
                      <p className="text-lg font-black text-gray-900 truncate">{formData.selectedCities[country]}</p>
                    </div>
                    <div className="bg-green-100 p-2 rounded-full text-green-600">
                      <CheckCircle size={18} />
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-blue-600 rounded-[1.5rem] p-6 text-white shadow-xl shadow-blue-100 flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-4">
                  <div className="w-24 h-12 bg-white rounded-xl p-1 shadow-inner overflow-hidden">
                    <img src={formData.signatureData} className="w-full h-full object-contain" alt="Signature" />
                  </div>
                  <div className="text-left">
                    <p className="text-[10px] uppercase font-black text-blue-100 tracking-widest">My Signature</p>
                    <p className="text-sm font-bold">I confirmed this agreement</p>
                  </div>
                </div>
                <p className="text-xs font-bold text-blue-100 italic opacity-90">Please proceed to finalize submission</p>
              </div>
            </div>
          </div>
        </div>
      )
      case 8: return renderSection6()
      case 9: return renderSection9()
      default: return renderSection1()
    }
  }

  return (
    <div className="w-full bg-white font-sans py-4 px-2 sm:px-6">
      {/* Face Verification Modal */}
      {showFaceModal && (
        <FaceVerification
          profilePhoto={formData.profilePhoto}
          onVerified={() => {
            setFormData(prev => ({ ...prev, faceVerified: true }))
            setShowFaceModal(false)
          }}
          onClose={() => setShowFaceModal(false)}
        />
      )}
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="text-center mb-6">
          <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight mb-2 uppercase">
            Employment Agreement
          </h1>
        </div>

        {/* Form Container */}
        <div className="w-full">
          
          <div className="py-2">
            
            {renderProgressBar()}

            <form onSubmit={handleSubmit}>
              {renderSection()}

              {/* Error/Success Messages */}
              {submitMessage.message && (
                <div className={`mt-8 p-4 rounded-xl flex items-center gap-3 animate-in zoom-in duration-300 ${
                  submitMessage.type === "error" ? "bg-red-50 text-red-700 border border-red-200" : 
                  submitMessage.type === "success" ? "bg-green-50 text-green-700 border border-green-200" : 
                  "bg-blue-50 text-blue-700 border border-blue-200"
                }`}>
                  {submitMessage.type === "error" ? <AlertCircle size={20} /> : <CheckCircle size={20} />}
                  <div className="flex-1">
                    <p className="font-bold">{submitMessage.message}</p>
                    {submitMessage.applicationNumber && (
                      <p className="text-xs font-mono mt-1 opacity-80">Application ID: {submitMessage.applicationNumber}</p>
                    )}
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="mt-8 flex flex-col sm:flex-row gap-4 items-center justify-between pt-4 border-t">
                {currentSection > 1 && (
                  <button
                    type="button"
                    onClick={handleBack}
                    className="w-full sm:w-auto px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 text-sm"
                  >
                    <ArrowLeft size={20} /> Back
                  </button>
                )}
                
                <div className="w-full sm:w-auto ml-auto">
                  {currentSection === 8 ? null : currentSection < 9 ? (
                    <button
                      type="button"
                      onClick={handleNext}
                      className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-200 transition-all active:scale-95 group text-sm"
                    >
                      {currentSection === 6 ? "Proceed" : currentSection === 7 ? "Send the Agreement" : "Next Section"} <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full sm:w-auto px-6 py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-green-200 transition-all active:scale-95 disabled:opacity-70 text-sm"
                    >
                      {loading ? (
                        <>
                          <Loader2 size={20} className="animate-spin" /> Submitting...
                        </>
                      ) : (
                        <>
                          Register Applicant <CheckCircle size={20} />
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>

        {/* Footer Info */}
        <p className="mt-8 text-center text-gray-500 text-sm font-medium">
          Official Employment Agreement Platform &copy; {new Date().getFullYear()}
        </p>
      </div>
    </div>
  )
}