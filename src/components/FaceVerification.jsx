import React, { useRef, useState, useEffect, useCallback } from 'react';
import Webcam from 'react-webcam';
import * as faceapi from '@vladmandic/face-api';
import { Camera, CheckCircle, AlertCircle, Loader2, Volume2, XCircle } from 'lucide-react';

export default function FaceVerification({ profilePhoto, onVerified, onClose }) {
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
        setError("Failed to load AI models. Please check your internet connection.");
      }
    };
    loadModels();
  }, []);

  // Process reference photo
  useEffect(() => {
    if (!modelsLoaded || !profilePhoto) return;

    const processReferencePhoto = async () => {
      try {
        const imageUrl = URL.createObjectURL(profilePhoto);
        const img = await faceapi.fetchImage(imageUrl);
        const detection = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();
        
        if (detection) {
          setReferenceDescriptor(detection.descriptor);
        } else {
          setError("No face detected in your uploaded profile photo. Verification cannot proceed.");
        }
      } catch (err) {
        console.error("Error processing profile photo", err);
        setError("Failed to analyze the profile photo.");
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

  // Trigger initial TTS
  useEffect(() => {
    if (modelsLoaded && referenceDescriptor && !success && !error) {
      speak("Please close your face to the camera");
    }
  }, [modelsLoaded, referenceDescriptor, success, error, speak]);

  // Auto-scan logic
  useEffect(() => {
    if (!modelsLoaded || !referenceDescriptor || success || error || verifying) return;

    const verifyFace = async () => {
      if (!webcamRef.current) return;
      setVerifying(true);

      try {
        const imageSrc = webcamRef.current.getScreenshot();
        if (!imageSrc) {
          setVerifying(false);
          return;
        }

        const img = new Image();
        img.src = imageSrc;
        await new Promise((resolve) => { img.onload = resolve; });

        const detection = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();

        if (detection) {
          const distance = faceapi.euclideanDistance(referenceDescriptor, detection.descriptor);
          
          if (distance < 0.6) {
            setSuccess(true);
            speak("Verification successful.");
            setTimeout(() => {
              onVerified();
            }, 2000);
            return;
          } else {
            // Keep scanning, but notify occasionally or just let the loop continue
            // To prevent spamming voice, we just silently fail and try again next tick
            console.log("Face not matching, distance:", distance);
          }
        }
      } catch (err) {
        console.error(err);
      }
      
      setVerifying(false);
    };

    const interval = setInterval(() => {
      verifyFace();
    }, 1500);

    return () => clearInterval(interval);
  }, [modelsLoaded, referenceDescriptor, success, error, verifying, speak, onVerified]);

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="relative w-full max-w-md bg-white rounded-[32px] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-500">
        
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <Camera className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-800">Face Verification</h2>
          </div>
          <button onClick={onClose} className="p-2 text-gray-400 hover:text-red-500 transition-colors bg-white rounded-full shadow-sm">
            <XCircle size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex flex-col items-center gap-6">
          {success ? (
            <div className="py-8 flex flex-col items-center gap-4 w-full animate-in zoom-in duration-500">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-2">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-2xl font-black text-green-800 uppercase tracking-tight">Verified!</h3>
              <p className="text-gray-600 font-medium text-center">Your identity has been successfully confirmed.</p>
            </div>
          ) : !modelsLoaded || !referenceDescriptor ? (
            <div className="w-full aspect-[4/3] bg-gray-50 rounded-2xl flex flex-col items-center justify-center gap-4 border-2 border-dashed border-gray-200">
              <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
              <p className="text-gray-600 font-bold px-6 text-center">
                {!modelsLoaded ? "Loading AI models..." : "Analyzing profile photo..."}
              </p>
            </div>
          ) : (
            <div className="w-full flex flex-col items-center gap-4">
              <div className="relative w-full aspect-[3/4] sm:aspect-square rounded-3xl overflow-hidden border-4 border-blue-100 shadow-lg bg-black">
                <Webcam
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  videoConstraints={{ facingMode: "user" }}
                  className="w-full h-full object-cover transform scale-x-[-1]"
                />
                <div className="absolute inset-0 border-[4px] border-dashed border-white/40 rounded-3xl m-6 pointer-events-none transition-all duration-1000 animate-pulse"></div>
                
                {verifying && (
                  <div className="absolute top-4 right-4 bg-black/50 backdrop-blur-md rounded-full px-3 py-1.5 flex items-center gap-2">
                    <Loader2 className="w-4 h-4 text-white animate-spin" />
                    <span className="text-xs font-bold text-white tracking-widest uppercase">Scanning</span>
                  </div>
                )}
              </div>
              <p className="text-sm font-bold text-gray-600 text-center flex items-center gap-2">
                <Volume2 size={16} className="text-blue-500 animate-pulse" /> Please look directly at the camera
              </p>
            </div>
          )}

          {error && (
            <div className="w-full p-4 bg-red-50 text-red-700 text-sm font-bold rounded-xl flex items-start gap-3 border border-red-200 animate-in slide-in-from-bottom-2">
              <AlertCircle size={20} className="flex-shrink-0 mt-0.5" />
              <p>{error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
