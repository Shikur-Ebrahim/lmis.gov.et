import React, { useRef, useState, useEffect, useCallback } from 'react';
import Webcam from 'react-webcam';
import * as faceapi from '@vladmandic/face-api';
import { Camera, CheckCircle, AlertCircle, Loader2, Volume2, XCircle, RefreshCw } from 'lucide-react';

const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/';

export default function FaceVerification({ profilePhoto, onVerified, onClose }) {
  const webcamRef = useRef(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null); // null | 'verified' | 'declined'
  const [statusText, setStatusText] = useState('Opening camera...');
  const [modelsReady, setModelsReady] = useState(false);

  // Use refs for the scan loop to avoid stale closures
  const scanLoopRef = useRef(null);
  const resultRef = useRef(null);
  const descriptorRef = useRef(null);
  const scanningRef = useRef(false);

  const speak = useCallback((text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.rate = 1.0;
      utter.lang = 'en-US';
      window.speechSynthesis.speak(utter);
    }
  }, []);

  // Load TINY (fast, mobile-friendly) models + profile photo analysis in background
  useEffect(() => {
    const init = async () => {
      try {
        // TinyFaceDetector is fast and works great on mobile
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68TinyNet.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
        ]);
        setModelsReady(true);

        // Analyze profile photo in background
        if (profilePhoto) {
          try {
            const imageUrl = URL.createObjectURL(profilePhoto);
            const img = await faceapi.fetchImage(imageUrl);
            // Use tiny options for speed
            const det = await faceapi
              .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions({ scoreThreshold: 0.3 }))
              .withFaceLandmarks(true)
              .withFaceDescriptor();
            if (det) {
              descriptorRef.current = det.descriptor;
            }
          } catch (e) {
            // Profile photo analysis failed — will still scan but skip comparison
            console.warn('Profile photo analysis failed:', e);
          }
        }
      } catch (err) {
        console.error('Model load error:', err);
      }
    };
    init();
  }, [profilePhoto]);

  // Speak once camera is ready
  useEffect(() => {
    if (cameraReady) {
      setStatusText('Please look directly at the camera');
      speak('Please close your face to the camera');
    }
  }, [cameraReady, speak]);

  // Auto-scan loop — every 800ms for fast detection
  useEffect(() => {
    if (!cameraReady || !modelsReady) return;

    const doScan = async () => {
      if (scanningRef.current || resultRef.current || !webcamRef.current) return;

      scanningRef.current = true;
      setScanning(true);

      try {
        const imgSrc = webcamRef.current.getScreenshot({ width: 640, height: 480 });
        if (!imgSrc) { scanningRef.current = false; setScanning(false); return; }

        const img = new Image();
        img.src = imgSrc;
        await new Promise(r => { img.onload = r; });

        // Use TinyFaceDetector with low score threshold for easy mobile detection
        const liveDetection = await faceapi
          .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions({ scoreThreshold: 0.2, inputSize: 320 }))
          .withFaceLandmarks(true)
          .withFaceDescriptor();

        if (!liveDetection) {
          setStatusText('Move your face closer to the camera');
          scanningRef.current = false;
          setScanning(false);
          return;
        }

        setStatusText('Face detected — checking identity...');

        if (descriptorRef.current) {
          // Compare with profile photo — use generous threshold (0.75) for easier passing
          const distance = faceapi.euclideanDistance(descriptorRef.current, liveDetection.descriptor);
          console.log('Face distance:', distance);

          if (distance < 0.75) {
            resultRef.current = 'verified';
            setResult('verified');
            speak('Verification successful. Identity confirmed.');
            setTimeout(() => onVerified(), 2000);
          } else {
            resultRef.current = 'declined';
            setResult('declined');
            speak('Verification declined. Profile photo does not match.');
          }
        } else {
          // Profile descriptor not ready yet, keep scanning
          setStatusText('Checking identity...');
        }
      } catch (err) {
        console.warn('Scan error:', err);
      }

      scanningRef.current = false;
      setScanning(false);
    };

    scanLoopRef.current = setInterval(doScan, 800);
    return () => clearInterval(scanLoopRef.current);
  }, [cameraReady, modelsReady, speak, onVerified]);

  const handleRetry = () => {
    resultRef.current = null;
    setResult(null);
    setStatusText('Please look directly at the camera');
    speak('Please close your face to the camera');
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-end sm:items-center justify-center bg-black/90 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-sm bg-white rounded-t-[36px] sm:rounded-[36px] overflow-hidden shadow-2xl animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-400">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-gradient-to-r from-blue-700 to-blue-500">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
              <Camera className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-base font-black text-white tracking-tight">Face Verification</h2>
              <p className="text-[11px] text-blue-100 font-medium">Identity Check</p>
            </div>
          </div>
          <button type="button" onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors">
            <XCircle size={18} />
          </button>
        </div>

        {/* Camera */}
        <div className="px-5 pt-5 pb-3">
          <div className="relative w-full aspect-[3/4] rounded-3xl overflow-hidden bg-black shadow-inner border-4 border-blue-50">
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              videoConstraints={{ facingMode: 'user', width: 640, height: 480 }}
              onUserMedia={() => setCameraReady(true)}
              className="w-full h-full object-cover scale-x-[-1]"
            />

            {/* Oval face overlay */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div
                className={`border-[3px] border-dashed rounded-full transition-colors duration-300 ${
                  scanning ? 'border-blue-400' : 'border-white/50'
                }`}
                style={{ width: '65%', height: '72%' }}
              />
            </div>

            {/* Status badge */}
            <div className="absolute top-3 left-0 right-0 flex justify-center">
              {result === 'verified' ? (
                <div className="flex items-center gap-2 bg-green-500 text-white px-4 py-1.5 rounded-full text-xs font-black uppercase shadow-lg">
                  <CheckCircle size={14} /> Verified!
                </div>
              ) : result === 'declined' ? (
                <div className="flex items-center gap-2 bg-red-500 text-white px-4 py-1.5 rounded-full text-xs font-black uppercase shadow-lg">
                  <AlertCircle size={14} /> Declined
                </div>
              ) : scanning ? (
                <div className="flex items-center gap-2 bg-blue-600 text-white px-4 py-1.5 rounded-full text-xs font-black uppercase shadow-lg">
                  <Loader2 size={13} className="animate-spin" /> Scanning...
                </div>
              ) : cameraReady ? (
                <div className="flex items-center gap-2 bg-black/50 backdrop-blur-sm text-white px-4 py-1.5 rounded-full text-xs font-bold uppercase">
                  <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse" /> Live
                </div>
              ) : (
                <div className="flex items-center gap-2 bg-black/50 backdrop-blur-sm text-white px-4 py-1.5 rounded-full text-xs font-bold">
                  <Loader2 size={13} className="animate-spin" /> Starting...
                </div>
              )}
            </div>

            {/* Verified overlay */}
            {result === 'verified' && (
              <div className="absolute inset-0 bg-green-500/20 flex items-center justify-center animate-in zoom-in duration-500">
                <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center shadow-xl">
                  <CheckCircle className="w-10 h-10 text-white" />
                </div>
              </div>
            )}

            {/* Declined overlay */}
            {result === 'declined' && (
              <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center animate-in zoom-in duration-500">
                <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center shadow-xl">
                  <AlertCircle className="w-10 h-10 text-white" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Status text + Retry */}
        <div className="px-5 pb-6 flex flex-col items-center gap-3">
          {result === 'verified' ? (
            <p className="text-green-600 font-black text-base text-center">✅ Identity Confirmed!</p>
          ) : result === 'declined' ? (
            <>
              <p className="text-red-600 font-bold text-sm text-center">
                Face does not match the profile photo.
              </p>
              <button type="button" onClick={handleRetry}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 shadow-lg active:scale-95 transition-all">
                <RefreshCw size={16} /> Try Again
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2 text-gray-500 text-xs font-medium">
              <Volume2 size={14} className="text-blue-400 flex-shrink-0 animate-pulse" />
              <p>{statusText}</p>
            </div>
          )}

          {/* Models loading indicator */}
          {!modelsReady && (
            <div className="flex items-center gap-2 text-gray-400 text-[11px]">
              <Loader2 size={12} className="animate-spin" /> Loading AI models...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
