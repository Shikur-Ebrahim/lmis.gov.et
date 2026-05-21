"use client"

import { useState, useEffect } from "react"
import { Link, useNavigate } from "react-router-dom"
import { useAuth } from "../../hooks/useAuth"
import {
  collection,
  addDoc,
  getDocs,
  query,
  orderBy,
  onSnapshot,
  deleteDoc,
  doc,
  Timestamp,
} from "firebase/firestore"
import { db, auth } from "../../config/firebase"
import { uploadVideo } from "../../utils/cloudinary"
import {
  Video,
  Upload,
  Trash2,
  Menu,
  X,
  Settings,
  CreditCard,
  UserPlus,
  Users,
  MessageSquare,
  Bell,
  Activity,
  Building2,
  LogOut,
  Plus,
  Play,
  FileText,
  Clock,
} from "lucide-react"
import Sidebar from "../../components/admin/Sidebar"

export default function AdminVideoUpload() {
  const { logout } = useAuth()
  const navigate = useNavigate()
  const [videos, setVideos] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "general",
  })

  useEffect(() => {
    // Listen for videos
    const q = query(collection(db, "videos"), orderBy("createdAt", "desc"))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const videoData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }))
      setVideos(videoData)
      setLoading(false)
    })

    return () => {
      unsubscribe()
    }
  }, [])

  const handleLogout = async () => {
    try {
      await logout()
      navigate("/")
    } catch (error) {
      console.error("Logout error:", error)
    }
  }

  const handleFileChange = (e) => {
    const file = e.target.files[0]
    if (file && file.type.startsWith("video/")) {
      setSelectedFile(file)
    } else {
      alert("Please select a valid video file.")
    }
  }

  const handleUpload = async (e) => {
    e.preventDefault()
    if (!selectedFile || !formData.title) {
      alert("Please provide a title and select a video file.")
      return
    }

    setUploading(true)
    setUploadProgress(10)

    try {
      // 1. Upload to Cloudinary with real-time XHR progress
      const uploadResult = await uploadVideo(selectedFile, (progress) => {
        setUploadProgress(progress)
      })

      // 2. Save to Firestore
      await addDoc(collection(db, "videos"), {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        videoUrl: uploadResult.url,
        thumbnailUrl: uploadResult.thumbnailUrl,
        publicId: uploadResult.publicId,
        format: uploadResult.format,
        duration: uploadResult.duration || 0,
        size: uploadResult.size,
        createdAt: Timestamp.now(),
        author: auth.currentUser?.email || "Admin",
      })

      setUploadProgress(100)
      setTimeout(() => {
        setIsModalOpen(false)
        setUploading(false)
        setUploadProgress(0)
        setFormData({ title: "", description: "", category: "general" })
        setSelectedFile(null)
      }, 500)

      alert("Video uploaded successfully!")
    } catch (error) {
      console.error("Upload error:", error)
      alert("Failed to upload video: " + error.message)
      setUploading(false)
      setUploadProgress(0)
    }
  }

  const handleDelete = async (videoId) => {
    if (window.confirm("Are you sure you want to delete this video?")) {
      try {
        await deleteDoc(doc(db, "videos", videoId))
        alert("Video deleted successfully.")
      } catch (error) {
        console.error("Delete error:", error)
        alert("Failed to delete video.")
      }
    }
  }

  const formatDate = (timestamp) => {
    if (!timestamp) return "Unknown date"
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 font-sans">
      <Sidebar />

      {/* Main Content */}
      <div className="lg:ml-64 pt-16 lg:pt-0">
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
            <div>
              <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-500">
                Video Library
              </h1>
              <p className="text-gray-400 mt-2 text-lg">Manage your promotional content and tutorials</p>
            </div>
            <button
              onClick={() => setIsModalOpen(true)}
              className="group flex items-center justify-center space-x-2 bg-cyan-600 hover:bg-cyan-500 text-white px-8 py-4 rounded-2xl transition-all shadow-xl shadow-cyan-500/20 active:scale-95"
            >
              <div className="bg-white/20 p-1.5 rounded-lg group-hover:rotate-90 transition-transform duration-300">
                <Plus className="w-5 h-5" />
              </div>
              <span className="font-bold tracking-wide">ADD NEW VIDEO</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {loading ? (
              [1, 2, 3].map(i => (
                <div key={i} className="bg-gray-900 border border-gray-800 rounded-3xl p-4 animate-pulse">
                  <div className="aspect-video bg-gray-800 rounded-2xl mb-4" />
                  <div className="h-6 bg-gray-800 rounded-lg w-3/4 mb-3" />
                  <div className="h-4 bg-gray-800 rounded-lg w-full mb-2" />
                  <div className="h-4 bg-gray-800 rounded-lg w-1/2" />
                </div>
              ))
            ) : videos.length === 0 ? (
              <div className="col-span-full text-center py-24 bg-gray-900/40 border-2 border-dashed border-gray-800 rounded-[40px]">
                <div className="bg-gray-800/50 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6 border border-gray-700">
                  <Video className="w-10 h-10 text-gray-500" />
                </div>
                <h3 className="text-2xl font-bold text-gray-200">No videos found</h3>
                <p className="text-gray-500 mt-2 max-w-xs mx-auto text-lg leading-relaxed">
                  Your video library is empty. Click the button above to upload your first clip.
                </p>
              </div>
            ) : (
              videos.map((video) => (
                <div
                  key={video.id}
                  className="group bg-gray-900/80 backdrop-blur-md border border-gray-800 hover:border-cyan-500/40 rounded-[32px] overflow-hidden transition-all duration-500 hover:shadow-2xl hover:shadow-cyan-500/10 hover:-translate-y-2"
                >
                  <div className="relative aspect-video overflow-hidden">
                    <img
                      src={video.thumbnailUrl || "/placeholder.svg"}
                      alt={video.title}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500">
                      <button
                        onClick={() => {
                          const videoElement = document.createElement("video");
                          videoElement.src = video.videoUrl;
                          videoElement.controls = true;
                          videoElement.autoplay = true;
                          // Standardize with a simple full-screen request or a modal if available.
                          // For now, let's just open in a new tab or use a similar modal logic if we had one.
                          window.open(video.videoUrl, "_blank");
                        }}
                        className="p-0 transition-transform hover:scale-110 active:scale-95"
                      >
                        <img 
                          src="/images/play-v.png" 
                          alt="Play" 
                          className="h-14 w-14 rounded-full border-2 border-white shadow-lg"
                        />
                      </button>
                    </div>
                    {video.duration > 0 && (
                      <div className="absolute bottom-4 right-4 bg-gray-950/80 backdrop-blur-md text-white text-[10px] font-black px-2.5 py-1 rounded-lg border border-white/10">
                        {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}
                      </div>
                    )}
                  </div>
                  <div className="p-7">
                    <div className="flex justify-between items-start mb-6 gap-4">
                      <h3 className="font-extrabold text-xl text-gray-50 truncate group-hover:text-cyan-400 transition-colors">
                        {video.title}
                      </h3>
                      <button
                        onClick={() => handleDelete(video.id)}
                        className="p-2 text-gray-600 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between pt-5 border-t border-gray-800/50">
                      <div className="flex items-center text-xs font-bold text-gray-500 uppercase tracking-widest">
                        <Clock className="w-4 h-4 mr-2 text-indigo-500" />
                        {formatDate(video.createdAt)}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 bg-cyan-500/10 text-cyan-400 text-[10px] font-black rounded-full border border-cyan-500/20 uppercase tracking-tighter">
                          {video.format || "MP4"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Modern Upload Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-gray-950/90 backdrop-blur-xl animate-in fade-in duration-300"
            onClick={() => !uploading && setIsModalOpen(false)}
          />
          <div className="relative bg-gray-900 border border-white/10 w-full max-w-xl rounded-[40px] overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] animate-in slide-in-from-bottom-10 duration-500">
            <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
              <div>
                <h2 className="text-2xl font-black text-white flex items-center gap-4">
                  <div className="bg-cyan-500/20 p-3 rounded-2xl">
                    <Upload className="w-6 h-6 text-cyan-400" />
                  </div>
                  Upload Video
                </h2>
                <p className="text-gray-500 mt-1 font-medium italic">Title and video file only</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="bg-white/5 p-3 rounded-2xl text-gray-400 hover:text-white hover:bg-red-500/20 transition-all active:scale-90"
                disabled={uploading}
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleUpload} className="p-8 space-y-8">
              <div className="space-y-6">
                <div className="group">
                  <label className="block text-xs font-black text-gray-500 uppercase tracking-[0.2em] mb-3 group-focus-within:text-cyan-400 transition-colors">Video Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-gray-100 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all placeholder:text-gray-700"
                    placeholder="Enter video title..."
                  />
                </div>

                <div className="group">
                  <label className="block text-xs font-black text-gray-500 uppercase tracking-[0.2em] mb-3 group-focus-within:text-cyan-400 transition-colors">Video File *</label>
                  <div className="relative">
                    <input
                      type="file"
                      required
                      accept="video/*"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="w-full bg-black/40 border border-white/10 group-hover:border-cyan-500/50 rounded-2xl px-6 py-4 flex items-center gap-3 transition-all">
                      <div className="bg-cyan-500/10 p-1.5 rounded-lg">
                        <Plus className="w-4 h-4 text-cyan-400" />
                      </div>
                      <span className="text-gray-400 text-sm font-bold truncate">
                        {selectedFile ? selectedFile.name : "Select Video File"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {uploading && (
                <div className="space-y-4">
                  <div className="flex justify-between items-end">
                    <p className="text-cyan-400 text-xs font-black uppercase tracking-widest animate-pulse">Uploading Media...</p>
                    <span className="text-xl font-black text-white italic">{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-white/5 rounded-full h-3 p-0.5 border border-white/5 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-cyan-600 to-blue-600 h-full rounded-full transition-all duration-500"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={uploading || !selectedFile || !formData.title}
                  className="w-full bg-gradient-to-br from-cyan-500 to-blue-700 hover:from-cyan-400 hover:to-blue-600 text-white font-black py-5 rounded-2xl shadow-[0_10px_30px_rgba(6,182,212,0.3)] disabled:opacity-30 disabled:shadow-none transition-all transform active:scale-[0.98] text-lg uppercase tracking-widest"
                >
                  {uploading ? "Uploading..." : "UPLOAD NOW"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes progress-stripe {
          from { background-position: 0 0; }
          to { background-position: 20px 0; }
        }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}} />
    </div>
  )
}
