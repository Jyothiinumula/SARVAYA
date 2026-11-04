export type Language = 'en' | 'te' | 'hi';

export interface Translations {
  appName: string;
  tagline: string;
  motto: string;
  greeting: string;
  heroTitle: string;
  heroSubtitle: string;
  reportIssueBtn: string;
  saveForLater: string;
  quickActions: string;
  myComplaints: string;
  trackReports: string;
  nearbyIssues: string;
  seeProblems: string;
  savedDrafts: string;
  viewSaved: string;
  nearbyProblems: string;
  emergencyNotice: string;
  emergencyBtn: string;
  photoCapture: string;
  whatsTheProblem: string;
  speakOrType: string;
  tapToSpeak: string;
  listening: string;
  locationDetected: string;
  submitComplaint: string;
  saveDraft: string;
  all: string;
  inProgress: string;
  resolved: string;
  overdue: string;
  reopened: string;
  verifyQuestion: string;
  yesResolved: string;
  noReopen: string;
}

export const DICTIONARY: Record<Language, Translations> = {
  en: {
    appName: 'SARVAYA',
    tagline: 'AI-Powered Civic Intelligence & Accountability',
    motto: 'Safer | Cleaner | Greener',
    greeting: 'Namaste, Citizen!',
    heroTitle: 'Let’s make our communities cleaner, safer and better — together.',
    heroSubtitle: 'Report civic issues in 30 seconds. Track municipal action. Create real change.',
    reportIssueBtn: 'Report a Civic Issue',
    saveForLater: 'Capture Now / Save for Later',
    quickActions: 'Quick Actions',
    myComplaints: 'My Complaints',
    trackReports: 'Track status & SLAs',
    nearbyIssues: 'Nearby Issues',
    seeProblems: 'See issues around you',
    savedDrafts: 'Saved Drafts',
    viewSaved: 'Drafts captured on-the-go',
    nearbyProblems: 'Civic Issues in Your Area',
    emergencyNotice: 'Immediate Danger? Dial 112 directly.',
    emergencyBtn: 'Call 112',
    photoCapture: 'Take Photo of the Problem',
    whatsTheProblem: 'What is the civic problem?',
    speakOrType: 'Describe the issue or speak in Telugu / English',
    tapToSpeak: 'Tap to Speak (Voice Note)',
    listening: 'Listening... Speak now',
    locationDetected: 'Auto GPS Location Detected',
    submitComplaint: 'Submit Civic Report',
    saveDraft: 'Save Draft (Report Later)',
    all: 'All',
    inProgress: 'In Progress',
    resolved: 'Resolved',
    overdue: 'Overdue / Escalated',
    reopened: 'Reopened',
    verifyQuestion: 'Authority marked this Resolved. Did you inspect it?',
    yesResolved: 'YES — Problem Resolved',
    noReopen: 'NO — Still Not Resolved',
  },
  te: {
    appName: 'సర్వాయ (SARVAYA)',
    tagline: 'AI ప్రజా సేవా సమస్యల పరిష్కార వ్యవస్థ',
    motto: 'సురక్షితం | పరిశుభ్రం | పచ్చదనం',
    greeting: 'నమస్కారం, పౌరుడా!',
    heroTitle: 'మన వీధిని, మన నగరాన్ని పరిశుభ్రంగా మరియు సురక్షితంగా ఉంచుకుందాం.',
    heroSubtitle: 'సమస్యను ఫోటో తీసి 30 సెకన్లలో ఫిర్యాదు చేయండి. అధికారుల చర్యలను పరిశీలించండి.',
    reportIssueBtn: 'సమస్యను ఫిర్యాదు చేయండి',
    saveForLater: 'ఇప్పుడే ఫోటో తీసి తర్వాత పంపండి',
    quickActions: 'త్వరిత సేవలు',
    myComplaints: 'నా ఫిర్యాదులు',
    trackReports: 'స్టేటస్ & పురోగతి చూడండి',
    nearbyIssues: 'సమీప సమస్యలు',
    seeProblems: 'మీ ప్రాంతంలోని సమస్యలు',
    savedDrafts: 'సేవ్ చేసిన డ్రాఫ్ట్స్',
    viewSaved: 'తర్వాత సమర్పించడానికి ఉంచినవి',
    nearbyProblems: 'మీ ప్రాంతంలో ఉన్న సమస్యలు',
    emergencyNotice: 'తక్షణ ప్రమాదమా? 112 కు కాల్ చేయండి.',
    emergencyBtn: 'కాల్ 112',
    photoCapture: 'సమస్య ఫోటో తీయండి',
    whatsTheProblem: 'ఎలాంటి సమస్య?',
    speakOrType: 'సమస్య గురించి మాట్లాడండి లేదా రాయండి',
    tapToSpeak: 'మాట్లాడటానికి నొక్కండి (వాయిస్ నోట్)',
    listening: 'వింటున్నాము... మాట్లాడండి',
    locationDetected: 'మీ లొకేషన్ గుర్తించబడింది',
    submitComplaint: 'ఫిర్యాదు సమర్పించండి',
    saveDraft: 'డ్రాఫ్ట్ సేవ్ చేయండి (తర్వాత పంపండి)',
    all: 'అన్నీ',
    inProgress: 'పురోగతిలో ఉంది',
    resolved: 'పరిష్కరించబడింది',
    overdue: 'గడువు దాటినవి (ఎస్కేలేట్)',
    reopened: 'తిరిగి తెరిచినవి',
    verifyQuestion: 'అధికారులు పరిష్కరించామని చెప్పారు. సమస్య నిజంగా పరిష్కారమైందా?',
    yesResolved: 'అవును — సమస్య తీరింది',
    noReopen: 'లేదు — ఇంకా అలాగే ఉంది',
  },
  hi: {
    appName: 'सर्वाया (SARVAYA)',
    tagline: 'AI-संचालित नागरिक शिकायत एवं जवाबदेही प्रणाली',
    motto: 'सुरक्षित | स्वच्छ | हरित',
    greeting: 'नमस्ते, नागरिक!',
    heroTitle: 'आइए अपने शहर और मोहल्ले को स्वच्छ और सुरक्षित बनाएं।',
    heroSubtitle: '30 सेकंड में समस्या की फोटो खींचें और रिपोर्ट करें। त्वरित समाधान पाएं।',
    reportIssueBtn: 'नागरिक समस्या रिपोर्ट करें',
    saveForLater: 'अभी फोटो लें / बाद में भेजें',
    quickActions: 'त्वरित सेवाएं',
    myComplaints: 'मेरी शिकायतें',
    trackReports: 'स्थिति और समय-सीमा देखें',
    nearbyIssues: 'आसपास की समस्याएं',
    seeProblems: 'मोहल्ले की रिपोर्ट देखें',
    savedDrafts: 'सहेजे गए ड्राफ्ट',
    viewSaved: 'बाद में भेजने के लिए',
    nearbyProblems: 'आपके क्षेत्र की समस्याएं',
    emergencyNotice: 'तत्काल खतरा? 112 पर कॉल करें।',
    emergencyBtn: 'कॉल 112',
    photoCapture: 'समस्या की फोटो लें',
    whatsTheProblem: 'समस्या क्या है?',
    speakOrType: 'समस्या के बारे में बोलें या लिखें',
    tapToSpeak: 'बोलने के लिए दबाएं (वॉयस नोट)',
    listening: 'सुन रहे हैं... बोलिए',
    locationDetected: 'स्थान स्वतः पहचाना गया',
    submitComplaint: 'शिकायत दर्ज करें',
    saveDraft: 'ड्राफ्ट सहेजें (बाद में भेजें)',
    all: 'सभी',
    inProgress: 'प्रगति पर है',
    resolved: 'हल हो गया',
    overdue: 'समय सीमा पार (एस्केलेट)',
    reopened: 'पुनः खोला गया',
    verifyQuestion: 'अधिकारियों ने इसे हल बताया है। क्या समस्या सच में हल हो गई?',
    yesResolved: 'हाँ — समस्या हल हो गई',
    noReopen: 'नहीं — अभी भी समस्या है',
  },
};
