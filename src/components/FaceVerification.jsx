import React, { useRef, useState, useEffect, useCallback } from 'react';
import Webcam from 'react-webcam';
import * as faceapi from '@vladmandic/face-api';
import { Camera, CheckCircle, AlertCircle, Loader2, Volume2 } from 'lucide-react';

export default function FaceVerification({ profilePhoto, onVerified }) {
  const webcamRef = useRef(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [referenceDescriptor, setReferenceDescriptor] = useState(null);

  // Load models from CDN
  useEffect(() => {
    const loadModels = async () => {
      try {
        const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/';
        await Promise.all([
          faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
        ]);
        setModelsLoaded(true);
      } catch (err) {
        console.error("Failed to load face-api models", err);
        setError("Failed to load verification models. Please check your connection.");
      }
    };
    loadModels();
  }, []);

  // Process reference photo
  useEffect(() => {
    if (!modelsLoaded || !profilePhoto) return;

    const processReferencePhoto = async () => {
      try {
        const img = await faceapi.bufferToImage(profilePhoto);
        const detection = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();
        if (detection) {
          setReferenceDescriptor(detection.descriptor);
        } else {
          setError("No face detected in your uploaded profile photo. Please upload a clear photo.");
        }
      } catch (err) {
        console.error("Error processing profile photo", err);
      }
    };

    processReferencePhoto();
  }, [modelsLoaded, profilePhoto]);

  // Handle TTS
  const speak = useCallback((text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      window.speechSynthesis.speak(utterance);
    }
  }, []);

  // Trigger initial TTS when component mounts and is ready
  useEffect(() => {
    if (modelsLoaded && referenceDescriptor && !success && !error && !verifying) {
      speak("Please close your face to the camera for verification");
    }
  }, [modelsLoaded, referenceDescriptor, success, error, verifying, speak]);

  const verifyFace = async () => {
    if (!webcamRef.current || !referenceDescriptor) return;

    setVerifying(true);
    setError(null);
    speak("Verifying face, please hold still.");

    try {
      const imageSrc = webcamRef.current.getScreenshot();
      if (!imageSrc) throw new Error("Could not capture from webcam");

      // Convert base64 to HTMLImageElement
      const img = new Image();
      img.src = imageSrc;
      await new Promise((resolve) => { img.onload = resolve; });

      const detection = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();

      if (!detection) {
        throw new Error("No face detected in webcam frame. Please position your face clearly.");
      }

      // Calculate distance
      const distance = faceapi.euclideanDistance(referenceDescriptor, detection.descriptor);
      
      // Threshold 0.6 is common (lower = more strict)
      if (distance < 0.6) {
        setSuccess(true);
        speak("Verification successful. You may proceed.");
        onVerified();
      } else {
        throw new Error("Face does not match the uploaded profile photo.");
      }
    } catch (err) {
      console.error(err);
      setError(err.message || "Verification failed");
      speak("Verification failed. " + (err.message || "Please try again."));
    } finally {
      setVerifying(false);
    }
  };

  if (success) {
    return (
      <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-6 flex flex-col items-center gap-3 shadow-sm animate-in zoom-in duration-500">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-2">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-xl font-bold text-green-800">Identity Verified</h3>
        <p className="text-sm text-green-600 text-center font-medium">
          Your face matches your profile photo. You can now proceed.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-4 pb-2 border-b">
        <div className="flex items-center gap-3">
          <Camera className="w-6 h-6 text-blue-600" />
          <h2 className="text-lg font-bold text-gray-800">Face Verification</h2>
        </div>
        <button type="button" onClick={() => speak("Please close your face to the camera for verification")} className="p-2 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-100 transition-colors" title="Play Instructions">
          <Volume2 size={18} />
        </button>
      </div>

      <div className="bg-white border-2 border-blue-100 rounded-2xl p-4 flex flex-col items-center gap-4 shadow-sm relative overflow-hidden">
        
        {!modelsLoaded || !referenceDescriptor ? (
          <div className="w-full h-[240px] bg-gray-50 rounded-xl flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
            <p className="text-sm font-medium text-gray-600 text-center px-4">
              {!modelsLoaded ? "Loading AI models (this may take a moment)..." : "Analyzing profile photo..."}
            </p>
          </div>
        ) : (
          <>
            <div className="relative w-full max-w-[320px] aspect-[4/3] rounded-xl overflow-hidden border-4 border-blue-50 shadow-inner bg-black">
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                videoConstraints={{ facingMode: "user" }}
                className="w-full h-full object-cover transform scale-x-[-1]"
              />
              {/* Overlay guides */}
              <div className="absolute inset-0 border-[3px] border-dashed border-white/50 rounded-xl m-4 pointer-events-none"></div>
            </div>

            {error && (
              <div className="w-full p-3 bg-red-50 text-red-700 text-sm font-medium rounded-lg flex items-start gap-2 border border-red-100 animate-in slide-in-from-top-2">
                <AlertCircle size={18} className="flex-shrink-0 mt-0.5" />
                <p>{error}</p>
              </div>
            )}

            <button
              type="button"
              onClick={verifyFace}
              disabled={verifying}
              className="w-full sm:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-700 disabled:opacity-70 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-200 transition-all active:scale-95 text-sm"
            >
              {verifying ? (
                <><Loader2 className="w-5 h-5 animate-spin" /> Verifying...</>
              ) : (
                <><Camera className="w-5 h-5" /> Scan Face</>
              )}
            </button>
            <p className="text-xs text-gray-500 font-medium italic text-center px-4">
              Please position your face clearly in the camera and click Scan.
            </p>
          </>
        )}
      </div>
    </div>
  );
}
