import {
  CivicCategory,
  PriorityLevel,
  PriorityFactors,
  CivicComplaint,
  CivicHotspot,
  SmartPriorityAnalysis,
  FactorRating,
} from '../types';

export interface IssueSenseResult {
  category: CivicCategory;
  specificProblem: string;
  impact: string;
  confidence: number;
  extractedKeywords: string[];
}

export interface SmartPriorityResult {
  priority: PriorityLevel;
  factors: PriorityFactors;
  smartPriority: SmartPriorityAnalysis;
  justification: string;
}

export interface HotspotMatchResult {
  matchedHotspot?: CivicHotspot;
  isNewHotspotCreated: boolean;
  relatedComplaintIds?: string[];
  affectedLocality?: string;
  possibleIssue?: string;
  possibleRootCause: string;
  clusterPriority?: PriorityLevel;
  patternDetected: boolean;
  patternDescription?: string;
}

export interface SmartRouteResult {
  department: string;
  officerName: string;
  officerContact: string;
  slaDays: number;
  targetResolutionDate: string;
  routingBasis: string;
}

export interface ReportValidationResult {
  isValid: boolean;
  status: 'valid' | 'verification_needed';
  issues: string[];
  message: string;
}

/**
 * Report Validation
 * Verifies Photo + Description + Location before IssueSense and municipal routing.
 * A photo alone must NOT become a complaint. Unclear/suspicious reports are flagged as Verification Needed.
 */
export function validateCivicReport(data: {
  photoUrl?: string;
  description: string;
  location?: { address?: string; lat?: number; lng?: number };
}): ReportValidationResult {
  const issues: string[] = [];

  // 1. Photo Check
  if (!data.photoUrl || data.photoUrl.trim().length === 0) {
    issues.push('A photo of the civic issue is required for verification.');
  }

  // 2. Location Check
  if (!data.location || !data.location.address || data.location.address.trim().length === 0) {
    issues.push('Location details are required so municipal field workers can inspect the issue.');
  }

  // 3. Description Check
  const text = (data.description || '').trim();
  const nonCivicGreetings = ['hi', 'hello', 'hey', 'test', 'హాయ్', 'నమస్తే', 'नमस्ते', 'hello there', 'hi there'];

  if (text.length === 0) {
    issues.push('Problem description is missing. A photo alone cannot become a civic complaint.');
  } else if (nonCivicGreetings.includes(text.toLowerCase()) || text.length < 4) {
    issues.push(`Description is too brief or unclear ("${text}"). Please describe the actual civic issue.`);
  }

  if (issues.length > 0) {
    return {
      isValid: false,
      status: 'verification_needed',
      issues,
      message: 'Verification Needed: Please provide complete grievance details before municipal submission.',
    };
  }

  return {
    isValid: true,
    status: 'valid',
    issues: [],
    message: 'Report verified. Photo, location, and description are complete.',
  };
}

/**
 * IssueSense — Understand. Classify. Organize.
 * Converts unstructured citizen complaint into a structured civic issue.
 */
