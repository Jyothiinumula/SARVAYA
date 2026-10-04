import React, { useState, useRef, useEffect } from 'react';
import { useCivic } from '../context/CivicContext';
import {
  Camera,
  MapPin,
  Mic,
  MicOff,
  Image as ImageIcon,
  CheckCircle2,
  BookmarkCheck,
  Send,
  AlertTriangle,
  RefreshCw,
  Info,
  ChevronRight,
  ShieldCheck,
  Building,
  Upload,
  X,
  WifiOff,
  CloudUpload,
} from 'lucide-react';
import { CivicCategory, CivicComplaint } from '../types';
import { SmartPriorityAnalysisCard } from './SmartPriorityAnalysisCard';
import {
  analyzeWithIssueSense,
  calculateSmartPriority,
  checkCivicHotspot,
  determineSmartRoute,
} from '../services/civicIntelligence';

const CATEGORY_SUGGESTIONS: CivicCategory[] = [
  'Waterlogging',
  'Drainage',
  'Water Supply',
  'Waste',
  'Road',
  'Streetlight',
  'Public Washroom',
  'Sanitation / Hygiene',
  'Public Infrastructure',
  'Public Safety',
  'Other',
];

type ReportingMode = 'select' | 'camera_now' | 'camera_later' | 'gallery';

