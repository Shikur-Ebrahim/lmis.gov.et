"use client"

import { useState, useEffect } from "react"
import {
  collection, onSnapshot, doc, updateDoc, serverTimestamp, orderBy, query
} from "firebase/firestore"
import { db } from "../../config/firebase"
import Sidebar from "../../components/admin/Sidebar"
import {
  FileCheck, CheckCircle, XCircle, Clock, Eye, X,
  RefreshCw, AlertTriangle, User, Calendar, Image as ImageIcon
} from "lucide-react"

const STATUS_STYLES = {
  pending:  { bg: "bg-amber-50",   text: "text-amber-700",   border: "border-amber-300",  icon: Clock,        label: "Pending Review" },
  verified: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-300",icon: CheckCircle,  label: "Verified" },
  rejected: { bg: "bg-red-50",     text: "text-red-700",     border: "border-red-300",    icon: XCircle,      label: "Rejected" },
}

export default function BankStatements() {
  const [statements, setStatements]   = useState([])
  const [loading, setLoading]         = useState(true)
  const [filterStatus, setFilter]     = useState("all")
  const [previewUrl, setPreviewUrl]   = useState(null)
  const [actionLoading, setActioning] = useState(null)

  useEffect(() => {
    const q = query(collection(db, "bank-statements"), orderBy("createdAt", "desc"))
    const unsub = onSnapshot(q, (snap) => {
      setStatements(snap.docs.map(d => ({ id: d.id, ...d.data() })))
      setLoading(false)
    })
    return unsub
  }, [])

  const handleAction = async (id, status) => {
    setActioning(id + status)
    try {
      await updateDoc(doc(db, "bank-statements", id), {
        status,
        reviewedAt: serverTimestamp(),
        isRead: true,
      })
    } catch (err) {
      console.error("Error updating status:", err)
    } finally {
      setActioning(null)
    }
  }

  const filtered = filterStatus === "all"
    ? statements
    : statements.filter(s => s.status === filterStatus)

  const counts = {
    all:      statements.length,
    pending:  statements.filter(s => s.status === "pending").length,
    verified: statements.filter(s => s.status === "verified").length,
    rejected: statements.filter(s => s.status === "rejected").length,
  }

  return (
    <div className="flex min-h-screen bg-gray-950 text-gray-100">
      <Sidebar />

      <div className="flex-1 lg:ml-64 p-4 sm:p-6 lg:p-8">

        {/* ── Page Header ── */}
        <div className="mb-8 border-b border-gray-800 pb-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
              <FileCheck className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400">
                Bank Statements
              </h1>
              <p className="text-gray-400 text-sm">Review and verify uploaded bank statement images</p>
            </div>
          </div>

          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
            {[
              { key: "all",      label: "Total",    color: "from-blue-600 to-indigo-600" },
              { key: "pending",  label: "Pending",  color: "from-amber-500 to-orange-500" },
              { key: "verified", label: "Verified", color: "from-emerald-500 to-green-500" },
              { key: "rejected", label: "Rejected", color: "from-red-500 to-rose-600" },
            ].map(item => (
              <button
                key={item.key}
                onClick={() => setFilter(item.key)}
                className={`relative rounded-2xl p-4 text-left transition-all duration-200 border-2 ${
                  filterStatus === item.key
                    ? "border-white/30 bg-white/10 scale-[1.02] shadow-lg"
                    : "border-transparent bg-gray-800/60 hover:bg-gray-800"
                }`}
              >
                <div className={`text-2xl font-black bg-gradient-to-r ${item.color} bg-clip-text text-transparent`}>
                  {counts[item.key]}
                </div>
                <div className="text-xs text-gray-400 font-bold mt-0.5 uppercase tracking-wider">{item.label}</div>
                {item.key === "pending" && counts.pending > 0 && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-amber-400 rounded-full animate-pulse" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* ── Content ── */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-32 gap-3">
            <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin" />
            <p className="text-gray-400 font-semibold">Loading bank statements…</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-32 gap-3 text-center">
            <div className="w-16 h-16 rounded-2xl bg-gray-800 flex items-center justify-center">
              <ImageIcon className="w-8 h-8 text-gray-600" />
            </div>
            <p className="text-gray-400 font-bold text-lg">No {filterStatus === "all" ? "" : filterStatus} submissions yet</p>
            <p className="text-gray-600 text-sm">Bank statement images will appear here once submitted</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
            {filtered.map((stmt) => {
              const st = STATUS_STYLES[stmt.status] || STATUS_STYLES.pending
              const StatusIcon = st.icon
              const actVerify = actionLoading === stmt.id + "verified"
              const actReject = actionLoading === stmt.id + "rejected"

              return (
                <div key={stmt.id} className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-lg hover:border-gray-700 transition-all duration-200 flex flex-col">

                  {/* Image Preview */}
                  <div className="relative bg-gray-800 h-48 group cursor-pointer" onClick={() => setPreviewUrl(stmt.fileUrl)}>
                    {stmt.fileUrl ? (
                      <>
                        <img
                          src={stmt.fileUrl}
                          alt="Bank Statement"
                          className="w-full h-full object-cover group-hover:opacity-80 transition-opacity"
                        />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                          <div className="bg-white/20 backdrop-blur rounded-full p-3">
                            <Eye className="w-6 h-6 text-white" />
                          </div>
                        </div>
                      </>
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ImageIcon className="w-12 h-12 text-gray-600" />
                      </div>
                    )}

                    {/* Status badge overlay */}
                    <div className={`absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${st.bg} ${st.text} ${st.border}`}>
                      <StatusIcon size={12} />
                      {st.label}
                    </div>
                  </div>

                  {/* Info */}
                  <div className="p-4 space-y-3 flex-1 flex flex-col">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2 text-gray-400 text-xs">
                        <User size={12} />
                        <span className="font-semibold truncate">{stmt.applicantName || stmt.userId || "Anonymous"}</span>
                      </div>
                      {stmt.createdAt && (
                        <div className="flex items-center gap-2 text-gray-500 text-xs">
                          <Calendar size={12} />
                          <span>{new Date(stmt.createdAt.seconds * 1000).toLocaleString()}</span>
                        </div>
                      )}
                      {stmt.reviewedAt && (
                        <div className="flex items-center gap-2 text-gray-500 text-xs">
                          <CheckCircle size={12} />
                          <span>Reviewed: {new Date(stmt.reviewedAt.seconds * 1000).toLocaleString()}</span>
                        </div>
                      )}
                    </div>

                    {/* Action buttons — only if pending */}
                    <div className="mt-auto pt-3 border-t border-gray-800">
                      {stmt.status === "pending" ? (
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => handleAction(stmt.id, "verified")}
                            disabled={!!actionLoading}
                            className="flex items-center justify-center gap-1.5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 rounded-xl text-white font-black text-xs transition-all active:scale-95"
                          >
                            {actVerify ? <RefreshCw size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                            Verify
                          </button>
                          <button
                            onClick={() => handleAction(stmt.id, "rejected")}
                            disabled={!!actionLoading}
                            className="flex items-center justify-center gap-1.5 py-2.5 bg-red-600 hover:bg-red-500 disabled:opacity-50 rounded-xl text-white font-black text-xs transition-all active:scale-95"
                          >
                            {actReject ? <RefreshCw size={14} className="animate-spin" /> : <XCircle size={14} />}
                            Reject
                          </button>
                        </div>
                      ) : (
                        <div className={`text-center py-2.5 rounded-xl text-xs font-bold border ${st.bg} ${st.text} ${st.border}`}>
                          {stmt.status === "verified" ? "✓ Verified — No action needed" : "✗ Rejected"}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* ── Full-screen Image Preview Modal ── */}
      {previewUrl && (
        <div
          className="fixed inset-0 z-[999] bg-black/90 flex items-center justify-center p-4"
          onClick={() => setPreviewUrl(null)}
        >
          <button
            className="absolute top-4 right-4 w-10 h-10 bg-white/20 hover:bg-white/30 rounded-full flex items-center justify-center transition-colors"
            onClick={() => setPreviewUrl(null)}
          >
            <X className="w-5 h-5 text-white" />
          </button>
          <img
            src={previewUrl}
            alt="Preview"
            className="max-w-full max-h-[90vh] rounded-2xl shadow-2xl object-contain"
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  )
}
