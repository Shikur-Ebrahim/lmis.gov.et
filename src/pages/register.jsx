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
import { useNavigate, useLocation } from "react-router-dom"
import { auth, db } from "../config/firebase"
import { uploadToCloudinary, uploadDocument, validateFile } from "../utils/cloudinary"
import CustomSelect from "../components/CustomSelect"

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

// ─── Bilingual Translations ───────────────────────────────────────────────
const TRANSLATIONS = {
  am: {
    // Header
    title: "የቅጥር ስምምነት",
    langToggle: "English",
    // Progress
    sectionOf: "ክፍል",
    of: "ከ",
    complete: "% ተጠናቋል",
    // Navigation
    back: "ወደ ኋላ",
    next: "ቀጣይ ክፍል",
    proceed: "ቀጥሉ",
    sendAgreement: "ስምምነቱን ይላኩ",
    // Section 1
    sec1Title: "የግል መረጃ",
    fullName: "ሙሉ ስም *",
    dateOfBirth: "የትውልድ ቀን *",
    gender: "ጾታ *",
    selectGender: "ጾታ ይምረጡ",
    male: "ወንድ",
    female: "ሴት",
    phoneNumber: "ስልክ ቁጥር *",
    region: "ክልል *",
    city: "ከተማ *",
    hasPassport: "ፓስፖርት አለዎት? *",
    passportNumber: "የፓስፖርት ቁጥር *",
    hasLaborId: "የሰራተኛ መታወቂያ (Labor ID) አለዎት? *",
    laborIdNumber: "የሰራተኛ መታወቂያ ቁጥር (Labor ID Number) *",
    yes: "አዎ",
    no: "አይ",
    // Section 2
    sec2Title: "የስራ መረጃ",
    jobTitle: "የስራ ርዕስ *",
    selectJob: "ስራ ይምረጡ",
    targetCountries: "የሚፈልጉት አገር (5 ያህሉ) *",
    selectCity: "-- ከተማ ይምረጡ --",
    contractType: "የኮንትራት አይነት *",
    selectContractType: "ኮንትራት አይነት ይምረጡ",
    fullTime: "ሙሉ ጊዜ",
    partTime: "ከፊል ጊዜ",
    contractLength: "የኮንትራት ርዝማኔ *",
    selectContractLength: "ርዝማኔ ይምረጡ",
    // Section 3
    sec3Title: "ግላዊ ሰነዶች",
    profilePhoto: "የፕሮፋይል ፎቶ *",
    idCardFront: "መታወቂያ (ፊት) *",
    idCardBack: "መታወቂያ (ጀርባ) *",
    educationalCert: "የትምህርት ምስክር ወረቀት",
    uploadPhoto: "ፎቶ ይስቀሉ",
    uploadDoc: "ሰነድ ይስቀሉ",
    changePhoto: "ፎቶ ይቀይሩ",
    // Section 4
    sec4Title: "ደሞዝ እና ጥቅማጥቅሞች",
    monthlySalary: "ወርሃዊ ደሞዝ *",
    selectSalary: "ደሞዝ ይምረጡ",
    workingHours: "የስራ ሰዓት *",
    selectHours: "ሰዓቶች ይምረጡ",
    accommodation: "መኖሪያ ቤት *",
    transport: "ትራንስፖርት *",
    food: "ምግብ *",
    // Section 5
    sec5Title: "ዓለም አቀፍ ሂደት",
    visaByCompany: "ቪዛ በኩባንያ *",
    workPermit: "የስራ ፈቃድ *",
    flightTicket: "የበረራ ቲኬት *",
    byCompany: "በኩባንያ",
    byEmployee: "በሰራተኛ",
    // Section 6 - Declaration
    sec6Title: "ማስታወቂያ እና ፊርማ",
    declarationText: "ከላይ የተዘረዘሩት መረጃዎች ትክክለኛ መሆናቸውን አረጋግጣለሁ።",
    iAgree: "ተስማምቻለሁ",
    signHere: "እዚህ ይፈርሙ",
    clearSig: "ፊርማ ሰርዝ",
    faceVerify: "ፊት ማረጋገጫ",
    verified: "ተረጋግጧል ✓",
    // Section 7 - Summary
    sec7Title: "ማጠቃለያ",
    // Section 8 - Code
    sec8Title: "የማቅረቢያ ኮድ",
    submissionCode: "የማቅረቢያ ኮድ *",
    enterCode: "ኮድ ያስገቡ",
    confirmCode: "ኮዱን አረጋግጣለሁ",
    wuklnaAgreeText: "የውክልና ደብዳቤውን ተስማምቻለሁ *",
    errWuklnaAgreed: "እባክዎ ለመቀጠል የውክልና ደብዳቤውን ይስማሙ",
    // Errors
    errFullName: "ሙሉ ስም ያስፈልጋል",
    errDOB: "የትውልድ ቀን ያስፈልጋል",
    errGender: "ጾታ ያስፈልጋል",
    errPhone: "ትክክለኛ 9 አሃዝ ቁጥር ያስፈልጋል (7 ወይም 9 ይጀምሩ)",
    errRegion: "ክልል ያስፈልጋል",
    errCity: "ከተማ ያስፈልጋል",
    errPassport: "ፓስፖርት ያዎት/አላዎት ይምረጡ",
    errPassportNum: "የፓስፖርት ቁጥር ያስፈልጋል",
    errLaborId: "የሰራተኛ መታወቂያ እንዳለዎት/እንደሌለዎት ይምረጡ",
    errLaborIdNum: "የሰራተኛ መታወቂያ ቁጥር ያስፈልጋል",
    errJobTitle: "የስራ ርዕስ ያስፈልጋል",
    errCountries: "5 አገሮች ማስፈለጉ ።",
    errCities: "ለሁሉም አገሮች ከተሞችን ይምረጡ",
    errContractType: "የኮንትራት አይነት ያስፈልጋል",
    errContractLen: "የኮንትራት ርዝማኔ ያስፈልጋል",
    errProfilePhoto: "የፕሮፋይል ፎቶ ያስፈልጋል",
    errIDFront: "መታወቂያ (ፊት) ያስፈልጋል",
    errIDBack: "መታወቂያ (ጀርባ) ያስፈልጋል",
    errSalary: "ወርሃዊ ደሞዝ ያስፈልጋል",
    errHours: "የስራ ሰዓት ያስፈልጋል",
    errAccom: "የመኖሪያ ቤት ምርጫ ያስፈልጋል",
    errTransport: "ትራንስፖርት ምርጫ ያስፈልጋል",
    errFood: "ምግብ ምርጫ ያስፈልጋል",
    errVisa: "የቪዛ መረጃ ያስፈልጋል",
    errWorkPermit: "የስራ ፈቃድ መረጃ ያስፈልጋል",
    errFlight: "የበረራ ቲኬት ምርጫ ያስፈልጋል",
    errDeclaration: "ማስታወቂያን ማረጋገጥ ያስፈልጋል",
    errSignature: "የጣት ፊርማ ያስፈልጋል",
    errFace: "ፊት ማረጋገጫ ያስፈልጋል",
    errCode: "የማቅረቢያ ኮድ ያስፈልጋል",
    errCodeConfirm: "ኮዱን ማረጋገጥ ያስፈልጋል",
    errPassword: "የይለፍ ቃል ያስፈልጋል",
    errPasswordLen: "የይለፍ ቃል ቢያንስ 6 ቁምፊዎች መሆን አለበት",
    errPasswordMatch: "የይለፍ ቃሎች አይዛመዱም",
    // Footer
    footer: "የስራ ስምምነት መድረክ",
    // Jobs
    "Cleaner": "ጽዳት",
    "Security Guard": "የጥበቃ ሰራተኛ",
    "Security Officer": "የጥበቃ ሃላፊ",
    "Driver (Heavy)": "አሽከርካሪ (ከባድ መኪና)",
    "Driver (Light)": "አሽከርካሪ (ቀላል መኪና)",
    "Domestic Worker": "የቤት ሰራተኛ",
    "Housemaid": "የቤት ሰራተኛ",
    "Caregiver": "ተንከባካቢ",
    "Nurse": "ነርስ",
    "Waitress": "አስተናጋጅ (ሴት)",
    "Waiter": "አስተናጋጅ (ወንድ)",
    "Cook / Chef": "ሼፍ / ምግብ አብሳይ",
    "Kitchen Helper": "የኩሽና ረዳት",
    "Dishwasher": "ዕቃ አጣቢ",
    "Receptionist": "እንግዳ ተቀባይ",
    "Sales Associate": "የሽያጭ ባለሙያ",
    "Construction Worker": "የኮንስትራክሽን ሰራተኛ",
    "Electrician": "ኤሌክትሪሻን",
    "Plumber": "የቧንቧ ሰራተኛ",
    "Carpenter": "አናፂ",
    "Mason": "ግንበኛ",
    "Painter": "ቀቢ",
    "AC Technician": "የአየር ማቀዝቀዣ ባለሙያ",
    "General Labor": "አጠቃላይ የጉልበት ሰራተኛ",
    "Warehouse Worker": "የመጋዘን ሰራተኛ",
    "Packer": "አሸጊ",
    "Factory Worker": "የፋብሪካ ሰራተኛ",
    "Agriculture Worker": "የእርሻ ሰራተኛ",
    "Gardener": "አትክልተኛ",
    "Tailor": "ልብስ ሰፊ",
    "1 Year": "1 ዓመት",
    "2 Years": "2 ዓመታት",
    "3 Years": "3 ዓመታት",
    "4 Years": "4 ዓመታት",
    "5 Years": "5 ዓመታት",
    "My Confirmation": "የእኔ ማረጋገጫ",
    "I agree that all my information is true and correct. I officially accept all the terms of this work agreement.": "ሁሉም መረጃዎቼ እውነተኛ እና ትክክለኛ መሆናቸውን እስማማለሁ። የዚህን የስራ ስምምነት ሁሉንም ውሎች በይፋ እቀበላለሁ።",
    "I Agree *": "እስማማለሁ *",
    "Sign with your finger": "በጣትዎ ይፈርሙ",
    "Please use your finger to sign here": "እባክዎ እዚህ ለመፈረም ጣትዎን ይጠቀሙ",
    "Preferred Cities for Selected Countries": "ለተመረጡ አገሮች ተመራጭ ከተሞች",
    // Countries
    "Canada": "ካናዳ", "Germany": "ጀርመን", "United Kingdom": "ዩናይትድ ኪንግደም",
    "France": "ፈረንሳይ", "Netherlands": "ኔዘርላንድስ", "Sweden": "ስዊድን",
    "Norway": "ኖርዌይ", "Denmark": "ዴንማርክ", "Switzerland": "ስዊዘርላንድ",
    "Ireland": "አየርላንድ", "Poland": "ፖላንድ", "Romania": "ሮማኒያ",
    "Hungary": "ሃንጋሪ", "Czech Republic": "ቼክ ሪፐብሊክ", "Slovakia": "ስሎቫኪያ",
    "Portugal": "ፖርቱጋል", "United Arab Emirates (UAE)": "የተባበሩት አረብ ኤምሬትስ (UAE)",
    "Saudi Arabia": "ሳዑዲ አረቢያ", "Qatar": "ኳታር", "Kuwait": "ኩዌት", "Oman": "ኦማን",
    // Middle East Cities
    "Dubai": "ዱባይ", "Abu Dhabi": "አቡ ዳቢ", "Sharjah": "ሻርጃ", "Al Ain": "አል አይን", "Ajman": "አጅማን", "Ras Al Khaimah": "ራስ አል ካይማህ", "Fujairah": "ፉጃይራ", "Umm Al Quwain": "ኡም አል ኩዌን", "Khor Fakkan": "ኮር ፋካን", "Kalba": "ካልባ",
    "Riyadh": "ሪያድ", "Jeddah": "ጅዳ", "Mecca": "መካ", "Medina": "መዲና", "Dammam": "ዳማም", "Taif": "ጣኢፍ", "Tabuk": "ታቡክ", "Buraidah": "ቡራይዳህ", "Khamis Mushait": "ካሚስ ሙሻይት", "Abha": "አብሃ",
    "Doha": "ዶሃ", "Al Rayyan": "አል ራያን", "Al Wakrah": "አል ዋክራ", "Al Khor": "አል ኮር", "Umm Salal": "ኡም ሳላል", "Madinat ash Shamal": "መዲናት አሽ ሻማል", "Al Daayen": "አል ዳየን", "Al Shahaniya": "አል ሻሃኒያ", "Mesaieed": "ሜሳይድ", "Dukhan": "ዱካን",
    "Kuwait City": "ኩዌት ከተማ", "Al Ahmadi": "አል አህማዲ", "Hawalli": "ሃዋሊ", "Al Jahra": "አል ጃህራ", "Al Farwaniyah": "አል ፋርዋኒያ", "Salmiya": "ሳልሚያ", "Mubarak Al-Kabeer": "ሙባረክ አል-ከቢር", "Fahaheel": "ፋሃሂል", "Sabah Al-Salem": "ሳባህ አል-ሳሌም", "Jaleeb Al-Shuyoukh": "ጃሊብ አል-ሹዩክ",
    "Muscat": "ሙስካት", "Salalah": "ሳላላ", "Seeb": "ሲብ", "Bawshar": "ባውሻር", "Sohar": "ሶሃር", "As Suwayq": "አስ ሱዋይቅ", "Ibri": "ኢብሪ", "Saham": "ሳሃም", "Barka": "ባርካ", "Rustaq": "ሩስታቅ",
    // Western Cities
    "Toronto": "ቶሮንቶ", "Montreal": "ሞንትሪያል", "Vancouver": "ቫንኮቨር", "Calgary": "ካልጋሪ", "Edmonton": "ኤድመንተን", "Ottawa": "ኦታዋ", "Winnipeg": "ዊኒፔግ", "Quebec City": "ኩቤክ ከተማ", "Hamilton": "ሃሚልተን", "Kitchener": "ኪችነር",
    "Berlin": "በርሊን", "Hamburg": "ሃምቡርግ", "Munich": "ሙኒክ", "Cologne": "ኮሎኝ", "Frankfurt": "ፍራንክፈርት", "Stuttgart": "ስቱትጋርት", "Düsseldorf": "ዱሰልዶርፍ", "Dortmund": "ዶርትሙንድ", "Essen": "ኤሰን", "Leipzig": "ላይፕዚግ",
    "London": "ለንደን", "Birmingham": "በርሚንግሃም", "Glasgow": "ግላስጎው", "Liverpool": "ሊቨርፑል", "Bristol": "ብሪስቶል", "Manchester": "ማንቸስተር", "Sheffield": "ሼፊልድ", "Leeds": "ሊድስ", "Edinburgh": "ኤዲንብራ", "Leicester": "ሌስተር",
    "Paris": "ፓሪስ", "Marseille": "ማርሴይ", "Lyon": "ሊዮን", "Toulouse": "ቱሉዝ", "Nice": "ኒስ", "Nantes": "ናንት", "Strasbourg": "ስትራስቡርግ", "Montpellier": "ሞንፔሊዬ", "Bordeaux": "ቦርዶ", "Lille": "ሊል",
    "Amsterdam": "አምስተርዳም", "Rotterdam": "ሮተርዳም", "The Hague": "ዘ ሄግ", "Utrecht": "ዩትሬክት", "Eindhoven": "አይንድሆቨን", "Tilburg": "ቲልቡርግ", "Groningen": "ግሮኒንገን", "Almere": "አልሜር", "Breda": "ብሬዳ", "Nijmegen": "ኒጅሜገን",
    "Stockholm": "ስቶክሆልም", "Gothenburg": "ጎተንበርግ", "Malmö": "ማልሞ", "Uppsala": "ኡፕሳላ", "Västerås": "ቫስተራስ", "Örebro": "ኦሬብሮ", "Linköping": "ሊንኮፒንግ", "Helsingborg": "ሄልሲንግቦርግ", "Jönköping": "ዮንኮፒንግ", "Norrköping": "ኖርኮፒንግ",
    "Oslo": "ኦስሎ", "Bergen": "በርገን", "Stavanger": "ስታቫንገር", "Trondheim": "ትሮንድሄም", "Fredrikstad": "ፍሬድሪክስታድ", "Drammen": "ድራመን", "Porsgrunn": "ፖርስግሩን", "Kristiansand": "ክሪስቲያንሳንድ", "Ålesund": "አሌሱንድ", "Tønsberg": "ቶንስበርግ",
    "Copenhagen": "ኮፐንሃገን", "Aarhus": "አርሁስ", "Odense": "ኦዴንሴ", "Aalborg": "አልቦርግ", "Esbjerg": "ኤስብዬርግ", "Randers": "ራንደርስ", "Kolding": "ኮልዲንግ", "Horsens": "ሆርሰንስ", "Vejle": "ቬይሌ", "Roskilde": "ሮስኪልዴ",
    "Zurich": "ዙሪክ", "Geneva": "ጄኔቫ", "Basel": "ባዝል", "Lausanne": "ሎዛን", "Bern": "በርን", "Winterthur": "ዊንተርቱር", "Lucerne": "ሉሰርን", "St. Gallen": "ሴንት ጋለን", "Lugano": "ሉጋኖ", "Biel/Bienne": "ቢኤል/ቢየን",
    "Dublin": "ደብሊን", "Cork": "ኮርክ", "Limerick": "ሊመሪክ", "Galway": "ጋልዌይ", "Waterford": "ዋተርፎርድ", "Drogheda": "ድሮሄዳ", "Dundalk": "ዱንዳልክ", "Swords": "ስዎርድስ", "Bray": "ብሬይ", "Navan": "ናቫን",
    "Warsaw": "ዋርሶ", "Kraków": "ክራኮው", "Łódź": "ሎድዝ", "Wrocław": "ቭሮትስላቭ", "Poznań": "ፖዝናን", "Gdańsk": "ግዳንስክ", "Szczecin": "ሽቼቲን", "Bydgoszcz": "ቢድጎሽች", "Lublin": "ሉብሊን", "Białystok": "ቢያሊስቶክ",
    "Bucharest": "ቡካሬስት", "Cluj-Napoca": "ክሉጅ-ናፖካ", "Timișoara": "ቲሚሾዋራ", "Iași": "ያሺ", "Constanța": "ኮንስታንሳ", "Craiova": "ክራዮቫ", "Brașov": "ብራሾቭ", "Galați": "ጋላቲ", "Ploiești": "ፕሎየስቲ", "Oradea": "ኦራዲያ",
    "Budapest": "ቡዳፔስት", "Debrecen": "ደብረሴን", "Szeged": "ሴጌድ", "Miskolc": "ሚሽኮልፅ", "Pécs": "ፔች", "Győr": "ጂዮር", "Nyíregyháza": "ኒሬጊሃዛ", "Kecskemét": "ኬችከሜት", "Székesfehérvár": "ሴከሽፈሄርቫር", "Szombathely": "ሶምባቴሊ",
    "Prague": "ፕራግ", "Brno": "ብሮኖ", "Ostrava": "ኦስትራቫ", "Pilsen": "ፒልሰን", "Liberec": "ሊቤሬክ", "Olomouc": "ኦሎሞውክ", "České Budějovice": "ቼስኬ ቡዴጆቪሴ", "Hradec Králové": "ህራዴክ ክራሎቬ", "Ústí nad Labem": "ኡስቲ ናድ ላቤም", "Pardubice": "ፓርዱቢሴ",
    "Bratislava": "ብራቲስላቫ", "Košice": "ኮሺሴ", "Prešov": "ፕሬሾቭ", "Žilina": "ዚሊና", "Nitra": "ኒትራ", "Banská Bystrica": "ባንስካ ቢስትሪካ", "Trnava": "ትርናቫ", "Martin": "ማርቲን", "Trenčín": "ትሬንቺን", "Poprad": "ፖፕራድ",
    "Lisbon": "ሊዝበን", "Porto": "ፖርቶ", "Vila Nova de Gaia": "ቪላ ኖቫ ዴ ጋያ", "Amadora": "አማዶራ", "Braga": "ብራጋ", "Funchal": "ፈንቻል", "Coimbra": "ኮይምብራ", "Setúbal": "ሴቱባል", "Almada": "አልማዳ", "Queluz": "ኬሉዝ",
    // Final Sections (Payment, Summary, Verify)
    "Work Agreement Summary": "የስራ ስምምነት ማጠቃለያ",
    "I hereby confirm my readiness to work in any of the following 5 countries and their respective cities as part of this official agreement.": "በዚህ ይፋዊ ስምምነት መሰረት ከዚህ በታች ባሉት 5 አገሮች እና ከተሞቻቸው ውስጥ ለመስራት ፈቃደኛ መሆኔን አረጋግጣለሁ።",
    "My Signature": "ፊርማዬ",
    "I confirmed this agreement": "ይህን ስምምነት አረጋግጫለሁ",
    "Please proceed to finalize submission": "እባክዎ ማቅረቡን ለማጠናቀቅ ይቀጥሉ",
    "Identity Verified": "ማንነት ተረጋግጧል",
    "Your face matched your profile photo.": "ፊትዎ ከፕሮፋይል ፎቶዎ ጋር ተዛምዷል።",
    "Start Face Verification": "የፊት ማረጋገጫ ጀምር",
    "Verification Failed": "ማረጋገጫው አልተሳካም",
    "No active payment was found for the phone number": "ለስልክ ቁጥሩ ምንም ንቁ ክፍያ አልተገኘም",
    "Please pay the submission fee to proceed.": "እባክዎ ለመቀጠል የማቅረቢያ ክፍያ ይክፈሉ።",
    "Pay Now": "አሁን ይክፈሉ",
    "Official Notification": "ይፋዊ ማሳወቂያ",
    "Legally required action": "በህግ የሚፈለግ እርምጃ",
    "Dear": "ውድ",
    "Sir/Madam": "አመልካች",
    "You have officially agreed to work in your selected countries. To send your agreement for acceptance, you must pay the": "በመረጧቸው አገሮች ውስጥ ለመስራት በይፋ ተስማምተዋል። ስምምነትዎን ተቀባይነት እንዲያገኝ ለመላክ መክፈል አለብዎት ",
    "Submission Fee": "የማቅረቢያ ክፍያ",
    "yourself.": "በራስዎ።",
    "International Company Benefits": "የዓለም አቀፍ ኩባንያ ጥቅማጥቅሞች",
    "Visa Process": "የቪዛ ሂደት",
    "Flight Ticket": "የበረራ ቲኬት",
    "The hiring company in your selected country covers all subsequent process costs starting from flight tickets and visa fees. You will repay these costs from your monthly salary after you start working there.": "በመረጡት አገር ያለው ቀጣሪ ኩባንያ ከበረራ ቲኬት እና ከቪዛ ክፍያ ጀምሮ ሁሉንም ቀጣይ የሂደት ወጪዎች ይሸፍናል። እዚያ መስራት ከጀመሩ በኋላ እነዚህን ወጪዎች ከወርሃዊ ደሞዝዎ ይመልሳሉ።",
    "Uploading Documents...": "ሰነዶችን በመጫን ላይ...",
    "Pay Submission Fee": "የማቅረቢያ ክፍያ ይክፈሉ",
  },
  en: {
    title: "Employment Agreement",
    langToggle: "አማርኛ",
    sectionOf: "Section",
    of: "of",
    complete: "% Complete",
    back: "Back",
    next: "Next Section",
    proceed: "Proceed",
    sendAgreement: "Send the Agreement",
    sec1Title: "Personal Information",
    fullName: "Full Name *",
    dateOfBirth: "Date of Birth *",
    gender: "Gender *",
    selectGender: "Select Gender",
    male: "Male",
    female: "Female",
    phoneNumber: "Phone Number *",
    region: "Region *",
    city: "City *",
    hasPassport: "Do you have a Passport? *",
    passportNumber: "Passport Number *",
    hasLaborId: "Do you have a Labor ID? *",
    laborIdNumber: "Labor ID Number *",
    yes: "Yes",
    no: "No",
    sec2Title: "Job Information",
    jobTitle: "Job Title *",
    selectJob: "Select Job",
    targetCountries: "Target Countries (Select 5) *",
    selectCity: "-- Select City --",
    contractType: "Contract Type *",
    selectContractType: "Select Contract Type",
    fullTime: "Full Time",
    partTime: "Part Time",
    contractLength: "Contract Length *",
    selectContractLength: "Select Length",
    sec3Title: "Personal Documents",
    profilePhoto: "Profile Photo *",
    idCardFront: "ID Card Front *",
    idCardBack: "ID Card Back *",
    educationalCert: "Educational Certificate",
    uploadPhoto: "Upload Photo",
    uploadDoc: "Upload Document",
    changePhoto: "Change Photo",
    sec4Title: "Salary & Benefits",
    monthlySalary: "Monthly Salary *",
    selectSalary: "Select Salary",
    workingHours: "Working Hours *",
    selectHours: "Select Hours",
    accommodation: "Accommodation *",
    transport: "Transport *",
    food: "Food *",
    sec5Title: "International Process",
    visaByCompany: "Visa by Company *",
    workPermit: "Work Permit *",
    flightTicket: "Flight Ticket *",
    byCompany: "Company",
    byEmployee: "Employee",
    sec6Title: "Declaration & Signature",
    declarationText: "I confirm that the information provided above is true and accurate.",
    iAgree: "I Agree",
    signHere: "Sign Here",
    clearSig: "Clear Signature",
    faceVerify: "Face Verification",
    verified: "Verified ✓",
    sec7Title: "Summary",
    sec8Title: "Submission Code",
    submissionCode: "Submission Code *",
    enterCode: "Enter Code",
    confirmCode: "I confirm the code",
    errFullName: "Full Name is required",
    errDOB: "Date of Birth is required",
    errGender: "Gender is required",
    errPhone: "Please enter a valid 9-digit number starting with 7 or 9",
    errRegion: "Region is required",
    errCity: "City is required",
    errPassport: "Please specify if you have a passport",
    errPassportNum: "Passport Number is required",
    errLaborId: "Please specify if you have a Labor ID",
    errLaborIdNum: "Labor ID Number is required",
    errJobTitle: "Job Title is required",
    errCountries: "You must select exactly 5 countries",
    errCities: "Please select a city for all countries",
    errContractType: "Contract Type is required",
    errContractLen: "Contract Length is required",
    errProfilePhoto: "Profile Photo is required",
    errIDFront: "ID Card Front is required",
    errIDBack: "ID Card Back is required",
    errSalary: "Monthly Salary is required",
    errHours: "Working Hours is required",
    errAccom: "Accommodation preference is required",
    errTransport: "Transport preference is required",
    errFood: "Food preference is required",
    errVisa: "Visa info is required",
    errWorkPermit: "Work permit info is required",
    errFlight: "Flight ticket preference is required",
    errDeclaration: "You must agree to the declaration",
    errSignature: "Finger signature is required",
    errFace: "Face verification is required to proceed",
    errCode: "Submission Code is required",
    errCodeConfirm: "You must confirm the code",
    wuklnaAgreeText: "I Agree to the Authorization Letter (Wuklna) *",
    errWuklnaAgreed: "Please agree to the Authorization Letter to proceed",
    errPassword: "Password is required",
    errPasswordLen: "Password must be at least 6 characters",
    errPasswordMatch: "Passwords do not match",
    footer: "Official Employment Agreement Platform",
  }
}
// ─────────────────────────────────────────────────────────────────────────────

