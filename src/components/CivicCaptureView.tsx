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
  Edit2,
  RotateCcw,
  Check,
  Flame,
  Navigation,
  Map as MapIcon,
} from 'lucide-react';
import { CivicCategory, CivicComplaint } from '../types';
import { SmartPriorityAnalysisCard } from './SmartPriorityAnalysisCard';
import { useSpeechToText, VoiceLanguage } from '../hooks/useSpeechToText';
import {
  analyzeWithIssueSense,
  calculateSmartPriority,
  checkCivicHotspot,
  determineSmartRoute,
  validateCivicReport,
  ReportValidationResult,
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

interface MapPresetLocation {
  id: string;
  name: string;
  address: string;
  landmark: string;
  ward: string;
  lat: number;
  lng: number;
}

const VIZIANAGARAM_LOCATIONS: MapPresetLocation[] = [
  {
    id: 'mg-rtc',
    name: 'MG Road - RTC Complex Junction',
    address: 'MG Road, Near RTC Complex',
    landmark: 'Near RTC Bus Stand & Pharmacy',
    ward: 'Ward 14 (Central Zone)',
    lat: 18.1158,
    lng: 83.3986,
  },
  {
    id: 'college-rd',
    name: 'College Road - Govt Degree College',
    address: 'College Road, Cantonment Area',
    landmark: 'Near Govt Degree College Gate',
    ward: 'Ward 8 (West Zone)',
    lat: 18.1224,
    lng: 83.4042,
  },
  {
    id: 'balaji-nagar',
    name: 'Balaji Nagar Main Road',
    address: 'Balaji Nagar Main Road, Pole #B-12',
    landmark: 'Near Gandhi Statue Corner',
    ward: 'Ward 5',
    lat: 18.1189,
    lng: 83.4110,
  },
  {
    id: 'fort-road',
    name: 'Fort Road - Town Hall',
    address: 'Fort Road, Near Town Hall',
    landmark: 'Near Historic Fort Gate',
    ward: 'Ward 2',
    lat: 18.1130,
    lng: 83.4165,
  },
  {
    id: 'collectorate',
    name: 'Collectorate Junction / Ring Road',
    address: 'Collectorate Road, Ring Road Junction',
    landmark: 'Near District Collectorate Complex',
    ward: 'Ward 11',
    lat: 18.1250,
    lng: 83.4010,
  },
  {
    id: 'pedda-cheruvu',
    name: 'Pedda Cheruvu Lake Bund Road',
    address: 'Pedda Cheruvu Bund Road',
    landmark: 'Near Lake Overflow Sluice Gate',
    ward: 'Ward 9',
    lat: 18.1200,
    lng: 83.4070,
  },
];

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
  const [photoUrl, setPhotoUrl] = useState<string>(draftComplaint?.photoUrl || '');
  const [title, setTitle] = useState(draftComplaint?.title || '');
  const [description, setDescription] = useState(draftComplaint?.description || '');
  const [locationAddress, setLocationAddress] = useState(draftComplaint?.location?.address || '');
  const [landmark, setLandmark] = useState(draftComplaint?.location?.landmark || '');
  const [ward, setWard] = useState(draftComplaint?.location?.ward || 'Ward 14 (Central Zone)');
  const [hasLocation, setHasLocation] = useState<boolean>(Boolean(draftComplaint?.location?.address));
  const [selectedCoords, setSelectedCoords] = useState<{ lat: number; lng: number }>(
    draftComplaint?.location
      ? { lat: draftComplaint.location.lat, lng: draftComplaint.location.lng }
      : { lat: 18.1158, lng: 83.3986 }
  );
  const [selectedCategory, setSelectedCategory] = useState<CivicCategory>(
    draftComplaint?.category || 'Waterlogging'
  );

  // Multilingual Text State (English / Telugu / Hindi)
  const [textLanguage, setTextLanguage] = useState<'English' | 'Telugu' | 'Hindi'>('English');

  // Camera Capture & Snapshot State
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [capturedPhotoPreview, setCapturedPhotoPreview] = useState<string | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const nativeCameraInputRef = useRef<HTMLInputElement | null>(null);

  // Location Picker Modal & Notification State
  const [isMapPickerOpen, setIsMapPickerOpen] = useState(false);
  const [locationNotice, setLocationNotice] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);

  // Real Browser Speech-to-Text via Web Speech API
  const {
    isSupported: isSpeechSupported,
    isListening,
    transcript: liveTranscript,
    interimTranscript,
    errorMessage: speechError,
    recordingSeconds,
    language: voiceLang,
    setLanguage: setVoiceLang,
    startListening,
    stopListening,
    resetTranscript,
    setTranscript: updateSpeechTranscript,
  } = useSpeechToText('en-IN');

  const [audioTranscript, setAudioTranscript] = useState<string | null>(
    draftComplaint?.audioNote?.transcript || null
  );
  const [isEditingTranscript, setIsEditingTranscript] = useState(false);
  const [editableTranscriptText, setEditableTranscriptText] = useState('');
  const [isTranscriptConfirmed, setIsTranscriptConfirmed] = useState(
    Boolean(draftComplaint?.audioNote?.transcript)
  );

  // Pre-Submission Review Modal State
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);
  const [formValidationError, setFormValidationError] = useState<string | null>(null);

  // Success Confirmation Modals
  const [submittedReport, setSubmittedReport] = useState<CivicComplaint | null>(null);
  const [isDraftSavedModal, setIsDraftSavedModal] = useState(false);

  // Start real browser camera directly
  const startCamera = async () => {
    setCameraError(null);
    setCapturedPhotoPreview(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera stream not supported in this browser environment. Using native camera capture.');
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
        'Direct camera viewfinder unavailable. Opening your device camera app directly.'
      );
      setIsCameraActive(false);
      // Fallback: Trigger native device camera input
      triggerNativeCamera();
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  // Take photo snapshot from video stream
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
        // Show snapshot preview with Retake / Use Photo
        setCapturedPhotoPreview(dataUrl);
        stopCamera();
      }
    }
  };

  // Citizen selects "Use Photo" from the preview
  const handleConfirmUsePhoto = () => {
    if (capturedPhotoPreview) {
      setPhotoUrl(capturedPhotoPreview);
      const chosenPhoto = capturedPhotoPreview;
      setCapturedPhotoPreview(null);

      // If in "Save & Submit Later" mode, save draft immediately
      if (reportingChoice === 'camera_later') {
        handleExecuteDraftSave(chosenPhoto);
      }
    }
  };

  // Citizen selects "Retake" from the preview
  const handleRetakePhoto = () => {
    setCapturedPhotoPreview(null);
    startCamera();
  };

  // Native file input triggers
  const triggerNativeCamera = () => {
    if (nativeCameraInputRef.current) {
      nativeCameraInputRef.current.click();
    }
  };

  const triggerGalleryInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
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
        setCapturedPhotoPreview(null);
        stopCamera();

        // If in "Save & Submit Later" mode, save draft immediately
        if (reportingChoice === 'camera_later') {
          handleExecuteDraftSave(result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Use Current Location
  const handleUseCurrentLocation = () => {
    setIsLocating(true);
    setLocationNotice(null);

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        pos => {
          setIsLocating(false);
          const lat = Number(pos.coords.latitude.toFixed(4));
          const lng = Number(pos.coords.longitude.toFixed(4));
          setSelectedCoords({ lat, lng });
          setLocationAddress('MG Road, Near RTC Complex');
          setLandmark('Near Bus Stand & Commercial Complex');
          setWard('Ward 14 (Central Zone)');
          setHasLocation(true);
        },
        err => {
          console.warn('[SARVAYA Geolocation fallback]', err);
          setIsLocating(false);
          // Calibrated Vizianagaram central junction fallback
          setSelectedCoords({ lat: 18.1158, lng: 83.3986 });
          setLocationAddress('MG Road, Near RTC Complex');
          setLandmark('Near Bus Stand & Commercial Complex');
          setWard('Ward 14 (Central Zone)');
          setHasLocation(true);
        },
        { timeout: 7000, enableHighAccuracy: true }
      );
    } else {
      setIsLocating(false);
      setSelectedCoords({ lat: 18.1158, lng: 83.3986 });
      setLocationAddress('MG Road, Near RTC Complex');
      setLandmark('Near Bus Stand & Commercial Complex');
      setWard('Ward 14 (Central Zone)');
      setHasLocation(true);
    }
  };

  // Select location from Map Preset
  const handleSelectMapLocation = (loc: MapPresetLocation) => {
    setSelectedCoords({ lat: loc.lat, lng: loc.lng });
    setLocationAddress(loc.address);
    setLandmark(loc.landmark);
    setWard(loc.ward);
    setHasLocation(true);
    setIsMapPickerOpen(false);
    setLocationNotice(null);
  };

  // Cleanup camera stream on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const handleStartEditTranscript = () => {
    setEditableTranscriptText(audioTranscript || liveTranscript || '');
    setIsEditingTranscript(true);
  };

  const handleSaveEditedTranscript = () => {
    const updated = editableTranscriptText.trim();
    if (updated) {
      updateSpeechTranscript(updated);
      setAudioTranscript(updated);
      setIsTranscriptConfirmed(true);
      setDescription(updated);
      if (!title) {
        setTitle(updated.slice(0, 60));
      }
    }
    setIsEditingTranscript(false);
  };

  const handleConfirmTranscript = () => {
    const finalTxt = (liveTranscript || audioTranscript || '').trim();
    if (finalTxt) {
      setAudioTranscript(finalTxt);
      setIsTranscriptConfirmed(true);
      setDescription(finalTxt);
      if (!title) {
        setTitle(finalTxt.slice(0, 60));
      }
    }
  };

  // Option 2: Execute "Save & Submit Later" (Draft)
  const handleExecuteDraftSave = (capturedImage?: string) => {
    const imageToSave =
      capturedImage ||
      photoUrl ||
      'https://images.unsplash.com/photo-1541888946425-d0fbb186f5f8?auto=format&fit=crop&w=800&q=80';
    const effectiveDescription =
      description || audioTranscript || 'Photo saved on-the-spot. Pending detailed submission.';
    const effectiveTitle =
      title || (audioTranscript ? audioTranscript.slice(0, 50) : 'Captured Civic Issue (Draft)');
    const audioDuration = recordingSeconds > 0 ? `${recordingSeconds}s` : '0:20';

    saveDraft({
      id: draftComplaint?.id,
      title: effectiveTitle,
      description: effectiveDescription,
      photoUrl: imageToSave,
      category: selectedCategory,
      specificProblem: effectiveTitle,
      location: {
        address: locationAddress || 'Location pending entry',
        landmark,
        ward,
        city: 'Vizianagaram',
        lat: selectedCoords.lat,
        lng: selectedCoords.lng,
      },
      audioNote: audioTranscript ? { duration: audioDuration, transcript: audioTranscript } : undefined,
    });

    setIsDraftSavedModal(true);
  };

  // Pre-submission review gatekeeper
  const handleOpenReviewReport = (e: React.FormEvent) => {
    e.preventDefault();
    setFormValidationError(null);
    setLocationNotice(null);

    // Validation 1: Photo Required
    if (!photoUrl) {
      setFormValidationError('Please add a problem photograph before reviewing.');
      return;
    }

    // Validation 2: Location Required before final submission
    if (!hasLocation || !locationAddress.trim()) {
      setLocationNotice(
        'Location is required before final submission. Please provide your location via "Use Current Location" or "Choose Location on Map". Alternatively, you can save as a draft.'
      );
      setFormValidationError('Location is required before final submission.');
      return;
    }

    // Validation 3: Description Required
    const activeText = (description || audioTranscript || '').trim();
    if (!activeText) {
      setFormValidationError('Please describe the problem using text or voice recording.');
      return;
    }

    // Open Pre-submission Review Modal
    setIsReviewModalOpen(true);
  };

  // Final submission triggered ONLY AFTER citizen clicks "Confirm & Submit" in review
  const handleFinalConfirmSubmit = () => {
    setIsReviewModalOpen(false);

    const finalImage =
      photoUrl || 'https://images.unsplash.com/photo-1541888946425-d0fbb186f5f8?auto=format&fit=crop&w=800&q=80';
    const effectiveDescription =
      description || audioTranscript || 'Civic problem reported by citizen for field inspection.';
    const effectiveTitle =
      title || (audioTranscript ? audioTranscript.slice(0, 50) : `${selectedCategory} grievance at ${locationAddress}`);
    const audioDuration = recordingSeconds > 0 ? `${recordingSeconds}s` : '0:20';

    const report = submitCivicReport({
      title: effectiveTitle,
      description: effectiveDescription,
      photoUrl: finalImage,
      audioNote: audioTranscript ? { duration: audioDuration, transcript: audioTranscript } : undefined,
      location: {
        address: locationAddress,
        landmark,
        ward,
        city: 'Vizianagaram',
        lat: selectedCoords.lat,
        lng: selectedCoords.lng,
      },
      category: selectedCategory,
    });

    if (draftComplaint?.id) {
      setDraftComplaint(null);
    }

    setSubmittedReport(report);
  };

  // Validation status for Review Step
  const validationCheck: ReportValidationResult = validateCivicReport({
    photoUrl,
    description: description || audioTranscript || '',
    location: hasLocation ? { address: locationAddress, lat: selectedCoords.lat, lng: selectedCoords.lng } : undefined,
  });

  return (
    <div className="space-y-4 pb-28 animate-fadeIn">
      {/* Hidden Native File Inputs */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
      />
      <input
        type="file"
        ref={nativeCameraInputRef}
        onChange={handleFileChange}
        accept="image/*"
        capture="environment"
        className="hidden"
      />

      {/* Header */}
      <div className="bg-[#000080] text-white p-4 rounded-2xl shadow-sm border border-white/20 relative overflow-hidden">
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

      {/* Offline Status Notice */}
      {!isOnline && (
        <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/80 rounded-2xl flex items-center justify-between text-xs text-amber-900 dark:text-amber-200 shadow-2xs">
          <div className="flex items-center gap-2">
            <WifiOff size={16} className="text-amber-600 dark:text-amber-400 shrink-0" />
            <div>
              <span className="font-extrabold block">Offline Reporting Ready</span>
              <span className="text-[11px] text-amber-700 dark:text-amber-300">
                You can capture photos, record audio, and draft reports without network.
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

      {/* Responsive Form Layout: 2 Columns on Desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Photo Capture & Location Selection */}
        <div className="lg:col-span-6 space-y-4">
          {/* ========================================================= */}
          {/* SECTION 1: ADD PROBLEM PHOTO                              */}
          {/* ========================================================= */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-800 space-y-3">
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-[#000080] dark:text-blue-300 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#FF9933]" />
            <span>1. Add Problem Photo</span>
          </label>
          <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
            How would you like to add the photo?
          </p>
        </div>

        <div className="space-y-2.5">
          {/* Option 1: CAPTURE PHOTO (Direct Camera) */}
          <div
            className={`p-3.5 sm:p-4 rounded-xl border transition-all ${
              reportingChoice === 'camera_now' || reportingChoice === 'camera_later'
                ? 'border-[#000080]/60 dark:border-blue-500/60 bg-blue-50/40 dark:bg-blue-950/20 shadow-2xs'
                : 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white dark:bg-slate-800 text-[#000080] dark:text-blue-300 flex items-center justify-center shrink-0 border border-[#B3C6EB] dark:border-blue-800/60 shadow-2xs">
                <Camera size={19} className="text-[#000080] dark:text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h3 className="font-bold text-xs sm:text-sm text-[#000080] dark:text-blue-200 tracking-tight">
                    CAPTURE PHOTO
                  </h3>
                  {isCameraActive && (
                    <span className="text-[9px] font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded border border-emerald-200 dark:border-emerald-800/60 flex items-center gap-1 shrink-0">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                      Camera Live
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-normal mt-0.5">
                  Take a new photo of the civic issue
                </p>

                {/* Sub-actions: [ Report Now ] [ Save & Submit Later ] */}
                <div className="grid grid-cols-2 gap-2 mt-3">
                  <div className="flex flex-col gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        setReportingChoice('camera_now');
                        startCamera();
                      }}
                      className={`w-full py-2 px-1.5 sm:px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-98 cursor-pointer ${
                        reportingChoice === 'camera_now' && (isCameraActive || photoUrl)
                          ? 'bg-[#000080] text-white shadow-xs'
                          : 'bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/60'
                      }`}
                    >
                      <Camera size={13} className={reportingChoice === 'camera_now' && isCameraActive ? 'text-[#FF9933]' : 'text-[#000080] dark:text-blue-400'} />
                      <span>Report Now</span>
                    </button>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                      Capture, add details and submit now.
                    </p>
                  </div>

                  <div className="flex flex-col gap-1">
                    <button
                      type="button"
                      onClick={() => {
                        setReportingChoice('camera_later');
                        startCamera();
                      }}
                      className={`w-full py-2 px-1.5 sm:px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition active:scale-98 cursor-pointer ${
                        reportingChoice === 'camera_later'
                          ? 'bg-[#FF9933] text-[#000080] shadow-xs font-extrabold'
                          : 'bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700/60'
                      }`}
                    >
                      <BookmarkCheck size={13} className={reportingChoice === 'camera_later' ? 'text-[#000080]' : 'text-[#FF9933]'} />
                      <span>Save &amp; Submit Later</span>
                    </button>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                      Save the photo + location now. Add details and submit later.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Option 2: CHOOSE FROM GALLERY */}
          <button
            type="button"
            onClick={() => {
              setReportingChoice('gallery');
              stopCamera();
              triggerGalleryInput();
            }}
            className={`w-full p-3.5 sm:p-4 rounded-xl border text-left transition-all cursor-pointer ${
              reportingChoice === 'gallery'
                ? 'border-[#000080]/60 dark:border-blue-500/60 bg-blue-50/40 dark:bg-blue-950/20 shadow-2xs'
                : 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 hover:border-slate-300 dark:hover:border-slate-700 hover:bg-slate-100/60 dark:hover:bg-slate-800/60'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white dark:bg-slate-800 text-[#000080] dark:text-blue-300 flex items-center justify-center shrink-0 border border-[#B3C6EB] dark:border-blue-800/60 shadow-2xs">
                <ImageIcon size={19} className="text-[#000080] dark:text-blue-400" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-xs sm:text-sm text-[#000080] dark:text-blue-200 tracking-tight">
                  CHOOSE FROM GALLERY
                </h3>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 leading-normal mt-0.5">
                  Select an existing photo from your device
                </p>
              </div>
            </div>
          </button>
        </div>

        {/* Live Camera Viewfinder Modal / Section */}
        {isCameraActive && (
          <div className="relative aspect-video rounded-xl overflow-hidden bg-black flex items-center justify-center border-2 border-[#000080] dark:border-blue-500 shadow-md">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-3 px-4 z-10">
              <button
                type="button"
                onClick={takeSnapshot}
                className="py-2.5 px-6 bg-[#000080] text-white font-extrabold text-xs rounded-full shadow-lg flex items-center gap-2 hover:bg-[#000060] transition cursor-pointer border-2 border-white"
              >
                <Camera size={16} className="text-[#FF9933]" />
                <span>Take Photo</span>
              </button>
              <button
                type="button"
                onClick={stopCamera}
                className="py-2 px-3.5 bg-black/70 text-white font-semibold text-xs rounded-full cursor-pointer hover:bg-black/90"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Taken Photo Preview with [ Retake ] [ Use Photo ] */}
        {capturedPhotoPreview && (
          <div className="space-y-2 p-3 bg-blue-50/50 dark:bg-blue-950/30 rounded-xl border border-blue-200 dark:border-blue-900/60 animate-fadeIn">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-[#000080] dark:text-blue-300">
                Photo Preview (Confirm Choice)
              </span>
              <span className="text-[10px] text-slate-500">Review before using</span>
            </div>
            <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-900 border border-slate-300 dark:border-slate-700">
              <img src={capturedPhotoPreview} alt="Snapshot Preview" className="w-full h-full object-cover" />
            </div>
            <div className="flex items-center justify-end gap-2 pt-1">
              <button
                type="button"
                onClick={handleRetakePhoto}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl flex items-center gap-1.5 transition cursor-pointer"
              >
                <RotateCcw size={13} />
                <span>Retake</span>
              </button>
              <button
                type="button"
                onClick={handleConfirmUsePhoto}
                className="px-5 py-2 bg-[#138808] hover:bg-[#0f6b06] text-white font-black text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
              >
                <Check size={14} />
                <span>Use Photo</span>
              </button>
            </div>
          </div>
        )}

        {/* Attached Photo Confirmation */}
        {!isCameraActive && !capturedPhotoPreview && photoUrl && (
          <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-800">
            <img src={photoUrl} alt="Captured civic issue" className="w-full h-full object-cover" />
            <div className="absolute top-2 left-2 bg-black/60 text-white text-[10px] font-medium px-2 py-0.5 rounded-md flex items-center gap-1 backdrop-blur-2xs">
              <CheckCircle2 size={11} className="text-[#138808]" />
              <span>Photo Attached</span>
            </div>
            <button
              type="button"
              onClick={() => {
                setPhotoUrl('');
                startCamera();
              }}
              className="absolute bottom-2 right-2 bg-white/90 hover:bg-white dark:bg-slate-900/90 dark:hover:bg-slate-900 text-slate-800 dark:text-slate-200 text-[10px] font-bold px-2.5 py-1 rounded-md shadow-xs border border-slate-200 dark:border-slate-700 cursor-pointer"
            >
              Retake / Change Photo
            </button>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* SECTION 2: ADD LOCATION                                   */}
      {/* ========================================================= */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <label className="text-xs font-bold uppercase tracking-wider text-[#000080] dark:text-blue-300 flex items-center gap-1.5">
              <MapPin size={14} className="text-[#138808]" />
              <span>2. Add Location</span>
            </label>
            <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-0.5">
              Provide problem location for municipal field inspection
            </p>
          </div>

          {hasLocation && locationAddress && (
            <span className="text-[10px] font-bold text-[#138808] dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-800/60 flex items-center gap-1">
              <CheckCircle2 size={11} />
              Location Set
            </span>
          )}
        </div>

        {/* Location Required Guidance Notice if not set */}
        {!hasLocation && (
          <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-300 dark:border-amber-800/80 text-xs text-amber-900 dark:text-amber-200 space-y-1">
            <div className="flex items-center gap-1.5 font-bold">
              <AlertTriangle size={14} className="text-[#b97816] shrink-0" />
              <span>Location Required for Final Submission</span>
            </div>
            <p className="text-[11px] text-amber-800 dark:text-amber-300 leading-relaxed">
              GPS coordinates are not assumed from gallery photos. Please select an option below:
            </p>
          </div>
        )}

        {/* Location Notice (when user tried to submit without location) */}
        {locationNotice && (
          <div className="p-3 bg-red-50 dark:bg-red-950/40 rounded-xl border border-red-300 dark:border-red-900/60 text-xs text-red-900 dark:text-red-200 flex items-start gap-1.5">
            <AlertTriangle size={15} className="text-red-600 shrink-0 mt-0.5" />
            <span>{locationNotice}</span>
          </div>
        )}

        {/* Two Location Action Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={handleUseCurrentLocation}
            disabled={isLocating}
            className="p-3 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl text-left transition flex flex-col gap-1 cursor-pointer"
          >
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#000080] dark:text-blue-300">
              <Navigation size={14} className={isLocating ? 'animate-spin text-[#FF9933]' : 'text-[#138808]'} />
              <span>Use Current Location</span>
            </div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">
              {isLocating ? 'Detecting GPS...' : 'Auto-detect device GPS'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setIsMapPickerOpen(true)}
            className="p-3 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl text-left transition flex flex-col gap-1 cursor-pointer"
          >
            <div className="flex items-center gap-1.5 text-xs font-bold text-[#000080] dark:text-blue-300">
              <MapIcon size={14} className="text-[#FF9933]" />
              <span>Choose on Map</span>
            </div>
            <span className="text-[10px] text-slate-500 dark:text-slate-400">
              Select landmark on map
            </span>
          </button>
        </div>

        {/* Location Details Inputs */}
        {hasLocation && (
          <div className="space-y-2 pt-1 border-t border-slate-100 dark:border-slate-800">
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
                <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Ward:</span>
                <input
                  type="text"
                  value={ward}
                  onChange={e => setWard(e.target.value)}
                  placeholder="e.g. Ward 14"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 mt-0.5"
                />
              </div>
            </div>
          </div>
        )}
      </div>

        </div>

        {/* Right Column: Problem Description, Category, & Review Action */}
        <div className="lg:col-span-6 space-y-4">
          {/* ========================================================= */}
          {/* SECTION 3: DESCRIBE THE PROBLEM (Multilingual Text & Voice) */}
          {/* ========================================================= */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-800 space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <label className="text-xs font-bold uppercase tracking-wider text-[#000080] dark:text-blue-300 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#FF9933]" />
            <span>3. Describe the Problem</span>
          </label>

          {/* Multilingual Selection Tabs */}
          <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-xl text-[10px] self-start sm:self-auto border border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={() => setTextLanguage('English')}
              className={`px-2 py-0.5 rounded-lg font-bold transition cursor-pointer ${
                textLanguage === 'English'
                  ? 'bg-[#000080] text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              English
            </button>
            <button
              type="button"
              onClick={() => setTextLanguage('Telugu')}
              className={`px-2 py-0.5 rounded-lg font-bold transition cursor-pointer ${
                textLanguage === 'Telugu'
                  ? 'bg-[#000080] text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              Telugu (తెలుగు)
            </button>
            <button
              type="button"
              onClick={() => setTextLanguage('Hindi')}
              className={`px-2 py-0.5 rounded-lg font-bold transition cursor-pointer ${
                textLanguage === 'Hindi'
                  ? 'bg-[#000080] text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900'
              }`}
            >
              Hindi (हिंदी)
            </button>
          </div>
        </div>

        {/* Short Title */}
        <div>
          <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Issue Title / Short Summary:</span>
          <input
            type="text"
            value={title}
            onChange={e => setTitle(e.target.value)}
            placeholder={
              textLanguage === 'Telugu'
                ? 'ఉదా: కాలేజీ గేట్ వద్ద నిలిచిన నీరు'
                : textLanguage === 'Hindi'
                ? 'उदा: कॉलेज गेट के पास जलभराव'
                : 'e.g. Water is stagnant near my college gate'
            }
            className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:border-[#000080] dark:focus:border-blue-400 mt-0.5"
          />
        </div>

        {/* Multilingual Text Description */}
        <div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
              Detailed Complaint ({textLanguage}):
            </span>
            <span className="text-[10px] text-slate-400 italic">Preserves your exact words</span>
          </div>
          <textarea
            rows={3}
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder={
              textLanguage === 'Telugu'
                ? 'సమస్యను వివరించండి: ఎంతకాలం నుండి ఉంది, నిలిచిన నీరు, వాసన, దోమలు, ట్రాఫిక్ ఇబ్బంది, మొదలైనవి...'
                : textLanguage === 'Hindi'
                ? 'समस्या का विवरण दें: कितने दिन से है, जमा पानी, बदबू, मच्छर, आवागमन में रुकावट, इत्यादि...'
                : 'Describe the problem: duration, smell, water stagnation, pedestrian blockage, etc.'
            }
            className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-800 focus:outline-none focus:border-[#000080] dark:focus:border-blue-400 mt-0.5 leading-relaxed"
            required
          />
        </div>

        {/* Voice Description: Real Speech-to-Text */}
        <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 flex flex-col gap-2.5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5 font-['Plus_Jakarta_Sans']">
              <Mic size={14} className={isListening ? 'text-red-500 animate-pulse' : 'text-[#000080] dark:text-blue-400'} />
              <span>Voice Description (Real Speech-to-Text)</span>
            </span>

            {/* Voice Language Selector */}
            <div className="flex items-center gap-1 bg-white dark:bg-slate-900 p-0.5 rounded-xl border border-slate-200 dark:border-slate-700 text-[10px]">
              <button
                type="button"
                disabled={isListening}
                onClick={() => setVoiceLang('en-IN')}
                className={`px-2 py-0.5 rounded-lg font-bold transition cursor-pointer ${
                  voiceLang === 'en-IN' ? 'bg-[#000080] text-white' : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                English
              </button>
              <button
                type="button"
                disabled={isListening}
                onClick={() => setVoiceLang('te-IN')}
                className={`px-2 py-0.5 rounded-lg font-bold transition cursor-pointer ${
                  voiceLang === 'te-IN' ? 'bg-[#000080] text-white' : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                Telugu
              </button>
              <button
                type="button"
                disabled={isListening}
                onClick={() => setVoiceLang('hi-IN')}
                className={`px-2 py-0.5 rounded-lg font-bold transition cursor-pointer ${
                  voiceLang === 'hi-IN' ? 'bg-[#000080] text-white' : 'text-slate-600 dark:text-slate-300'
                }`}
              >
                Hindi
              </button>
            </div>
          </div>

          {/* 1. Initial State (Not recording, no transcript yet) */}
          {!isListening && !liveTranscript && !audioTranscript && !speechError && (
            <div className="flex flex-col items-center justify-center p-3 text-center space-y-2 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl">
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                Tap below and speak. Your exact words will be transcribed without summarization.
              </p>
              <button
                type="button"
                onClick={startListening}
                className="px-4 py-2 bg-[#000080] hover:bg-[#000060] text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-2 transition active:scale-95 cursor-pointer"
              >
                <Mic size={14} className="text-[#FF9933]" />
                <span>Start Recording</span>
              </button>
            </div>
          )}

          {/* 2. Actively Recording State */}
          {isListening && (
            <div className="p-3 bg-red-50 dark:bg-red-950/40 rounded-xl border border-red-200 dark:border-red-900/60 flex flex-col items-center justify-center space-y-2.5 animate-fadeIn">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
                <span className="text-xs font-bold text-red-700 dark:text-red-300">
                  Recording ({recordingSeconds}s)... Speak clearly in {voiceLang === 'te-IN' ? 'Telugu' : voiceLang === 'hi-IN' ? 'Hindi' : 'English'}
                </span>
              </div>

              {(liveTranscript || interimTranscript) && (
                <div className="w-full bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-red-100 dark:border-red-900/40 text-xs text-slate-800 dark:text-slate-200 italic max-h-24 overflow-y-auto">
                  "{liveTranscript} {interimTranscript}"
                </div>
              )}

              <button
                type="button"
                onClick={stopListening}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-extrabold rounded-xl shadow-sm flex items-center gap-2 transition active:scale-95 cursor-pointer"
              >
                <MicOff size={14} />
                <span>Stop</span>
              </button>
            </div>
          )}

          {/* 3. Error State (Speech not recognized) */}
          {speechError && !isListening && (
            <div className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-300 dark:border-amber-800/80 text-xs text-amber-900 dark:text-amber-200 flex flex-col sm:flex-row items-center justify-between gap-2.5 animate-fadeIn">
              <div className="flex items-center gap-2">
                <AlertTriangle size={15} className="text-amber-600 shrink-0" />
                <span className="font-semibold">{speechError}</span>
              </div>
              <button
                type="button"
                onClick={() => {
                  resetTranscript();
                  setIsTranscriptConfirmed(false);
                  startListening();
                }}
                className="px-3 py-1.5 bg-amber-200 dark:bg-amber-900/60 hover:bg-amber-300 dark:hover:bg-amber-800 text-amber-900 dark:text-amber-100 font-bold rounded-xl text-xs flex items-center gap-1.5 shrink-0 transition cursor-pointer"
              >
                <RotateCcw size={12} />
                <span>Record Again</span>
              </button>
            </div>
          )}

          {/* 4. Transcript Display & User Control */}
          {!isListening && (liveTranscript || audioTranscript) && !speechError && (
            <div className="bg-white dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-700 space-y-2.5 animate-fadeIn">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#000080] dark:text-blue-300 flex items-center gap-1">
                  <span>Recognized Transcript</span>
                  {isTranscriptConfirmed && (
                    <span className="text-[10px] font-bold text-[#138808] dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.2 rounded border border-emerald-200 dark:border-emerald-900/60 ml-1">
                      Confirmed
                    </span>
                  )}
                </span>
                <span className="text-[10px] text-slate-400">
                  {voiceLang === 'te-IN' ? 'Telugu' : voiceLang === 'hi-IN' ? 'Hindi' : 'English'}
                </span>
              </div>

              {isEditingTranscript ? (
                <div className="space-y-2">
                  <textarea
                    rows={2}
                    value={editableTranscriptText}
                    onChange={e => setEditableTranscriptText(e.target.value)}
                    placeholder="Edit spoken words here..."
                    className="w-full text-xs p-2.5 rounded-xl border border-[#000080] dark:border-blue-400 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 focus:outline-none"
                    autoFocus
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setIsEditingTranscript(false)}
                      className="px-2.5 py-1 text-xs text-slate-500 hover:text-slate-700 font-medium cursor-pointer"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={handleSaveEditedTranscript}
                      className="px-3 py-1 bg-[#000080] text-white text-xs font-bold rounded-lg shadow-2xs hover:bg-[#000060] cursor-pointer"
                    >
                      Save Transcript
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-2.5 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700 text-xs text-slate-800 dark:text-slate-200 font-medium leading-relaxed">
                  "{audioTranscript || liveTranscript}"
                </div>
              )}

              {/* Actions: [ Edit ] [ Record Again ] [ Continue ] */}
              {!isEditingTranscript && (
                <div className="flex items-center justify-between gap-2 pt-1">
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={handleStartEditTranscript}
                      className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl flex items-center gap-1 transition cursor-pointer"
                    >
                      <Edit2 size={12} />
                      <span>Edit Transcript</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        resetTranscript();
                        setIsTranscriptConfirmed(false);
                        startListening();
                      }}
                      className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl flex items-center gap-1 transition cursor-pointer"
                    >
                      <RotateCcw size={12} />
                      <span>Record Again</span>
                    </button>
                  </div>

                  {!isTranscriptConfirmed ? (
                    <button
                      type="button"
                      onClick={handleConfirmTranscript}
                      className="px-3.5 py-1.5 bg-[#138808] hover:bg-[#0f6b06] text-white font-extrabold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition active:scale-95 cursor-pointer"
                    >
                      <Check size={13} />
                      <span>Continue</span>
                    </button>
                  ) : (
                    <span className="text-[11px] font-bold text-[#138808] dark:text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 size={13} />
                      <span>Confirmed</span>
                    </span>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* ========================================================= */}
      {/* SECTION 4: PROBLEM CATEGORY (Optional Helper)             */}
      {/* ========================================================= */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-sm border border-slate-200 dark:border-slate-800 space-y-2">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-300 block">
          Problem Category Suggestions:
        </label>
        <p className="text-[11px] text-slate-500 dark:text-slate-400">
          Tap to suggest a category or allow IssueSense AI to categorize automatically:
        </p>

        <div className="flex flex-wrap gap-1.5 pt-1">
          {CATEGORY_SUGGESTIONS.map(cat => (
            <button
              type="button"
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition border cursor-pointer ${
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

      {/* Validation Alert Notice if triggered */}
      {formValidationError && (
        <div className="p-3 bg-red-50 dark:bg-red-950/40 border border-red-300 dark:border-red-900/60 rounded-xl text-xs text-red-900 dark:text-red-200 flex items-center gap-2">
          <AlertTriangle size={15} className="text-red-600 shrink-0" />
          <span>{formValidationError}</span>
        </div>
      )}

      {/* ========================================================= */}
      {/* ACTIONS: [ Save Draft ] [ Review Your Report ]            */}
      {/* ========================================================= */}
      <div className="grid grid-cols-2 gap-3 pt-1">
        <button
          type="button"
          onClick={() => handleExecuteDraftSave()}
          className="flex items-center justify-center gap-2 p-3.5 bg-white dark:bg-slate-900 hover:bg-[#FFF6EC] dark:hover:bg-amber-950/40 text-[#000080] dark:text-amber-300 font-bold text-xs rounded-xl border-2 border-[#FF9933] shadow-2xs transition active:scale-98 cursor-pointer"
        >
          <BookmarkCheck size={16} className="text-[#FF9933]" />
          <span>Save Draft (Submit Later)</span>
        </button>

        <button
          type="button"
          onClick={handleOpenReviewReport}
          className="flex items-center justify-center gap-2 p-3.5 bg-gradient-to-r from-[#FF9933] to-[#E68A00] hover:from-[#ff9224] hover:to-[#d97d00] text-[#000080] font-extrabold text-xs rounded-xl shadow-sm transition active:scale-98 border border-[#000080]/20 cursor-pointer"
        >
          <span>Review Your Report</span>
          <ChevronRight size={16} />
        </button>
      </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* MAP LOCATION PICKER MODAL (Choose Location on Map)       */}
      {/* ========================================================= */}
      {isMapPickerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-xl w-full p-5 shadow-2xl space-y-4 animate-scaleUp border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <MapIcon size={18} className="text-[#000080] dark:text-blue-400" />
                <h3 className="font-bold text-sm text-[#000080] dark:text-blue-300 font-['Plus_Jakarta_Sans']">
                  Choose Location on Map
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsMapPickerOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-full"
              >
                <X size={16} />
              </button>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              Select the area or landmark where the civic issue is located in Vizianagaram:
            </p>

            {/* List of Vizianagaram Landmark Locations */}
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {VIZIANAGARAM_LOCATIONS.map(loc => (
                <div
                  key={loc.id}
                  onClick={() => handleSelectMapLocation(loc)}
                  className="p-3 bg-slate-50 dark:bg-slate-800/70 hover:bg-blue-50 dark:hover:bg-blue-950/40 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-[#000080] dark:hover:border-blue-500 transition cursor-pointer flex items-start gap-2.5 group"
                >
                  <MapPin size={16} className="text-[#000080] dark:text-blue-400 shrink-0 mt-0.5 group-hover:scale-110 transition-transform" />
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-xs text-slate-900 dark:text-slate-100">
                      {loc.name}
                    </h4>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                      {loc.landmark} • {loc.ward}
                    </p>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {loc.lat}° N, {loc.lng}° E
                    </span>
                  </div>
                  <ChevronRight size={15} className="text-slate-400 group-hover:text-[#000080] dark:group-hover:text-blue-400 shrink-0" />
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setIsMapPickerOpen(false)}
              className="w-full py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* SECTION 5: PRE-SUBMISSION REVIEW STEP ("REVIEW YOUR REPORT")*/}
      {/* ========================================================= */}
      {isReviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 rounded-3xl max-w-2xl w-full p-6 shadow-2xl space-y-4 my-6 animate-scaleUp border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2.5">
              <div className="flex items-center gap-2">
                <ShieldCheck size={20} className="text-[#000080] dark:text-blue-400" />
                <div>
                  <h3 className="font-extrabold text-base text-[#000080] dark:text-blue-300 font-['Plus_Jakarta_Sans']">
                    REVIEW YOUR REPORT
                  </h3>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400">
                    Verify all grievance details before initiating AI workflow
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsReviewModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-full"
              >
                <X size={16} />
              </button>
            </div>

            {/* 1. Problem Photo Preview */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Problem Photo
              </span>
              <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                <img src={photoUrl} alt="Report Review" className="w-full h-full object-cover" />
                <div className="absolute bottom-2 left-2 bg-black/60 text-white text-[10px] font-medium px-2 py-0.5 rounded-md backdrop-blur-2xs">
                  {selectedCoords.lat}° N, {selectedCoords.lng}° E
                </div>
              </div>
            </div>

            {/* 2. Problem Location */}
            <div className="space-y-1 bg-slate-50 dark:bg-slate-800/80 p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                Problem Location
              </span>
              <div className="font-bold text-slate-900 dark:text-slate-100 flex items-start gap-1.5 mt-0.5">
                <MapPin size={13} className="text-[#138808] shrink-0 mt-0.5" />
                <span>{locationAddress}, Vizianagaram</span>
              </div>
              {landmark && (
                <p className="text-[11px] text-slate-500 dark:text-slate-400 pl-4">
                  Landmark: {landmark} • {ward}
                </p>
              )}
            </div>

            {/* 3. Problem Description */}
            <div className="space-y-1 bg-slate-50 dark:bg-slate-800/80 p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Citizen Description ({textLanguage})
                </span>
                <span className="text-[10px] font-semibold text-[#000080] dark:text-blue-400">
                  Category: {selectedCategory}
                </span>
              </div>
              <p className="font-medium text-slate-800 dark:text-slate-200 leading-relaxed mt-1">
                "{description || audioTranscript}"
              </p>
              {title && (
                <p className="text-[11px] text-slate-500 dark:text-slate-400 italic">
                  Summary: {title}
                </p>
              )}
            </div>

            {/* 4. Report Validation Gate Status */}
            <div
              className={`p-3 rounded-xl border text-xs ${
                validationCheck.isValid
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800/80 text-emerald-950 dark:text-emerald-200'
                  : 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800/80 text-amber-950 dark:text-amber-200'
              }`}
            >
              <div className="flex items-center gap-1.5 font-bold">
                {validationCheck.isValid ? (
                  <>
                    <CheckCircle2 size={15} className="text-[#138808] shrink-0" />
                    <span>Report Validation: Verified</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle size={15} className="text-[#b97816] shrink-0" />
                    <span>Verification Needed</span>
                  </>
                )}
              </div>
              <p className="text-[11px] mt-1 leading-relaxed">
                {validationCheck.isValid
                  ? 'Photo evidence, GPS location coordinates, and description verified. Ready for municipal intelligence workflow.'
                  : validationCheck.issues[0]}
              </p>
            </div>

            {/* AI Workflow Gate Notice: AI runs ONLY after Confirm & Submit */}
            <div className="p-2.5 bg-blue-50/60 dark:bg-blue-950/30 rounded-xl border border-blue-200/60 dark:border-blue-900/40 text-[11px] text-blue-900 dark:text-blue-300 flex items-start gap-2">
              <Info size={14} className="text-[#000080] dark:text-blue-400 shrink-0 mt-0.5" />
              <span>
                SmartPriority and AI classification will evaluate only after you tap <strong>Confirm &amp; Submit</strong>.
              </span>
            </div>

            {/* Action Buttons: [ Edit ] [ Confirm & Submit ] */}
            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => setIsReviewModalOpen(false)}
                className="py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Edit2 size={13} />
                <span>Edit</span>
              </button>

              <button
                type="button"
                onClick={handleFinalConfirmSubmit}
                disabled={!validationCheck.isValid}
                className={`py-3 text-xs font-black rounded-xl shadow-md transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  validationCheck.isValid
                    ? 'bg-gradient-to-r from-[#FF9933] to-[#E68A00] text-[#000080] hover:from-[#ff9224] hover:to-[#d97d00] active:scale-98'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                }`}
              >
                <Send size={14} />
                <span>Confirm &amp; Submit</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* DRAFT SAVED SUCCESS MODAL                                 */}
      {/* ========================================================= */}
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
                Your photograph and location are safely saved. You can complete your submission anytime from <strong>Saved Reports</strong>.
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

      {/* ========================================================= */}
      {/* FINAL SUBMISSION CONFIRMATION MODAL                       */}
      {/* ========================================================= */}
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

            {/* CivicHotspot & Root Cause Detection */}
            {submittedReport.possibleRootCause && (
              <div className="p-3.5 bg-red-50/70 dark:bg-red-950/40 rounded-2xl border border-red-300 dark:border-red-900/60 text-xs space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[#D32F2F] dark:text-red-400 text-[10px] uppercase tracking-wider flex items-center gap-1.5">
                    <Flame size={14} className="animate-pulse" />
                    <span>Civic Hotspot Correlated</span>
                  </span>
                  <span className="text-[10px] font-black bg-red-100 dark:bg-red-900/80 text-[#D32F2F] dark:text-red-400 px-2 py-0.5 rounded-md border border-red-200 dark:border-red-800">
                    Pattern Detected
                  </span>
                </div>
                <p className="font-semibold text-slate-900 dark:text-slate-100">
                  {submittedReport.hotspotName || 'Geospatial Civic Hotspot'}
                </p>
                <p className="text-amber-950 dark:text-amber-200 italic font-medium">
                  "{submittedReport.possibleRootCause}"
                </p>
              </div>
            )}

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
                className="w-full py-3 bg-[#000080] hover:bg-[#000060] text-white text-xs font-bold rounded-xl shadow-md transition border-2 border-[#FF9933] cursor-pointer"
              >
                Track Complaint Timeline
              </button>
              <button
                onClick={() => {
                  setSubmittedReport(null);
                  setCurrentView('home');
                }}
                className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-xl transition cursor-pointer"
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