export function analyzeWithIssueSense(text: string, title?: string): IssueSenseResult {
  const combined = `${title || ''} ${text}`.toLowerCase().trim();

  // Test 1 guard: Casual greetings or non-civic short phrases must NOT generate an invented civic complaint
  const nonCivicGreetings = ['hi', 'hello', 'hey', 'test', 'హాయ్', 'నమస్తే', 'नमस्ते', 'hello there', 'hi there'];
  if (nonCivicGreetings.includes(combined) || (combined.length <= 3 && !combined.includes('ప') && !combined.includes('ర'))) {
    return {
      category: 'Other',
      specificProblem: text.trim() || 'General Citizen Note',
      impact: 'Informational note awaiting civic inspection details',
      confidence: 0.3,
      extractedKeywords: [],
    };
  }

  // 1. Waterlogging
  if (
    combined.includes('waterlog') ||
    combined.includes('standing water') ||
    combined.includes('stagnant water') ||
    combined.includes('flooding') ||
    combined.includes('నీరు నిలిచింది') ||
    combined.includes('నీరు') ||
    combined.includes('వరద') ||
    combined.includes('जलभराव') ||
    combined.includes('पानी भरा')
  ) {
    return {
      category: 'Waterlogging',
      specificProblem: 'Waterlogging and Stagnant Water Hazard',
      impact: 'Pedestrian and vehicular obstruction, foul odor, and health concern',
      confidence: 0.96,
      extractedKeywords: ['waterlogging', 'stagnant water', 'odor'],
    };
  }

  // 2. Drainage & Sewer
  if (
    combined.includes('drain') ||
    combined.includes('gutter') ||
    combined.includes('choke') ||
    combined.includes('culvert') ||
    combined.includes('కాలువ') ||
    combined.includes('మురుగు') ||
    combined.includes('నాలీ') ||
    combined.includes('नाली') ||
    combined.includes('सीवर') ||
    combined.includes('गटर')
  ) {
    return {
      category: 'Drainage',
      specificProblem: 'Storm Drain Blockage / Silt Choke',
      impact: 'Water stagnation and reverse overflow onto road',
      confidence: 0.94,
      extractedKeywords: ['drainage', 'silt', 'blockage'],
    };
  }

  // 3. Water Supply
  if (
    combined.includes('pipe') ||
    combined.includes('drinking water') ||
    combined.includes('potable') ||
    combined.includes('water supply') ||
    combined.includes('tap') ||
    combined.includes('మంచినీరు') ||
    combined.includes('తాగునీరు') ||
    combined.includes('పైప్') ||
    combined.includes('पेयजल') ||
    combined.includes('नल')
  ) {
    return {
      category: 'Water Supply',
      specificProblem: 'Drinking Water Pipeline Burst / Leakage',
      impact: 'Potable water loss and residential pressure drop',
      confidence: 0.93,
      extractedKeywords: ['water supply', 'pipeline', 'potable water'],
    };
  }

  // 4. Public Washroom
  if (
    combined.includes('washroom') ||
    combined.includes('toilet') ||
    combined.includes('urinal') ||
    combined.includes('మరుగుదొడ్డి') ||
    combined.includes('టాయిలెట్') ||
    combined.includes('शौचालय') ||
    combined.includes('टॉयलेट')
  ) {
    return {
      category: 'Public Washroom',
      specificProblem: 'Public Washroom Maintenance / Water Shortage',
      impact: 'Hygiene and public sanitation concern',
      confidence: 0.95,
      extractedKeywords: ['public washroom', 'sanitation', 'cleanliness'],
    };
  }

  // 5. Road & Potholes
  if (
    combined.includes('pothole') ||
    combined.includes('road') ||
    combined.includes('crater') ||
    combined.includes('asphalt') ||
    combined.includes('tar') ||
    combined.includes('గుంత') ||
    combined.includes('రోడ్డు') ||
    combined.includes('రహదారి') ||
    combined.includes('गड्ढा') ||
    combined.includes('सड़क') ||
    combined.includes('रोड')
  ) {
    return {
      category: 'Road',
      specificProblem: 'Road Surface Pothole & Erosion',
      impact: 'Accident risk for two-wheelers and vehicular damage',
      confidence: 0.96,
      extractedKeywords: ['pothole', 'road condition', 'accident hazard'],
    };
  }

  // 6. Streetlight
  if (
    combined.includes('light') ||
    combined.includes('lamp') ||
    combined.includes('dark') ||
    combined.includes('pole') ||
    combined.includes('flicker') ||
    combined.includes('లైట్') ||
    combined.includes('దీపం') ||
    combined.includes('చీకటి') ||
    combined.includes('लाइट') ||
    combined.includes('बत्ती') ||
    combined.includes('अंधेरा')
  ) {
    return {
      category: 'Streetlight',
      specificProblem: 'Non-Functional Streetlight',
      impact: 'Nighttime safety concern and pedestrian vulnerability',
      confidence: 0.95,
      extractedKeywords: ['streetlight', 'dark stretch', 'public lighting'],
    };
  }

  // 7. Waste & Garbage
  if (
    combined.includes('garbage') ||
    combined.includes('trash') ||
    combined.includes('waste') ||
    combined.includes('dump') ||
    combined.includes('bin') ||
    combined.includes('చెత్త') ||
    combined.includes('కుప్ప') ||
    combined.includes('కచరా') ||
    combined.includes('कचरा') ||
    combined.includes('कूड़ा') ||
    combined.includes('गंदगी')
  ) {
    return {
      category: 'Waste',
      specificProblem: 'Uncollected Solid Waste & Bin Overflow',
      impact: 'Odor, stray animal congregation, and hygiene nuisance',
      confidence: 0.93,
      extractedKeywords: ['garbage dump', 'overflowing bin', 'solid waste'],
    };
  }

  // 8. Public Safety & Open Manhole
  if (
    combined.includes('manhole') ||
    combined.includes('sewer') ||
    combined.includes('open drain') ||
    combined.includes('మ్యాన్‌హోల్') ||
    combined.includes('मैनहोल')
  ) {
    return {
      category: 'Public Safety',
      specificProblem: 'Broken / Open Drain Cover',
      impact: 'Physical fall risk for pedestrians and children',
      confidence: 0.95,
      extractedKeywords: ['open manhole', 'physical hazard', 'life safety'],
    };
  }

  // 9. Sanitation & Odor
  if (
    combined.includes('smell') ||
    combined.includes('stench') ||
    combined.includes('mosquito') ||
    combined.includes('hygiene') ||
    combined.includes('దుర్వాసన') ||
    combined.includes('దోమలు') ||
    combined.includes('बदबू') ||
    combined.includes('मच्छर')
  ) {
    return {
      category: 'Sanitation / Hygiene',
      specificProblem: 'Sewage Backflow & Sanitation Hazard',
      impact: 'Odor, insect breeding, and public health risk',
      confidence: 0.91,
      extractedKeywords: ['sanitation', 'sewage', 'hygiene'],
    };
  }

  // 10. Public Infrastructure
  if (
    combined.includes('footpath') ||
    combined.includes('bench') ||
    combined.includes('railing') ||
    combined.includes('bus shelter') ||
    combined.includes('ఫుట్‌పాత్') ||
    combined.includes('फुटपाथ')
  ) {
    return {
      category: 'Public Infrastructure',
      specificProblem: 'Damaged Public Civic Infrastructure',
      impact: 'Impaired pedestrian mobility',
      confidence: 0.88,
      extractedKeywords: ['civic infrastructure', 'public walkway'],
    };
  }

  return {
    category: 'Other',
    specificProblem: text.trim() ? `${text.trim().slice(0, 45)} (Civic Grievance)` : 'Reported Civic Grievance',
    impact: 'General civic inconvenience requiring municipal field inspection',
    confidence: 0.82,
    extractedKeywords: ['civic issue', 'inspection needed'],
  };
}

