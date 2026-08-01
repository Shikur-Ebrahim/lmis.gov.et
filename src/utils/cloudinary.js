// Cloudinary configuration - using environment variables for security
// Make sure to set these in your .env file and Vercel environment variables
export const CLOUDINARY_CONFIG = {
  cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME,
  uploadPresets: {
    profile: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "profile_upload",
    documents: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || "profile_upload",
  },
}

export async function uploadToCloudinary(file) {
  const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`
  const formData = new FormData()
  formData.append("file", file)
  formData.append("upload_preset", CLOUDINARY_CONFIG.uploadPresets.profile)
  formData.append("folder", "lmis/profiles")

  try {
    const response = await fetch(url, {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`)
    }

    const data = await response.json()
    return {
      url: data.secure_url,
      publicId: data.public_id,
      format: data.format,
      size: data.bytes,
    }
  } catch (error) {
    console.error("Profile image upload error:", error)
    throw new Error("Failed to upload profile image")
  }
}

export async function uploadDocument(file) {
  // Use image endpoint for images, raw endpoint for PDFs/other files
  const isImage = file.type.startsWith('image/')
  const resourceType = isImage ? 'image' : 'raw'
  const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/${resourceType}/upload`
  const formData = new FormData()
  formData.append("file", file)
  formData.append("upload_preset", CLOUDINARY_CONFIG.uploadPresets.documents)
  formData.append("folder", "lmis/documents")

  try {
    const response = await fetch(url, {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      const errData = await response.json().catch(() => ({}))
      throw new Error(`Upload failed: ${errData?.error?.message || response.statusText}`)
    }

    const data = await response.json()
    return {
      url: data.secure_url,
      publicId: data.public_id,
      format: data.format,
      size: data.bytes,
      originalName: file.name,
    }
  } catch (error) {
    console.error("Document upload error:", error)
    throw new Error(`Failed to upload document: ${error.message}`)
  }
}

export async function uploadVideo(file, onProgress) {
  // Use chunked upload for files larger than 50MB to avoid network errors
  const CHUNK_SIZE = 50 * 1024 * 1024 // 50MB chunks
  const MAX_FILE_SIZE = 500 * 1024 * 1024 // 500MB max

  if (file.size > MAX_FILE_SIZE) {
    throw new Error(`File too large. Maximum allowed size is 500MB. Your file is ${(file.size / (1024 * 1024)).toFixed(1)}MB.`)
  }

  // For small files (<= 50MB), use standard upload
  if (file.size <= CHUNK_SIZE) {
    return new Promise((resolve, reject) => {
      const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/video/upload`
      const formData = new FormData()
      formData.append("file", file)
      formData.append("upload_preset", CLOUDINARY_CONFIG.uploadPresets.profile)
      formData.append("folder", "lmis/videos")

      const xhr = new XMLHttpRequest()
      xhr.open("POST", url, true)
      xhr.timeout = 300000 // 5 minute timeout

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable && onProgress) {
          const percentComplete = Math.round((event.loaded / event.total) * 100)
          onProgress(percentComplete)
        }
      }

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const data = JSON.parse(xhr.responseText)
          resolve({
            url: data.secure_url,
            publicId: data.public_id,
            format: data.format,
            duration: data.duration,
            size: data.bytes,
            originalName: file.name,
            thumbnailUrl: data.secure_url.replace(/\.[^/.]+$/, ".jpg"),
          })
        } else {
          const errorData = JSON.parse(xhr.responseText || "{}")
          reject(new Error(`Upload failed: ${errorData.error?.message || xhr.statusText}`))
        }
      }

      xhr.onerror = () => reject(new Error("Network error during upload. Please check your internet connection."))
      xhr.ontimeout = () => reject(new Error("Upload timed out. Please try again."))
      xhr.send(formData)
    })
  }

  // For large files (> 50MB), use chunked upload
  const totalChunks = Math.ceil(file.size / CHUNK_SIZE)
  const uploadUrl = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/video/upload`
  let uploadId = null
  let lastResponse = null

  for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
    const start = chunkIndex * CHUNK_SIZE
    const end = Math.min(start + CHUNK_SIZE, file.size)
    const chunk = file.slice(start, end)
    const contentRange = `bytes ${start}-${end - 1}/${file.size}`

    const formData = new FormData()
    formData.append("file", chunk, file.name)
    formData.append("upload_preset", CLOUDINARY_CONFIG.uploadPresets.profile)
    formData.append("folder", "lmis/videos")
    if (uploadId) formData.append("public_id", uploadId)

    lastResponse = await new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest()
      xhr.open("POST", uploadUrl, true)
      xhr.setRequestHeader("X-Unique-Upload-Id", uploadId || (uploadId = `lmis-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`))
      xhr.setRequestHeader("Content-Range", contentRange)
      xhr.timeout = 300000 // 5 min timeout per chunk

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable && onProgress) {
          // Calculate overall progress across all chunks
          const chunkLoaded = start + (event.loaded / event.total) * (end - start)
          const overallPercent = Math.round((chunkLoaded / file.size) * 100)
          onProgress(Math.min(overallPercent, 99))
        }
      }

      xhr.onload = () => {
        if (xhr.status === 200 || xhr.status === 201) {
          resolve(JSON.parse(xhr.responseText))
        } else if (xhr.status === 206) {
          // Chunk accepted, continue with next
          resolve({ partial: true })
        } else {
          const errorData = JSON.parse(xhr.responseText || "{}")
          reject(new Error(`Chunk upload failed: ${errorData.error?.message || xhr.statusText}`))
        }
      }

      xhr.onerror = () => reject(new Error("Network error during chunk upload. Please check your connection."))
      xhr.ontimeout = () => reject(new Error("Chunk upload timed out. Please try again."))
      xhr.send(formData)
    })
  }

  // Final chunk completed - return result
  if (onProgress) onProgress(100)
  return {
    url: lastResponse.secure_url,
    publicId: lastResponse.public_id,
    format: lastResponse.format,
    duration: lastResponse.duration,
    size: lastResponse.bytes || file.size,
    originalName: file.name,
    thumbnailUrl: (lastResponse.secure_url || "").replace(/\.[^/.]+$/, ".jpg"),
  }
}

export function getOptimizedImageUrl(url, options = {}) {
  if (typeof url !== "string" || !url.includes("cloudinary.com")) {
    return url;
  }

  const { width = 400, height = 400, quality = "auto", format = "auto", crop = "fill" } = options;
  const transformations = `w_${width},h_${height},c_${crop},q_${quality},f_${format}`;
  return url.replace("/upload/", `/upload/${transformations}/`);
}


export function validateFile(file, type = "image") {
  const maxSizes = {
    image: 5 * 1024 * 1024,
    document: 10 * 1024 * 1024,
  }

  const allowedTypes = {
    image: ["image/jpeg", "image/png", "image/webp", "image/gif"],
    document: [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "text/plain",
    ],
  }

  if (file.size > maxSizes[type]) {
    throw new Error(`File size must be less than ${maxSizes[type] / (1024 * 1024)}MB`)
  }

  if (!allowedTypes[type].includes(file.type)) {
    throw new Error(`Invalid file type. Allowed: ${allowedTypes[type].join(", ")}`)
  }

  return true
}
