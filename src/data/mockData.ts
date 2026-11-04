import { CivicComplaint, CivicHotspot } from '../types';

export const INITIAL_HOTSPOTS: CivicHotspot[] = [
  {
    id: 'HOTSPOT-VZM-01',
    name: 'MG Road - RTC Complex Drainage Hotspot',
    locality: 'MG Road, Near RTC Complex to Mayuri Junction',
    city: 'Vizianagaram',
    possibleIssue: 'Storm Drainage Blockage & Waterlogging',
    possibleRootCause: 'Possible Root Cause: Severe silt accumulation in primary roadside storm drain combined with choked culvert inlet near RTC Complex.',
    relatedReportIds: ['SRV-2026-1042', 'SRV-2026-1050', 'SRV-2026-1054', 'SRV-2026-1057'],
    priority: 'HIGH',
    department: 'Drainage & Sanitation (Municipal Corporation of Vizianagaram)',
    status: 'In Progress',
    coordinates: { lat: 18.1158, lng: 83.3986 },
    radiusMeters: 260,
    detectedAt: '2026-09-30 08:30 AM',
    notes: 'SARVAYA identified 4 correlated citizen reports within 250m reporting stagnant water, blocked drains, bad odor, and mosquito accumulation within 48 hours.',
  },
  {
    id: 'HOTSPOT-VZM-02',
    name: 'Cantonment Road Pedestrian Hazard Zone',
    locality: 'Cantonment Main Road, Near Govt College & Collectorate Turn',
    city: 'Vizianagaram',
    possibleIssue: 'Road Deterioration & Damaged Streetlighting',
    possibleRootCause: 'Possible Root Cause: Water stagnation weakening bitumen sub-base combined with damaged roadside cable conduit.',
    relatedReportIds: ['SRV-2026-1015', 'SRV-2026-1038'],
    priority: 'HIGH',
    department: 'Roads & Infrastructure (Municipal Corporation of Vizianagaram)',
    status: 'Under Escalation Review',
    coordinates: { lat: 18.1224, lng: 83.4042 },
    radiusMeters: 300,
    detectedAt: '2026-09-28 04:15 PM',
    notes: 'Multiple complaints reporting deep potholes and broken street lamp poles near student commute junction.',
  },
];

