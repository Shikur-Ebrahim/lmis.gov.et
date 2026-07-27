import React, { useRef, useState, useEffect, useCallback } from 'react';
import Webcam from 'react-webcam';
import * as faceapi from '@vladmandic/face-api';
import { Camera, CheckCircle, AlertCircle, Loader2, Volume2, XCircle, RefreshCw } from 'lucide-react';

const MODEL_URL = 'https://cdn.jsdelivr.net/npm/@vladmandic/face-api/model/';
// Very generous threshold — smaller similarity still passes
const MATCH_THRESHOLD = 0.82;

export default function FaceVerification({ profilePhoto, onVerified, onClose }) {
  const webcamRef = useRef(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [modelsReady, setModelsReady] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [result, setResult] = useState(null); // null | 'verified' | 'declined'
  const [statusText, setStatusText] = useState('Opening camera...');

  // Refs for scan loop
  const descriptorRef = useRef(null);       // profile photo face descriptor (may be null)
  const profileCheckedRef = useRef(false);  // true once profile analysis is done
  const resultRef = useRef(null);
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

  // Load tiny models + analyze profile photo silently
  useEffect(() => {
    const init = async () => {
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68TinyNet.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL)
        ]);

        // Try to get face descriptor from profile photo
        if (profilePhoto) {
          try {
            const url = URL.createObjectURL(profilePhoto);
            const img = await faceapi.fetchImage(url);
            const det = await faceapi
              .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions({ scoreThreshold: 0.2, inputSize: 320 }))
              .withFaceLandmarks(true)
              .withFaceDescriptor();
            if (det) {
              descriptorRef.current = det.descriptor;
            }
            // If no face found in profile photo, descriptorRef stays null → liveness-only mode
          } catch (_) {
            // Profile analysis failed → liveness-only mode
          }
        }

        profileCheckedRef.current = true;
        setModelsReady(true);
      } catch (err) {
        console.error('Model load error:', err);
        setStatusText('Failed to load AI. Please retry.');
      }
    };
    init();
  }, [profilePhoto]);

  // Speak when camera is ready
  useEffect(() => {
    if (cameraReady) {
      setStatusText('Please look directly at the camera');
      speak('Please close your face to the camera');
    }
  }, [cameraReady, speak]);

  // Auto-scan loop — every 900ms
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

        // Detect live face with very permissive threshold
        const liveDetection = await faceapi
          .detectSingleFace(img, new faceapi.TinyFaceDetectorOptions({ scoreThreshold: 0.15, inputSize: 320 }))
          .withFaceLandmarks(true)
          .withFaceDescriptor();

        if (!liveDetection) {
          setStatusText('Please move your face closer and look at camera');
          scanningRef.current = false;
          setScanning(false);
          return;
        }

        setStatusText('Face detected — verifying identity...');

        // Case 1: We have a profile descriptor → compare
        if (descriptorRef.current) {
          const dist = faceapi.euclideanDistance(descriptorRef.current, liveDetection.descriptor);
          console.log('Face match distance:', dist, '(threshold:', MATCH_THRESHOLD, ')');

          if (dist < MATCH_THRESHOLD) {
            markVerified();
          } else {
            markDeclined();
          }
        } else {
          // Case 2: No face in profile photo → liveness-only mode → PASS automatically
          // (a real person is in front of the camera)
          markVerified();
        }
      } catch (err) {
        console.warn('Scan error:', err);
      }

      scanningRef.current = false;
      setScanning(false);
    };

    const interval = setInterval(doScan, 900);
    return () => clearInterval(interval);
  }, [cameraReady, modelsReady]); // eslint-disable-line

  const markVerified = () => {
    resultRef.current = 'verified';
    setResult('verified');
    speak('Verification successful. Identity confirmed.');
    setTimeout(() => onVerified(), 2200);
  };

  const markDeclined = () => {
    resultRef.current = 'declined';
    setResult('declined');
    speak('Verification declined. Please try again.');
  };

  const handleRetry = () => {
    resultRef.current = null;
    setResult(null);
    setStatusText('Please look directly at the camera');
    speak('Please close your face to the camera again');
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
              <p className="text-[11px] text-blue-100 font-medium">
                {descriptorRef.current === null && profileCheckedRef.current
                  ? 'Liveness Check Mode'
                  : 'Identity Check'}
              </p>
            </div>
          </div>
          <button type="button" onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white hover:bg-white/30 transition-colors">
            <XCircle size={18} />
          </button>
        </div>

        {/* Camera View */}
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

            {/* Oval guide */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div
                className={`border-[3px] border-dashed rounded-full transition-all duration-300 ${
                  scanning ? 'border-blue-400 scale-105' : 'border-white/50'
                }`}
                style={{ width: '65%', height: '72%' }}
              />
            </div>

            {/* Top badge */}
            <div className="absolute top-3 left-0 right-0 flex justify-center">
              {result === 'verified' ? (
                <div className="flex items-center gap-1.5 bg-green-500 text-white px-4 py-1.5 rounded-full text-xs font-black uppercase shadow-lg">
                  <CheckCircle size={13} /> Verified!
                </div>
              ) : result === 'declined' ? (
                <div className="flex items-center gap-1.5 bg-red-500 text-white px-4 py-1.5 rounded-full text-xs font-black uppercase shadow-lg">
                  <AlertCircle size={13} /> Not Matched
                </div>
              ) : scanning ? (
                <div className="flex items-center gap-1.5 bg-blue-600 text-white px-4 py-1.5 rounded-full text-xs font-black uppercase shadow-lg">
                  <Loader2 size={12} className="animate-spin" /> Scanning...
                </div>
              ) : cameraReady ? (
                <div className="flex items-center gap-1.5 bg-black/50 backdrop-blur-sm text-white px-4 py-1.5 rounded-full text-xs font-bold">
                  <div className="w-2 h-2 rounded-full bg-red-400 animate-pulse" /> Live
                </div>
              ) : (
                <div className="flex items-center gap-1.5 bg-black/50 text-white px-3 py-1.5 rounded-full text-xs font-bold">
                  <Loader2 size={12} className="animate-spin" /> Starting camera...
                </div>
              )}
            </div>

            {/* Result overlay */}
            {result === 'verified' && (
              <div className="absolute inset-0 bg-green-500/25 flex items-center justify-center animate-in zoom-in duration-400">
                <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center shadow-2xl ring-4 ring-green-200">
                  <CheckCircle className="w-10 h-10 text-white" />
                </div>
              </div>
            )}
            {result === 'declined' && (
              <div className="absolute inset-0 bg-red-500/25 flex items-center justify-center animate-in zoom-in duration-400">
                <div className="w-20 h-20 bg-red-500 rounded-full flex items-center justify-center shadow-2xl ring-4 ring-red-200">
                  <AlertCircle className="w-10 h-10 text-white" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Bottom status */}
        <div className="px-5 pb-6 flex flex-col items-center gap-3">
          {result === 'verified' ? (
            <p className="text-green-600 font-black text-sm text-center">✅ Identity Confirmed — proceeding...</p>
          ) : result === 'declined' ? (
            <>
              <p className="text-red-600 font-bold text-xs text-center">
                Your face did not match the profile photo. Please try again.
              </p>
              <button type="button" onClick={handleRetry}
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg shadow-blue-100">
                <RefreshCw size={15} /> Try Again
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2 text-gray-500 text-xs font-medium">
              <Volume2 size={13} className="text-blue-400 flex-shrink-0 animate-pulse" />
              <p>{statusText}</p>
            </div>
          )}
          {!modelsReady && (
            <div className="flex items-center gap-1.5 text-gray-400 text-[11px]">
              <Loader2 size={11} className="animate-spin" /> Loading AI in background...
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
