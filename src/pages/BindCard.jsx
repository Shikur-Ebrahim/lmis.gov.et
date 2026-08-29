import React, { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { doc, getDoc, updateDoc, setDoc, collection, query, where, getDocs } from "firebase/firestore"
import { db } from "../config/firebase"
import { korixaDb } from "../config/korixa"
import { ArrowLeft, CreditCard, ShieldCheck, AlertCircle, Info, Loader2, CheckCircle, Lock, XCircle, DollarSign, BadgeCheck, Eye, EyeOff } from "lucide-react"

export default function BindCard() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [lang, setLang] = useState('am')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showDetails, setShowDetails] = useState(false)

  const [cardData, setCardData] = useState({
    cardNumber: "",
    holderName: "",
    expiryDate: "",
    cvv: ""
  })

  const [existingCard, setExistingCard] = useState(null)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const texts = {
    en: {
      title: "Bind Your VISA Card",
      subtitle: "Your payment for working abroad will be sent directly to this card. Please bind your card now.",
      infoTitle: "Important",
      infoBody: "After completing the process, the company will deposit your payments to this card. If you don't have a card yet, get one at korixapay.com",
      cardNumber: "Card Number",
      cardHolder: "Card Holder Name",
      validThru: "Valid Thru",
      cvv: "CVV",
      bind: "Verify & Bind Card",
      verifying: "Verifying with Korixa...",
      alreadyBound: "Card Successfully Bound",
      alreadyBoundDesc: "Your Elite Black Card has been verified and connected. Payments will be sent to this card.",
      cardInUseLmis: "This card is already bound to another applicant in our system.",
      cardNotFound: "Card not found in Korixa. Please check your card number and try again.",
      cardNotBlack: "❌ Only Elite Black Card (Black Tier) is accepted. Silver, Gold and other tiers are NOT eligible. Please upgrade your card at korixapay.com",
      cardFrozen: "This card is currently frozen. Please unfreeze it in your Korixa app first.",
      cvvMismatch: "CVV does not match. Please check and try again.",
      expiryMismatch: "Expiry date does not match. Please check and try again.",
      holderMismatch: "Card holder name does not match the registered name on the card.",
      invalidCard: "Please enter a valid 16-digit card number.",
      success: "✅ Card verified and bound successfully!",
      noCard: "Don't have a card? Get yours at korixapay.com",
      balanceLabel: "Card Balance",
      tierLabel: "Card Tier",
      holderLabel: "Card Holder",
      expiresLabel: "Expires",
      verifiedBy: "Verified by Korixa",
      cardLabel: "Card",
      toggleVisible: "Show details",
      toggleHidden: "Hide details",
      emptyHolder: "CARD HOLDER",
      emptyExpiry: "MM/YY"
    },
    am: {
      title: "ቪዛ ካርድዎን ያገናኙ",
      subtitle: "በውጭ ሀገር ለሚሰሩት ክፍያ ቀጥታ ወደዚህ ካርድ ይተላለፋል። አሁን ካርድዎን ያገናኙ።",
      infoTitle: "አስፈላጊ ማሳሰቢያ",
      infoBody: "ሂደቱን ከጨረሱ በኋላ፣ ኩባንያው ክፍያዎን ወደዚህ ካርድ ያስተላልፋል። ካርድ ከሌለዎት korixapay.com ላይ ያውጡ።",
      cardNumber: "የካርድ ቁጥር",
      cardHolder: "የካርድ ባለቤት ስም",
      validThru: "ያበቃበት ቀን",
      cvv: "CVV",
      bind: "ያረጋግጡ እና ያገናኙ",
      verifying: "በKorixa እያረጋገጡ...",
      alreadyBound: "ካርድ ተያይዟል",
      alreadyBoundDesc: "የኤሊት ብላክ ካርድዎ ተረጋግጦ ተገናኝቷል። ክፍያዎ ወደዚህ ካርድ ይላካል።",
      cardInUseLmis: "ይህ ካርድ ቀደም ብሎ በሌላ አመልካች ተምዝግቧል።",
      cardNotFound: "ካርዱ በKorixa አልተገኘም። የካርድ ቁጥሩን ያረጋግጡ እና እንደገና ይሞክሩ።",
      cardNotBlack: "❌ ኤሊት ብላክ ካርድ (Black Tier) ብቻ ተቀባይነት አለው። ሲልቨር፣ ጎልድ እና ሌሎች ደረጃዎች ብቁ አይደሉም። ካርድዎን በkorixapay.com ያሻሽሉ።",
      cardFrozen: "ይህ ካርድ አሁን ቀዝቅዟል። በKorixa መተግበሪያዎ ውስጥ ቀደም ብለው ያቅሉ።",
      cvvMismatch: "CVV አይዛመድም። እባክዎ ያረጋግጡ እና እንደገና ይሞክሩ።",
      expiryMismatch: "የማብቂያ ቀን አይዛመድም። እባክዎ ያረጋግጡ እና እንደገና ይሞክሩ።",
      holderMismatch: "የካርድ ባለቤት ስም ከካርዱ ላይ ካለው ስም ጋር አይዛመድም።",
      invalidCard: "እባክዎ ትክክለኛ ባለ 16-ዲጂት የካርድ ቁጥር ያስገቡ።",
      success: "✅ ካርዱ ተረጋግጦ በተሳካ ሁኔታ ተገናኝቷል!",
      noCard: "ካርድ የለዎትም? korixapay.com ላይ ያግኙ",
      balanceLabel: "የካርድ ቀሪ ሂሳብ",
      tierLabel: "የካርድ ደረጃ",
      holderLabel: "የካርድ ባለቤት",
      expiresLabel: "የሚያበቃበት ቀን",
      verifiedBy: "በKorixa ተረጋግጧል",
      cardLabel: "ካርድ",
      toggleVisible: "መረጃ አሳይ",
      toggleHidden: "መረጃ ደብቅ",
      emptyHolder: "የካርድ ባለቤት",
      emptyExpiry: "ወር/ዓ.ም"
    }
  }

  const t = (key) => texts[lang][key] || texts.en[key] || key

  useEffect(() => {
    const fetchUser = async () => {
      try {
        if (!id) return
        const userDoc = await getDoc(doc(db, "users", id))
        if (userDoc.exists()) {
          const data = userDoc.data()
          if (data.visaCard) {
            setExistingCard(data.visaCard)
            // Fetch latest balance from korixa if bound
            try {
              const q = query(collection(korixaDb, "userCards"), where("cardNumber", "==", data.visaCard.cardNumber))
              const snap = await getDocs(q)
              if (!snap.empty) {
                const kCard = snap.docs[0].data()
                setExistingCard(prev => ({ ...prev, balance: kCard.balance ?? 0 }))
              }
            } catch(e) {
              console.log("Could not fetch latest balance")
            }
          }
        }
      } catch (err) {
        console.error("Error fetching user data", err)
      } finally {
        setLoading(false)
      }
    }
    fetchUser()
  }, [id])

  const formatCardNumber = (value) => {
    const v = value.replace(/\D/g, '').slice(0, 16)
    return v.replace(/(.{4})/g, '$1 ').trim()
  }

  const formatExpiry = (value) => {
    const v = value.replace(/\D/g, '').slice(0, 4)
    if (v.length >= 3) return `${v.slice(0, 2)}/${v.slice(2)}`
    return v
  }

  const maskCardNumber = (number) => {
    if (!number) return "••••  ••••  ••••  ••••"
    const raw = number.replace(/\s/g, '')
    if (raw.length < 4) return "••••  ••••  ••••  ••••"
    return `••••  ••••  ••••  ${raw.slice(-4)}`
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name === "cardNumber") {
      setCardData(prev => ({ ...prev, cardNumber: formatCardNumber(value) }))
    } else if (name === "expiryDate") {
      setCardData(prev => ({ ...prev, expiryDate: formatExpiry(value) }))
    } else if (name === "cvv") {
      setCardData(prev => ({ ...prev, cvv: value.replace(/\D/g, '').slice(0, 4) }))
    } else if (name === "holderName") {
      setCardData(prev => ({ ...prev, holderName: value.toUpperCase() }))
    }
  }

  const verifyWithKorixa = async () => {
    const q = query(
      collection(korixaDb, "userCards"),
      where("cardNumber", "==", cardData.cardNumber)
    )
    const snap = await getDocs(q)

    if (snap.empty) return { valid: false, error: t("cardNotFound") }

    const card = snap.docs[0].data()

    // STRICTLY only tierId "black" is accepted
    if (card.tierId !== "black") {
      return { valid: false, error: t("cardNotBlack") }
    }

    if (card.frozen === true) return { valid: false, error: t("cardFrozen") }
    if (card.cvv !== cardData.cvv) return { valid: false, error: t("cvvMismatch") }
    if (card.expiryDate !== cardData.expiryDate) return { valid: false, error: t("expiryMismatch") }
    if (card.holderName.toUpperCase().trim() !== cardData.holderName.toUpperCase().trim()) {
      return { valid: false, error: t("holderMismatch") }
    }

    return { valid: true, card }
  }

  const handleBindCard = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    const raw = cardData.cardNumber.replace(/\s/g, '')
    if (raw.length !== 16) {
      setError(t("invalidCard"))
      return
    }

    setSaving(true)
    try {
      // Step 1: Check if card already used in LMIS by another user
      const lmisQ = query(collection(db, "users"), where("visaCard.cardNumber", "==", cardData.cardNumber))
      const lmisSnap = await getDocs(lmisQ)
      if (!lmisSnap.empty) {
        // Ensure it's not the current user who already bound it
        const usedByOther = lmisSnap.docs.some(d => d.id !== id)
        if (usedByOther) {
          setError(t("cardInUseLmis"))
          setSaving(false)
          return
        }
      }

      // Step 2: Verify card in Korixa (must be tierId: "black")
      const result = await verifyWithKorixa()

      if (!result.valid) {
        setError(result.error)
        setSaving(false)
        return
      }

      // Step 3: Build card payload including balance from Korixa
      const cardPayload = {
        userId: id,
        cardNumber: cardData.cardNumber,
        holderName: cardData.holderName,
        expiryDate: cardData.expiryDate,
        cvv: cardData.cvv,
        tierId: result.card.tierId,          // "black"
        balance: result.card.balance ?? 0,   // from Korixa
        frozen: false,
        displayInAssets: true,
        korixaVerified: true,
        boundAt: new Date().toISOString()
      }

      // Step 4: Save to users.visaCard field
      await updateDoc(doc(db, "users", id), { visaCard: cardPayload })

      // Step 5: Also save to separate "userCard" collection
      await setDoc(doc(collection(db, "userCard"), id), cardPayload)

      setSuccess(t("success"))
      setExistingCard(cardPayload)
    } catch (err) {
      console.error(err)
      setError("Verification failed. Please check your connection and try again.")
    } finally {
      setSaving(false)
    }
  }

  const renderEliteBlackCard = (cNumber, cHolder, cExpiry, cCvv, mask = false, onClick) => {
    const displayNum = mask ? (cNumber ? maskCardNumber(cNumber) : "••••  ••••  ••••  ••••") : (cNumber || "••••  ••••  ••••  ••••");
    const displayExpiry = mask ? "••/••" : (cExpiry || "MM/YY");
    const displayCvv = mask ? "•••" : (cCvv || "•••");
    
    return (
      <div className="flex flex-col items-center w-full">
        <div 
          onClick={onClick}
          className="relative mx-auto aspect-[1.586/1] w-full max-w-[360px] cursor-pointer group"
        >
          {/* Main Card Background */}
          <div className="relative h-full w-full overflow-hidden rounded-2xl sm:rounded-3xl bg-[#1c1d21] shadow-2xl border border-white/5">
            {/* Subtle Diagonal Lines Pattern */}
            <svg
              className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.03]"
              viewBox="0 0 400 250"
              preserveAspectRatio="none"
            >
              {Array.from({ length: 8 }).map((_, i) => (
                <path
                  key={i}
                  d={`M -100 ${50 + i * 40} Q 200 ${100 + i * 20} 500 ${-50 + i * 60}`}
                  fill="none"
                  stroke="white"
                  strokeWidth="1.5"
                />
              ))}
            </svg>

            {/* Gradient Overlay */}
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-black/40" />

            {/* Card Content */}
            <div className="relative flex h-full flex-col p-4 sm:p-6 text-left">
              {/* Top Row */}
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-[8px] sm:text-[10px] font-bold tracking-[0.15em] text-gray-400">KORIXA PAY</p>
                  <p className="mt-0.5 sm:mt-1 text-xs sm:text-sm font-black tracking-wide text-white">ELITE BLACK</p>
                </div>
                {/* Gold Realistic Chip */}
                <div className="relative h-7 w-10 sm:h-9 sm:w-12 rounded-md border border-yellow-500/50 bg-gradient-to-br from-yellow-300 via-yellow-500 to-yellow-600 shadow-inner flex overflow-hidden flex-shrink-0">
                  <div className="absolute inset-0 opacity-40 mix-blend-overlay" 
                       style={{ backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 2px, black 2px, black 4px)' }}></div>
                  <div className="w-1/3 border-r border-yellow-700/40 relative z-10"></div>
                  <div className="w-1/3 border-r border-yellow-700/40 relative z-10"></div>
                  <div className="w-1/3 relative z-10"></div>
                  <div className="absolute h-[1px] w-full bg-yellow-700/40 top-1/2 -mt-[0.5px] z-10"></div>
                </div>
              </div>

              {/* Middle Row: Card Number */}
              <div className="mt-auto mb-3 sm:mb-6">
                <p className="font-mono text-[1.1rem] sm:text-[1.35rem] tracking-[0.1em] sm:tracking-[0.15em] text-white whitespace-nowrap overflow-hidden text-ellipsis">
                  {displayNum}
                </p>
              </div>

              {/* Bottom Row */}
              <div className="flex items-end justify-between">
                <div className="space-y-2 sm:space-y-4">
                  {/* Holder */}
                  <div>
                    <p className="text-[7px] sm:text-[9px] uppercase tracking-wider text-gray-500">CARD HOLDER</p>
                    <p className="text-[9px] sm:text-xs font-bold uppercase tracking-wider text-white mt-0.5 max-w-[150px] sm:max-w-[180px] truncate">
                      {cHolder || t("emptyHolder")}
                    </p>
                  </div>
                  {/* Valid Thru & CVV */}
                  <div className="flex gap-4 sm:gap-6">
                    <div>
                      <p className="text-[7px] sm:text-[9px] uppercase tracking-wider text-gray-500">VALID THRU</p>
                      <p className="text-[9px] sm:text-xs font-mono font-medium text-white mt-0.5">{displayExpiry}</p>
                    </div>
                    <div>
                      <p className="text-[7px] sm:text-[9px] uppercase tracking-wider text-gray-500">CVV</p>
                      <p className="text-[9px] sm:text-xs font-mono font-medium text-white mt-0.5">{displayCvv}</p>
                    </div>
                  </div>
                </div>

                {/* Logos */}
                <div className="flex flex-col items-end gap-1 pb-1 sm:pb-2 pr-1">
                  <div className="text-white font-black italic text-base sm:text-xl tracking-tighter">VISA</div>
                  {/* Master Card style overlap circles - Colored */}
                  <div className="flex -mr-1 sm:-mr-2">
                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-red-500/90 mix-blend-screen"></div>
                    <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-yellow-500/90 -ml-2 sm:-ml-3 mix-blend-screen"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Eye Icon in absolute bottom right corner of the CARD (outside padding) */}
            <div className="absolute bottom-1.5 right-2 sm:bottom-2 sm:right-3 p-1.5 text-white/70 group-hover:text-white transition-colors z-20">
              {mask ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
            </div>
          </div>
        </div>
        {/* Helper Text below card */}
        <p className="text-xs text-gray-400 mt-4 font-medium flex items-center justify-center gap-1.5 cursor-pointer" onClick={onClick}>
          {mask ? "Tap card to reveal details" : "Tap card to hide details"}
        </p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 font-sans">

      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-lg mx-auto px-4 py-4 flex justify-between items-center">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors text-gray-600">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => setLang(l => l === 'am' ? 'en' : 'am')}
            className="text-xs font-bold bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-full transition-colors text-gray-700"
          >
            {lang === 'am' ? 'English' : 'አማርኛ'}
          </button>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6">

        {existingCard ? (
          /* ── Already Bound Success State ── */
          <div className="space-y-6 mt-4">

            {/* Card visual matching Korixa Elite Black Card */}
            {renderEliteBlackCard(existingCard.cardNumber, existingCard.holderName, existingCard.expiryDate, existingCard.cvv, !showDetails, () => setShowDetails(!showDetails))}

            {/* Card Details */}
            <div className="bg-white rounded-3xl p-6 space-y-4 shadow-sm border border-gray-100 mt-6">
              {/* Balance */}
              <div className="flex justify-between items-center pb-4 border-b border-gray-50">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-green-500" />
                  <span className="text-gray-500 font-medium text-sm">{t("balanceLabel")}</span>
                </div>
                <span className="font-black text-green-600 text-xl">
                  {showDetails ? `$${existingCard.balance ?? 0}` : '***'}
                </span>
              </div>

              {/* Tier */}
              <div className="flex justify-between items-center pb-4 border-b border-gray-50">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-500 font-medium text-sm">{t("tierLabel")}</span>
                </div>
                <span className="font-black text-white uppercase px-3 py-1 bg-gray-900 rounded-full text-xs tracking-wider">
                  {existingCard.tierId || "BLACK"}
                </span>
              </div>

              {/* Holder */}
              <div className="flex justify-between items-center pb-4 border-b border-gray-50">
                <span className="text-gray-500 font-medium text-sm">{t("holderLabel")}</span>
                <span className="font-bold text-gray-900 text-sm">{existingCard.holderName}</span>
              </div>

              {/* Expires */}
              <div className="flex justify-between items-center pb-2">
                <span className="text-gray-500 font-medium text-sm">{t("expiresLabel")}</span>
                <span className="font-mono font-bold text-gray-900 text-sm">
                  {showDetails ? existingCard.expiryDate : '**/**'}
                </span>
              </div>
            </div>

            {/* Korixa verified badge */}
            {existingCard.korixaVerified && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <BadgeCheck className="w-5 h-5 text-emerald-500" />
                <p className="text-sm font-bold text-emerald-600">{t("verifiedBy")}</p>
              </div>
            )}
          </div>
        ) : (
          <>
            {/* ── Card Form Section ── */}
            <div className="mb-8 mt-4">
              {/* Live Preview */}
              {renderEliteBlackCard(cardData.cardNumber, cardData.holderName, cardData.expiryDate, cardData.cvv, false)}
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
              {/* Only black tier notice */}
              <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 mb-6 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-gray-900 flex-shrink-0 mt-0.5" />
                <p className="text-[12px] text-gray-600 font-semibold leading-relaxed">Black Tier only — Silver & other tiers not accepted.</p>
              </div>

              {/* Form */}
              <form onSubmit={handleBindCard} className="space-y-5">
                {error && (
                  <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex items-start gap-3 text-red-700 text-sm font-medium">
                    <XCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">{t("cardNumber")}</label>
                  <input type="text" name="cardNumber" value={cardData.cardNumber} onChange={handleChange}
                    placeholder="0000 0000 0000 0000" maxLength={19} inputMode="numeric" required
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-gray-900 font-mono text-base placeholder:text-gray-300 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all" />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">{t("cardHolder")}</label>
                  <input type="text" name="holderName" value={cardData.holderName} onChange={handleChange}
                    placeholder="" required
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-gray-900 font-mono uppercase placeholder:text-gray-300 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">{t("validThru")}</label>
                    <input type="text" name="expiryDate" value={cardData.expiryDate} onChange={handleChange}
                      placeholder="MM/YY" maxLength={5} inputMode="numeric" required
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-gray-900 font-mono placeholder:text-gray-300 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">{t("cvv")}</label>
                    <input type="password" name="cvv" value={cardData.cvv} onChange={handleChange}
                      placeholder="•••" maxLength={4} inputMode="numeric" required
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-gray-900 font-mono placeholder:text-gray-300 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all" />
                  </div>
                </div>

                <div className="pt-2">
                  <button type="submit" disabled={saving}
                    className="w-full bg-gray-900 hover:bg-black active:scale-[0.98] text-white font-black py-4 rounded-xl shadow-lg shadow-gray-900/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70">
                    {saving
                      ? <><Loader2 className="w-5 h-5 animate-spin" />{t("verifying")}</>
                      : <><Lock className="w-4 h-4" />{t("bind")}</>}
                  </button>
                </div>
              </form>
            </div>

            {/* Info below form */}
            <div className="space-y-4 mt-6">
              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex gap-3">
                <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-blue-700 mb-1">{t("title")}</p>
                  <p className="text-xs text-blue-600 leading-relaxed">{t("subtitle")}</p>
                </div>
              </div>
              <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex gap-3">
                <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-bold text-amber-700 mb-1">{t("infoTitle")}</p>
                  <p className="text-xs text-amber-600 leading-relaxed">{t("infoBody")}</p>
                </div>
              </div>
              <div className="flex items-center justify-center gap-2">
                <ShieldCheck className="w-4 h-4 text-gray-400" />
                <p className="text-xs text-gray-500 font-medium">Cards are verified against Korixa database</p>
              </div>
              <p className="text-center text-xs text-gray-400 mt-2">{t("noCard")}</p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
