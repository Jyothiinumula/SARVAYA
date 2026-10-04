import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import {
  CivicComplaint,
  CivicHotspot,
  AppView,
  CivicCategory,
  ComplaintStatus,
  TimelineEvent,
  PriorityLevel,
  UserRole,
} from '../types';
import { INITIAL_COMPLAINTS, INITIAL_HOTSPOTS } from '../data/mockData';
import {
  analyzeWithIssueSense,
  calculateSmartPriority,
  checkCivicHotspot,
  determineSmartRoute,
} from '../services/civicIntelligence';
import { Language, DICTIONARY } from '../utils/i18n';
import {
  fetchCentralCivicData,
  saveCentralComplaint,
  updateCentralComplaint,
  resetCentralData,
} from '../services/centralDataStore';
import {
  saveOfflineDraft,
  getOfflineDrafts,
  deleteOfflineDraft,
  enqueueOfflineReport,
  getOfflineOutbox,
  removeOfflineOutboxItem,
  cacheComplaintsLocally,
  cacheHotspotsLocally,
  getCachedComplaints,
  getCachedHotspots,
} from '../services/offlineStorage';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

interface CivicContextType {
  complaints: CivicComplaint[];
  hotspots: CivicHotspot[];
  currentView: AppView;
  selectedComplaint: CivicComplaint | null;
  draftComplaint: Partial<CivicComplaint> | null;
  isEmergencyModalOpen: boolean;
  activeFilter: string;
  language: Language;
  isServerConnected: boolean;
  isOnline: boolean;
  offlineQueueCount: number;
  newComplaintsCount: number;
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  isSyncing: boolean;
  syncWithServer: () => Promise<void>;
  syncWithCentralDB: () => Promise<void>;
  syncOfflineQueue: () => Promise<void>;
  setLanguage: (lang: Language) => void;
  setCurrentView: (view: AppView) => void;
  setSelectedComplaint: (complaint: CivicComplaint | null) => void;
  setDraftComplaint: (draft: Partial<CivicComplaint> | null) => void;
  setIsEmergencyModalOpen: (open: boolean) => void;
  setActiveFilter: (filter: string) => void;
  saveDraft: (draft: Partial<CivicComplaint>) => void;
  deleteDraft: (id: string) => void;
  submitCivicReport: (reportData: {
    title: string;
    description: string;
    photoUrl?: string;
    audioNote?: { duration: string; transcript: string };
    location: { address: string; landmark: string; ward: string; city?: string; lat: number; lng: number };
    category?: CivicCategory;
  }) => CivicComplaint;
  updateComplaintStatus: (id: string, status: ComplaintStatus, notes?: string, actor?: string, assignedDepartment?: string) => void;
  escalateComplaint: (id: string, directive: string, assignedOfficer?: string) => void;
  verifyComplaint: (id: string, isResolved: boolean, feedback?: string) => void;
  reopenComplaint: (id: string, reason: string) => void;
  upvoteComplaint: (id: string) => void;
  resetToDemoData: () => void;
}

const CivicContext = createContext<CivicContextType | undefined>(undefined);