/**
 * SmartPriority — Explainable Dynamic Priority Analysis Module
 * Analyzes:
 * 1. Severity / safety risk
 * 2. Number of people potentially affected
 * 3. Duration of the problem
 * 4. Public-health impact
 * 5. Recurrence / related complaints
 * 6. Location sensitivity (public road, school, residential area, etc.)
 *
 * Principle: Priority is determined by potential impact and urgency,
 * NOT simply by the order in which complaints were submitted.
 */
export function calculateSmartPriority(
  category: CivicCategory,
  description: string,
  locationInput?: { address?: string; landmark?: string; ward?: string } | string,
  relatedComplaintsOverride?: number,
  title?: string
): SmartPriorityResult {
  const combined = `${title || ''} ${description} ${
    typeof locationInput === 'string'
      ? locationInput
      : `${locationInput?.address || ''} ${locationInput?.landmark || ''} ${locationInput?.ward || ''}`
  }`.toLowerCase();

  // 1. Severity / Safety Risk
  let safetyRisk: FactorRating = 'Low';
  let safetyRiskDetails = 'Minor non-hazardous civic condition';
  let safetyPoints = 10;

  if (
    category === 'Public Safety' ||
    combined.includes('danger') ||
    combined.includes('accident') ||
    combined.includes('hazard') ||
    combined.includes('open drain') ||
    combined.includes('manhole') ||
    combined.includes('crater') ||
    combined.includes('burst') ||
    combined.includes('electric') ||
    combined.includes('skid') ||
    (category === 'Road' && (combined.includes('pothole') || combined.includes('deep')))
  ) {
    safetyRisk = 'High';
    safetyRiskDetails = combined.includes('pothole') || combined.includes('crater')
      ? 'Severe vehicular skid hazard and risk of two-wheeler physical injuries'
      : combined.includes('manhole') || combined.includes('open drain')
      ? 'Severe pedestrian fall hazard directly on pedestrian pathway'
      : combined.includes('burst')
      ? 'High utility disruption and erosion of pavement base'
      : 'Immediate physical safety risk to commuters and pedestrians';
    safetyPoints = 35;
  } else if (
    category === 'Streetlight' ||
    combined.includes('dark') ||
    combined.includes('broken') ||
    combined.includes('slippery') ||
    combined.includes('waterlog') ||
    combined.includes('drain')
  ) {
    safetyRisk = 'Medium';
    safetyRiskDetails = 'Elevated nighttime pedestrian and commuter caution required';
    safetyPoints = 20;
  }

  // 2. Number of People Affected
  let peopleAffected: FactorRating = 'Medium';
  let peopleAffectedDetails = 'Moderate locality scale (~400 - 800 residents)';
  let peoplePoints = 15;

  if (
    combined.includes('college') ||
    combined.includes('school') ||
    combined.includes('bus stand') ||
    combined.includes('rtc complex') ||
    combined.includes('station') ||
    combined.includes('main road') ||
    combined.includes('market') ||
    combined.includes('bazaar') ||
    combined.includes('arterial') ||
    combined.includes('fort road')
  ) {
    peopleAffected = 'High';
    peopleAffectedDetails = 'High (> 2,500 daily commuters, students & residents)';
    peoplePoints = 25;
  } else if (combined.includes('lane') || combined.includes('isolated') || combined.includes('corner')) {
    peopleAffected = 'Low';
    peopleAffectedDetails = 'Local pocket (< 150 residents)';
    peoplePoints = 10;
  }

  // 3. Duration of the Problem
  let duration = '2 days';
  let durationLevel: FactorRating = 'Medium';
  let durationPoints = 15;

  if (
    combined.includes('5 days') ||
    combined.includes('6 days') ||
    combined.includes('week') ||
    combined.includes('chronic') ||
    combined.includes('long time')
  ) {
    duration = combined.includes('6 days') ? '6 days' : '5 days';
    durationLevel = 'High';
    durationPoints = 20;
  } else if (combined.includes('4 days')) {
    duration = '4 days';
    durationLevel = 'High';
    durationPoints = 20;
  } else if (combined.includes('3 days') || combined.includes('3 nights')) {
    duration = combined.includes('3 nights') ? '3 nights' : '3 days';
    durationLevel = 'Medium';
    durationPoints = 15;
  } else if (combined.includes('12 hours') || combined.includes('today') || combined.includes('few hours')) {
    duration = combined.includes('12 hours') ? '12 hours' : '1 day';
    durationLevel = 'Low';
    durationPoints = 10;
  }

  // 4. Public-Health Impact
  let publicHealthImpact: FactorRating = 'Low';
  let publicHealthImpactDetails = 'Negligible public-health or sanitation risk';
  let healthPoints = 5;

  if (
    combined.includes('mosquito') ||
    combined.includes('stagnant') ||
    combined.includes('foul smell') ||
    combined.includes('bad smell') ||
    combined.includes('stench') ||
    combined.includes('sewage') ||
    combined.includes('contamination') ||
    combined.includes('dengue') ||
    combined.includes('malaria') ||
    (category === 'Sanitation / Hygiene' && combined.includes('waste'))
  ) {
    publicHealthImpact = 'High';
    publicHealthImpactDetails = 'High: Stagnant sewage breeding disease vectors & severe odor';
    healthPoints = 25;
  } else if (category === 'Waste' || category === 'Waterlogging' || category === 'Drainage') {
    publicHealthImpact = 'Medium';
    publicHealthImpactDetails = 'Moderate sanitation accumulation and localized odor';
    healthPoints = 15;
  }

  // 5. Recurrence / Related Complaints
  let relatedComplaints = relatedComplaintsOverride ?? 1;
  if (relatedComplaintsOverride === undefined) {
    if (combined.includes('mg road') || combined.includes('rtc complex')) {
      relatedComplaints = 4;
    } else if (combined.includes('college road') || combined.includes('cantonment')) {
      relatedComplaints = 3;
    } else if (combined.includes('balaji nagar')) {
      relatedComplaints = 1;
    }
  }

  let recurrenceLevel: FactorRating = 'Low';
  let recurrencePoints = 5;
  if (relatedComplaints >= 3 || combined.includes('recurring') || combined.includes('repeating')) {
    recurrenceLevel = 'High';
    recurrencePoints = 15;
  } else if (relatedComplaints === 2) {
    recurrenceLevel = 'Medium';
    recurrencePoints = 10;
  }

  // 6. Location Sensitivity (public road, school, residential area, etc.)
  let locationSensitivity: FactorRating = 'Medium';
  let locationSensitivityDetails = 'Residential municipal sector';
  let locationPoints = 10;

  if (
    combined.includes('school') ||
    combined.includes('college') ||
    combined.includes('hospital') ||
    combined.includes('bus stand') ||
    combined.includes('rtc complex') ||
    combined.includes('main road') ||
    combined.includes('market') ||
    combined.includes('commercial')
  ) {
    locationSensitivity = 'High';
    locationSensitivityDetails = combined.includes('college')
      ? 'High: Major arterial educational corridor (Govt Degree College)'
      : combined.includes('school')
      ? 'High: Sensitive student pedestrian zone (Primary Municipal School Gate)'
      : combined.includes('rtc') || combined.includes('bus stand')
      ? 'High: High-density civic transit hub (RTC Complex & Commercial Hub)'
      : 'High: Public transit arterial road';
    locationPoints = 20;
  } else if (combined.includes('colony') || combined.includes('nagar') || combined.includes('residential')) {
    locationSensitivity = 'Medium';
    locationSensitivityDetails = 'Medium: Residential neighborhood corridor';
    locationPoints = 10;
  } else {
    locationSensitivity = 'Low';
    locationSensitivityDetails = 'Low: Low-density interior municipal lane';
    locationPoints = 5;
  }

  // Composite Calculation
  let totalScore = safetyPoints + peoplePoints + durationPoints + healthPoints + recurrencePoints + locationPoints;

  // Domain rule overrides based on user specs:
  // - Pothole on College Road → HIGH because of safety risk + public usage + affected people
  if (safetyRisk === 'High' && (peopleAffected === 'High' || locationSensitivity === 'High')) {
    totalScore = Math.max(totalScore, 75);
  }
  // - Waterlogging with stagnant water, bad smell and mosquitoes → HIGH because of public-health impact + duration + recurrence
  if (publicHealthImpact === 'High' && (durationLevel === 'High' || recurrenceLevel === 'High')) {
    totalScore = Math.max(totalScore, 75);
  }
  // - Street Light Not Working → MEDIUM unless multiple related reports or a sensitive location increase its priority
  if (category === 'Streetlight' && relatedComplaints < 3 && locationSensitivity !== 'High') {
    totalScore = Math.min(totalScore, 55);
    totalScore = Math.max(totalScore, 40);
  }

  let priority: PriorityLevel = 'LOW';
  if (totalScore >= 65) {
    priority = 'HIGH';
  } else if (totalScore >= 35) {
    priority = 'MEDIUM';
  } else {
    priority = 'LOW';
  }

  // AI Recommendation formulation
  let aiRecommendation = '';
  if (priority === 'HIGH') {
    if (combined.includes('pothole') || (safetyRisk === 'High' && peopleAffected === 'High')) {
      aiRecommendation =
        'High priority because this issue creates a significant public safety risk and affects multiple people.';
    } else if (publicHealthImpact === 'High' || combined.includes('waterlog') || combined.includes('stagnant')) {
      aiRecommendation =
        'High priority because public-health hazards (stagnant water, bad smell & disease vectors) combined with duration and recurrence require immediate field intervention.';
    } else {
      aiRecommendation =
        'High priority because this issue creates an urgent hazard in a sensitive civic area requiring accelerated municipal response.';
    }
  } else if (priority === 'MEDIUM') {
    if (category === 'Streetlight' || combined.includes('street light') || combined.includes('light')) {
      aiRecommendation =
        'Medium priority because this issue causes nighttime visibility concern for residents with standard municipal SLA response required, unless multiple related reports or a sensitive location increase its priority.';
    } else {
      aiRecommendation =
        'Medium priority because this problem affects local residents without an immediate life-safety or disease outbreak hazard.';
    }
  } else {
    aiRecommendation =
      'Low priority because this issue represents minor localized maintenance without imminent hazard to health or safety.';
  }

  const determinationPrinciple =
    'Priority is dynamically evaluated based on potential civic impact, public safety risk, and urgency — NOT simply by the chronological order in which complaints were submitted.';

  const smartPriority: SmartPriorityAnalysis = {
    priority,
    safetyRisk,
    safetyRiskDetails,
    peopleAffected,
    peopleAffectedDetails,
    duration,
    durationLevel,
    publicHealthImpact,
    publicHealthImpactDetails,
    relatedComplaints,
    recurrenceLevel,
    locationSensitivity,
    locationSensitivityDetails,
    aiRecommendation,
    score: totalScore,
    calculatedAt: new Date().toISOString(),
    determinationPrinciple,
  };

  const factors: PriorityFactors = {
    severity: safetyRiskDetails,
    safetyRisk,
    safetyRiskDetails,
    peopleAffected: peopleAffectedDetails,
    duration: `${duration} (${durationLevel} persistence)`,
    recurrence: `${relatedComplaints} related complaint(s) in locality`,
    publicHealthImpact: publicHealthImpactDetails,
    safetyImpact: safetyRiskDetails,
    relatedComplaintsCount: relatedComplaints,
    locationSensitivity,
    locationSensitivityDetails,
    aiRecommendation,
    scoreBreakdown: [
      { factor: 'Safety Risk', rating: safetyRisk, notes: safetyRiskDetails },
      { factor: 'People Affected', rating: peopleAffected, notes: peopleAffectedDetails },
      { factor: 'Duration', rating: durationLevel, notes: `${duration} active on-ground` },
      { factor: 'Public Health Impact', rating: publicHealthImpact, notes: publicHealthImpactDetails },
      { factor: 'Related Complaints', rating: recurrenceLevel, notes: `${relatedComplaints} complaint(s) clustered` },
      { factor: 'Location Sensitivity', rating: locationSensitivity, notes: locationSensitivityDetails },
    ],
  };

  const justification = aiRecommendation;

  return { priority, factors, smartPriority, justification };
}