export default function Register() {
  const navigate = useNavigate()
  const location = useLocation()
  const [lang, setLang] = useState('am')
  const t = (key) => TRANSLATIONS[lang]?.[key] ?? TRANSLATIONS['en'][key] ?? key
  const [currentSection, setCurrentSection] = useState(location.state?.returnToSection || 1) // 1-8
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

  const [previews, setPreviews] = useState({
    profilePhoto: location.state?.applicantData?.profilePhoto || null,
    idCardFront: location.state?.applicantData?.idCardFront || null,
    idCardBack: location.state?.applicantData?.idCardBack || null,
    educationalCertificate: location.state?.applicantData?.educationalCertificate || null
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
    hasLaborId: "", // "Yes" or "No"
    laborIdNumber: "",

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
    wuklnaAgreed: false,

    // Section 7: Declaration
    declarationAgreed: false,
    signatureData: "",
    
    // Auth
    password: "",
    confirmPassword: "",
    ...(location.state?.applicantData || {})
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
      if (!formData.fullName) newErrors.fullName = t('errFullName')
      if (!formData.dateOfBirth) newErrors.dateOfBirth = t('errDOB')
      if (!formData.gender) newErrors.gender = t('errGender')
      if (!formData.phoneNumber) newErrors.phoneNumber = t('errPhone')
      else if (!/^[79]\d{8}$/.test(formData.phoneNumber)) {
        newErrors.phoneNumber = t('errPhone')
      }
      if (!formData.region) newErrors.region = t('errRegion')
      if (!formData.city) newErrors.city = t('errCity')
      if (!formData.hasPassport) newErrors.hasPassport = t('errPassport')
      if (formData.hasPassport === "Yes" && !formData.passportNumber) newErrors.passportNumber = t('errPassportNum')
      if (!formData.hasLaborId) newErrors.hasLaborId = t('errLaborId')
      if (formData.hasLaborId === "Yes" && !formData.laborIdNumber) newErrors.laborIdNumber = t('errLaborIdNum')
    }

    if (section === 2) {
      if (!formData.jobTitle) newErrors.jobTitle = t('errJobTitle')
      if (formData.selectedCountries.length !== 5) newErrors.selectedCountries = t('errCountries')
      formData.selectedCountries.forEach(country => {
        if (!formData.selectedCities[country]) newErrors.selectedCities = t('errCities')
      })
      if (!formData.contractType) newErrors.contractType = t('errContractType')
      if (!formData.contractLength) newErrors.contractLength = t('errContractLen')
    }

    if (section === 3) {
      if (!formData.profilePhoto) newErrors.profilePhoto = t('errProfilePhoto')
      if (!formData.idCardFront) newErrors.idCardFront = t('errIDFront')
      if (!formData.idCardBack) newErrors.idCardBack = t('errIDBack')
    }

    if (section === 4) {
      if (!formData.monthlySalary) newErrors.monthlySalary = t('errSalary')
      if (!formData.workingHours) newErrors.workingHours = t('errHours')
      if (!formData.accommodation) newErrors.accommodation = t('errAccom')
      if (!formData.transport) newErrors.transport = t('errTransport')
      if (!formData.food) newErrors.food = t('errFood')
    }

    if (section === 5) {
      if (!formData.visaProvidedByCompany) newErrors.visaProvidedByCompany = t('errVisa')
      if (!formData.workPermit) newErrors.workPermit = t('errWorkPermit')
      if (!formData.flightTicket) newErrors.flightTicket = t('errFlight')
    }

    if (section === 6) {
      if (!formData.declarationAgreed) newErrors.declarationAgreed = t('errDeclaration')
      if (formData.declarationAgreed && !formData.signatureData) newErrors.signatureData = t('errSignature')
    }

    if (section === 7) { return true }

    if (section === 8) {
      if (!formData.submissionCode) newErrors.submissionCode = t('errCode')
      if (!formData.codeConfirmed) newErrors.codeConfirmed = t('errCodeConfirm')
    }

    if (section === 9) {
      if (!formData.password) newErrors.password = t('errPassword')
      if (formData.password.length < 6) newErrors.password = t('errPasswordLen')
      if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = t('errPasswordMatch')
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
      if (currentSection === 8) {
        handleProceedToPayment()
      } else {
        setCurrentSection(prev => prev + 1)
        window.scrollTo({ top: 0, behavior: "smooth" })
      }
    }
  }

  const handleProceedToPayment = async () => {
    setLoading(true)
    setErrors({})
    setSubmitMessage({ type: "info", message: "Uploading profile photo..." })

    try {
      const profilePhotoUrl = await handleFileUpload(formData.profilePhoto, "profilePhoto")
      if (!profilePhotoUrl) throw new Error("Profile photo upload failed. Please re-upload and try again.")

      setSubmitMessage({ type: "info", message: "Uploading ID card (front)..." })
      const idCardFrontUrl = await handleFileUpload(formData.idCardFront, "idCardFront")
      if (!idCardFrontUrl) throw new Error("ID card front upload failed. Please re-upload and try again.")

      setSubmitMessage({ type: "info", message: "Uploading ID card (back)..." })
      const idCardBackUrl = await handleFileUpload(formData.idCardBack, "idCardBack")
      if (!idCardBackUrl) throw new Error("ID card back upload failed. Please re-upload and try again.")

      setSubmitMessage({ type: "info", message: "Uploading educational certificate..." })
      const educationalCertificateUrl = formData.educationalCertificate
        ? await handleFileUpload(formData.educationalCertificate, "educationalCertificate")
        : ""

      const finalData = {
        ...formData,
        profilePhoto: profilePhotoUrl,
        idCardFront: idCardFrontUrl,
        idCardBack: idCardBackUrl,
        educationalCertificate: educationalCertificateUrl,
        // Remove File objects from formData spread
        signatureData: formData.signatureData || null,
        faceVerified: formData.faceVerified || false,
      }

      // Remove non-serializable and non-database fields before saving
      delete finalData.password
      delete finalData.confirmPassword
      delete finalData.hasLaborId
      delete finalData.laborIdNumber

      setLoading(false)
      navigate("/payment-methods", { 
        state: { 
          phoneNumber: `+251${formData.phoneNumber}`,
          applicantData: finalData
        } 
      })
    } catch (err) {
      setLoading(false)
      setSubmitMessage({ type: "error", message: err.message || "Failed to prepare documents" })
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
    if (typeof file === 'string') return file
    try {
      setUploadProgress(prev => ({ ...prev, [fieldName]: 10 }))
      // Use image upload for all image files; use document upload only for PDFs
      const isImage = file.type.startsWith('image/')
      const result = await (isImage ? uploadToCloudinary(file) : uploadDocument(file))
      setUploadProgress(prev => ({ ...prev, [fieldName]: 100 }))
      if (!result || !result.url) throw new Error('No URL returned from upload')
      return result.url
    } catch (error) {
      console.error(`Upload failed for ${fieldName}:`, error)
      setErrors(prev => ({ ...prev, [fieldName]: `Upload failed: ${error.message}` }))
      return null
    }
  }

  // --- RENDERERS ---

  const renderProgressBar = () => (
    <div className="mb-10 animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="flex justify-between items-center mb-2">
        <span className="text-xs font-bold text-gray-600">{t('sectionOf')} {currentSection} {t('of')} 8</span>
        <span className="text-xs font-medium text-blue-600">
          {Math.round((currentSection / 8) * 100)}{t('complete')}
        </span>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-1.5">
        <div 
          className="bg-blue-600 h-1.5 rounded-full transition-all duration-500 ease-out shadow-sm"
          style={{ width: `${(currentSection / 8) * 100}%` }}
        ></div>
      </div>
    </div>
  )

  const renderSection1 = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-3 mb-4 pb-2 border-b">
        <User className="w-6 h-6 text-blue-600" />
        <h2 className="text-lg font-bold text-gray-800">{t('sec1Title')}</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1">{t('fullName')}</label>
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
          <label className="block text-xs font-bold text-gray-700 mb-1">{t('dateOfBirth')}</label>
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
          <label className="block text-xs font-bold text-gray-700 mb-1">{t('gender')}</label>
          <CustomSelect
            name="gender"
            value={formData.gender}
            onChange={handleInputChange}
            options={[
              { value: 'Male', label: t('male') },
              { value: 'Female', label: t('female') }
            ]}
            placeholder={t('selectGender')}
            error={errors.gender}
          />
          {errors.gender && <p className="text-red-500 text-xs mt-1">{errors.gender}</p>}
        </div>

        <div className="space-y-1">
          <label className="block text-xs font-bold text-gray-700">{t('phoneNumber')}</label>
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
          <label className="block text-xs font-bold text-gray-700 mb-1">{t('region')}</label>
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
          <label className="block text-xs font-bold text-gray-700 mb-1">{t('city')}</label>
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
            <label className="block text-xs font-bold text-gray-700 mb-2">{t('hasPassport')}</label>
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
                <span className="text-sm font-medium">{t('yes')}</span>
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
                <span className="text-sm font-medium">{t('no')}</span>
              </label>
            </div>
            {errors.hasPassport && <p className="text-red-500 text-xs mt-1">{errors.hasPassport}</p>}
          </div>

          {formData.hasPassport === "Yes" && (
            <div className="animate-in slide-in-from-top-2 duration-300">
              <label className="block text-xs font-bold text-gray-700 mb-1">{t('passportNumber')}</label>
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

          <div className="pt-2 border-t border-gray-100">
            <label className="block text-xs font-bold text-gray-700 mb-2">{t('hasLaborId')}</label>
            <div className="flex gap-6">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="hasLaborId"
                  value="Yes"
                  checked={formData.hasLaborId === "Yes"}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-sm font-medium">{t('yes')}</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="hasLaborId"
                  value="No"
                  checked={formData.hasLaborId === "No"}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-blue-600"
                />
                <span className="text-sm font-medium">{t('no')}</span>
              </label>
            </div>
            {errors.hasLaborId && <p className="text-red-500 text-xs mt-1">{errors.hasLaborId}</p>}
          </div>

          {formData.hasLaborId === "Yes" && (
            <div className="animate-in slide-in-from-top-2 duration-300">
              <label className="block text-xs font-bold text-gray-700 mb-1">{t('laborIdNumber')}</label>
              <input
                type="text"
                name="laborIdNumber"
                value={formData.laborIdNumber}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 text-sm rounded-lg border ${errors.laborIdNumber ? "border-red-500" : "border-gray-300"} focus:ring-2 focus:ring-blue-500 transition-all`}
                placeholder=""
              />
              {errors.laborIdNumber && <p className="text-red-500 text-xs mt-1">{errors.laborIdNumber}</p>}
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
        <h2 className="text-lg font-bold text-gray-800">{t('sec2Title')}</h2>
      </div>

      <div className="space-y-8">
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1">{t('jobTitle')}</label>
          <CustomSelect
            name="jobTitle"
            value={formData.jobTitle}
            onChange={handleInputChange}
            options={jobOptions.map(job => ({ value: job, label: t(job) }))}
            placeholder={t('selectJob')}
            error={errors.jobTitle}
          />
          {errors.jobTitle && <p className="text-red-500 text-xs mt-1">{errors.jobTitle}</p>}
        </div>

        <div>
          <label className="block text-xs font-bold text-gray-700 mb-2">
            {t('targetCountries')}
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
                    {t(country)}
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
              <MapPin className="w-4 h-4" /> {t('Preferred Cities for Selected Countries')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {formData.selectedCountries.map(country => (
                <div key={country} className="p-4 bg-white border-2 border-blue-50 rounded-2xl shadow-sm flex flex-col gap-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-4 rounded-sm overflow-hidden border shadow-sm bg-gray-100">
                        <img src={`/images/${flagMapping[country]}`} alt="" className="w-full h-full object-cover" />
                      </div>
                      <span className="text-xs font-semibold text-blue-600">{t(country)}</span>
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
                    options={(cityMapping[country] || []).map(city => ({ value: city, label: t(city) }))}
                    placeholder={t('selectCity')}
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
            <label className="block text-xs font-bold text-gray-700 mb-1">{t('contractType')}</label>
            <CustomSelect
              name="contractType"
              value={formData.contractType}
              onChange={handleInputChange}
              options={[
                { value: 'Full-time', label: t('fullTime') },
                { value: 'Part-time', label: t('partTime') }
              ]}
              placeholder={t('selectContractType')}
              error={errors.contractType}
            />
            {errors.contractType && <p className="text-red-500 text-xs mt-1">{errors.contractType}</p>}
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 mb-1">{t('contractLength')}</label>
            <CustomSelect
              name="contractLength"
              value={formData.contractLength}
              onChange={handleInputChange}
              options={[
                { value: '1 Year', label: t('1 Year') },
                { value: '2 Years', label: t('2 Years') },
                { value: '3 Years', label: t('3 Years') },
                { value: '4 Years', label: t('4 Years') },
                { value: '5 Years', label: t('5 Years') }
              ]}
              placeholder={t('selectContractLength')}
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
        <h2 className="text-lg font-bold text-gray-800">{t('sec3Title')}</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
        {[
          { id: "profilePhoto", label: t('profilePhoto'), icon: <Camera size={20} /> },
          { id: "idCardFront", label: t('idCardFront'), icon: <FileText size={20} /> },
          { id: "idCardBack", label: t('idCardBack'), icon: <FileText size={20} /> },
          { id: "educationalCertificate", label: t('educationalCert'), icon: <Globe size={20} /> }
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
        <h2 className="text-lg font-bold text-gray-800">{t('sec4Title')}</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <label className="block text-xs font-bold text-gray-700 mb-1">{t('monthlySalary')}</label>
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
          <label className="block text-xs font-bold text-gray-700 mb-1">{t('workingHours')}</label>
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
              {benefit === "accommodation" ? t('accommodation') : benefit === "transport" ? t('transport') : t('food')}
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
                  <span className="text-sm font-medium group-hover:text-blue-600 transition-colors">{option === "Yes" ? t('yes') : t('no')}</span>
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
        <h2 className="text-lg font-bold text-gray-800">{t('sec5Title')}</h2>
      </div>

      <div className="space-y-8">
        <div className="space-y-3">
          <label className="block text-xs font-bold text-gray-700">{t('visaByCompany')}</label>
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
                <span className="text-sm font-bold group-hover:text-blue-600">{option === "Yes" ? t('yes') : t('no')}</span>
              </label>
            ))}
          </div>
          {errors.visaProvidedByCompany && <p className="text-red-500 text-xs mt-1">{errors.visaProvidedByCompany}</p>}
        </div>

        <div className="space-y-3">
          <label className="block text-xs font-bold text-gray-700">{t('workPermit')}</label>
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
                <span className="text-sm font-bold group-hover:text-blue-600">{option === "Yes" ? t('yes') : t('no')}</span>
              </label>
            ))}
          </div>
          {errors.workPermit && <p className="text-red-500 text-xs mt-1">{errors.workPermit}</p>}
        </div>

        <div className="space-y-3">
          <label className="block text-xs font-bold text-gray-700">{t('flightTicket')}</label>
          <div className="flex gap-8">
            {[
              { value: "Company", label: t('byCompany') },
              { value: "Employee", label: t('byEmployee') }
            ].map(opt => (
              <label key={opt.value} className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="radio"
                  name="flightTicket"
                  value={opt.value}
                  checked={formData.flightTicket === opt.value}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm font-bold group-hover:text-blue-600">{opt.label}</span>
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
            <h3 className="text-2xl font-black text-red-900">{t('Verification Failed')}</h3>
            <p className="text-red-700 font-medium leading-relaxed max-w-md mx-auto">
              {t('No active payment was found for the phone number')} <span className="font-bold underline">+251{formData.phoneNumber}</span>. 
              {t('Please pay the submission fee to proceed.')}
            </p>
            
            <div className="flex justify-center pt-4">
              <button
                type="button"
                onClick={() => navigate("/payment-methods", { state: { phoneNumber: `+251${formData.phoneNumber}`, applicantData: formData } })}
                className="px-12 py-4 bg-red-600 text-white rounded-2xl font-black text-lg hover:bg-red-700 shadow-xl shadow-red-200 transition-all flex items-center justify-center gap-3"
              >
                <CreditCard size={22} /> {t('Pay Now')}
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
            <h3 className="text-lg font-black text-gray-900">{t('Official Notification')}</h3>
            <p className="text-gray-400 font-medium text-xs mt-1">{t('Legally required action')}</p>
          </div>

          <div className="p-8 sm:p-12 space-y-10 text-center">
            <div className="space-y-6">
              <p className="text-lg font-bold text-gray-800">
                {t('Dear')} <span className="text-blue-600">{formData.fullName || t('Sir/Madam')}</span>,
              </p>
              <p className="text-gray-600 leading-relaxed font-medium">
                {t('You have officially agreed to work in your selected countries. To send your agreement for acceptance, you must pay the')} <span className="font-black text-blue-700">{t('Submission Fee')}</span> {t('yourself.')}
              </p>
              
              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 space-y-4">
                <div className="flex items-center gap-3 text-blue-800 font-bold text-sm justify-center">
                  <ShieldCheck size={20} className="text-blue-600" />
                  {t('International Company Benefits')}
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-4 rounded-xl shadow-sm border border-blue-100">
                    <Truck className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                    <span className="text-[10px] font-semibold text-gray-500 block">{t('Visa Process')}</span>
                  </div>
                  <div className="bg-white p-4 rounded-xl shadow-sm border border-blue-100">
                    <Ticket className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                    <span className="text-[10px] font-semibold text-gray-500 block">{t('Flight Ticket')}</span>
                  </div>
                </div>
                <p className="text-xs text-blue-700 font-bold leading-relaxed px-2">
                  {t('The hiring company in your selected country covers all subsequent process costs starting from flight tickets and visa fees. You will repay these costs from your monthly salary after you start working there.')}
                </p>
              </div>

              {/* WUKLNA IMAGE AND AGREEMENT */}
              <div className="space-y-4">
                <img 
                  src="/wuklna.jpg" 
                  alt="Wuklna / Authorization Letter" 
                  className="w-full h-auto rounded-xl border border-gray-200 shadow-sm pointer-events-none select-none"
                  onContextMenu={(e) => e.preventDefault()}
                  draggable="false"
                  onError={(e) => { e.target.style.display = 'none'; }} 
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleProceedToPayment}
              disabled={loading}
              className="w-full py-5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-2xl font-black text-xl shadow-xl shadow-blue-200 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 group disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="animate-spin h-6 w-6 border-2 border-white border-t-transparent rounded-full" />
                  {t('Uploading Documents...')}
                </>
              ) : (
                <>
                  <CreditCard size={26} /> {t('Pay Submission Fee')} <ArrowRight className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
            {submitMessage.message && (
              <p className={`text-sm font-bold text-center mt-3 ${submitMessage.type === "error" ? "text-red-500" : "text-blue-600"}`}>
                {submitMessage.message}
              </p>
            )}
          </div>
        </div>
      </div>
    )
  }

  const renderSection7 = () => (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex items-center gap-3 mb-4 pb-2 border-b">
        <ClipboardCheck className="w-6 h-6 text-blue-600" />
        <h2 className="text-lg font-bold text-gray-800">{t('My Confirmation')}</h2>
      </div>

      <div className="bg-gray-50 border-2 border-gray-200 rounded-2xl p-8 space-y-8">
        <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100 shadow-sm">
          <p className="text-gray-700 leading-relaxed text-sm font-semibold text-center italic">
            “{t('I agree that all my information is true and correct. I officially accept all the terms of this work agreement.')}”
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
          <span className="text-sm font-bold text-gray-800 group-hover:text-blue-600">{t('I Agree *')}</span>
        </label>
        {errors.declarationAgreed && <p className="text-red-500 text-sm mt-1 font-bold text-center">{errors.declarationAgreed}</p>}
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
          <h2 className="text-lg font-bold text-gray-800">{t('Sign with your finger')}</h2>
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
            <p className="text-xs text-gray-500 font-medium italic">{t('Please use your finger to sign here')}</p>
            <button
              type="button"
              onClick={clearCanvas}
              className="text-xs font-bold text-red-500 hover:text-red-700 flex items-center gap-1"
            >
              <X size={14} /> {t('clearSig')}
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
                <h3 className="text-lg font-black text-gray-900 tracking-tight">{t('Work Agreement Summary')}</h3>
                <p className="text-gray-500 font-bold text-sm max-w-md mx-auto leading-relaxed">
                  {t('I hereby confirm my readiness to work in any of the following 5 countries and their respective cities as part of this official agreement.')}
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
                      <p className="text-xs font-bold text-blue-600 mb-1">{t(country)}</p>
                      <p className="text-lg font-black text-gray-900 truncate">{t(formData.selectedCities[country])}</p>
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
                    <p className="text-[10px] font-semibold text-blue-100">{t('My Signature')}</p>
                    <p className="text-sm font-bold">{t('I confirmed this agreement')}</p>
                  </div>
                </div>
                <p className="text-xs font-bold text-blue-100 italic opacity-90">{t('Please proceed to finalize submission')}</p>
              </div>
            </div>
          </div>
        </div>
      )
      case 8: return renderSection6()
      default: return renderSection1()
    }
  }

  return (
    <div className="w-full bg-white font-sans py-4 px-2 sm:px-6">
      <div className="max-w-4xl mx-auto">
        
        {/* Header */}
        <div className="relative text-center mb-6">
          <h1 className="text-lg sm:text-xl font-extrabold text-gray-900 tracking-tight mb-2">
            {t('title')}
          </h1>
          {/* Language Toggle */}
          <button
            type="button"
            onClick={() => setLang(l => l === 'am' ? 'en' : 'am')}
            className="absolute right-0 top-1/2 -translate-y-1/2 flex items-center gap-1.5 px-3 py-1.5 rounded-full border-2 border-blue-500 bg-white hover:bg-blue-50 transition-all active:scale-95 shadow-sm"
          >
            <span className={`text-xs font-black ${lang === 'am' ? 'text-blue-600' : 'text-gray-400'}`}>አማርኛ</span>
            <span className="text-gray-300 text-xs">|</span>
            <span className={`text-xs font-black ${lang === 'en' ? 'text-blue-600' : 'text-gray-400'}`}>English</span>
          </button>
        </div>

        {/* Form Container */}
        <div className="w-full">
          
          <div className="py-2">
            
            {renderProgressBar()}

              <div>
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
                    <ArrowLeft size={20} /> {t('back')}
                  </button>
                )}
                
                <div className="w-full sm:w-auto ml-auto">
                  {currentSection < 8 && (
                    <button
                      type="button"
                      onClick={handleNext}
                      className="w-full sm:w-auto px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-200 transition-all active:scale-95 group text-sm"
                    >
                      {currentSection === 6 ? t('proceed') : currentSection === 7 ? t('sendAgreement') : t('next')} <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <p className="mt-8 text-center text-gray-500 text-sm font-medium">
          {t('footer')} &copy; {new Date().getFullYear()}
        </p>
      </div>
    </div>
  )
}