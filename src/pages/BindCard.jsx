import React, { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { doc, getDoc, updateDoc, collection, query, where, getDocs } from "firebase/firestore"
import { db } from "../config/firebase"
import { ArrowLeft, CreditCard, ShieldCheck, AlertCircle, Info, Loader2, CheckCircle } from "lucide-react"

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
      bind: "Bind Card",
      alreadyBound: "Card Already Bound",
      alreadyBoundDesc: "Your VISA card has been successfully connected. Payments will be sent to this card.",
      cardInUse: "This card is already registered by another user.",
      invalidCard: "Please enter a valid 16-digit card number.",
      success: "Card bound successfully!",
      noCard: "Don't have a card? Get yours at korixapay.com"
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
      bind: "ካርድ አገናኝ",
      alreadyBound: "ካርድ ተያይዟል",
      alreadyBoundDesc: "የቪዛ ካርድዎ በተሳካ ሁኔታ ተገናኝቷል። ክፍያዎ ወደዚህ ካርድ ይላካል።",
      cardInUse: "ይህ ካርድ ቀደም ብሎ በሌላ ተጠቃሚ ተመዝግቧል።",
      invalidCard: "እባክዎ ትክክለኛ ባለ 16-ዲጂት የካርድ ቁጥር ያስገቡ።",
      success: "ካርዱ በተሳካ ሁኔታ ተገናኝቷል!",
      noCard: "ካርድ የለዎትም? korixapay.com ላይ ያግኙ"
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
    } else {
      setCardData(prev => ({ ...prev, [name]: value }))
    }
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
      const q = query(collection(db, "users"), where("visaCard.cardNumber", "==", cardData.cardNumber))
      const snap = await getDocs(q)
      if (!snap.empty) {
        setError(t("cardInUse"))
        setSaving(false)
        return
      }

      const cardPayload = {
        cardNumber: cardData.cardNumber,
        holderName: cardData.holderName,
        expiryDate: cardData.expiryDate,
        cvv: cardData.cvv,
        tierId: "silver",
        frozen: false,
        displayInAssets: true,
        createdAt: new Date().toISOString()
      }

      await updateDoc(doc(db, "users", id), { visaCard: cardPayload })
      setSuccess(t("success"))
      setExistingCard(cardPayload)
    } catch (err) {
      console.error(err)
      setError("Error saving card. Please try again.")
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
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white font-sans">

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

      <div className="max-w-lg mx-auto px-4 py-8">

        {/* Top Icon + Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl shadow-lg shadow-blue-200 mb-4">
            <CreditCard className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-black text-gray-900 mb-2">{t("title")}</h1>
          <p className="text-sm text-gray-500 leading-relaxed max-w-xs mx-auto">{t("subtitle")}</p>
        </div>

        {/* Info Banner */}
        <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex gap-3 mb-8">
          <Info className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-xs font-bold text-blue-700 mb-0.5">{t("infoTitle")}</p>
            <p className="text-xs text-blue-600 leading-relaxed">{t("infoBody")}</p>
          </div>
        </div>

        {existingCard ? (
          /* Already Bound State */
          <div className="bg-white border border-gray-100 rounded-3xl shadow-sm p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">{t("alreadyBound")}</h2>
            <p className="text-sm text-gray-500">{t("alreadyBoundDesc")}</p>

            {/* Masked card info */}
            <div className="bg-gray-50 rounded-2xl p-4 mt-4 space-y-2 text-sm text-left">
              <div className="flex justify-between">
                <span className="text-gray-400 font-medium">Card</span>
                <span className="font-mono font-bold text-gray-700">{existingCard.cardNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400 font-medium">Holder</span>
                <span className="font-bold text-gray-700">{existingCard.holderName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400 font-medium">Expires</span>
                <span className="font-mono font-bold text-gray-700">{existingCard.expiryDate}</span>
              </div>
            </div>
          </div>
        ) : (
          /* Bind Form */
          <div className="bg-white border border-gray-100 rounded-3xl shadow-sm p-6">
            <form onSubmit={handleBindCard} className="space-y-5">

              {error && (
                <div className="bg-red-50 border border-red-100 rounded-xl p-3 flex items-start gap-2 text-red-600 text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {success && (
                <div className="bg-green-50 border border-green-100 rounded-xl p-3 flex items-start gap-2 text-green-600 text-sm">
                  <CheckCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{success}</span>
                </div>
              )}

              {/* Card Number */}
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">{t("cardNumber")}</label>
                <input
                  type="text"
                  name="cardNumber"
                  value={cardData.cardNumber}
                  onChange={handleChange}
                  placeholder="0000 0000 0000 0000"
                  maxLength={19}
                  inputMode="numeric"
                  required
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 font-mono text-base placeholder:text-gray-300 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>

              {/* Card Holder */}
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">{t("cardHolder")}</label>
                <input
                  type="text"
                  name="holderName"
                  value={cardData.holderName}
                  onChange={handleChange}
                  placeholder=""
                  required
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 font-mono uppercase placeholder:text-gray-300 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                />
              </div>

              {/* Expiry + CVV */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">{t("validThru")}</label>
                  <input
                    type="text"
                    name="expiryDate"
                    value={cardData.expiryDate}
                    onChange={handleChange}
                    placeholder="MM/YY"
                    maxLength={5}
                    inputMode="numeric"
                    required
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 font-mono placeholder:text-gray-300 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wide">{t("cvv")}</label>
                  <input
                    type="password"
                    name="cvv"
                    value={cardData.cvv}
                    onChange={handleChange}
                    placeholder="•••"
                    maxLength={4}
                    inputMode="numeric"
                    required
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 font-mono placeholder:text-gray-300 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
                  />
                </div>
              </div>

              {/* Submit */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-black py-4 rounded-xl shadow-lg shadow-blue-100 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
                >
                  {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <ShieldCheck className="w-5 h-5" />}
                  {t("bind")}
                </button>
              </div>
            </form>

            {/* No card note */}
            <p className="text-center text-xs text-gray-400 mt-5">
              {t("noCard")}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
