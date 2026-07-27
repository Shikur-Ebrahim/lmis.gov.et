import React, { useRef, useState, useEffect, useCallback } from 'react';
import Webcam from 'react-webcam';
import * as faceapi from '@vladmandic/face-api';
import { Camera, CheckCircle, AlertCircle, Loader2, Volume2, XCircle } from 'lucide-react';

export default function FaceVerification({ profilePhoto, onVerified, onClose }) {
  const webcamRef = useRef(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null); // null | 'verified' | 'declined'
  const [statusText, setStatusText] = useState('Preparing camera...');
  const readyRef = useRef({ models: false, descriptor: null });
  const scanningRef = useRef(false);
  const resultRef = useRef(null);

  const speak = useCallback((text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.rate = 0.95;
      window.speechSynthesis.speak(utter);
    }
  }, []);

  // Load models + profile photo analysis silently in background
  useEffect(() => {
    const init = async () => {
      try {
        // Step 1: load models
        const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/';
        await Promise.all([
          faceapi.nets.ssdMobilenetv1.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
        ]);
        readyRef.current.models = true;

        // Step 2: extract reference descriptor from profile photo
        if (profilePhoto) {
          const imageUrl = URL.createObjectURL(profilePhoto);
          const img = await faceapi.fetchImage(imageUrl);
          const det = await faceapi.detectSingleFace(img).withFaceLandmarks().withFaceDescriptor();
          if (det) {
            readyRef.current.descriptor = det.descriptor;
          }
        }
      } catch (err) {
        console.error('FaceVerification init error:', err);
      }
    };
    init();
  }, [profilePhoto]);

  // Speak instruction when camera is ready
  useEffect(() => {
    if (cameraReady) {
      setStatusText('Please look directly at the camera');
      speak('Please close your face to the camera');
    }
  }, [cameraReady, speak]);

  // Auto-scan loop — runs every 1.2s once camera is ready
  useEffect(() => {
    if (!cameraReady) return;

    const loop = setInterval(async () => {
      if (scanningRef.current || resultRef.current) return;
      if (!webcamRef.current) return;

      // Must have models to detect face at all
      if (!readyRef.current.models) return;

      scanningRef.current = true;
      setScanning(true);

      try {
        const imgSrc = webcamRef.current.getScreenshot();
        if (!imgSrc) { scanningRef.current = false; setScanning(false); return; }

        const img = new Image();
        img.src = imgSrc;
        await new Promise(r => { img.onload = r; });

        // Detect face in webcam frame
        const liveDetection = await faceapi
          .detectSingleFace(img)
          .withFaceLandmarks()
          .withFaceDescriptor();

        if (!liveDetection) {
          setStatusText('No face detected — please look at the camera');
          scanningRef.current = false;
          setScanning(false);
          return;
        }

        setStatusText('Face detected — verifying...');

        // If profile descriptor is ready, compare
        if (readyRef.current.descriptor) {
          const distance = faceapi.euclideanDistance(readyRef.current.descriptor, liveDetection.descriptor);
          if (distance < 0.6) {
            resultRef.current = 'verified';
            setResult('verified');
            speak('Verification successful. Identity confirmed.');
            setTimeout(() => { onVerified(); }, 2200);
          } else {
            resultRef.current = 'declined';
            setResult('declined');
            speak('Verification declined. Your face does not match the profile photo.');
          }
        } else {
          // Profile photo analysis not done yet — just confirm face was scanned
          // Use a simple liveness check (just that a face is present) and accept
          // Actually wait a tiny bit more for the descriptor
          setStatusText('Checking identity...');
          // retry in next tick
        }
      } catch (err) {
        console.error('Scan error:', err);
      }

      scanningRef.current = false;
      setScanning(false);
    }, 1200);

    return () => clearInterval(loop);
  }, [cameraReady, speak, onVerified]);

  const handleRetry = () => {
    resultRef.current = null;
    setResult(null);
    setStatusText('Please look directly at the camera');
    speak('Please close your face to the camera');
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center bg-black/85 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="relative w-full max-w-md bg-white rounded-t-[32px] sm:rounded-[32px] overflow-hidden shadow-2xl animate-in slide-in-from-bottom-8 sm:zoom-in-95 duration-500">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 bg-gradient-to-r from-blue-600 to-blue-500">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
              <Camera className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-black text-white">Face Verification</h2>
              <p className="text-xs text-blue-100 font-medium">Identity Check</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors"
          >
            <XCircle size={20} />
          </button>
        </div>

        {/* Camera + Result */}
        <div className="p-6 flex flex-col items-center gap-5">

          {/* Camera Feed — always visible */}
          {result !== 'verified' && (
            <div className="relative w-full aspect-[3/4] sm:aspect-[4/3] rounded-3xl overflow-hidden bg-black shadow-2xl border-4 border-gray-100">
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"
                videoConstraints={{ facingMode: 'user' }}
                onUserMedia={() => setCameraReady(true)}
                className="w-full h-full object-cover scale-x-[-1]"
              />

              {/* Oval face guide overlay */}
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div
                  className="border-4 border-dashed border-white/60 rounded-full"
                  style={{ width: '60%', height: '70%' }}
                />
              </div>

              {/* Scanning badge */}
              {cameraReady && (
                <div className={`absolute top-4 left-0 right-0 flex justify-center`}>
                  <div className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-black uppercase tracking-widest shadow-lg
                    ${scanning ? 'bg-blue-600 text-white' : 'bg-black/50 backdrop-blur-sm text-white'}`}>
                    {scanning
                      ? <><Loader2 size={14} className="animate-spin" /> Scanning...</>
                      : <><div className="w-2 h-2 rounded-full bg-red-400 animate-pulse" /> Live</>
                    }
                  </div>
                </div>
              )}

              {/* Not ready overlay */}
              {!cameraReady && (
                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-3">
                  <Loader2 className="w-8 h-8 text-white animate-spin" />
                  <p className="text-white text-sm font-bold">Starting camera...</p>
                </div>
              )}
            </div>
          )}

          {/* Verified State */}
          {result === 'verified' && (
            <div className="py-6 flex flex-col items-center gap-4 w-full animate-in zoom-in duration-500">
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center shadow-lg shadow-green-100">
                <CheckCircle className="w-12 h-12 text-green-500" />
              </div>
              <div className="text-center">
                <h3 className="text-2xl font-black text-green-700 uppercase">Verified!</h3>
                <p className="text-sm text-gray-500 mt-1 font-medium">Identity confirmed. Proceeding...</p>
              </div>
            </div>
          )}

          {/* Declined State */}
          {result === 'declined' && (
            <div className="py-4 flex flex-col items-center gap-4 w-full">
              <div className="w-24 h-24 bg-red-100 rounded-full flex items-center justify-center shadow-lg shadow-red-100 animate-in zoom-in duration-500">
                <AlertCircle className="w-12 h-12 text-red-500" />
              </div>
              <div className="text-center">
                <h3 className="text-2xl font-black text-red-600 uppercase">Declined</h3>
                <p className="text-sm text-gray-500 mt-1 font-medium">
                  Your face does not match the profile photo.
                </p>
              </div>
              {/* Camera visible for retry */}
              <div className="relative w-full aspect-[3/4] sm:aspect-[4/3] rounded-3xl overflow-hidden bg-black shadow-xl border-4 border-red-100">
                <Webcam
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  videoConstraints={{ facingMode: 'user' }}
                  className="w-full h-full object-cover scale-x-[-1]"
                />
              </div>
              <button
                type="button"
                onClick={handleRetry}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-200 active:scale-95 transition-all"
              >
                <Camera size={18} /> Try Again
              </button>
            </div>
          )}

          {/* Status text */}
          {result !== 'verified' && result !== 'declined' && (
            <div className="flex items-center gap-2 text-gray-500 text-sm font-medium">
              <Volume2 size={16} className="text-blue-400 animate-pulse flex-shrink-0" />
              <p>{statusText}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