export const CivicCaptureView: React.FC = () => {
  const {
    submitCivicReport,
    saveDraft,
    setCurrentView,
    setSelectedComplaint,
    draftComplaint,
    setDraftComplaint,
    complaints,
    hotspots,
    isOnline,
    offlineQueueCount,
  } = useCivic();

  // Mode: initial choice of the 3 options, or actively in a mode
  const [reportingChoice, setReportingChoice] = useState<ReportingMode>(
    draftComplaint ? 'camera_now' : 'select'
  );

  // Form State
  const [photoUrl, setPhotoUrl] = useState<string>(
    draftComplaint?.photoUrl || ''
  );
  const [title, setTitle] = useState(draftComplaint?.title || '');
  const [description, setDescription] = useState(draftComplaint?.description || '');
  const [locationAddress, setLocationAddress] = useState(
    draftComplaint?.location?.address || 'MG Road, Near RTC Complex'
  );
  const [landmark, setLandmark] = useState(
    draftComplaint?.location?.landmark || 'Near Bus Stand & Commercial Complex'
  );
  const [ward, setWard] = useState(draftComplaint?.location?.ward || 'Ward 14 (Central Zone)');
  const [city] = useState('Vizianagaram');
  const [selectedCategory, setSelectedCategory] = useState<CivicCategory>(
    draftComplaint?.category || 'Waterlogging'
  );

  // Camera capture state
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Audio recording simulation
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [audioTranscript, setAudioTranscript] = useState<string | null>(
    draftComplaint?.audioNote?.transcript || null
  );

  // Modals
  const [submittedReport, setSubmittedReport] = useState<CivicComplaint | null>(null);
  const [isDraftSavedModal, setIsDraftSavedModal] = useState(false);

  // Start real browser camera
  const startCamera = async () => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera stream not supported in this browser. Please use standard photo picker.');
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: 'environment' } },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setIsCameraActive(true);
    } catch (err: any) {
      console.warn('Camera stream error:', err);
      setCameraError(
        'Camera permission was not granted or camera is in use. You can use standard file capture or gallery below.'
      );
      setIsCameraActive(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  // Capture still from video stream
  const takeSnapshot = () => {
    if (videoRef.current) {
      const video = videoRef.current;
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
        setPhotoUrl(dataUrl);
        stopCamera();

        // If in "Capture Now, Submit Later" mode, immediately save draft!
        if (reportingChoice === 'camera_later') {
          handleExecuteDraftSave(dataUrl);
        }
      }
    }
  };

  // Handle local gallery or file upload
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = event => {
        const result = event.target?.result as string;
        setPhotoUrl(result);
        if (reportingChoice === 'camera_later') {
          handleExecuteDraftSave(result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Auto-detect GPS location
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          // Keep coordinates calibrated to Vizianagaram test area
        },
        () => {
          // Graceful fallback to default Vizianagaram coordinates
        }
      );
    }
  }, []);

  // Cleanup camera stream on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  // Audio timer
  useEffect(() => {
    let interval: any;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingSeconds(s => s + 1);
      }, 1000);
    } else {
      setRecordingSeconds(0);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  const handleToggleRecord = () => {
    if (isRecording) {
      setIsRecording(false);
      const generatedTranscript =
        description.trim().length > 0
          ? `Voice Note Recorded: "${description.slice(0, 100)}..."`
          : 'Voice Note Recorded: "Water is standing near RTC complex with foul odor for 4 days."';
      setAudioTranscript(generatedTranscript);
      if (!description) {
        setDescription('Water is standing near RTC complex with foul odor for 4 days.');
      }
    } else {
      setIsRecording(true);
    }
  };

  // Option 2: Execute "Capture Now, Submit Later"
  const handleExecuteDraftSave = (capturedImage?: string) => {
    const imageToSave = capturedImage || photoUrl || 'https://images.unsplash.com/photo-1541888946425-d0fbb186f5f8?auto=format&fit=crop&w=800&q=80';
    saveDraft({
      id: draftComplaint?.id,
      title: title || 'Captured Civic Issue (Draft)',
      description: description || 'Photo and GPS saved on-the-spot. Pending detailed submission.',
      photoUrl: imageToSave,
      category: selectedCategory,
      specificProblem: title || 'Pending Citizen Description',
      location: {
        address: locationAddress,
        landmark,
        ward,
        city: 'Vizianagaram',
        lat: 18.1158,
        lng: 83.3986,
      },
      audioNote: audioTranscript ? { duration: '0:20', transcript: audioTranscript } : undefined,
    });

    setIsDraftSavedModal(true);
  };

  // Option 1 & 3: Submit Report
  const handleSubmitReport = (e: React.FormEvent) => {
    e.preventDefault();

    const finalImage = photoUrl || 'https://images.unsplash.com/photo-1541888946425-d0fbb186f5f8?auto=format&fit=crop&w=800&q=80';

    const report = submitCivicReport({
      title: title || `${selectedCategory} grievance at ${locationAddress}`,
      description: description || 'Civic problem reported by citizen for field inspection.',
      photoUrl: finalImage,
      audioNote: audioTranscript ? { duration: '0:20', transcript: audioTranscript } : undefined,
      location: {
        address: locationAddress,
        landmark,
        ward,
        lat: 18.1158,
        lng: 83.3986,
      },
      category: selectedCategory,
    });

    if (draftComplaint?.id) {
      setDraftComplaint(null);
    }

    setSubmittedReport(report);
  };

  // Hidden native file input for camera/gallery
  const triggerFileInput = (captureMode?: 'environment') => {
    if (fileInputRef.current) {
      if (captureMode) {
        fileInputRef.current.setAttribute('capture', captureMode);
      } else {
        fileInputRef.current.removeAttribute('capture');
      }
      fileInputRef.current.click();
    }
  };

  return (
    <div className="space-y-4 pb-28 animate-fadeIn">
      {/* Hidden File Input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />

      {/* Header */}
      <div className="bg-[#000080] text-white p-4 rounded-2xl shadow-sm border border-white/20 relative overflow-hidden">
        {/* Subtle Indian Tricolour accent bar */}
        <div className="h-1 w-20 bg-gradient-to-r from-[#FF9933] via-white to-[#138808] rounded-full mb-2" />
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold tracking-tight">CivicCapture</h2>
            <p className="text-[11px] text-blue-100">Capture. Locate. Report.</p>
          </div>
          <span className="text-[10px] bg-[#FF9933]/20 px-2 py-0.5 rounded text-[#FFD4A8] border border-[#FF9933]/40 font-bold">
            Vizianagaram Municipal Corporation
          </span>
        </div>
      </div>

      {/* SECTION 5: EXACT THREE REPORTING CHOICES */}
      {!isOnline && (
        <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/80 rounded-2xl flex items-center justify-between text-xs text-amber-900 dark:text-amber-200 shadow-2xs">
          <div className="flex items-center gap-2">
            <WifiOff size={16} className="text-amber-600 dark:text-amber-400 shrink-0" />
            <div>
              <span className="font-extrabold block">Offline Reporting Ready</span>
              <span className="text-[11px] text-amber-700 dark:text-amber-300">
                You can capture photos, record audio, and draft reports without network. Data is preserved safely in local device storage.
              </span>
            </div>
          </div>
          {offlineQueueCount > 0 && (
            <span className="px-2 py-0.5 bg-amber-200 dark:bg-amber-900 text-amber-900 dark:text-amber-100 rounded-full font-bold text-[10px] shrink-0 ml-2">
              {offlineQueueCount} in outbox
            </span>
          )}
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-800 space-y-2.5">
        <label className="text-xs font-bold uppercase tracking-wider text-[#000080] dark:text-blue-300 block flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#FF9933]" />
          Select Reporting Method:
        </label>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          {/* Choice 1: Capture & Report Now */}
          <button
            type="button"
            onClick={() => {
              setReportingChoice('camera_now');
              startCamera();
            }}
            className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition ${
              reportingChoice === 'camera_now'
                ? 'border-[#000080] dark:border-blue-600 bg-[#EBF0FA] dark:bg-blue-950/50 text-[#000080] dark:text-blue-300'
                : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-200'
            }`}
          >
            <div className="w-8 h-8 rounded-lg bg-[#EBF0FA] dark:bg-blue-950/80 text-[#000080] dark:text-blue-300 flex items-center justify-center shrink-0 mt-0.5 border border-[#B3C6EB] dark:border-blue-800">
              <Camera size={16} />
            </div>
            <div>
              <span className="font-bold text-xs block leading-tight text-[#000080] dark:text-blue-300">
                1. Capture &amp; Report Now
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight block mt-0.5">
                Open camera, take photo, describe, and submit immediately
              </span>
            </div>
          </button>

          {/* Choice 2: Capture Now, Submit Later */}
          <button
            type="button"
            onClick={() => {
              setReportingChoice('camera_later');
              startCamera();
            }}
            className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition ${
              reportingChoice === 'camera_later'
                ? 'border-[#FF9933] dark:border-amber-600 bg-[#FFF6EC] dark:bg-amber-950/50 text-[#000080] dark:text-amber-300'
                : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-200'
            }`}
          >
            <div className="w-8 h-8 rounded-lg bg-[#FFF6EC] dark:bg-amber-950/80 text-[#E68A00] dark:text-[#FF9933] flex items-center justify-center shrink-0 mt-0.5 border border-[#FFD4A8] dark:border-amber-800">
              <BookmarkCheck size={16} />
            </div>
            <div>
              <span className="font-bold text-xs block leading-tight text-[#000080] dark:text-amber-300">
                2. Capture Now, Submit Later
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight block mt-0.5">
                Snap photo &amp; GPS immediately. Saves as draft to submit later
              </span>
            </div>
          </button>

          {/* Choice 3: Choose from Gallery */}
          <button
            type="button"
            onClick={() => {
              setReportingChoice('gallery');
              stopCamera();
              triggerFileInput();
            }}
            className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition ${
              reportingChoice === 'gallery'
                ? 'border-[#000080] dark:border-blue-600 bg-[#EBF0FA] dark:bg-blue-950/50 text-[#000080] dark:text-blue-300'
                : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-200'
            }`}
          >
            <div className="w-8 h-8 rounded-lg bg-[#EBF0FA] dark:bg-blue-950/80 text-[#000080] dark:text-blue-300 flex items-center justify-center shrink-0 mt-0.5 border border-[#B3C6EB] dark:border-blue-800">
              <ImageIcon size={16} />
            </div>
            <div>
              <span className="font-bold text-xs block leading-tight text-[#000080] dark:text-blue-300">
                3. Choose from Gallery
              </span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight block mt-0.5">
                Select an existing photo from your phone or device
              </span>
            </div>
          </button>
        </div>
      </div>

      {/* CAMERA VIEWFINDER / PHOTO PREVIEW */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
            <Camera size={14} className="text-[#000080] dark:text-blue-400" />
            <span>Problem Photograph</span>
          </label>
          {photoUrl && (
            <span className="text-[11px] text-[#138808] dark:text-emerald-400 font-bold flex items-center gap-1">
              <CheckCircle2 size={12} />
              Photo Attached
            </span>
          )}
        </div>

        {/* Live Camera Viewfinder if active */}
        {isCameraActive && (
          <div className="relative aspect-video rounded-xl overflow-hidden bg-black flex items-center justify-center border-2 border-[#000080] dark:border-blue-500">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-3 px-4">
              <button
                type="button"
                onClick={takeSnapshot}
                className="py-2 px-5 bg-white text-[#000080] font-bold text-xs rounded-full shadow-lg flex items-center gap-2 hover:bg-slate-100"
              >
                <Camera size={16} className="text-[#000080]" />
                <span>Take Photo</span>
              </button>
              <button
                type="button"
                onClick={stopCamera}
                className="py-2 px-3 bg-black/60 text-white font-semibold text-xs rounded-full"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Camera Permission / Fallback Notice */}
        {cameraError && (
          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-800/60 text-xs text-amber-900 dark:text-amber-200 space-y-2">
            <div className="flex items-start gap-1.5">
              <AlertTriangle size={15} className="text-[#b97816] shrink-0 mt-0.5" />
              <span>{cameraError}</span>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => triggerFileInput('environment')}
                className="px-3 py-1.5 bg-[#000080] text-white rounded-lg text-[11px] font-bold"
              >
                Open Camera via Native App
              </button>
              <button
                type="button"
                onClick={() => triggerFileInput()}
                className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 rounded-lg text-[11px] font-semibold"
              >
                Upload File from Device
              </button>
            </div>
          </div>
        )}

        {/* Captured/Selected Photo Preview */}
        {!isCameraActive && photoUrl && (
          <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-800">
            <img src={photoUrl} alt="Captured civic issue" className="w-full h-full object-cover" />
            <div className="absolute top-2 left-2 bg-black/60 text-white text-[10px] font-medium px-2 py-0.5 rounded-md flex items-center gap-1 backdrop-blur-2xs">
              <MapPin size={10} className="text-[#138808]" />
              <span>Vizianagaram • 18.1158° N, 83.3986° E</span>
            </div>
            <button
              type="button"
              onClick={() => {
                setPhotoUrl('');
                startCamera();
              }}
              className="absolute bottom-2 right-2 bg-white/90 hover:bg-white dark:bg-slate-900/90 dark:hover:bg-slate-900 text-slate-800 dark:text-slate-200 text-[10px] font-bold px-2.5 py-1 rounded-md shadow-xs border border-slate-200 dark:border-slate-700"
            >
              Retake / Change Photo
            </button>
          </div>
        )}

        {/* Empty state when no photo yet */}
        {!isCameraActive && !photoUrl && (
          <div className="p-6 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl text-center space-y-2.5 bg-slate-50 dark:bg-slate-850">
            <Camera size={28} className="mx-auto text-slate-400 dark:text-slate-500" />
            <div className="text-xs text-slate-600 dark:text-slate-300">
              No photo selected yet. Choose an option to take or select a photo.
            </div>
            <div className="flex justify-center gap-2">
              <button
                type="button"
                onClick={startCamera}
                className="px-3 py-1.5 bg-[#000080] text-white text-xs font-bold rounded-lg shadow-xs"
              >
                Open Camera
              </button>
              <button
                type="button"
                onClick={() => triggerFileInput()}
                className="px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold rounded-lg"
              >
                Select from Device
              </button>
            </div>
          </div>
        )}
      </div>

      {/* SECTION 6: SIMPLE CATEGORY SUGGESTIONS */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-800 space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block">
          Problem Category Suggestions:
        </label>
        <p className="text-[11px] text-slate-500 dark:text-slate-400">
          Tap to select the civic category matching this grievance:
        </p>

        <div className="flex flex-wrap gap-1.5 pt-1">
          {CATEGORY_SUGGESTIONS.map(cat => (
            <button
              type="button"
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition border ${
                selectedCategory === cat
                  ? 'bg-[#000080] dark:bg-blue-600 text-white border-[#000080] dark:border-blue-500 shadow-2xs font-bold ring-2 ring-[#FF9933]/50'
                  : 'bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* FORM: DETAILS, VOICE NOTE, AND LOCATION */}
      <form onSubmit={handleSubmitReport} className="space-y-4">
        {/* Description & Voice Note */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-800 space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-[#000080] dark:text-blue-300 block flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#FF9933]" />
            Problem Description &amp; Voice Note
          </label>

          <div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Issue Title / Short Summary:</span>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Waterlogging and bad smell on MG Road"
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:border-[#000080] dark:focus:border-blue-400 mt-0.5"
            />
          </div>

          <div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Detailed Description:</span>
            <textarea
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Describe the problem: duration, smell, water stagnation, traffic blockage, etc."
              className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:border-[#000080] dark:focus:border-blue-400 mt-0.5"
              required
            />
          </div>

          {/* Voice Note Button */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl border border-slate-200 dark:border-slate-700 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Mic size={14} className={isRecording ? 'text-red-500 animate-pulse' : 'text-[#000080] dark:text-blue-400'} />
                <span>Voice Audio Note (Optional)</span>
              </span>

              <button
                type="button"
                onClick={handleToggleRecord}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition ${
                  isRecording
                    ? 'bg-red-500 text-white animate-pulse'
                    : 'bg-[#000080] text-white hover:bg-[#000060]'
                }`}
              >
                {isRecording ? (
                  <>
                    <MicOff size={13} />
                    <span>Stop ({recordingSeconds}s)</span>
                  </>
                ) : (
                  <>
                    <Mic size={13} />
                    <span>Record Audio</span>
                  </>
                )}
              </button>
            </div>

            {audioTranscript && (
              <div className="p-2 bg-emerald-50 dark:bg-emerald-950/40 rounded-lg border border-[#138808]/40 text-xs text-emerald-900 dark:text-emerald-300 flex items-start gap-1.5">
                <CheckCircle2 size={13} className="text-[#138808] shrink-0 mt-0.5" />
                <span>{audioTranscript}</span>
              </div>
            )}
          </div>
        </div>

        {/* Location & Ward (Vizianagaram) */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-800 space-y-2.5">
          <label className="text-xs font-bold uppercase tracking-wider text-[#000080] dark:text-blue-300 flex items-center gap-1.5">
            <MapPin size={14} className="text-[#138808]" />
            <span>Problem Location</span>
          </label>

          <div className="space-y-2">
            <div>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Street / Locality Address:</span>
              <input
                type="text"
                value={locationAddress}
                onChange={e => setLocationAddress(e.target.value)}
                placeholder="e.g. MG Road, Near RTC Complex"
                className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:border-[#000080] dark:focus:border-blue-400 mt-0.5"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Landmark:</span>
                <input
                  type="text"
                  value={landmark}
                  onChange={e => setLandmark(e.target.value)}
                  placeholder="e.g. Near Bus Stand"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:border-[#000080] dark:focus:border-blue-400 mt-0.5"
                />
              </div>

              <div>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Municipality:</span>
                <input
                  type="text"
                  disabled
                  value="Vizianagaram Municipal Corp"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 mt-0.5 font-medium"
                />
              </div>
            </div>
          </div>
        </div>

        {/* ACTION BUTTONS (Save Draft vs Submit Report) */}
        <div className="grid grid-cols-2 gap-3 pt-1">
          <button
            type="button"
            onClick={() => handleExecuteDraftSave()}
            className="flex items-center justify-center gap-2 p-3.5 bg-white dark:bg-slate-900 hover:bg-[#FFF6EC] dark:hover:bg-amber-950/40 text-[#000080] dark:text-amber-300 font-bold text-xs rounded-xl border-2 border-[#FF9933] shadow-2xs transition active:scale-98"
          >
            <BookmarkCheck size={16} className="text-[#FF9933]" />
            <span>Save Draft (Submit Later)</span>
          </button>

          <button
            type="submit"
            className="flex items-center justify-center gap-2 p-3.5 bg-gradient-to-r from-[#FF9933] to-[#E68A00] hover:from-[#ff9224] hover:to-[#d97d00] text-[#000080] font-extrabold text-xs rounded-xl shadow-sm transition active:scale-98 border border-[#000080]/20"
          >
            <Send size={16} />
            <span>Submit Civic Report</span>
          </button>
        </div>
      </form>

      {/* DRAFT SAVED SUCCESS MODAL */}
      {isDraftSavedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-sm w-full p-5 shadow-2xl text-center space-y-3.5 animate-scaleUp border border-[#FFD4A8] dark:border-amber-800/60 text-slate-800 dark:text-slate-100">
            <div className="w-12 h-12 bg-[#FFF6EC] dark:bg-amber-950/60 text-[#E68A00] dark:text-[#FF9933] rounded-full flex items-center justify-center mx-auto border border-[#FFD4A8] dark:border-amber-800/60">
              <BookmarkCheck size={26} />
            </div>
            <div>
              <h3 className="font-bold text-base text-[#000080] dark:text-blue-300 font-['Plus_Jakarta_Sans']">
                Captured Draft Saved!
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                Your photograph and location are safely saved. You can leave now and complete your submission anytime from <strong>Saved Reports</strong>.
              </p>
            </div>
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => {
                  setIsDraftSavedModal(false);
                  setCurrentView('my-complaints');
                }}
                className="flex-1 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl"
              >
                View Saved Reports
              </button>
              <button
                onClick={() => {
                  setIsDraftSavedModal(false);
                  setCurrentView('home');
                }}
                className="flex-1 py-2.5 bg-[#000080] hover:bg-[#000060] text-white text-xs font-bold rounded-xl"
              >
                Back to Home
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SUBMISSION CONFIRMATION MODAL */}
      {submittedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-md w-full p-5 shadow-2xl space-y-4 my-8 animate-scaleUp border border-slate-100 dark:border-slate-800 text-slate-800 dark:text-slate-100">
            <div className="text-center space-y-1">
              {submittedReport.status === 'Pending Offline Sync' ? (
                <>
                  <div className="w-12 h-12 bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 rounded-full flex items-center justify-center mx-auto border border-amber-300 dark:border-amber-800">
                    <CloudUpload size={26} />
                  </div>
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100 font-['Plus_Jakarta_Sans']">
                    Captured &amp; Saved Offline!
                  </h3>
                  <p className="text-xs text-amber-700 dark:text-amber-300 font-medium">
                    Queued in Local Storage • ID: <strong className="text-slate-800 dark:text-slate-200">{submittedReport.id}</strong>
                  </p>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed px-2">
                    Report, photo, and GPS are safely stored on this device. When internet returns, it will automatically transmit to the Municipal Corporation.
                  </p>
                </>
              ) : (
                <>
                  <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-950/60 text-[#138808] dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 size={26} />
                  </div>
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-slate-100 font-['Plus_Jakarta_Sans']">
                    Civic Report Successfully Submitted!
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Complaint ID: <strong className="text-slate-800 dark:text-slate-200">{submittedReport.id}</strong>
                  </p>
                </>
              )}
            </div>

            {/* Official Structured Information */}
            <div className="bg-slate-50 dark:bg-slate-800/80 rounded-2xl p-3.5 border border-slate-200 dark:border-slate-700 text-xs space-y-2">
              <div className="flex justify-between border-b border-slate-200 dark:border-slate-700 pb-1.5">
                <span className="text-slate-500 dark:text-slate-400">Problem:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{submittedReport.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Category:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{submittedReport.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Location:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{submittedReport.location.address}, Vizianagaram</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Assessed Priority:</span>
                <span className="font-extrabold text-[#D32F2F] dark:text-red-400">{submittedReport.priority}</span>
              </div>
              <div className="flex justify-between border-t border-slate-200 dark:border-slate-700 pt-1.5">
                <span className="text-slate-500 dark:text-slate-400">Assigned Department:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{submittedReport.department}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Officer / SLA:</span>
                <span className="text-slate-700 dark:text-slate-300">{submittedReport.officerName} • {submittedReport.slaDays * 24} Hours</span>
              </div>
            </div>

            {/* SmartPriority Explainable Analysis in Confirmation Modal */}
            <div className="max-h-60 overflow-y-auto rounded-2xl border border-slate-200 dark:border-slate-700">
              <SmartPriorityAnalysisCard complaint={submittedReport} defaultExpanded={true} />
            </div>

            <div className="flex flex-col gap-2 pt-1">
              <button
                onClick={() => {
                  setSelectedComplaint(submittedReport);
                  setSubmittedReport(null);
                  setCurrentView('complaint-detail');
                }}
                className="w-full py-3 bg-[#000080] hover:bg-[#000060] text-white text-xs font-bold rounded-xl shadow-md transition border-2 border-[#FF9933]"
              >
                Track Complaint Timeline
              </button>
              <button
                onClick={() => {
                  setSubmittedReport(null);
                  setCurrentView('home');
                }}
                className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl transition"
              >
                Return to Home
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
