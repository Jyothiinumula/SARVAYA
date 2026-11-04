import React, { useState, useEffect, useRef } from 'react';
import { useCivic } from '../context/CivicContext';
import {
  MapPin,
  Flame,
  X,
  AlertTriangle,
  Building,
  Clock,
  ArrowRight,
  Eye,
  CheckCircle2,
} from 'lucide-react';
import { CivicCategory, CivicHotspot, CivicComplaint } from '../types';

declare global {
  interface Window {
    google?: any;
    gm_authFailure?: () => void;
  }
}

const CATEGORIES: { label: string; value: CivicCategory | 'All' }[] = [
  { label: 'All', value: 'All' },
  { label: 'Waterlogging', value: 'Waterlogging' },
  { label: 'Drainage', value: 'Drainage' },
  { label: 'Water Supply', value: 'Water Supply' },
  { label: 'Road', value: 'Road' },
  { label: 'Streetlight', value: 'Streetlight' },
  { label: 'Waste', value: 'Waste' },
  { label: 'Public Washroom', value: 'Public Washroom' },
  { label: 'Public Safety', value: 'Public Safety' },
];

export const NearbyCivicMapView: React.FC = () => {
  const { complaints, hotspots, setSelectedComplaint, setCurrentView } = useCivic();

  const [selectedCategory, setSelectedCategory] = useState<CivicCategory | 'All'>('All');
  const [selectedHotspot, setSelectedHotspot] = useState<CivicHotspot | null>(hotspots[0] || null);
  const [selectedSingleReport, setSelectedSingleReport] = useState<CivicComplaint | null>(null);

  // Google Maps State
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [isGoogleMapActive, setIsGoogleMapActive] = useState(false);
  const [, setMapError] = useState<string | null>(null);
  const [markerPixels, setMarkerPixels] = useState<{
    hotspot?: { x: number; y: number };
    c1?: { x: number; y: number };
    c2?: { x: number; y: number };
    c3?: { x: number; y: number };
  }>({});

  const googleMapsApiKey = (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY || '';

  // Initialize Google Maps when API key is available
  useEffect(() => {
    if (!googleMapsApiKey) {
      setIsGoogleMapActive(false);
      return;
    }

    let isMounted = true;

    // Handle authentication error callback from Google Maps API gracefully
    window.gm_authFailure = () => {
      console.warn('[SARVAYA Maps] Google Maps API key authentication failed. Falling back to vector map.');
      if (isMounted) {
        setIsGoogleMapActive(false);
        setMapError('Google Maps API key invalid. Displaying offline vector map.');
      }
    };

    const initializeMap = () => {
      if (!mapContainerRef.current || !window.google?.maps) return;

      try {
        // Vizianagaram central junction (MG Road / RTC Complex coordinates)
        const center = { lat: 18.1170, lng: 83.4040 };
        const map = new window.google.maps.Map(mapContainerRef.current, {
          center,
          zoom: 15,
          mapTypeId: 'roadmap',
          gestureHandling: 'greedy',
          disableDefaultUI: true,
          zoomControl: true,
          mapTypeControl: true,
          mapTypeControlOptions: {
            style: window.google.maps.MapTypeControlStyle?.DROPDOWN_MENU || 2,
            position: window.google.maps.ControlPosition?.TOP_LEFT || 1,
          },
        });

        mapInstanceRef.current = map;

        // Custom OverlayView to project geographical LatLng to container pixel coordinates
        const overlay = new window.google.maps.OverlayView();
        overlay.onAdd = function () {};
        overlay.onRemove = function () {};
        overlay.draw = function () {
          const projection = overlay.getProjection();
          if (!projection || !isMounted) return;

          const p0 = projection.fromLatLngToContainerPixel(
            new window.google.maps.LatLng(18.1158, 83.3986)
          );
          const p1 = projection.fromLatLngToContainerPixel(
            new window.google.maps.LatLng(18.1224, 83.4042)
          );
          const p2 = projection.fromLatLngToContainerPixel(
            new window.google.maps.LatLng(18.1189, 83.4110)
          );
          const p3 = projection.fromLatLngToContainerPixel(
            new window.google.maps.LatLng(18.1130, 83.4165)
          );

          setMarkerPixels({
            hotspot: p0 ? { x: p0.x, y: p0.y } : undefined,
            c1: p1 ? { x: p1.x, y: p1.y } : undefined,
            c2: p2 ? { x: p2.x, y: p2.y } : undefined,
            c3: p3 ? { x: p3.x, y: p3.y } : undefined,
          });
        };

        overlay.setMap(map);
        setIsGoogleMapActive(true);
      } catch (err: any) {
        console.warn('[SARVAYA Maps] Failed to initialize Google Map:', err);
        if (isMounted) {
          setIsGoogleMapActive(false);
          setMapError('Failed to initialize Google Map. Using vector map.');
        }
      }
    };

    if (window.google?.maps) {
      initializeMap();
    } else {
      const scriptId = 'google-maps-js-sdk';
      let script = document.getElementById(scriptId) as HTMLScriptElement | null;
      if (!script) {
        script = document.createElement('script');
        script.id = scriptId;
        script.src = `https://maps.googleapis.com/maps/api/js?key=${googleMapsApiKey}&v=weekly`;
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
      }

      script.addEventListener('load', () => {
        if (isMounted) initializeMap();
      });
      script.addEventListener('error', () => {
        if (isMounted) {
          setIsGoogleMapActive(false);
          setMapError('Unable to load Google Maps SDK. Using vector map.');
        }
      });
    }

    return () => {
      isMounted = false;
    };
  }, [googleMapsApiKey]);

  const activeReports = complaints.filter(c => !c.isDraft);

  const filteredReports = activeReports.filter(c => {
    if (selectedCategory === 'All') return true;
    return c.category === selectedCategory;
  });

  const handleSelectHotspot = (h: CivicHotspot) => {
    setSelectedSingleReport(null);
    setSelectedHotspot(h);
  };

  const handleSelectSingleReport = (r: CivicComplaint) => {
    setSelectedHotspot(null);
    setSelectedSingleReport(r);
  };

  return (
    <div className="space-y-4 pb-28 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-base font-bold text-[#000080] dark:text-blue-300 font-['Plus_Jakarta_Sans'] flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#FF9933]" />
            <span>Nearby Civic Map</span>
            <span className="text-[10px] font-bold bg-[#FFF6EC] dark:bg-amber-950/50 text-[#E68A00] dark:text-amber-400 px-2 py-0.5 rounded border border-[#FFD4A8] dark:border-amber-800/60">
              Vizianagaram
            </span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Spatial distribution of public grievances and connected Civic Hotspots
          </p>
        </div>
      </div>

      {/* Category Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
        {CATEGORIES.map(cat => (
          <button
            key={cat.label}
            onClick={() => setSelectedCategory(cat.value)}
            className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition border ${
              selectedCategory === cat.value
                ? 'bg-[#000080] dark:bg-blue-600 text-white border-[#000080] dark:border-blue-500 shadow-2xs font-bold ring-2 ring-[#FF9933]/40'
                : 'bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* MAP CANVAS: GOOGLE MAPS BASE WITH SARVAYA CIVIC HOTSPOT OVERLAYS */}
      <div className="relative w-full h-[420px] sm:h-[480px] lg:h-[580px] bg-[#eaf0f6] rounded-3xl overflow-hidden border border-slate-300 shadow-inner select-none">
        {/* Real Interactive Google Maps Element */}
        <div
          ref={mapContainerRef}
          className={`absolute inset-0 w-full h-full transition-opacity duration-300 ${
            isGoogleMapActive ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        />

        {/* Fallback Vector Map (shown when Google Maps is loading or API key not present) */}
        {!isGoogleMapActive && (
          <svg className="absolute inset-0 w-full h-full pointer-events-none">
            {/* Subtle land parcel grids */}
            <rect width="100%" height="100%" fill="#edf3f8" />

            {/* Pedda Cheruvu / Water Body in Vizianagaram */}
            <path
              d="M 280 20 C 330 30 380 70 360 120 C 330 160 270 140 260 100 C 250 50 260 30 280 20 Z"
              fill="#c7e2f5"
              stroke="#93c5fd"
              strokeWidth="1.5"
            />
            <text x="290" y="85" fill="#0369a1" fontSize="9" fontWeight="bold">Pedda Cheruvu</text>

            {/* Railway line passing through Vizianagaram Junction */}
            <path
              d="M 30 380 L 380 30"
              fill="none"
              stroke="#64748b"
              strokeWidth="3"
              strokeDasharray="8,6"
            />
            <text x="60" y="340" fill="#475569" fontSize="8" fontWeight="600" transform="rotate(-40, 60, 340)">
              Railway Line (Visakhapatnam - Howrah Main Line)
            </text>

            {/* Main Arterial Roads (MG Road, Cantonment Road, Station Road) */}
            <path d="M 0 180 Q 180 165 400 190" fill="none" stroke="#ffffff" strokeWidth="22" />
            <path d="M 0 180 Q 180 165 400 190" fill="none" stroke="#cbd5e1" strokeWidth="2" />
            <path d="M 0 180 Q 180 165 400 190" fill="none" stroke="#e2e8f0" strokeWidth="1" strokeDasharray="6,6" />

            {/* Cantonment Main Road (Vertical Arterial) */}
            <path d="M 180 0 L 180 400" fill="none" stroke="#ffffff" strokeWidth="18" />
            <path d="M 180 0 L 180 400" fill="none" stroke="#cbd5e1" strokeWidth="2" />

            {/* Station Road to Fort */}
            <path d="M 40 380 L 320 180" fill="none" stroke="#ffffff" strokeWidth="14" />
            <path d="M 40 380 L 320 180" fill="none" stroke="#cbd5e1" strokeWidth="1.5" />

            {/* Secondary streets */}
            <path d="M 100 0 L 100 240" fill="none" stroke="#ffffff" strokeWidth="10" />
            <path d="M 260 160 L 260 400" fill="none" stroke="#ffffff" strokeWidth="10" />
            <path d="M 0 90 L 200 90" fill="none" stroke="#ffffff" strokeWidth="10" />
            <path d="M 180 270 L 400 270" fill="none" stroke="#ffffff" strokeWidth="10" />

            {/* Vizianagaram Fort Compound */}
            <rect x="220" y="230" width="80" height="70" rx="6" fill="#fef3c7" stroke="#fcd34d" strokeWidth="1.2" />
            <text x="230" y="265" fill="#92400e" fontSize="9" fontWeight="bold">Vizianagaram Fort</text>

            {/* RTC Complex Area */}
            <rect x="110" y="130" width="60" height="40" rx="4" fill="#e0f2fe" stroke="#7dd3fc" strokeWidth="1" />
            <text x="116" y="152" fill="#0284c7" fontSize="8" fontWeight="bold">RTC Complex</text>
          </svg>
        )}

        {/* Status / Env info pill on bottom left */}
        <div className="absolute bottom-2.5 left-3 z-10 pointer-events-none flex items-center gap-1.5">
          {isGoogleMapActive ? (
            <span className="bg-white/90 dark:bg-slate-900/90 text-emerald-700 dark:text-emerald-400 text-[9px] font-bold px-2 py-0.5 rounded-md shadow-xs border border-emerald-300 dark:border-emerald-800 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live Google Maps Layer (Vizianagaram)
            </span>
          ) : (
            <span className="bg-white/90 dark:bg-slate-900/90 text-slate-600 dark:text-slate-300 text-[9px] font-medium px-2 py-0.5 rounded-md shadow-xs border border-slate-200 dark:border-slate-700">
              {googleMapsApiKey ? 'Connecting Google Maps...' : 'Vector Map Fallback • Set VITE_GOOGLE_MAPS_API_KEY to activate Google Maps'}
            </span>
          )}
        </div>

        {/* Real Locality Labels (for vector fallback mode) */}
        {!isGoogleMapActive && (
          <>
            <div className="absolute top-34 left-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xs px-2 py-0.5 rounded text-[9px] font-bold text-slate-700 dark:text-slate-200 shadow-xs pointer-events-none border border-slate-200 dark:border-slate-700">
              MG Road (RTC Junction)
            </div>
            <div className="absolute top-4 left-44 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xs px-2 py-0.5 rounded text-[9px] font-bold text-slate-700 dark:text-slate-200 shadow-xs pointer-events-none border border-slate-200 dark:border-slate-700">
              Cantonment Area
            </div>
          </>
        )}

        {/* Map Legend */}
        <div className="absolute top-3 right-3 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xs p-2.5 rounded-xl shadow-md border border-slate-200 dark:border-slate-700 text-[10px] space-y-1 z-10 text-slate-800 dark:text-slate-200 pointer-events-auto">
          <div className="flex items-center gap-1.5 font-bold text-red-600 dark:text-red-400">
            <span className="w-2.5 h-2.5 rounded-full bg-[#D32F2F] animate-ping" />
            <span>Civic Hotspot (4 Reports)</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 font-medium">
            <span className="w-2 h-2 rounded-full bg-[#000080] dark:bg-blue-400" />
            <span>Individual Report</span>
          </div>
        </div>

        {/* SARVAYA OVERLAYS CONTAINER (Interactive over the base map layer) */}
        <div className="absolute inset-0 pointer-events-none">
          {/* CIVIC HOTSPOT 1: MG Road - RTC Complex Drainage Hotspot (4 related reports) */}
          <div
            onClick={() => handleSelectHotspot(hotspots[0])}
            style={
              isGoogleMapActive && markerPixels.hotspot
                ? { left: `${markerPixels.hotspot.x}px`, top: `${markerPixels.hotspot.y}px` }
                : { left: '42%', top: '48%' }
            }
            className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-20 group pointer-events-auto"
          >
            {/* Subtle pulsing radius around hotspot as requested in Section 7 */}
            <div className="w-24 h-24 rounded-full bg-red-500/20 border-2 border-red-500/50 -translate-x-1/2 -translate-y-1/2 absolute left-1/2 top-1/2 animate-ping pointer-events-none" />
            <div className="w-16 h-16 rounded-full bg-red-500/25 border border-red-500/70 -translate-x-1/2 -translate-y-1/2 absolute left-1/2 top-1/2" />

            {/* Red/Orange Core Pin */}
            <div className="relative w-10 h-10 rounded-full bg-gradient-to-tr from-[#D32F2F] to-[#f97316] text-white flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform ring-4 ring-white dark:ring-slate-900">
              <Flame size={20} />
              <span className="absolute -top-1 -right-1 bg-[#000080] text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border border-white">
                4
              </span>
            </div>
            <span className="absolute top-11 -left-16 w-44 text-center bg-white/95 dark:bg-slate-900/95 text-slate-900 dark:text-slate-100 text-[10px] font-bold px-2 py-0.5 rounded-md shadow-xs border border-slate-200 dark:border-slate-700 pointer-events-none">
              MG Road Drainage Hotspot
            </span>
          </div>

          {/* Individual Report Pin: College Road Pothole */}
          {complaints[1] && (
            <div
              onClick={() => handleSelectSingleReport(complaints[1])}
              style={
                isGoogleMapActive && markerPixels.c1
                  ? { left: `${markerPixels.c1.x}px`, top: `${markerPixels.c1.y}px` }
                  : { left: '48%', top: '22%' }
              }
              className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-15 group pointer-events-auto"
              title="Pothole on College Road"
            >
              <div className="w-7 h-7 rounded-full bg-[#D32F2F] text-white flex items-center justify-center shadow-sm ring-2 ring-white dark:ring-slate-900 group-hover:scale-125 transition-transform">
                <MapPin size={14} />
              </div>
            </div>
          )}

          {/* Individual Report Pin: Streetlight at Balaji Nagar */}
          {complaints[2] && (
            <div
              onClick={() => handleSelectSingleReport(complaints[2])}
              style={
                isGoogleMapActive && markerPixels.c2
                  ? { left: `${markerPixels.c2.x}px`, top: `${markerPixels.c2.y}px` }
                  : { left: '78%', top: '32%' }
              }
              className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-15 group pointer-events-auto"
              title="Street Light Not Working"
            >
              <div className="w-6 h-6 rounded-full bg-[#FF9933] text-white flex items-center justify-center shadow-sm ring-2 ring-white dark:ring-slate-900 group-hover:scale-125 transition-transform">
                <MapPin size={12} />
              </div>
            </div>
          )}

          {/* Individual Report Pin: Fort Road Pipeline */}
          {complaints[3] && (
            <div
              onClick={() => handleSelectSingleReport(complaints[3])}
              style={
                isGoogleMapActive && markerPixels.c3
                  ? { left: `${markerPixels.c3.x}px`, top: `${markerPixels.c3.y}px` }
                  : { left: '62%', top: '72%' }
              }
              className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer z-15 group pointer-events-auto"
              title="Drinking Water Pipeline"
            >
              <div className="w-6 h-6 rounded-full bg-[#000080] dark:bg-blue-600 text-white flex items-center justify-center shadow-sm ring-2 ring-white dark:ring-slate-900 group-hover:scale-125 transition-transform">
                <MapPin size={12} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* SELECTED HOTSPOT DRAWER (Clean, official layout matching Section 7) */}
      {selectedHotspot && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-md border-2 border-red-200 dark:border-red-900/60 space-y-3 animate-slideUp text-slate-800 dark:text-slate-100">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-red-100 dark:bg-red-950/80 text-[#D32F2F] dark:text-red-400 flex items-center justify-center shrink-0">
                <Flame size={20} />
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#D32F2F] dark:text-red-400 block">
                  Civic Hotspot Connected Cluster
                </span>
                <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 leading-tight">
                  {selectedHotspot.name}
                </h3>
              </div>
            </div>
            <button
              onClick={() => setSelectedHotspot(null)}
              className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X size={16} />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2 text-xs bg-slate-50 dark:bg-slate-800/80 p-3 rounded-xl border border-slate-200 dark:border-slate-700">
            <div>
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase block">
                Number of Related Reports:
              </span>
              <span className="font-extrabold text-slate-900 dark:text-slate-100">
                4 Related Complaints (Same Locality)
              </span>
            </div>

            <div>
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase block">
                Priority Level:
              </span>
              <span className="font-extrabold text-[#D32F2F] dark:text-red-400">HIGH PRIORITY</span>
            </div>

            <div className="col-span-2 border-t border-slate-200 dark:border-slate-700 pt-1.5">
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase block">
                Locality:
              </span>
              <span className="text-slate-800 dark:text-slate-200">{selectedHotspot.locality}, Vizianagaram</span>
            </div>

            <div className="col-span-2 border-t border-slate-200 dark:border-slate-700 pt-1.5">
              <span className="text-[10px] font-bold text-[#E68A00] dark:text-[#FF9933] uppercase block">
                Possible Root Cause:
              </span>
              <p className="text-amber-950 dark:text-amber-200 font-medium italic mt-0.5">
                {selectedHotspot.possibleRootCause}
              </p>
            </div>

            <div className="col-span-2 flex items-center justify-between border-t border-slate-200 dark:border-slate-700 pt-1.5">
              <div>
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase block">
                  Responsible Department:
                </span>
                <span className="font-bold text-slate-800 dark:text-slate-200">{selectedHotspot.department}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-400 uppercase block">
                  Cluster Status:
                </span>
                <span className="font-bold text-[#000080] dark:text-blue-300">{selectedHotspot.status}</span>
              </div>
            </div>
          </div>

          {/* Connected Reports list */}
          <div className="space-y-1.5 pt-1">
            <span className="text-[11px] font-bold text-slate-600 dark:text-slate-300 block">
              Connected Citizen Complaints in this Hotspot:
            </span>
            <div className="space-y-1">
              <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-xs flex justify-between items-center border border-slate-200 dark:border-slate-700">
                <span className="font-semibold text-slate-800 dark:text-slate-200">1. Waterlogging on MG Road</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">Rahul M. • In Progress</span>
              </div>
              <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-xs flex justify-between items-center border border-slate-200 dark:border-slate-700">
                <span className="font-semibold text-slate-800 dark:text-slate-200">2. Storm drain completely blocked</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">Suresh K. • Connected</span>
              </div>
              <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-xs flex justify-between items-center border border-slate-200 dark:border-slate-700">
                <span className="font-semibold text-slate-800 dark:text-slate-200">3. Stagnant water and mosquito accumulation</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">Sunita R. • Connected</span>
              </div>
              <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-lg text-xs flex justify-between items-center border border-slate-200 dark:border-slate-700">
                <span className="font-semibold text-slate-800 dark:text-slate-200">4. Foul smell from standing wastewater</span>
                <span className="text-[10px] text-slate-500 dark:text-slate-400">P. Naidu • Connected</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SELECTED SINGLE REPORT DRAWER */}
      {selectedSingleReport && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 shadow-md border border-slate-200 dark:border-slate-800 space-y-2.5 animate-slideUp text-slate-800 dark:text-slate-100">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] font-mono font-bold text-[#000080] dark:text-blue-300">
                {selectedSingleReport.id} • {selectedSingleReport.category}
              </span>
              <h3 className="font-bold text-sm text-slate-900 dark:text-slate-100 leading-snug">
                {selectedSingleReport.title}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                {selectedSingleReport.location.address}, Vizianagaram
              </p>
            </div>
            <button
              onClick={() => setSelectedSingleReport(null)}
              className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              <X size={16} />
            </button>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
            <span className="font-semibold text-slate-700 dark:text-slate-300">Status: {selectedSingleReport.status}</span>
            <button
              onClick={() => {
                setSelectedComplaint(selectedSingleReport);
                setCurrentView('complaint-detail');
              }}
              className="text-xs font-bold text-[#000080] dark:text-blue-400 hover:underline flex items-center gap-1"
            >
              <span>View Complaint Details & Timeline</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