export const INITIAL_COMPLAINTS: CivicComplaint[] = [
  {
    id: 'SRV-2026-1042',
    title: 'Waterlogging and bad smell',
    description: 'Water has been standing near our street for 4 days and there is a foul smell. Stagnant water is blocking pedestrians near the shops and mosquitoes are breeding.',
    // Realistic ordinary smartphone photo of Indian street with localized stagnant water/drain
    photoUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb186f5f8?auto=format&fit=crop&w=800&q=80',
    audioNote: {
      duration: '0:22',
      transcript: 'The water is standing outside the shops near RTC complex corner. People cannot cross and mosquitoes are increasing.'
    },
    category: 'Drainage',
    specificProblem: 'Waterlogging and bad smell',
    impact: 'Pedestrian obstruction, foul smell, and public health concern',
    location: {
      address: 'MG Road, Near RTC Complex',
      landmark: 'Near Bus Stand & Pharmacy',
      ward: 'Ward 14 (Central Zone)',
      city: 'Vizianagaram',
      lat: 18.1158,
      lng: 83.3986
    },
    isDraft: false,
    capturedAt: '2026-09-30 08:15 AM',
    reportedAt: '2026-09-30 08:30 AM',
    priority: 'HIGH',
    smartPriority: {
      priority: 'HIGH',
      safetyRisk: 'Medium',
      safetyRiskDetails: 'Algae growth and slippery road shoulder hazard for pedestrians',
      peopleAffected: 'High',
      peopleAffectedDetails: 'High (> 2,500 daily commuters and shopkeepers near RTC Complex)',
      duration: '4 days',
      durationLevel: 'High',
      publicHealthImpact: 'High',
      publicHealthImpactDetails: 'High: Stagnant sewage breeding mosquitoes (dengue risk) & foul odor',
      relatedComplaints: 4,
      recurrenceLevel: 'High',
      locationSensitivity: 'High',
      locationSensitivityDetails: 'High: Major civic transit zone (RTC Bus Stand & Market Road)',
      aiRecommendation: 'High priority because public-health hazards (stagnant water & disease vectors) combined with 4-day duration and recurrence require immediate field intervention.',
      score: 85,
      determinationPrinciple: 'Priority is dynamically evaluated based on potential civic impact, public safety risk, and urgency — NOT simply by the chronological order in which complaints were submitted.'
    },
    priorityFactors: {
      severity: 'Stagnant water impeding pedestrian movement',
      safetyRisk: 'Medium',
      peopleAffected: 'High (~2,000 daily commuters and shopkeepers)',
      duration: '4 days (High persistence)',
      recurrence: '4 related complaints clustered in locality',
      publicHealthImpact: 'High: Odor & mosquito vector risk',
      safetyImpact: 'Slippery algae on road edge',
      relatedComplaintsCount: 4,
      locationSensitivity: 'High',
      locationSensitivityDetails: 'Near RTC Bus Complex and commercial shops',
      aiRecommendation: 'High priority because public-health hazards (stagnant water & disease vectors) combined with 4-day duration and recurrence require immediate field intervention.',
      scoreBreakdown: [
        { factor: 'Safety Risk', rating: 'Medium', notes: 'Algae slippery hazard' },
        { factor: 'People Affected', rating: 'High', notes: 'High commuter volume near RTC Complex' },
        { factor: 'Duration', rating: 'High', notes: '4 days continuous stagnation' },
        { factor: 'Public Health Impact', rating: 'High', notes: 'Stagnant water breeding mosquitoes for 4 days' },
        { factor: 'Related Complaints', rating: 'High', notes: '4 related complaints clustered in hotspot' },
        { factor: 'Location Sensitivity', rating: 'High', notes: 'Transit artery near bus stand' }
      ]
    },
    hotspotId: 'HOTSPOT-VZM-01',
    hotspotName: 'MG Road - RTC Complex Drainage Hotspot',
    possibleRootCause: 'Possible Root Cause: Silt accumulation in primary storm drain combined with choked culvert inlet near RTC Complex.',
    department: 'Drainage / Sanitation',
    officerName: 'Er. K. V. Ramanamurthy (AEE)',
    officerContact: '+91 94401 23456 (AEE - Vizianagaram Municipal Corp)',
    slaDays: 2,
    targetResolutionDate: '2026-10-02 08:30 AM',
    status: 'In Progress',
    upvotes: 24,
    timelineEvents: [
      {
        id: 'evt-1',
        step: 'Reported',
        title: 'Report Submitted by Citizen',
        timestamp: '2026-09-30 08:30 AM',
        actor: 'Citizen (Rahul M.)',
        notes: 'Photo and GPS geotag recorded near RTC Complex, Vizianagaram.',
        state: 'completed'
      },
      {
        id: 'evt-2',
        step: 'AI Analysis',
        title: 'IssueSense & Priority Analysis',
        timestamp: '2026-09-30 08:31 AM',
        actor: 'SARVAYA Civic Intelligence',
        notes: 'Classified: Drainage. Problem: Waterlogging and bad smell. SmartPriority: HIGH (4-day duration + public health concern).',
        state: 'completed'
      },
      {
        id: 'evt-3',
        step: 'CivicHotspot',
        title: 'CivicHotspot Detected',
        timestamp: '2026-09-30 08:32 AM',
        actor: 'SARVAYA CivicHotspot',
        notes: 'Correlated with 3 other reports in MG Road area. Possible Root Cause: Roadside drain silt blockage.',
        state: 'completed'
      },
      {
        id: 'evt-4',
        step: 'Assigned',
        title: 'Assigned to Municipal Drainage Wing',
        timestamp: '2026-09-30 08:35 AM',
        actor: 'SmartRoute',
        notes: 'Routed to Er. K. V. Ramanamurthy (AEE). Standard SLA: 48 Hours.',
        state: 'completed'
      },
      {
        id: 'evt-5',
        step: 'In Progress',
        title: 'Sanitation Crew Dispatched for Desilting',
        timestamp: '2026-10-01 11:20 AM',
        actor: 'Er. K. V. Ramanamurthy (AEE)',
        notes: 'Field worker crew clearing silt from covered drain culvert.',
        state: 'current'
      },
      {
        id: 'evt-6',
        step: 'Citizen Verification',
        title: 'Pending Citizen Verification (CitizenVerify)',
        timestamp: 'Awaiting field completion',
        actor: 'Citizen Verification',
        notes: 'When officer marks resolved, citizen Rahul M. will confirm: YES to close, NO to reopen.',
        state: 'pending'
      }
    ]
  },
  {
    id: 'SRV-2026-1015',
    title: 'Pothole on College Road',
    description: 'Large deep pothole on the asphalt road in front of Govt Degree College. Motorcyclists losing balance at night.',
    photoUrl: 'https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?auto=format&fit=crop&w=800&q=80',
    category: 'Road',
    specificProblem: 'Dangerous Road Pothole',
    impact: 'Accident risk for two-wheelers and auto-rickshaws',
    location: {
      address: 'College Road, Cantonment Area',
      landmark: 'Near Govt Degree College Gate',
      ward: 'Ward 8 (West Zone)',
      city: 'Vizianagaram',
      lat: 18.1224,
      lng: 83.4042
    },
    isDraft: false,
    capturedAt: '2026-09-27 10:00 AM',
    reportedAt: '2026-09-27 10:15 AM',
    priority: 'HIGH',
    smartPriority: {
      priority: 'HIGH',
      safetyRisk: 'High',
      safetyRiskDetails: 'High: Deep crater pothole causing bike skids & vehicular collisions',
      peopleAffected: 'High',
      peopleAffectedDetails: 'High (~3,500 students, auto-rickshaws, and daily bus commuters)',
      duration: '6 days',
      durationLevel: 'High',
      publicHealthImpact: 'Low',
      publicHealthImpactDetails: 'Low: Negligible public-health or sanitation risk',
      relatedComplaints: 3,
      recurrenceLevel: 'High',
      locationSensitivity: 'High',
      locationSensitivityDetails: 'High: Major arterial educational corridor (Govt Degree College Gate)',
      aiRecommendation: 'High priority because this issue creates a significant public safety risk and affects multiple people.',
      score: 90,
      determinationPrinciple: 'Priority is dynamically evaluated based on potential civic impact, public safety risk, and urgency — NOT simply by the chronological order in which complaints were submitted.'
    },
    priorityFactors: {
      severity: 'Physical crater hazard on active bus lane',
      safetyRisk: 'High',
      peopleAffected: 'High (~3,500 students and daily vehicles)',
      duration: '6 days (High persistence)',
      recurrence: '3 related reports in Cantonment corridor',
      publicHealthImpact: 'Low',
      safetyImpact: 'High traffic accident hazard',
      relatedComplaintsCount: 3,
      locationSensitivity: 'High',
      locationSensitivityDetails: 'Govt Degree College entrance bus lane',
      aiRecommendation: 'High priority because this issue creates a significant public safety risk and affects multiple people.',
      scoreBreakdown: [
        { factor: 'Safety Risk', rating: 'High', notes: 'Crater pothole causing 2-wheeler skids' },
        { factor: 'People Affected', rating: 'High', notes: '3,500 students & commuters daily' },
        { factor: 'Duration', rating: 'High', notes: '6 days continuous without patch repair' },
        { factor: 'Public Health Impact', rating: 'Low', notes: 'No bio/sanitation hazard' },
        { factor: 'Related Complaints', rating: 'High', notes: '3 clustered reports along road stretch' },
        { factor: 'Location Sensitivity', rating: 'High', notes: 'Educational zone & arterial road' }
      ]
    },
    hotspotId: 'HOTSPOT-VZM-02',
    hotspotName: 'Cantonment Road Pedestrian Hazard Zone',
    possibleRootCause: 'Possible Root Cause: Water stagnation weakening bitumen sub-base under heavy bus traffic.',
    department: 'Roads & Infrastructure',
    officerName: 'Asst. Eng. P. Satyanarayana',
    officerContact: '+91 94401 56789 (Ward 8 Roads)',
    slaDays: 2,
    targetResolutionDate: '2026-09-29 10:15 AM',
    status: 'Escalated',
    upvotes: 38,
    timelineEvents: [
      {
        id: 'evt-p1',
        step: 'Reported',
        title: 'Report Submitted',
        timestamp: '2026-09-27 10:15 AM',
        actor: 'Citizen (Priya S.)',
        state: 'completed'
      },
      {
        id: 'evt-p2',
        step: 'Assigned',
        title: 'Assigned to Ward Roads Division',
        timestamp: '2026-09-27 10:25 AM',
        actor: 'SmartRoute',
        notes: 'SLA target: 48 Hours.',
        state: 'completed'
      },
      {
        id: 'evt-p3',
        step: 'In Progress',
        title: 'Inspected by Ward Junior Engineer',
        timestamp: '2026-09-28 02:00 PM',
        actor: 'Asst. Eng. P. Satyanarayana',
        state: 'completed'
      },
      {
        id: 'evt-p4',
        step: 'Overdue',
        title: 'SLA Breached — Status OVERDUE',
        timestamp: '2026-09-29 10:16 AM',
        actor: 'SARVAYA SLA Monitor',
        notes: '48-hour resolution window passed without patch completion.',
        state: 'overdue'
      },
      {
        id: 'evt-p5',
        step: 'Escalated',
        title: 'Escalated to Higher Authority Review',
        timestamp: '2026-09-29 11:00 AM',
        actor: 'SARVAYA Escalation System',
        notes: 'Alert forwarded to Municipal Commissioner & Grievance Cell.',
        state: 'escalated'
      },
      {
        id: 'evt-p6',
        step: 'Higher Authority Review',
        title: 'Executive Directive Issued',
        timestamp: '2026-09-30 03:00 PM',
        actor: 'Dr. M. S. Rao (Municipal Commissioner, Vizianagaram)',
        notes: 'Directive #DIR-VZM-301: Immediate cold-mix bitumen patching mandated within 18 hours.',
        state: 'current'
      }
    ],
    escalation: {
      isEscalated: true,
      escalationDate: '2026-09-29 11:00 AM',
      overdueDuration: 'Overdue by 3 days',
      originalOfficer: 'Asst. Eng. P. Satyanarayana',
      assignedDepartment: 'Roads & Infrastructure',
      deadlineSLA: '48 Hours (Expired 2026-09-29 10:15 AM)',
      reason: 'Critical road crater near college exceeded standard 48-hour resolution deadline.',
      higherAuthorityName: 'Dr. M. S. Rao',
      higherAuthorityDesignation: 'Municipal Commissioner, Vizianagaram',
      directiveIssued: 'Emergency Cold-Mix Bitumen Patching Mandated within 18 hours. Show-cause notice to maintenance contractor.',
      actionHistory: [
        {
          date: '2026-09-29 11:00 AM',
          action: 'Automated Tier-2 Escalation Alert',
          actor: 'SARVAYA System',
          notes: 'Flagged overdue to Commissioner dashboard.'
        },
        {
          date: '2026-09-30 03:00 PM',
          action: 'Higher Authority Directive Issued',
          actor: 'Dr. M. S. Rao (Commissioner)',
          notes: 'Issued directive to execute emergency patch repair.'
        }
      ]
    }
  },
  {
    id: 'SRV-2026-1038',
    title: 'Street Light Not Working',
    description: 'Street light pole non-functional for 3 consecutive nights. Complete dark stretch near residential colony entrance.',
    photoUrl: 'https://images.unsplash.com/photo-1509114397022-ed747cca3f65?auto=format&fit=crop&w=800&q=80',
    category: 'Streetlight',
    specificProblem: 'Non-Functional Streetlight',
    impact: 'Nighttime safety concern and pedestrian vulnerability',
    location: {
      address: 'Balaji Nagar Main Road, Pole #B-12',
      landmark: 'Near Gandhi Statue Corner',
      ward: 'Ward 5',
      city: 'Vizianagaram',
      lat: 18.1189,
      lng: 83.4110
    },
    isDraft: false,
    capturedAt: '2026-09-29 07:45 PM',
    reportedAt: '2026-09-29 08:00 PM',
    priority: 'MEDIUM',
    smartPriority: {
      priority: 'MEDIUM',
      safetyRisk: 'Medium',
      safetyRiskDetails: 'Elevated nighttime pedestrian and commuter caution required due to dark stretch',
      peopleAffected: 'Medium',
      peopleAffectedDetails: 'Moderate colony scale (~400 evening residents)',
      duration: '3 days',
      durationLevel: 'Medium',
      publicHealthImpact: 'Low',
      publicHealthImpactDetails: 'Negligible public-health or sanitation risk',
      relatedComplaints: 1,
      recurrenceLevel: 'Low',
      locationSensitivity: 'Medium',
      locationSensitivityDetails: 'Residential municipal colony corridor (Balaji Nagar)',
      aiRecommendation: 'Medium priority because this issue causes nighttime visibility concern for residents with standard municipal SLA response required, unless multiple related reports or a sensitive location increase its priority.',
      score: 48,
      determinationPrinciple: 'Priority is dynamically evaluated based on potential civic impact, public safety risk, and urgency — NOT simply by the chronological order in which complaints were submitted.'
    },
    priorityFactors: {
      severity: 'Unlit stretch of 40 meters',
      safetyRisk: 'Medium',
      safetyRiskDetails: 'Nighttime pedestrian trip/fall hazard',
      peopleAffected: 'Moderate (~400 evening residents)',
      duration: '3 days',
      recurrence: 'First occurrence (1 isolated report)',
      publicHealthImpact: 'Low',
      safetyImpact: 'Night pedestrian fall risk',
      relatedComplaintsCount: 1,
      locationSensitivity: 'Medium',
      locationSensitivityDetails: 'Balaji Nagar residential entry road',
      aiRecommendation: 'Medium priority because this issue causes nighttime visibility concern for residents with standard municipal SLA response required, unless multiple related reports or a sensitive location increase its priority.',
      scoreBreakdown: [
        { factor: 'Safety Risk', rating: 'Medium', notes: 'Unlit 40m street stretch' },
        { factor: 'People Affected', rating: 'Medium', notes: '~400 colony residents daily' },
        { factor: 'Duration', rating: 'Medium', notes: '3 days non-functional' },
        { factor: 'Public Health Impact', rating: 'Low', notes: 'Zero sanitary risk' },
        { factor: 'Related Complaints', rating: 'Low', notes: 'Single isolated report' },
        { factor: 'Location Sensitivity', rating: 'Medium', notes: 'Colony access lane' }
      ]
    },
    department: 'Electrical & Street Lighting',
    officerName: 'K. Sundaram (Lighting Inspector)',
    officerContact: '+91 94401 88990',
    slaDays: 1,
    targetResolutionDate: '2026-10-03 08:00 PM',
    status: 'Assigned',
    upvotes: 11,
    timelineEvents: [
      {
        id: 'evt-s1',
        step: 'Reported',
        title: 'Report Submitted',
        timestamp: '2026-09-29 08:00 PM',
        actor: 'Citizen (Deepak T.)',
        state: 'completed'
      },
      {
        id: 'evt-s2',
        step: 'Assigned',
        title: 'Assigned to Electrical Wing',
        timestamp: '2026-09-29 08:15 PM',
        actor: 'SmartRoute',
        notes: 'LED luminaire driver unit replacement scheduled.',
        state: 'completed'
      },
      {
        id: 'evt-s3',
        step: 'In Progress',
        title: 'Technician Dispatched for Bulb Replacement',
        timestamp: '2026-10-02 09:30 AM',
        actor: 'K. Sundaram',
        state: 'current'
      }
    ]
  },
  {
    id: 'SRV-2026-1022',
    title: 'Drinking Water Pipeline Burst',
    description: 'Fresh municipal drinking water gushing heavily from underground distribution line on Fort Road.',
    photoUrl: 'https://images.unsplash.com/photo-1584467735815-f778f274e296?auto=format&fit=crop&w=800&q=80',
    category: 'Water Supply',
    specificProblem: 'Distribution Pipeline Burst',
    impact: 'Potable water wastage and reduced water pressure for 800 houses',
    location: {
      address: 'Fort Road, Near Town Hall',
      landmark: 'Near Historic Fort Gate',
      ward: 'Ward 2',
      city: 'Vizianagaram',
      lat: 18.1130,
      lng: 83.4165
    },
    isDraft: false,
    capturedAt: '2026-09-28 09:00 AM',
    reportedAt: '2026-09-28 09:15 AM',
    priority: 'HIGH',
    smartPriority: {
      priority: 'HIGH',
      safetyRisk: 'High',
      safetyRiskDetails: 'High: Continuous water flow eroding road sub-base under vehicular traffic',
      peopleAffected: 'High',
      peopleAffectedDetails: 'High (~800 households facing drinking water disruption)',
      duration: '12 hours',
      durationLevel: 'Low',
      publicHealthImpact: 'Medium',
      publicHealthImpactDetails: 'Treated drinking water loss and low tap pressure across Ward 2',
      relatedComplaints: 2,
      recurrenceLevel: 'Medium',
      locationSensitivity: 'High',
      locationSensitivityDetails: 'High: Fort Road historic public arterial transit road',
      aiRecommendation: 'High priority because continuous loss of treated drinking water impacts over 800 households and risks road sub-base collapse.',
      score: 78,
      determinationPrinciple: 'Priority is dynamically evaluated based on potential civic impact, public safety risk, and urgency — NOT simply by the chronological order in which complaints were submitted.'
    },
    priorityFactors: {
      severity: 'Continuous loss of treated potable drinking water',
      safetyRisk: 'High',
      safetyRiskDetails: 'Roadway erosion hazard',
      peopleAffected: 'High (~800 households)',
      duration: '12 hours',
      recurrence: 'Aging pipeline collar (2 complaints)',
      publicHealthImpact: 'Medium',
      safetyImpact: 'Erosion of pavement',
      relatedComplaintsCount: 2,
      locationSensitivity: 'High',
      locationSensitivityDetails: 'Fort Road near Town Hall',
      aiRecommendation: 'High priority because continuous loss of treated drinking water impacts over 800 households and risks road sub-base collapse.',
      scoreBreakdown: [
        { factor: 'Safety Risk', rating: 'High', notes: 'Roadbed erosion hazard' },
        { factor: 'People Affected', rating: 'High', notes: '800 households water supply cut' },
        { factor: 'Duration', rating: 'Low', notes: '12 hours active' },
        { factor: 'Public Health Impact', rating: 'Medium', notes: 'Potable water contamination risk' },
        { factor: 'Related Complaints', rating: 'Medium', notes: '2 related calls logged' },
        { factor: 'Location Sensitivity', rating: 'High', notes: 'Fort Road arterial public corridor' }
      ]
    },
    department: 'Water Supply & Sewerage',
    officerName: 'Er. V. Appalaraju (AE - Water Works)',
    officerContact: '+91 94401 33445',
    slaDays: 1,
    targetResolutionDate: '2026-09-29 09:15 AM',
    status: 'Resolved',
    upvotes: 29,
    citizenVerification: {
      status: 'pending_verification',
      citizenName: 'Kavita Rao',
      feedbackNotes: undefined
    },
    timelineEvents: [
      {
        id: 'evt-w1',
        step: 'Reported',
        title: 'Report Submitted',
        timestamp: '2026-09-28 09:15 AM',
        actor: 'Citizen (Kavita Rao)',
        state: 'completed'
      },
      {
        id: 'evt-w2',
        step: 'Assigned',
        title: 'Assigned to Water Works Quick Response',
        timestamp: '2026-09-28 09:20 AM',
        actor: 'SmartRoute',
        state: 'completed'
      },
      {
        id: 'evt-w3',
        step: 'In Progress',
        title: 'Main Isolation Valve Closed & Collar Welded',
        timestamp: '2026-09-28 02:40 PM',
        actor: 'Er. V. Appalaraju',
        notes: 'Burst section excavated and mechanical collar coupling installed.',
        state: 'completed'
      },
      {
        id: 'evt-w4',
        step: 'Resolved',
        title: 'Authority Marked as RESOLVED',
        timestamp: '2026-09-28 05:30 PM',
        actor: 'Water Supply Division',
        notes: 'Water pressure restored. Authority marked issue as resolved.',
        state: 'completed'
      },
      {
        id: 'evt-w5',
        step: 'Citizen Verification',
        title: 'Pending Citizen Verification (CitizenVerify)',
        timestamp: 'Awaiting Citizen Response',
        actor: 'Citizen Kavita Rao',
        notes: 'SARVAYA will NOT auto-close until citizen verifies: YES or NO.',
        state: 'current'
      }
    ]
  },
  {
    id: 'SRV-2026-0988',
    title: 'Damaged and Open Drain Cover',
    description: 'Concrete drain slab broken and left open near primary school. Citizen reopened complaint after temporary branch placement.',
    photoUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?auto=format&fit=crop&w=800&q=80',
    category: 'Public Safety',
    specificProblem: 'Broken Open Drain Cover',
    impact: 'Fall hazard for school children and pedestrians',
    location: {
      address: 'Bazaar Street, Near Municipal School',
      landmark: 'Near Govt School Compound',
      ward: 'Ward 10',
      city: 'Vizianagaram',
      lat: 18.1145,
      lng: 83.4020
    },
    isDraft: false,
    capturedAt: '2026-09-25 04:00 PM',
    reportedAt: '2026-09-25 04:20 PM',
    priority: 'HIGH',
    smartPriority: {
      priority: 'HIGH',
      safetyRisk: 'High',
      safetyRiskDetails: 'High: Open broken concrete slab directly on student walkway causing critical fall hazard',
      peopleAffected: 'High',
      peopleAffectedDetails: 'High (~500 municipal school students and pedestrian parents daily)',
      duration: '5 days',
      durationLevel: 'High',
      publicHealthImpact: 'Medium',
      publicHealthImpactDetails: 'Exposed drain sewer odors and open sewage trench near school entrance',
      relatedComplaints: 2,
      recurrenceLevel: 'Medium',
      locationSensitivity: 'High',
      locationSensitivityDetails: 'High: Sensitive student pedestrian zone (Govt Primary School Compound)',
      aiRecommendation: 'High priority because an open drain near a school creates an imminent life-safety fall risk for children and pedestrians.',
      score: 92,
      determinationPrinciple: 'Priority is dynamically evaluated based on potential civic impact, public safety risk, and urgency — NOT simply by the chronological order in which complaints were submitted.'
    },
    priorityFactors: {
      severity: 'Physical fall risk directly outside school',
      safetyRisk: 'High',
      safetyRiskDetails: 'Direct child injury hazard',
      peopleAffected: 'High (~500 students)',
      duration: '5 days (High persistence)',
      recurrence: 'Damaged by commercial delivery tempo (2 complaints)',
      publicHealthImpact: 'Medium',
      safetyImpact: 'Severe child fall hazard',
      relatedComplaintsCount: 2,
      locationSensitivity: 'High',
      locationSensitivityDetails: 'Bazaar Street near Municipal Primary School',
      aiRecommendation: 'High priority because an open drain near a school creates an imminent life-safety fall risk for children and pedestrians.',
      scoreBreakdown: [
        { factor: 'Safety Risk', rating: 'High', notes: 'Uncovered sewer trench fall hazard' },
        { factor: 'People Affected', rating: 'High', notes: '500+ schoolchildren & parents daily' },
        { factor: 'Duration', rating: 'High', notes: '5 days continuous' },
        { factor: 'Public Health Impact', rating: 'Medium', notes: 'Exposed gutter smell and flies' },
        { factor: 'Related Complaints', rating: 'Medium', notes: '2 resident escalations' },
        { factor: 'Location Sensitivity', rating: 'High', notes: 'School compound entrance gate' }
      ]
    },
    department: 'Drainage & Sanitation',
    officerName: 'T. R. Murthy (Supervisor)',
    officerContact: '+91 94401 77665',
    slaDays: 1,
    targetResolutionDate: '2026-09-26 04:20 PM',
    status: 'Reopened',
    upvotes: 45,
    citizenVerification: {
      status: 'reopened',
      citizenName: 'Amit Saxena',
      verifiedAt: '2026-09-27 11:30 AM',
      feedbackNotes: 'Department marked resolved but worker only placed a wooden branch. No proper concrete slab installed. Reopening complaint.',
      reopenReason: 'Cosmetic fix only; physical fall hazard still exists on-ground.'
    },
    timelineEvents: [
      {
        id: 'evt-m1',
        step: 'Reported',
        title: 'Report Submitted',
        timestamp: '2026-09-25 04:20 PM',
        actor: 'Citizen (Amit Saxena)',
        state: 'completed'
      },
      {
        id: 'evt-m2',
        step: 'Resolved',
        title: 'Department Marked Resolved (Premature)',
        timestamp: '2026-09-27 10:00 AM',
        actor: 'T. R. Murthy (AE)',
        notes: 'Department flagged as covered.',
        state: 'completed'
      },
      {
        id: 'evt-m3',
        step: 'Citizen Verification',
        title: 'Citizen Verification: REOPENED by Citizen',
        timestamp: '2026-09-27 11:30 AM',
        actor: 'Citizen Amit Saxena',
        notes: 'Citizen inspected location and flagged that problem is NOT resolved. Reopened under priority audit.',
        state: 'overdue'
      },
      {
        id: 'evt-m4',
        step: 'In Progress',
        title: 'Reinforced Concrete Slab Dispatched',
        timestamp: '2026-10-01 10:00 AM',
        actor: 'Chief Engineer Works',
        notes: 'RCC precast cover sent for installation.',
        state: 'current'
      }
    ]
  },
  // Saved Draft demonstrating "Capture Now, Submit Later"
  {
    id: 'SRV-DRAFT-2026-08',
    title: 'Captured Photo & Location — Pending Citizen Description',
    description: 'Captured on-the-go while traveling. Photo and GPS coordinates saved at 08:42 AM. Tap to complete description and submit.',
    photoUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb186f5f8?auto=format&fit=crop&w=800&q=80',
    category: 'Drainage',
    specificProblem: 'Roadside water accumulation',
    impact: 'Under assessment',
    location: {
      address: 'Station Road, Near Railway Overbridge',
      landmark: 'Near Auto Stand',
      ward: 'Ward 11',
      city: 'Vizianagaram',
      lat: 18.1105,
      lng: 83.4072
    },
    isDraft: true,
    capturedAt: '2026-10-02 08:42 AM',
    priority: 'LOW',
    smartPriority: {
      priority: 'LOW',
      safetyRisk: 'Low',
      safetyRiskDetails: 'Pending field description; minor roadside moisture accumulation',
      peopleAffected: 'Low',
      peopleAffectedDetails: 'Local station perimeter commuters',
      duration: '1 day',
      durationLevel: 'Low',
      publicHealthImpact: 'Low',
      publicHealthImpactDetails: 'Pending detailed inspection report',
      relatedComplaints: 1,
      recurrenceLevel: 'Low',
      locationSensitivity: 'Medium',
      locationSensitivityDetails: 'Station Road near Railway Overbridge',
      aiRecommendation: 'Low priority pending citizen full description and detailed field verification.',
      score: 25,
      determinationPrinciple: 'Priority is dynamically evaluated based on potential civic impact, public safety risk, and urgency — NOT simply by the chronological order in which complaints were submitted.'
    },
    priorityFactors: {
      severity: 'Draft capture pending submission',
      peopleAffected: 'Local commuters',
      duration: 'Recent',
      recurrence: 'Not evaluated',
      publicHealthImpact: 'Low',
      safetyImpact: 'Low'
    },
    department: 'Pending Submission',
    officerName: 'Pending Assignment',
    officerContact: '—',
    slaDays: 2,
    targetResolutionDate: '—',
    status: 'Draft',
    timelineEvents: [
      {
        id: 'evt-d1',
        step: 'Reported',
        title: 'Captured Now (Draft Saved)',
        timestamp: '2026-10-02 08:42 AM',
        actor: 'Citizen (You)',
        notes: 'Photo and GPS saved on-the-spot. Ready to finalize description and submit.',
        state: 'completed'
      }
    ]
  }
];
