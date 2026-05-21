"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { collection, query, orderBy, onSnapshot } from "firebase/firestore"
import { db } from "../config/firebase"
import {
  Building2,
  CreditCard,
  Copy,
  Check,
  ArrowLeft,
  AlertTriangle,
  Upload,
} from "lucide-react"

const PaymentMethod = () => {
  const [accounts, setAccounts] = useState([])
  const [loading, setLoading] = useState(true)
  const [copiedAccountId, setCopiedAccountId] = useState(null)
  const navigate = useNavigate()

  useEffect(() => {
    const accountsQuery = query(
      collection(db, "account"),
      orderBy("createdAt", "desc")
    )

    const unsubscribe = onSnapshot(accountsQuery, (snapshot) => {
      const accountsData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      setAccounts(accountsData)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const copyAccountNumber = async (accountNumber, accountId) => {
    try {
      await navigator.clipboard.writeText(accountNumber)
      setCopiedAccountId(accountId)
      setTimeout(() => setCopiedAccountId(null), 2000)
    } catch (error) {
      const textArea = document.createElement("textarea")
      textArea.value = accountNumber
      textArea.style.position = "fixed"
      textArea.style.opacity = "0"
      document.body.appendChild(textArea)
      textArea.select()
      try {
        document.execCommand("copy")
        setCopiedAccountId(accountId)
        setTimeout(() => setCopiedAccountId(null), 2000)
      } catch (err) {
        console.error("Copy failed", err)
      }
      document.body.removeChild(textArea)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mx-auto mb-4" />
          <p className="text-gray-600 text-lg">Loading payment methods...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate("/personal")}
            className="flex items-center space-x-2 text-gray-600 hover:text-blue-600 mb-4 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Dashboard</span>
          </button>

          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 mb-2">
            Payment Methods
          </h1>
          <p className="text-gray-600">
            Select a company payment method and copy the account number
          </p>
        </div>
{/* IMPORTANT NOTE */}
<div className="mb-8 bg-yellow-50 border border-yellow-300 rounded-2xl p-6 shadow-md">
  <div className="flex items-start gap-3">
    <AlertTriangle className="w-6 h-6 text-yellow-600 mt-1" />
    <div className="space-y-4">
      {/* English */}
      <div>
        <h2 className="text-lg font-bold text-yellow-800 mb-1">
          Important Notice
        </h2>
        <p className="text-gray-800 text-sm leading-relaxed">
          These are <strong>official company accounts</strong>. Payments made to any
          account <strong>other than the accounts listed here are NOT</strong>{" "}
          <strong>accountable</strong> and will not be supported. All valid payments made using the accounts below
          are registered in the company system.
        </p>
        <p className="text-gray-800 text-sm leading-relaxed mt-2">
          <strong>Travel Cost Coverage:</strong> The company covers{" "}
          <strong>80% of the travel cost</strong>, while{" "}
          <strong>20%</strong> is paid by the individual.
        </p>
      </div>

      {/* Amharic */}
      <div className="border-t border-yellow-200 pt-3">
        <h2 className="text-lg font-bold text-yellow-800 mb-1">ማስታወቂያ</h2>
        <p className="text-gray-800 text-sm leading-relaxed">
          እዚህ የተዘረዘሩት <strong>የኩባንያው ኦፊሴላዊ የክፍያ መለያዎች</strong> ናቸው።
          ከእነዚህ መለያዎች ውጭ ወደ ሌላ መለያ የተፈጸመ ክፍያ
          <strong> ተቀባይነት አይኖረውም</strong> እና ኩባንያው ኃላፊነት
          አይወስድበትም። በእነዚህ መለያዎች የተፈጸመ ክፍያ ሁሉ
          በኩባንያው ስርዓት ይመዘገባል።
        </p>
        <p className="text-gray-800 text-sm leading-relaxed mt-2">
          <strong>የጉዞ ወጪ ክፍያ:</strong> ኩባንያው{" "}
          <strong>80%</strong> የጉዞ ወጪ ይሸፍናል፣{" "}
          <strong>20%</strong> ግን በግለሰብ ይከፈላል።
        </p>
      </div>

      {/* Verification */}
      <div className="border-t border-yellow-200 pt-3">
        <div className="flex items-center gap-2 text-blue-700 font-semibold mb-1">
          <Upload className="w-5 h-5" />
          <span>Payment Verification</span>
        </div>
        <p className="text-gray-800 text-sm leading-relaxed">
          After completing the payment, please{" "}
          <strong>send the payment screenshot or payment slip</strong> for further
          verification.
        </p>
        <p className="text-gray-800 text-sm leading-relaxed mt-1">
          ክፍያውን ከፈጸሙ በኋላ ለተጨማሪ ማረጋገጫ{" "}
          <strong>የክፍያ ማስረጃ (screenshot / pay slip)</strong> እባክዎን ይላኩ።
        </p>
      </div>
    </div>
  </div>
</div>

        {/* Accounts Grid */}
        {accounts.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl shadow-lg border">
            <Building2 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 text-lg">No payment methods found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {accounts.map((account) => (
              <div
                key={account.id}
                className="bg-white rounded-2xl p-6 shadow-lg border hover:shadow-xl transition"
              >
                <div className="flex items-center gap-3 mb-4">
                  {account.logo?.url ? (
                    <img
                      src={account.logo.url}
                      alt={account.bankName}
                      className="w-14 h-14 object-contain rounded-lg border p-1"
                    />
                  ) : (
                    <div className="w-14 h-14 rounded-lg bg-blue-100 flex items-center justify-center">
                      <Building2 className="w-7 h-7 text-blue-600" />
                    </div>
                  )}
                  <div>
                    <h3 className="font-bold text-gray-900">{account.bankName}</h3>
                    <p className="text-sm text-gray-500">{account.paymentMethod}</p>
                  </div>
                </div>

                <p className="text-sm text-gray-600 mb-1 flex items-center">
                  <CreditCard className="w-4 h-4 mr-1" /> Account Number
                </p>

                <div className="flex items-center justify-between bg-gray-50 rounded-lg p-3 border">
                  <span className="font-mono font-semibold">
                    {account.accountNumber}
                  </span>
                  <button
                    onClick={() => copyAccountNumber(account.accountNumber, account.id)}
                    className="p-2 rounded-lg bg-blue-600 hover:bg-blue-700 transition"
                  >
                    {copiedAccountId === account.id ? (
                      <Check className="w-5 h-5 text-white" />
                    ) : (
                      <Copy className="w-5 h-5 text-white" />
                    )}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default PaymentMethod