export const CivicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    return (localStorage.getItem('sarvaya_lang') as Language) || 'te';
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('sarvaya_lang', lang);
  };

  const [complaints, setComplaints] = useState<CivicComplaint[]>(() => {
    const saved = localStorage.getItem('sarvaya_complaints');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed.map((c: CivicComplaint) => {
            if (!c.smartPriority) {
              const initial = INITIAL_COMPLAINTS.find(ic => ic.id === c.id);
              if (initial?.smartPriority) {
                return { ...c, smartPriority: initial.smartPriority };
              }
            }
            return c;
          });
        }
      } catch {
        return INITIAL_COMPLAINTS;
      }
    }
    return INITIAL_COMPLAINTS;
  });

  const [hotspots, setHotspots] = useState<CivicHotspot[]>(() => {
    const saved = localStorage.getItem('sarvaya_hotspots');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return INITIAL_HOTSPOTS;
      }
    }
    return INITIAL_HOTSPOTS;
  });

  const [currentView, setCurrentView] = useState<AppView>('home');
  const [selectedComplaint, setSelectedComplaint] = useState<CivicComplaint | null>(null);
  const [draftComplaint, setDraftComplaint] = useState<Partial<CivicComplaint> | null>(null);
  const [isEmergencyModalOpen, setIsEmergencyModalOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState('all');
  const [isServerConnected, setIsServerConnected] = useState(true);
  const [userRole, setUserRoleState] = useState<UserRole>(() => {
    return (localStorage.getItem('sarvaya_role') as UserRole) || 'citizen';
  });

  const setUserRole = (role: UserRole) => {
    setUserRoleState(role);
    localStorage.setItem('sarvaya_role', role);
  };

  const [isSyncing, setIsSyncing] = useState(false);
  const [offlineQueueCount, setOfflineQueueCount] = useState(0);
  const { isOnline } = useOnlineStatus();

  const isPollingRef = useRef(false);

  // Refresh offline outbox count
  const refreshOfflineQueueCount = useCallback(async () => {
    try {
      const outbox = await getOfflineOutbox();
      setOfflineQueueCount(outbox.length);
    } catch {
      setOfflineQueueCount(0);
    }
  }, []);

  // Synchronize queued offline reports with the central shared database
  const syncOfflineQueue = useCallback(async () => {
    if (!isOnline || isSyncing) return;
    setIsSyncing(true);

    try {
      const outbox = await getOfflineOutbox();
      if (outbox.length === 0) {
        setIsSyncing(false);
        return;
      }

      console.log(`[SARVAYA OfflineSync] Synchronizing ${outbox.length} offline queued reports...`);
      for (const item of outbox) {
        try {
          const syncedComplaint: CivicComplaint = {
            ...item.report,
            status: item.report.status === 'Pending Offline Sync' ? 'New' : item.report.status,
            isOfflineSynced: true,
            timelineEvents: [
              ...item.report.timelineEvents,
              {
                id: `evt-sync-${Date.now()}`,
                step: 'LocalSync',
                title: 'Synchronized with Municipal Central DB',
                timestamp: new Date().toLocaleString(),
                actor: 'SARVAYA Local-First Sync Engine',
                notes: 'Queued offline report successfully uploaded to municipal server after network reconnection.',
                state: 'completed',
              },
            ],
          };

          await saveCentralComplaint(syncedComplaint);
          await removeOfflineOutboxItem(item.id);

          // Update local state to show synchronized status
          setComplaints(prev =>
            prev.map(c => (c.id === syncedComplaint.id ? syncedComplaint : c))
          );
        } catch (postErr) {
          console.warn(`[SARVAYA OfflineSync] Failed to sync ${item.id}, will retry:`, postErr);
        }
      }

      await refreshOfflineQueueCount();
      await syncWithCentralDB();
    } catch (err) {
      console.warn('[SARVAYA OfflineSync] Error during offline queue sync:', err);
    } finally {
      setIsSyncing(false);
    }
  }, [isOnline, isSyncing, refreshOfflineQueueCount]);

  // Synchronize complaints with the central shared database
  const syncWithCentralDB = useCallback(async () => {
    if (isPollingRef.current) return;
    isPollingRef.current = true;

    try {
      const data = await fetchCentralCivicData();
      if (data.isOnline && data.complaints && data.complaints.length > 0) {
        const enriched = data.complaints.map(c => {
          if (!c.smartPriority) {
            const initial = INITIAL_COMPLAINTS.find(ic => ic.id === c.id);
            if (initial?.smartPriority) {
              return { ...c, smartPriority: initial.smartPriority };
            }
          }
          return c;
        });

        setComplaints(prev => {
          // Keep locally enqueued offline items that haven't synced yet
          const pendingOfflineItems = prev.filter(c => c.status === 'Pending Offline Sync' || c.isDraft);
          const serverComplaints = enriched.filter(
            ec => !pendingOfflineItems.some(poi => poi.id === ec.id)
          );

          const merged = [...pendingOfflineItems, ...serverComplaints];
          const prevSignature = JSON.stringify(prev.map(c => ({ id: c.id, status: c.status, events: c.timelineEvents.length, dept: c.department })));
          const nextSignature = JSON.stringify(merged.map(c => ({ id: c.id, status: c.status, events: c.timelineEvents.length, dept: c.department })));
          if (prevSignature !== nextSignature) {
            return merged;
          }
          return prev;
        });
        setIsServerConnected(true);
      }
      if (data.hotspots && data.hotspots.length > 0) {
        setHotspots(data.hotspots);
      }
    } catch (err) {
      console.warn('[SARVAYA Sync] Central sync notice:', err);
      setIsServerConnected(false);
    } finally {
      isPollingRef.current = false;
    }
  }, []);

  // On mount: load offline drafts and check outbox
  useEffect(() => {
    async function loadOfflineStorage() {
      try {
        const [offlineDrafts, outbox] = await Promise.all([
          getOfflineDrafts(),
          getOfflineOutbox(),
        ]);

        if (offlineDrafts.length > 0) {
          setComplaints(prev => {
            const existingIds = new Set(prev.map(c => c.id));
            const newDrafts = offlineDrafts.filter(d => !existingIds.has(d.id));
            return [...newDrafts, ...prev];
          });
        }

        if (outbox.length > 0) {
          setOfflineQueueCount(outbox.length);
          // Add outbox items to complaints if not present
          setComplaints(prev => {
            const existingIds = new Set(prev.map(c => c.id));
            const pendingReports = outbox.map(o => o.report).filter(r => !existingIds.has(r.id));
            return [...pendingReports, ...prev];
          });
        }
      } catch (e) {
        console.warn('[SARVAYA] Offline storage init note:', e);
      }
    }
    loadOfflineStorage();
  }, []);

  // Auto-sync offline queue when network connects
  useEffect(() => {
    if (isOnline) {
      syncOfflineQueue();
    }
  }, [isOnline, syncOfflineQueue]);

  // Poll central database every 3 seconds when online
  useEffect(() => {
    if (isOnline) {
      syncWithCentralDB();
      const interval = setInterval(syncWithCentralDB, 3000);
      return () => clearInterval(interval);
    }
  }, [syncWithCentralDB, isOnline]);

  useEffect(() => {
    localStorage.setItem('sarvaya_complaints', JSON.stringify(complaints));
    cacheComplaintsLocally(complaints).catch(() => {});
  }, [complaints]);

  useEffect(() => {
    localStorage.setItem('sarvaya_hotspots', JSON.stringify(hotspots));
    cacheHotspotsLocally(hotspots).catch(() => {});
  }, [hotspots]);

  // Keep selectedComplaint fresh when complaints state updates
  useEffect(() => {
    if (selectedComplaint) {
      const updated = complaints.find(c => c.id === selectedComplaint.id);
      if (updated) {
        setSelectedComplaint(updated);
      }
    }
  }, [complaints, selectedComplaint]);

  const newComplaintsCount = complaints.filter(c => c.status === 'New').length;

  const saveDraft = (draft: Partial<CivicComplaint>) => {
    const draftId = draft.id || `SRV-DRAFT-${Date.now().toString().slice(-4)}`;
    const now = new Date().toLocaleString();

    const newDraft: CivicComplaint = {
      id: draftId,
      title: draft.title || 'Saved Quick Capture (Draft)',
      description: draft.description || 'Geotagged image captured on-the-go. Pending complete description.',
      photoUrl: draft.photoUrl || 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80',
      audioNote: draft.audioNote,
      category: draft.category || 'Drainage',
      specificProblem: draft.specificProblem || 'Draft Civic Problem',
      impact: draft.impact || 'Under review',
      location: {
        address: draft.location?.address || 'Main Road Junction, Near Bus Shelter',
        landmark: draft.location?.landmark || 'Opposite State Bank',
        ward: draft.location?.ward || 'Ward 12 (North Central Zone)',
        city: draft.location?.city || 'Vizianagaram',
        lat: draft.location?.lat ?? 17.4435,
        lng: draft.location?.lng ?? 78.3842,
      },
      isDraft: true,
      capturedAt: now,
      priority: 'LOW',
      priorityFactors: {
        severity: 'Draft capture pending citizen finalization',
        peopleAffected: 'Local community',
        duration: 'Recent',
        recurrence: 'Not assessed yet',
        publicHealthImpact: 'Low',
        safetyImpact: 'Low',
      },
      department: 'Pending Submission',
      officerName: 'Pending Assignment',
      officerContact: '—',
      slaDays: 2,
      targetResolutionDate: '—',
      status: 'Draft',
      citizenInfo: {
        name: 'Citizen (Public User)',
        contact: '+91 98480 22334',
        submittedFrom: 'Mobile Device',
      },
      timelineEvents: [
        {
          id: `evt-${Date.now()}`,
          step: 'CivicCapture',
          title: 'Captured Now / Draft Saved',
          timestamp: now,
          actor: 'Citizen (You)',
          notes: 'Captured on-site. Photo and GPS coordinates safely stored for later submission.',
          state: 'completed',
        },
      ],
    };

    setComplaints(prev => {
      const filtered = prev.filter(c => c.id !== draftId);
      return [newDraft, ...filtered];
    });

    // Save to local-first IndexedDB storage so high-res image & audio persist offline
    saveOfflineDraft(newDraft).catch(e => console.warn('[SARVAYA] Error saving offline draft:', e));

    setDraftComplaint(null);
  };

  const deleteDraft = (id: string) => {
    setComplaints(prev => prev.filter(c => c.id !== id));
    deleteOfflineDraft(id).catch(e => console.warn('[SARVAYA] Error deleting offline draft:', e));
  };

  /**
   * Citizen submits a complaint:
   * - Generates unique Complaint ID (SAR-XXXX)
   * - Default status = "New"
   * - Stored in central shared database so Admin Dashboard automatically sees it
   */
  const submitCivicReport = (reportData: {
    title: string;
    description: string;
    photoUrl?: string;
    audioNote?: { duration: string; transcript: string };
    location: { address: string; landmark: string; ward: string; city?: string; lat: number; lng: number };
    category?: CivicCategory;
  }): CivicComplaint => {
    // Generate unique complaint ID (e.g. SAR-1024)
    const complaintId = `SAR-${Math.floor(1000 + Math.random() * 9000)}`;
    const now = new Date().toLocaleString();

    // 1. IssueSense AI Analysis
    const issueSense = analyzeWithIssueSense(reportData.description, reportData.title);
    const chosenCategory = reportData.category || issueSense.category;

    // 2. CivicHotspot & Root Cause Insight (Evaluated first to inform cluster/related complaints)
    const hotspotResult = checkCivicHotspot(
      {
        category: chosenCategory,
        lat: reportData.location.lat,
        lng: reportData.location.lng,
        description: reportData.description,
      },
      hotspots,
      complaints
    );

    // 3. SmartPriority Engine Assessment (6-factor explainable analysis)
    const smartPriorityResult = calculateSmartPriority(
      chosenCategory,
      reportData.description,
      reportData.location,
      hotspotResult.matchedHotspot ? hotspotResult.relatedComplaintsCount : 1,
      reportData.title
    );

    let assignedHotspotId: string | undefined = undefined;
    let assignedHotspotName: string | undefined = undefined;

    if (hotspotResult.matchedHotspot) {
      assignedHotspotId = hotspotResult.matchedHotspot.id;
      assignedHotspotName = hotspotResult.matchedHotspot.name;
      setHotspots(prev =>
        prev.map(h =>
          h.id === hotspotResult.matchedHotspot!.id
            ? { ...h, relatedReportIds: [...h.relatedReportIds, complaintId] }
            : h
        )
      );
    } else if (hotspotResult.isNewHotspotCreated) {
      const newHotspotId = `HOTSPOT-VZM-${Math.floor(10 + Math.random() * 90)}`;
      const newHotspot: CivicHotspot = {
        id: newHotspotId,
        name: `${reportData.location.ward} ${chosenCategory} Cluster`,
        locality: `${reportData.location.address}`,
        city: reportData.location.city || 'Vizianagaram',
        possibleIssue: issueSense.specificProblem,
        possibleRootCause: hotspotResult.possibleRootCause,
        relatedReportIds: [complaintId],
        priority: smartPriorityResult.priority,
        department: determineSmartRoute(chosenCategory, reportData.location.ward).department,
        status: 'Intelligence Correlated',
        coordinates: { lat: reportData.location.lat, lng: reportData.location.lng },
        radiusMeters: 250,
        detectedAt: now,
        notes: `SARVAYA correlated this report with localized recurring complaints in ${reportData.location.ward}.`,
      };
      setHotspots(prev => [newHotspot, ...prev]);
      assignedHotspotId = newHotspotId;
      assignedHotspotName = newHotspot.name;
    }

    // 4. SmartRoute Assignment
    const smartRoute = determineSmartRoute(chosenCategory, reportData.location.ward);

    // Build timeline events
    const timelineEvents: TimelineEvent[] = [
      {
        id: `evt-1-${Date.now()}`,
        step: 'CivicCapture',
        title: 'Report Captured & Submitted (Status: New)',
        timestamp: now,
        actor: 'Citizen (You)',
        notes: 'Geotagged image, coordinates and description submitted to Central Municipal Hub.',
        state: 'completed',
      },
      {
        id: `evt-2-${Date.now()}`,
        step: 'IssueSense',
        title: 'AI Classification Completed',
        timestamp: now,
        actor: 'SARVAYA IssueSense AI',
        notes: `Identified category: ${chosenCategory}. Specific problem: ${issueSense.specificProblem}.`,
        state: 'completed',
      },
      {
        id: `evt-3-${Date.now()}`,
        step: 'SmartPriority',
        title: `Priority Evaluated: ${smartPriorityResult.priority}`,
        timestamp: now,
        actor: 'SARVAYA SmartPriority Engine',
        notes: smartPriorityResult.justification,
        state: 'completed',
      },
    ];

    if (assignedHotspotId) {
      timelineEvents.push({
        id: `evt-4-${Date.now()}`,
        step: 'CivicHotspot',
        title: 'Correlated into Civic Hotspot',
        timestamp: now,
        actor: 'SARVAYA CivicHotspot Engine',
        notes: `${hotspotResult.possibleRootCause} (Linked to cluster: ${assignedHotspotName})`,
        state: 'completed',
      });
    }

    timelineEvents.push(
      {
        id: `evt-5-${Date.now()}`,
        step: 'SmartRoute',
        title: `Routed to ${smartRoute.department}`,
        timestamp: now,
        actor: 'SARVAYA SmartRoute Engine',
        notes: `Suggested Officer: ${smartRoute.officerName}. Defined SLA: ${smartRoute.slaDays * 24} Hours.`,
        state: 'completed',
      },
      {
        id: `evt-6-${Date.now()}`,
        step: 'Awaiting Action',
        title: 'Awaiting Admin / Ward Work Order',
        timestamp: now,
        actor: 'Municipal Authority / Admin',
        notes: 'Newly received grievance visible in Central Admin Queue.',
        state: 'current',
      }
    );

    const isActuallyOffline = !isOnline || !isServerConnected;

    const newComplaint: CivicComplaint = {
      id: complaintId,
      title: reportData.title || issueSense.specificProblem,
      description: reportData.description,
      photoUrl: reportData.photoUrl || 'https://images.unsplash.com/photo-1541888946425-d0fbb186f5f8?auto=format&fit=crop&w=800&q=80',
      audioNote: reportData.audioNote,
      category: chosenCategory,
      specificProblem: issueSense.specificProblem,
      impact: issueSense.impact,
      location: {
        ...reportData.location,
        city: reportData.location.city || 'Vizianagaram',
      },
      isDraft: false,
      capturedAt: now,
      reportedAt: now,
      priority: smartPriorityResult.priority,
      priorityFactors: smartPriorityResult.factors,
      smartPriority: smartPriorityResult.smartPriority,
      hotspotId: assignedHotspotId,
      hotspotName: assignedHotspotName,
      possibleRootCause: hotspotResult.possibleRootCause,
      department: smartRoute.department,
      officerName: smartRoute.officerName,
      officerContact: smartRoute.officerContact,
      slaDays: smartRoute.slaDays,
      targetResolutionDate: smartRoute.targetResolutionDate,
      status: isActuallyOffline ? 'Pending Offline Sync' : 'New',
      isOfflineSynced: !isActuallyOffline,
      timelineEvents: isActuallyOffline
        ? [
            ...timelineEvents,
            {
              id: `evt-offline-${Date.now()}`,
              step: 'OfflineCapture',
              title: 'Saved to Local-First Outbox (Offline Mode)',
              timestamp: now,
              actor: 'SARVAYA Offline Engine',
              notes: 'Network is currently unavailable. Report and media safely stored in local IndexedDB. Will auto-sync when online.',
              state: 'completed',
            },
          ]
        : timelineEvents,
      upvotes: 1,
      citizenInfo: {
        name: 'Citizen (Public App User)',
        contact: '+91 98480 22334',
        submittedFrom: 'Mobile Device',
      },
    };

    // Save locally
    setComplaints(prev => [newComplaint, ...prev]);

    if (isActuallyOffline) {
      // Enqueue to offline outbox in IndexedDB
      enqueueOfflineReport(newComplaint)
        .then(() => refreshOfflineQueueCount())
        .catch(err => console.warn('[SARVAYA] Error enqueuing offline report:', err));
    } else {
      // Save to central database; fallback to offline outbox if request fails
      saveCentralComplaint(newComplaint).catch(err => {
        console.warn('[SARVAYA] Network save failed, enqueuing to offline outbox:', err);
        enqueueOfflineReport({ ...newComplaint, status: 'Pending Offline Sync', isOfflineSynced: false })
          .then(() => refreshOfflineQueueCount())
          .catch(() => {});
      });
    }

    return newComplaint;
  };

  const updateComplaintStatus = (
    id: string,
    status: ComplaintStatus,
    notes?: string,
    actor?: string,
    assignedDepartment?: string
  ) => {
    const now = new Date().toLocaleString();
    setComplaints(prev =>
      prev.map(c => {
        if (c.id !== id) return c;

        const updatedEvents = [...c.timelineEvents];
        const newDept = assignedDepartment || c.department;
        const newOfficer = actor || c.officerName;

        if (status === 'Assigned') {
          updatedEvents.push({
            id: `evt-${Date.now()}`,
            step: 'Assigned',
            title: `Assigned to ${newDept}`,
            timestamp: now,
            actor: newOfficer || 'Authority Desk',
            notes: notes || `Work order assigned to ${newOfficer} in ${newDept}.`,
            state: 'completed',
          });
        } else if (status === 'In Progress') {
          updatedEvents.push({
            id: `evt-${Date.now()}`,
            step: 'In Progress',
            title: 'Field Team Commenced Action',
            timestamp: now,
            actor: newOfficer || c.officerName,
            notes: notes || 'Equipment mobilized and team deployed at site.',
            state: 'current',
          });
        } else if (status === 'Resolved') {
          updatedEvents.push({
            id: `evt-${Date.now()}`,
            step: 'Resolved',
            title: 'Authority Marked Issue as RESOLVED',
            timestamp: now,
            actor: actor || newDept,
            notes: notes || 'Field crew completed required repairs. Awaiting Citizen Confirmation.',
            state: 'completed',
          });
          updatedEvents.push({
            id: `evt-cv-${Date.now()}`,
            step: 'CitizenVerify',
            title: 'Awaiting Citizen Verification (CitizenVerify)',
            timestamp: now,
            actor: 'Citizen Verification Pending',
            notes: 'SARVAYA requires citizen to verify: YES (Problem Resolved) or NO (Still Not Resolved).',
            state: 'current',
          });
        } else if (status === 'Overdue') {
          updatedEvents.push({
            id: `evt-${Date.now()}`,
            step: 'Overdue',
            title: 'SLA Timeline Breached — Status OVERDUE',
            timestamp: now,
            actor: 'SARVAYA SLA Monitor',
            notes: notes || 'Department missed committed resolution SLA.',
            state: 'overdue',
          });
        }

        const updated: CivicComplaint = {
          ...c,
          status,
          department: newDept,
          officerName: newOfficer,
          timelineEvents: updatedEvents,
          citizenVerification:
            status === 'Resolved'
              ? { status: 'pending_verification' }
              : c.citizenVerification,
        };

        // Persist update to central database
        updateCentralComplaint(id, {
          status,
          department: newDept,
          officerName: newOfficer,
          timelineEvents: updatedEvents,
          citizenVerification: updated.citizenVerification,
        });

        return updated;
      })
    );
  };

  const escalateComplaint = (id: string, directive: string, assignedOfficer?: string) => {
    const now = new Date().toLocaleString();
    setComplaints(prev =>
      prev.map(c => {
        if (c.id !== id) return c;

        const newEvents: TimelineEvent[] = [
          ...c.timelineEvents,
          {
            id: `evt-esc-${Date.now()}`,
            step: 'Escalate',
            title: 'Escalated to Higher Authority Review',
            timestamp: now,
            actor: 'SARVAYA Automated Escalation System',
            notes: 'Overdue alert forwarded to Joint Municipal Commissioner & Grievance Cell.',
            state: 'escalated',
          },
          {
            id: `evt-dir-${Date.now()}`,
            step: 'Higher Authority Review',
            title: 'Higher Authority Directive Issued',
            timestamp: now,
            actor: 'Dr. S. K. Narayanan (Joint Municipal Commissioner)',
            notes: `Directive: "${directive}". Reassigned officer: ${assignedOfficer || c.officerName}.`,
            state: 'current',
          },
        ];

        const updated: CivicComplaint = {
          ...c,
          status: 'Escalated' as ComplaintStatus,
          officerName: assignedOfficer || c.officerName,
          timelineEvents: newEvents,
          escalation: {
            isEscalated: true,
            escalationDate: now,
            overdueDuration: 'Overdue past department SLA',
            originalOfficer: c.officerName,
            assignedDepartment: c.department,
            deadlineSLA: `${c.slaDays * 24} Hours`,
            reason: 'Critical SLA breach flagged by citizen & municipal audit.',
            higherAuthorityName: 'Dr. S. K. Narayanan',
            higherAuthorityDesignation: 'Joint Municipal Commissioner & Head of Vigilance',
            directiveIssued: directive,
            actionHistory: [
              ...(c.escalation?.actionHistory || []),
              {
                date: now,
                action: 'Higher Authority Directive Issued',
                actor: 'Dr. S. K. Narayanan (Jt. Commissioner)',
                notes: directive,
              },
            ],
          },
        };

        updateCentralComplaint(id, {
          status: 'Escalated',
          officerName: updated.officerName,
          timelineEvents: newEvents,
          escalation: updated.escalation,
        });

        return updated;
      })
    );
  };

  const verifyComplaint = (id: string, isResolved: boolean, feedback?: string) => {
    const now = new Date().toLocaleString();
    setComplaints(prev =>
      prev.map(c => {
        if (c.id !== id) return c;

        if (isResolved) {
          const updatedEvents: TimelineEvent[] = [
            ...c.timelineEvents,
            {
              id: `evt-v-yes-${Date.now()}`,
              step: 'CitizenVerify',
              title: 'Citizen Confirmed Resolution: YES',
              timestamp: now,
              actor: 'Citizen (You)',
              notes: feedback ? `Feedback: "${feedback}"` : 'Citizen inspected and confirmed problem resolved satisfactorily.',
              state: 'completed',
            },
            {
              id: `evt-v-close-${Date.now()}`,
              step: 'Closed',
              title: 'Complaint Formally Closed',
              timestamp: now,
              actor: 'SARVAYA Accountability System',
              notes: 'Grievance ticket verified and officially closed with citizen consensus.',
              state: 'completed',
            },
          ];

          const updated: CivicComplaint = {
            ...c,
            status: 'Closed' as ComplaintStatus,
            timelineEvents: updatedEvents,
            citizenVerification: {
              status: 'confirmed_resolved',
              verifiedAt: now,
              feedbackNotes: feedback,
            },
          };

          updateCentralComplaint(id, {
            status: 'Closed',
            timelineEvents: updatedEvents,
            citizenVerification: updated.citizenVerification,
          });

          return updated;
        } else {
          const updatedEvents: TimelineEvent[] = [
            ...c.timelineEvents,
            {
              id: `evt-v-no-${Date.now()}`,
              step: 'CitizenVerify',
              title: 'Citizen Rejected Resolution: NO (Still Not Resolved)',
              timestamp: now,
              actor: 'Citizen (You)',
              notes: feedback ? `Reason: "${feedback}"` : 'Citizen inspected location and flagged that problem remains active.',
              state: 'overdue',
            },
            {
              id: `evt-v-reopen-${Date.now()}`,
              step: 'Reopened',
              title: 'Complaint Reopened for Urgent Rectification',
              timestamp: now,
              actor: 'SARVAYA Quality Assurance Wing',
              notes: 'Ticket marked REOPENED. Sent back to Department Superintending Engineer.',
              state: 'current',
            },
          ];

          const updated: CivicComplaint = {
            ...c,
            status: 'Reopened' as ComplaintStatus,
            timelineEvents: updatedEvents,
            citizenVerification: {
              status: 'reopened',
              verifiedAt: now,
              feedbackNotes: feedback,
              reopenReason: feedback || 'Citizen reported issue is still not resolved on-ground.',
            },
          };

          updateCentralComplaint(id, {
            status: 'Reopened',
            timelineEvents: updatedEvents,
            citizenVerification: updated.citizenVerification,
          });

          return updated;
        }
      })
    );
  };

  const reopenComplaint = (id: string, reason: string) => {
    verifyComplaint(id, false, reason);
  };

  const upvoteComplaint = (id: string) => {
    setComplaints(prev =>
      prev.map(c => {
        if (c.id !== id) return c;
        const newCount = (c.upvotes || 0) + 1;
        updateCentralComplaint(id, { upvotes: newCount });
        return { ...c, upvotes: newCount };
      })
    );
  };

  const resetToDemoData = async () => {
    await resetCentralData();
    setComplaints(INITIAL_COMPLAINTS);
    setHotspots(INITIAL_HOTSPOTS);
    localStorage.removeItem('sarvaya_complaints');
    localStorage.removeItem('sarvaya_hotspots');
  };

  return (
    <CivicContext.Provider
      value={{
        complaints,
        hotspots,
        currentView,
        selectedComplaint,
        draftComplaint,
        isEmergencyModalOpen,
        activeFilter,
        language,
        isServerConnected,
        isOnline,
        offlineQueueCount,
        newComplaintsCount,
        userRole,
        setUserRole,
        isSyncing,
        syncWithServer: syncWithCentralDB,
        syncWithCentralDB,
        syncOfflineQueue,
        setLanguage,
        setCurrentView,
        setSelectedComplaint,
        setDraftComplaint,
        setIsEmergencyModalOpen,
        setActiveFilter,
        saveDraft,
        deleteDraft,
        submitCivicReport,
        updateComplaintStatus,
        escalateComplaint,
        verifyComplaint,
        reopenComplaint,
        upvoteComplaint,
        resetToDemoData,
      }}
    >
      {children}
    </CivicContext.Provider>
  );
};

export const useCivic = () => {
  const context = useContext(CivicContext);
  if (!context) {
    throw new Error('useCivic must be used within a CivicProvider');
  }
  return context;
};