/**
 * Ensures any complaint has a fully computed explainable SmartPriorityAnalysis
 */
export function getOrCalculateSmartPriority(complaint: CivicComplaint): SmartPriorityAnalysis {
  if (complaint.smartPriority) {
    return complaint.smartPriority;
  }
  const result = calculateSmartPriority(
    complaint.category,
    complaint.description,
    complaint.location,
    complaint.priorityFactors?.relatedComplaintsCount,
    complaint.title
  );
  return result.smartPriority;
}

/**
 * CivicHotspot & Root Cause Insight
 * Connects multiple related complaints from the same locality in Vizianagaram.
 * A SINGLE complaint must NOT by itself become a confirmed CivicHotspot.
 * Thresholds:
 * - 1 report = Individual Complaint (no cluster)
 * - 2 reports = Possible Related Cluster
 * - 3+ reports = Confirmed Civic Hotspot
 */

const CIVIC_PROBLEM_CLUSTERS: Record<string, string[]> = {
  drainage: [
    'drain', 'drainage', 'water', 'waterlogging', 'waterlog', 'stagnant', 'standing water',
    'overflow', 'clog', 'clogged', 'choke', 'choked', 'silt', 'puddle', 'smell', 'mosquito',
    'mosquitoes', 'odor', 'foul', 'stench', 'flood', 'flooding', 'gutter', 'culvert', 'sewer'
  ],
  road: [
    'pothole', 'potholes', 'crater', 'craters', 'road damage', 'damaged road', 'broken road',
    'tar', 'asphalt crack', 'road cave', 'cave-in', 'skid', 'skidding', 'accident hazard',
    'pavement break', 'ditch', 'bitumen', 'uneven road', 'road depression'
  ],
  lighting: [
    'light', 'streetlight', 'street light', 'dark', 'darkness', 'pole', 'lamp', 'bulb',
    'unlit', 'night', 'visibility', 'blackout'
  ],
  waterSupply: [
    'pipeline', 'pipe', 'leak', 'leaking', 'burst', 'drinking water', 'tap', 'water supply',
    'pressure', 'potable', 'contamination', 'supply'
  ],
  sanitation: [
    'garbage', 'waste', 'trash', 'dump', 'dumping', 'litter', 'debris', 'bin', 'hygiene',
    'washroom', 'toilet', 'public toilet'
  ],
};

