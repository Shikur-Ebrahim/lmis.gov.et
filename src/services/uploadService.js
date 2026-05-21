// src/services/uploadService.js
import { uploadToCloudinary, uploadDocument, validateFile } from "../utils/cloudinary";
import { doc, updateDoc, arrayUnion } from "firebase/firestore";
import { db } from "../config/firebase"; // adjust path if needed

export async function uploadProfile(file, userId) {
  validateFile(file, "image");
  const result = await uploadToCloudinary(file);
  await updateDoc(doc(db, "users", userId), { profileImage: result.url });
}

export async function uploadUserDocument(file, userId) {
  validateFile(file, "document");
  const result = await uploadDocument(file);
  await updateDoc(doc(db, "users", userId), {
    documents: arrayUnion({
      name: result.originalName,
      url: result.url,
      uploadedAt: new Date(),
    }),
  });
}
