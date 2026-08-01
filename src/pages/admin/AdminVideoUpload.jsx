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
  const [selectedFile, setSelectedFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [compressing, setCompressing] = useState(false)
  const [activeVideoModal, setActiveVideoModal] = useState(null)
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
    const file = e.target.files && e.target.files[0]
    if (!file) return

    // Flexible check for video mime types or extensions
    const isVideoType = file.type.startsWith("video/") || file.type === ""
    const isVideoExt = /\.(mp4|mov|avi|wmv|flv|mkv|webm|m4v|3gp)$/i.test(file.name)

    if (isVideoType || isVideoExt) {
      setSelectedFile(file)
      const url = URL.createObjectURL(file)
      setPreviewUrl(url)
    } else {
      alert("Please select a valid video file (MP4, MOV, MKV, WebM, etc.)")
      e.target.value = ""
    }
  }

  const handleRemoveSelectedFile = () => {
    setSelectedFile(null)
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
    }
  }

  // Compress video using browser MediaRecorder (canvas re-encode)
  const compressVideo = (file, onProgress) => {
    return new Promise((resolve, reject) => {
      const video = document.createElement("video")
      video.src = URL.createObjectURL(file)
      video.muted = true
      video.crossOrigin = "anonymous"

      video.onloadedmetadata = () => {
        const canvas = document.createElement("canvas")
        // Scale down to max 1280x720 for compression
        let width = video.videoWidth || 1280
        let height = video.videoHeight || 720
        const maxW = 1280, maxH = 720
        if (width > maxW) { height = Math.round(height * maxW / width); width = maxW }
        if (height > maxH) { width = Math.round(width * maxH / height); height = maxH }
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext("2d")

        const stream = canvas.captureStream(24)

        // Try to add audio track from video
        try {
          const vsrc = video.captureStream ? video.captureStream() : null
          if (vsrc) vsrc.getAudioTracks().forEach(t => stream.addTrack(t))
        } catch (_) {}

        // Pick supported mime type
        const mimeType = MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
          ? "video/webm;codecs=vp9"
          : "video/webm"

        const chunks = []
        const recorder = new MediaRecorder(stream, {
          mimeType,
          videoBitsPerSecond: 1_200_000, // 1.2 Mbps — keeps under 100MB for ~10 min video
        })

        recorder.ondataavailable = (e) => { if (e.data.size > 0) chunks.push(e.data) }
        recorder.onstop = () => {
          const blob = new Blob(chunks, { type: mimeType })
          const ext = mimeType.includes("webm") ? ".webm" : ".mp4"
          const compressedFile = new File(
            [blob],
            file.name.replace(/\.[^/.]+$/, ext),
            { type: mimeType }
          )
          URL.revokeObjectURL(video.src)
          resolve(compressedFile)
        }
        recorder.onerror = (e) => reject(new Error("Compression failed: " + e.error))

        const drawFrame = () => {
          if (!video.paused && !video.ended) {
            ctx.drawImage(video, 0, 0, width, height)
            if (onProgress && video.duration > 0) {
              onProgress(Math.round((video.currentTime / video.duration) * 100))
            }
            requestAnimationFrame(drawFrame)
          }
        }

        recorder.start(200)
        video.play()
        video.onplay = drawFrame
        video.onended = () => { recorder.stop() }
      }

      video.onerror = () => reject(new Error("Could not load video for compression."))
    })
  }

  const handleUpload = async (e) => {
    e.preventDefault()
    if (!selectedFile || !formData.title.trim()) {
      alert("Please provide a title and select a video file.")
      return
    }

    setUploading(true)
    setUploadProgress(1)

    try {
      let fileToUpload = selectedFile
      const MAX_CLOUDINARY_SIZE = 90 * 1024 * 1024 // 90MB Cloudinary limit

      // Compress if over 90MB
      if (selectedFile.size > MAX_CLOUDINARY_SIZE) {
        setCompressing(true)
        setUploadProgress(0)
        fileToUpload = await compressVideo(selectedFile, (pct) => setUploadProgress(pct))
        setCompressing(false)
        setUploadProgress(1)
      }

      // Upload to Cloudinary
      const uploadResult = await uploadVideo(fileToUpload, (progress) => {
        setUploadProgress(progress)
      })

      // Save to Firestore
      await addDoc(collection(db, "videos"), {
        title: formData.title.trim(),
        description: formData.description || "",
        category: formData.category || "general",
        videoUrl: uploadResult.url,
        thumbnailUrl: uploadResult.thumbnailUrl || uploadResult.url,
        publicId: uploadResult.publicId || "",
        format: uploadResult.format || "webm",
        duration: uploadResult.duration || 0,
        size: uploadResult.size || fileToUpload.size,
        originalSize: selectedFile.size,
        createdAt: Timestamp.now(),
        author: auth.currentUser?.email || "Admin",
      })

      setUploadProgress(100)
      setTimeout(() => {
        setIsModalOpen(false)
        setUploading(false)
        setUploadProgress(0)
        setCompressing(false)
        setFormData({ title: "", description: "", category: "general" })
        handleRemoveSelectedFile()
      }, 500)

      alert("Video uploaded successfully!")
    } catch (error) {
      console.error("Upload error:", error)
      alert("Failed to upload video: " + (error.message || "Unknown error"))
      setUploading(false)
      setCompressing(false)
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
        alert("Failed to delete video: " + error.message)
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

  const formatFileSize = (bytes) => {
    if (!bytes) return "0 MB"
    const mb = bytes / (1024 * 1024)
    return mb.toFixed(1) + " MB"
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
              [1, 2, 3].map((i) => (
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
                  <div className="relative aspect-video overflow-hidden bg-black flex items-center justify-center">
                    {video.thumbnailUrl ? (
                      <img
                        src={video.thumbnailUrl}
                        alt={video.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        onError={(e) => {
                          e.target.onerror = null
                          e.target.style.display = "none"
                        }}
                      />
                    ) : null}
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-500">
                      <button
                        onClick={() => setActiveVideoModal(video)}
                        className="p-0 transition-transform hover:scale-110 active:scale-95"
                        title="Play Video"
                      >
                        <div className="w-16 h-16 rounded-full bg-cyan-500 flex items-center justify-center text-white shadow-lg shadow-cyan-500/50 border-2 border-white">
                          <Play className="w-8 h-8 fill-white translate-x-0.5" />
                        </div>
                      </button>
                    </div>
                    {video.duration > 0 && (
                      <div className="absolute bottom-4 right-4 bg-gray-950/80 backdrop-blur-md text-white text-[10px] font-black px-2.5 py-1 rounded-lg border border-white/10">
                        {Math.floor(video.duration / 60)}:{(Math.floor(video.duration) % 60).toString().padStart(2, "0")}
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
                        title="Delete video"
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
                          {video.format?.toUpperCase() || "MP4"}
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

      {/* Video Player Modal */}
      {activeVideoModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/90 backdrop-blur-md"
            onClick={() => setActiveVideoModal(null)}
          />
          <div className="relative bg-gray-900 border border-white/10 w-full max-w-4xl rounded-3xl overflow-hidden z-10 shadow-2xl">
            <div className="p-4 bg-gray-950 border-b border-gray-800 flex items-center justify-between">
              <h3 className="font-bold text-lg text-white truncate px-2">{activeVideoModal.title}</h3>
              <button
                onClick={() => setActiveVideoModal(null)}
                className="p-2 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 transition-all"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="aspect-video bg-black flex items-center justify-center">
              <video
                src={activeVideoModal.videoUrl}
                controls
                autoPlay
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>
      )}

      {/* Modern Upload Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-gray-950/90 backdrop-blur-xl animate-in fade-in duration-300"
            onClick={() => {
              if (!uploading) {
                setIsModalOpen(false)
                handleRemoveSelectedFile()
              }
            }}
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
                <p className="text-gray-500 mt-1 font-medium italic">Select a video file from your device</p>
              </div>
              <button
                onClick={() => {
                  if (!uploading) {
                    setIsModalOpen(false)
                    handleRemoveSelectedFile()
                  }
                }}
                className="bg-white/5 p-3 rounded-2xl text-gray-400 hover:text-white hover:bg-red-500/20 transition-all active:scale-90"
                disabled={uploading}
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleUpload} className="p-8 space-y-6">
              <div className="space-y-6">
                <div className="group">
                  <label className="block text-xs font-black text-gray-500 uppercase tracking-[0.2em] mb-3 group-focus-within:text-cyan-400 transition-colors">
                    Video Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-gray-100 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 focus:border-cyan-500 transition-all placeholder:text-gray-700 font-bold"
                    placeholder="Enter video title..."
                  />
                </div>

                <div className="group">
                  <label className="block text-xs font-black text-gray-500 uppercase tracking-[0.2em] mb-3 group-focus-within:text-cyan-400 transition-colors">
                    Video File *
                  </label>

                  {selectedFile ? (
                    <div className="bg-black/40 border border-cyan-500/50 rounded-2xl p-4 space-y-3">
                      {previewUrl && (
                        <div className="aspect-video bg-black rounded-xl overflow-hidden border border-white/10 relative">
                          <video src={previewUrl} controls className="w-full h-full object-contain" />
                        </div>
                      )}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className="bg-cyan-500/20 p-2 rounded-xl text-cyan-400">
                            <Video className="w-5 h-5" />
                          </div>
                          <div className="truncate">
                            <p className="text-white font-bold text-sm truncate">{selectedFile.name}</p>
                            <p className="text-gray-500 text-xs">{formatFileSize(selectedFile.size)}</p>
                          </div>
                        </div>
                        {!uploading && (
                          <button
                            type="button"
                            onClick={handleRemoveSelectedFile}
                            className="text-xs font-bold text-red-400 hover:text-red-300 bg-red-500/10 px-3 py-1.5 rounded-xl hover:bg-red-500/20 transition-all"
                          >
                            Remove
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="relative">
                      <input
                        type="file"
                        required
                        accept="video/*,video/mp4,video/quicktime,video/x-msvideo,video/x-matroska,.mp4,.mov,.avi,.mkv,.webm,.3gp"
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                      />
                      <div className="w-full bg-black/40 border-2 border-dashed border-white/10 group-hover:border-cyan-500/50 rounded-2xl p-8 flex flex-col items-center justify-center text-center transition-all">
                        <div className="bg-cyan-500/10 p-4 rounded-2xl mb-3 group-hover:scale-110 transition-transform">
                          <Plus className="w-8 h-8 text-cyan-400" />
                        </div>
                        <p className="text-gray-200 text-base font-bold">Select Video from Gallery / Files</p>
                        <p className="text-gray-500 text-xs mt-1">Supports MP4, MOV, MKV, WebM, etc.</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {(uploading || compressing) && (
                <div className="space-y-4 pt-2">
                  <div className="flex justify-between items-end">
                    <p className="text-cyan-400 text-xs font-black uppercase tracking-widest animate-pulse">
                      {compressing ? "⚙️ Compressing Video..." : "☁️ Uploading to Cloudinary..."}
                    </p>
                    <span className="text-xl font-black text-white italic">{uploadProgress}%</span>
                  </div>
                  <div className="w-full bg-white/5 rounded-full h-3 p-0.5 border border-white/5 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        compressing
                          ? "bg-gradient-to-r from-yellow-500 to-orange-500"
                          : "bg-gradient-to-r from-cyan-600 to-blue-600"
                      }`}
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  {compressing && (
                    <p className="text-yellow-400/80 text-xs font-semibold text-center">
                      Video is being compressed to fit Cloudinary's 100MB limit. This may take a few minutes...
                    </p>
                  )}
                </div>
              )}

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={uploading || compressing || !selectedFile || !formData.title.trim()}
                  className="w-full bg-gradient-to-br from-cyan-500 to-blue-700 hover:from-cyan-400 hover:to-blue-600 text-white font-black py-5 rounded-2xl shadow-[0_10px_30px_rgba(6,182,212,0.3)] disabled:opacity-30 disabled:shadow-none transition-all transform active:scale-[0.98] text-lg uppercase tracking-widest"
                >
                  {compressing ? "COMPRESSING..." : uploading ? "UPLOADING..." : "UPLOAD NOW"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style
        dangerouslySetInnerHTML={{
          __html: `
        @keyframes progress-stripe {
          from { background-position: 0 0; }
          to { background-position: 20px 0; }
        }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `,
        }}
      />
    </div>
  )
}
