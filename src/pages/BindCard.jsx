import React, { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { doc, getDoc, updateDoc, setDoc, collection, query, where, getDocs } from "firebase/firestore"
import { db } from "../config/firebase"
import { korixaDb } from "../config/korixa"
import { ArrowLeft, CreditCard, ShieldCheck, AlertCircle, Info, Loader2, CheckCircle, Lock, XCircle, DollarSign, BadgeCheck } from "lucide-react"

export default function BindCard() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [lang, setLang] = useState('am')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

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
      balance: "Card Balance",
      tier: "Card Tier",
      verifiedBy: "Verified by Korixa"
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
      balance: "የካርድ ቀሪ ሂሳብ",
      tier: "የካርድ ደረጃ",
      verifiedBy: "በKorixa ተረጋግጧል"
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
          if (data.visaCard) setExistingCard(data.visaCard)
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
      // Step 1: Check if card already used in LMIS
      const lmisQ = query(collection(db, "users"), where("visaCard.cardNumber", "==", cardData.cardNumber))
      const lmisSnap = await getDocs(lmisQ)
      if (!lmisSnap.empty) {
        setError(t("cardInUseLmis"))
        setSaving(false)
        return
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white font-sans">

      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-lg mx-auto px-4 py-4 flex justify-between items-center">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-gray-100 transition-colors text-gray-600">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => setLang(l => l === 'am' ? 'en' : 'am')}
            className="text-xs font-bold bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-full transition-colors text-gray-600"
          >
            {lang === 'am' ? 'English' : 'አማርኛ'}
          </button>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-6">

        {existingCard ? (
          /* ── Already Bound Success State ── */
          <div className="space-y-6">
            <div className="text-center pt-4">
              <div className="w-20 h-20 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-10 h-10 text-green-500" />
              </div>
              <h2 className="text-2xl font-black text-gray-900">{t("alreadyBound")}</h2>
              <p className="text-sm text-gray-500 mt-1">{t("alreadyBoundDesc")}</p>
            </div>

            {/* Card visual matching Korixa Elite Black Card */}
            <div className="relative mx-auto aspect-[1.586/1] w-[300px] md:w-[340px] perspective-1000">
              <div className="relative h-full w-full overflow-hidden rounded-2xl sm:rounded-3xl border border-white/10 bg-gradient-to-br from-zinc-900 via-black to-zinc-900 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
                {/* Midnight Pattern SVG */}
                <svg
                  className="pointer-events-none absolute inset-0 h-full w-full opacity-20"
                  viewBox="0 0 400 250"
                  preserveAspectRatio="xMidYMid slice"
                >
                  {Array.from({ length: 12 }).map((_, row) =>
                    Array.from({ length: 18 }).map((_, col) => (
                      <rect
                        key={`${row}-${col}`}
                        x={col * 24 + (row % 2) * 12}
                        y={row * 22}
                        width="14"
                        height="4"
                        rx="2"
                        fill="white"
                        transform={`rotate(${(row + col) * 8} ${col * 24 + 7} ${row * 22 + 2})`}
                      />
                    ))
                  )}
                </svg>

                <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent" />

                <div className="relative flex h-full flex-col justify-between p-4 sm:p-5">
                  <div className="flex items-start justify-between">
                    <div className="text-left">
                      <p className="text-[10px] font-bold uppercase tracking-[0.15em] sm:text-xs text-white">
                        Korixa
                      </p>
                      <p className="mt-0.5 text-[11px] font-medium sm:text-xs text-white/50">
                        Elite Black Card
                      </p>
                    </div>
                    {/* Gold Chip */}
                    <div className="relative h-8 w-10 overflow-hidden rounded-md border border-amber-300/30 bg-gradient-to-br from-amber-200/90 to-amber-500/70 shadow-inner sm:h-9 sm:w-11">
                      <div className="absolute inset-0 grid grid-cols-3 grid-rows-2 gap-px p-1 opacity-40">
                        {Array.from({ length: 6 }).map((_, i) => (
                          <div key={i} className="rounded-sm bg-black/20" />
                        ))}
                      </div>
                    </div>
                  </div>

                  <p className="text-right text-lg font-light tracking-wider sm:text-xl text-white">
                    Premium
                  </p>

                  <div className="space-y-3">
                    <p className="font-mono text-sm tracking-[0.1em] sm:text-base text-white text-left">
                      {existingCard.cardNumber}
                    </p>
                    <div className="flex items-end justify-between gap-2 text-left">
                      <div>
                        <p className="text-[9px] uppercase tracking-wider text-white/50">Card Holder</p>
                        <p className="text-[11px] font-medium uppercase sm:text-xs text-white">
                          {existingCard.holderName}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] uppercase tracking-wider text-white/50">Expires</p>
                        <p className="text-[11px] font-medium sm:text-xs text-white">{existingCard.expiryDate}</p>
                      </div>
                      {/* Network Dots */}
                      <div className="flex items-center">
                        <div className="h-4 w-4 rounded-full bg-red-400/80 sm:h-5 sm:w-5" />
                        <div className="-ml-2 h-4 w-4 rounded-full bg-amber-400/80 sm:h-5 sm:w-5" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Card Details */}
            <div className="bg-gray-50 rounded-2xl p-5 space-y-3 text-sm">
              {/* Balance */}
              <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-green-500" />
                  <span className="text-gray-500 font-medium">{t("balance")}</span>
                </div>
                <span className="font-black text-green-600 text-lg">${existingCard.balance ?? 0}</span>
              </div>

              {/* Tier */}
              <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-gray-400" />
                  <span className="text-gray-500 font-medium">{t("tier")}</span>
                </div>
                <span className="font-black text-gray-800 uppercase px-2 py-0.5 bg-gray-800 text-white rounded-full text-xs">{existingCard.tierId}</span>
              </div>

              {/* Holder */}
              <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                <span className="text-gray-500 font-medium">Holder</span>
                <span className="font-bold text-gray-800">{existingCard.holderName}</span>
              </div>

              {/* Expires */}
              <div className="flex justify-between items-center">
                <span className="text-gray-500 font-medium">Expires</span>
                <span className="font-mono font-bold text-gray-800">{existingCard.expiryDate}</span>
              </div>
            </div>

            {/* Korixa verified badge */}
            {existingCard.korixaVerified && (
              <div className="flex items-center justify-center gap-2 bg-green-50 border border-green-100 rounded-xl p-3">
                <BadgeCheck className="w-5 h-5 text-green-500" />
                <p className="text-sm font-bold text-green-600">{t("verifiedBy")}</p>
              </div>
            )}
          </div>
        ) : (
          <>
            {/* ── Card Form Section ── */}
            <div className="relative rounded-3xl overflow-hidden mb-8"
                 style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e3a5f 40%, #0f4c75 100%)' }}>
              <div className="absolute -top-16 -right-16 w-48 h-48 rounded-full opacity-10"
                   style={{ background: 'radial-gradient(circle, #60a5fa, transparent)' }}></div>
              <div className="absolute -bottom-10 -left-10 w-36 h-36 rounded-full opacity-10"
                   style={{ background: 'radial-gradient(circle, #818cf8, transparent)' }}></div>

              <div className="relative p-6 pb-8">
                {/* Title */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                    <CreditCard className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-blue-300 tracking-[0.2em] uppercase">KORIXA PAY</p>
                    <h2 className="text-xl font-black text-white tracking-tight">Elite Black Card</h2>
                  </div>
                </div>

                {/* Only black tier notice */}
                <div className="bg-white/5 border border-white/10 rounded-xl px-3 py-2 mb-5 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-400 flex-shrink-0" />
                  <p className="text-[11px] text-amber-300 font-semibold">Black Tier only — Silver & other tiers not accepted</p>
                </div>

                {/* Form */}
                <form onSubmit={handleBindCard} className="space-y-4">
                  {error && (
                    <div className="bg-red-500/20 border border-red-400/30 rounded-xl p-3 flex items-start gap-2 text-red-300 text-sm">
                      <XCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <span>{error}</span>
                    </div>
                  )}
                  {success && (
                    <div className="bg-green-500/20 border border-green-400/30 rounded-xl p-3 flex items-start gap-2 text-green-300 text-sm">
                      <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <span>{success}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-[10px] font-bold text-blue-300 mb-1.5 uppercase tracking-widest">{t("cardNumber")}</label>
                    <input type="text" name="cardNumber" value={cardData.cardNumber} onChange={handleChange}
                      placeholder="0000 0000 0000 0000" maxLength={19} inputMode="numeric" required
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white font-mono text-base placeholder:text-white/30 focus:outline-none focus:border-blue-400 focus:bg-white/15 transition-all" />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-blue-300 mb-1.5 uppercase tracking-widest">{t("cardHolder")}</label>
                    <input type="text" name="holderName" value={cardData.holderName} onChange={handleChange}
                      placeholder="" required
                      className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white font-mono uppercase placeholder:text-white/30 focus:outline-none focus:border-blue-400 focus:bg-white/15 transition-all" />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-blue-300 mb-1.5 uppercase tracking-widest">{t("validThru")}</label>
                      <input type="text" name="expiryDate" value={cardData.expiryDate} onChange={handleChange}
                        placeholder="MM/YY" maxLength={5} inputMode="numeric" required
                        className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white font-mono placeholder:text-white/30 focus:outline-none focus:border-blue-400 focus:bg-white/15 transition-all" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-blue-300 mb-1.5 uppercase tracking-widest">{t("cvv")}</label>
                      <input type="password" name="cvv" value={cardData.cvv} onChange={handleChange}
                        placeholder="•••" maxLength={4} inputMode="numeric" required
                        className="w-full bg-white/10 border border-white/20 rounded-xl px-4 py-3 text-white font-mono placeholder:text-white/30 focus:outline-none focus:border-blue-400 focus:bg-white/15 transition-all" />
                    </div>
                  </div>

                  <div className="pt-2">
                    <button type="submit" disabled={saving}
                      className="w-full bg-white hover:bg-gray-100 active:bg-gray-200 text-gray-900 font-black py-4 rounded-xl shadow-xl transition-all flex items-center justify-center gap-2 disabled:opacity-60">
                      {saving
                        ? <><Loader2 className="w-5 h-5 animate-spin" />{t("verifying")}</>
                        : <><Lock className="w-4 h-4" />{t("bind")}</>}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Info below form */}
            <div className="space-y-4">
              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex gap-3">
                <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-blue-700 mb-1">{t("title")}</p>
                  <p className="text-xs text-blue-500 leading-relaxed">{t("subtitle")}</p>
                </div>
              </div>
              <div className="bg-amber-50 border border-amber-100 rounded-2xl p-4 flex gap-3">
                <AlertCircle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs font-bold text-amber-700 mb-1">{t("infoTitle")}</p>
                  <p className="text-xs text-amber-600 leading-relaxed">{t("infoBody")}</p>
                </div>
              </div>
              <div className="flex items-center justify-center gap-2 bg-gray-50 rounded-xl p-3 border border-gray-100">
                <ShieldCheck className="w-4 h-4 text-gray-400" />
                <p className="text-xs text-gray-400 font-medium">Cards are verified against Korixa database</p>
              </div>
              <p className="text-center text-xs text-gray-400 mt-2">{t("noCard")}</p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