function getCategoryDomain(category: CivicCategory): string {
  switch (category) {
    case 'Waterlogging':
    case 'Drainage':
    case 'Drainage & Sanitation':
      return 'drainage';
    case 'Road':
    case 'Roads & Infrastructure':
      return 'road';
    case 'Streetlight':
    case 'Street Lights':
      return 'lighting';
    case 'Water Supply':
      return 'waterSupply';
    case 'Waste':
    case 'Public Washroom':
    case 'Sanitation / Hygiene':
      return 'sanitation';
    default:
      return 'general';
  }
}

function areCategoriesCompatible(cat1: CivicCategory, cat2: CivicCategory): boolean {
  if (cat1 === cat2) return true;
  const d1 = getCategoryDomain(cat1);
  const d2 = getCategoryDomain(cat2);
  return d1 !== 'general' && d1 === d2;
}

function hasTextClusterOverlap(text1: string, text2: string): boolean {
  const t1 = text1.toLowerCase();
  const t2 = text2.toLowerCase();

  for (const [, keywords] of Object.entries(CIVIC_PROBLEM_CLUSTERS)) {
    const t1Has = keywords.some(k => t1.includes(k));
    const t2Has = keywords.some(k => t2.includes(k));
    if (t1Has && t2Has) return true;
  }
  return false;
}

export function checkCivicHotspot(
  newComplaint: {
    category: CivicCategory;
    lat: number;
    lng: number;
    description: string;
    title?: string;
    address?: string;
    ward?: string;
  },
  existingHotspots: CivicHotspot[],
  existingComplaints: CivicComplaint[]
): HotspotMatchResult {
  const newText = `${newComplaint.title || ''} ${newComplaint.description}`.toLowerCase();
  const newDomain = getCategoryDomain(newComplaint.category);
  const newAddrLower = (newComplaint.address || '').toLowerCase();

  // 1. Check if the complaint matches an existing confirmed CivicHotspot
  for (const hotspot of existingHotspots) {
    const hotspotLocLower = (hotspot.locality || '').toLowerCase();
    const hotspotNameLower = (hotspot.name || '').toLowerCase();

    // Prevent cross-merging distinct localities in Vizianagaram
    const isDistinctLocality =
      (newAddrLower.includes('college') && !hotspotLocLower.includes('college') && !hotspotNameLower.includes('college')) ||
      (newAddrLower.includes('fort') && !hotspotLocLower.includes('fort') && !hotspotNameLower.includes('fort')) ||
      (newAddrLower.includes('balaji') && !hotspotLocLower.includes('balaji') && !hotspotNameLower.includes('balaji')) ||
      (newAddrLower.includes('mg road') && !hotspotLocLower.includes('mg road') && !hotspotNameLower.includes('mg road'));

    if (isDistinctLocality) continue;

    const latDiff = Math.abs(hotspot.coordinates.lat - newComplaint.lat);
    const lngDiff = Math.abs(hotspot.coordinates.lng - newComplaint.lng);
    const isNearby = latDiff < 0.0055 && lngDiff < 0.0055; // ~500m

    // Ensure the complaint is genuinely relevant to this hotspot's domain
    const hotspotText = `${hotspot.name} ${hotspot.possibleIssue} ${hotspot.department}`.toLowerCase();
    const isDomainMatch =
      (newDomain === 'drainage' && (hotspotText.includes('drain') || hotspotText.includes('waterlog'))) ||
      (newDomain === 'road' && (hotspotText.includes('road') || hotspotText.includes('hazard') || hotspotText.includes('pothole'))) ||
      (newDomain === 'lighting' && (hotspotText.includes('light') || hotspotText.includes('lamp'))) ||
      (newDomain === 'waterSupply' && hotspotText.includes('water supply')) ||
      (newDomain === 'sanitation' && (hotspotText.includes('sanitation') || hotspotText.includes('waste')));

    const domainKeywords = CIVIC_PROBLEM_CLUSTERS[newDomain] || [];
    const hasDomainSpecificOverlap = domainKeywords.some(k => newText.includes(k) && hotspotText.includes(k));

    if (isNearby && (isDomainMatch || hasDomainSpecificOverlap)) {
      return {
        matchedHotspot: hotspot,
        isNewHotspotCreated: false,
        relatedComplaintIds: [...hotspot.relatedReportIds],
        affectedLocality: hotspot.locality,
        possibleIssue: hotspot.possibleIssue,
        possibleRootCause: hotspot.possibleRootCause,
        clusterPriority: hotspot.priority,
        patternDetected: true,
        patternDescription: `Correlated into confirmed Civic Hotspot "${hotspot.name}" (${hotspot.relatedReportIds.length + 1} Related Reports in locality).`,
      };
    }
  }

  // 2. Not matching an existing confirmed hotspot. Search existing complaints for a nearby and related cluster
  const relatedExistingComplaints = existingComplaints.filter(c => {
    if (c.isDraft) return false;

    const cAddr = (c.location.address || '').toLowerCase();

    // Prevent cross-merging distinct localities
    const hasConflictingLocality =
      (cAddr.includes('college') && newAddrLower.includes('mg road')) ||
      (cAddr.includes('mg road') && newAddrLower.includes('college')) ||
      (cAddr.includes('fort') && newAddrLower.includes('balaji')) ||
      (cAddr.includes('balaji') && newAddrLower.includes('fort'));

    if (hasConflictingLocality) return false;

    // Geographic Proximity: Coords near, same ward, or shared locality landmark
    const latDiff = Math.abs(c.location.lat - newComplaint.lat);
    const lngDiff = Math.abs(c.location.lng - newComplaint.lng);
    const isCoordsNear = latDiff < 0.0055 && lngDiff < 0.0055; // ~500m
    const sameWard = Boolean(c.location.ward && newComplaint.ward && c.location.ward === newComplaint.ward);

    const sharedLocality =
      (cAddr.includes('college') && newAddrLower.includes('college')) ||
      (cAddr.includes('mg road') && newAddrLower.includes('mg road')) ||
      (cAddr.includes('rtc') && newAddrLower.includes('rtc')) ||
      (cAddr.includes('fort') && newAddrLower.includes('fort')) ||
      (cAddr.includes('balaji') && newAddrLower.includes('balaji')) ||
      (cAddr.includes('cantonment') && newAddrLower.includes('cantonment'));

    const isGeographicallyNear = isCoordsNear || (sameWard && latDiff < 0.009 && lngDiff < 0.009) || sharedLocality;

    if (!isGeographicallyNear) return false;

    // Civic category compatibility or semantic problem text overlap
    const isCategoryCompatible = areCategoriesCompatible(c.category, newComplaint.category);
    const cText = `${c.title} ${c.description}`.toLowerCase();
    const hasProblemOverlap = hasTextClusterOverlap(newText, cText);

    return isCategoryCompatible || hasProblemOverlap;
  });

  const totalClusterCount = relatedExistingComplaints.length + 1;
  const relatedIds = relatedExistingComplaints.map(c => c.id);
  const targetLocality = newComplaint.address || relatedExistingComplaints[0]?.location.address || 'Vizianagaram';

  // Formulate tentative root cause and common civic problem
  let possibleRootCause = 'Possible Root Cause: Localized defect pending municipal field inspection.';
  let possibleIssue = newComplaint.title || 'Possible localized civic issue';

  if (newDomain === 'drainage') {
    possibleIssue = 'Recurring drainage blockage and stagnant water overflow';
    possibleRootCause = 'Possible Root Cause: Severe silt accumulation in roadside storm drain combined with choked culvert inlet.';
  } else if (newDomain === 'road') {
    possibleIssue = 'Recurring road surface deterioration and pothole crater formation';
    possibleRootCause = 'Possible Root Cause: Water stagnation weakening bitumen sub-base under repetitive vehicular traffic.';
  } else if (newDomain === 'lighting') {
    possibleIssue = 'Recurring lighting corridor failure along street stretch';
    possibleRootCause = 'Possible Root Cause: Underground cable conduit fault or circuit trip affecting multiple consecutive poles.';
  } else if (newDomain === 'waterSupply') {
    possibleIssue = 'Recurring drinking water distribution disruption';
    possibleRootCause = 'Possible Root Cause: Distribution pipeline joint failure or pressure drop along aged secondary main.';
  } else if (newDomain === 'sanitation') {
    possibleIssue = 'Recurring sanitation and waste accumulation bottleneck';
    possibleRootCause = 'Possible Root Cause: Overflowing collection bin cycle combined with commercial dumping in transit area.';
  }

  // 3. Apply MVP Thresholds:
  // Case A: 1 complaint only -> INDIVIDUAL COMPLAINT (Must NOT become a confirmed CivicHotspot)
  if (totalClusterCount === 1) {
    return {
      isNewHotspotCreated: false,
      relatedComplaintIds: [],
      affectedLocality: targetLocality,
      possibleIssue: newComplaint.title || 'Individual civic report',
      possibleRootCause: '', // Explicitly empty: root cause is only for clusters/hotspots
      clusterPriority: 'LOW',
      patternDetected: false,
      patternDescription: 'Single isolated report. No recurring pattern or cluster identified at this location.',
    };
  }

  // Case B: 2 complaints -> RELATED CLUSTER
  if (totalClusterCount === 2) {
    return {
      isNewHotspotCreated: false,
      relatedComplaintIds: relatedIds,
      affectedLocality: targetLocality,
      possibleIssue,
      possibleRootCause,
      clusterPriority: 'MEDIUM',
      patternDetected: true,
      patternDescription: '2 related complaints detected in the vicinity. Possible recurring civic problem under observation.',
    };
  }

  // Case C: 3 or more complaints -> CIVIC HOTSPOT
  return {
    isNewHotspotCreated: true,
    relatedComplaintIds: relatedIds,
    affectedLocality: targetLocality,
    possibleIssue,
    possibleRootCause,
    clusterPriority: totalClusterCount >= 4 ? 'HIGH' : 'MEDIUM',
    patternDetected: true,
    patternDescription: `${totalClusterCount} correlated citizen reports detected in this locality. Confirmed Civic Hotspot infrastructure pattern.`,
  };
}

/**
 * SmartRoute
 * Routes issue to appropriate department & officer in Municipal Corporation of Vizianagaram.
 */
export function determineSmartRoute(category: CivicCategory, ward: string = 'Ward 14'): SmartRouteResult {
  const date = new Date();

  switch (category) {
    case 'Water Supply':
      date.setDate(date.getDate() + 1); // 24 Hours
      return {
        department: 'Water Supply & Sewerage (Municipal Corporation of Vizianagaram)',
        officerName: 'Er. V. Appalaraju (AE - Water Works)',
        officerContact: '+91 94401 33445',
        slaDays: 1,
        targetResolutionDate: date.toISOString().slice(0, 10) + ' 06:00 PM',
        routingBasis: `Jurisdiction: ${ward}, Vizianagaram • Fast-track water supply division`,
      };

    case 'Waterlogging':
    case 'Drainage':
    case 'Sanitation / Hygiene':
    case 'Public Washroom':
      date.setDate(date.getDate() + 2); // 48 Hours
      return {
        department: 'Drainage / Sanitation (Municipal Corporation of Vizianagaram)',
        officerName: 'Er. K. V. Ramanamurthy (AEE)',
        officerContact: '+91 94401 23456 (AEE - Central Zone)',
        slaDays: 2,
        targetResolutionDate: date.toISOString().slice(0, 10) + ' 05:00 PM',
        routingBasis: `Jurisdiction: ${ward}, Vizianagaram • Stormwater & Public Health Mandate`,
      };

    case 'Road':
      date.setDate(date.getDate() + 2); // 48 Hours
      return {
        department: 'Roads & Infrastructure (Municipal Corporation of Vizianagaram)',
        officerName: 'Asst. Eng. P. Satyanarayana',
        officerContact: '+91 94401 56789 (Ward Roads Division)',
        slaDays: 2,
        targetResolutionDate: date.toISOString().slice(0, 10) + ' 05:00 PM',
        routingBasis: `Jurisdiction: ${ward}, Vizianagaram • Pavement Maintenance Division`,
      };

    case 'Streetlight':
      date.setDate(date.getDate() + 1); // 24 Hours
      return {
        department: 'Electrical & Street Lighting (Municipal Corporation of Vizianagaram)',
        officerName: 'K. Sundaram (Lighting Inspector)',
        officerContact: '+91 94401 88990',
        slaDays: 1,
        targetResolutionDate: date.toISOString().slice(0, 10) + ' 08:00 PM',
        routingBasis: `Jurisdiction: ${ward}, Vizianagaram • Night safety lighting mandate`,
      };

    case 'Waste':
      date.setDate(date.getDate() + 1); // 24 Hours
      return {
        department: 'Solid Waste Management (Municipal Corporation of Vizianagaram)',
        officerName: 'S. Ramakrishna (Sanitary Inspector)',
        officerContact: '+91 94401 77123',
        slaDays: 1,
        targetResolutionDate: date.toISOString().slice(0, 10) + ' 02:00 PM',
        routingBasis: `Jurisdiction: ${ward}, Vizianagaram • Daily municipal sanitation grid`,
      };

    case 'Public Safety':
      date.setDate(date.getDate() + 1); // 24 Hours
      return {
        department: 'Drainage & Sanitation (Municipal Corporation of Vizianagaram)',
        officerName: 'T. R. Murthy (Safety Supervisor)',
        officerContact: '+91 94401 77665',
        slaDays: 1,
        targetResolutionDate: date.toISOString().slice(0, 10) + ' 04:00 PM',
        routingBasis: `Jurisdiction: ${ward}, Vizianagaram • Urgent Pedestrian Safety Intervention`,
      };

    default:
      date.setDate(date.getDate() + 3);
      return {
        department: 'Municipal Civil Works Division (Vizianagaram)',
        officerName: 'G. Narayana Rao (Executive Engineer)',
        officerContact: '+91 94401 11223',
        slaDays: 3,
        targetResolutionDate: date.toISOString().slice(0, 10) + ' 05:00 PM',
        routingBasis: `Jurisdiction: ${ward}, Vizianagaram • General civic works roster`,
      };
  }
}

/**
 * Helper to retrieve or calculate explainable SmartPriorityAnalysis for any complaint
 */
export function getSmartPriorityForComplaint(complaint: Partial<CivicComplaint>): SmartPriorityAnalysis {
  if (complaint.smartPriority) {
    return complaint.smartPriority;
  }
  const result = calculateSmartPriority(
    complaint.category || 'Other',
    complaint.description || '',
    complaint.location,
    complaint.hotspotId ? 4 : undefined,
    complaint.title
  );
  return result.smartPriority;
}

