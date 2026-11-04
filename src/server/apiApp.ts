import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { INITIAL_COMPLAINTS, INITIAL_HOTSPOTS } from '../data/mockData';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Shared database persistent storage directory
const DATA_DIR = path.resolve(__dirname, '../../data_store');
const COMPLAINTS_FILE = path.join(DATA_DIR, 'shared_complaints.json');
const HOTSPOTS_FILE = path.join(DATA_DIR, 'shared_hotspots.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function loadJson<T>(file: string, fallback: T): T {
  try {
    if (fs.existsSync(file)) {
      const raw = fs.readFileSync(file, 'utf-8');
      return JSON.parse(raw);
    }
  } catch (err) {
    console.error(`[SARVAYA Central DB] Error reading ${file}:`, err);
  }
  return fallback;
}

function saveJson(file: string, data: any) {
  try {
    fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error(`[SARVAYA Central DB] Error writing ${file}:`, err);
  }
}

// Load in-memory store from file or fallback to initial civic dataset
let complaints = loadJson(COMPLAINTS_FILE, INITIAL_COMPLAINTS);
let hotspots = loadJson(HOTSPOTS_FILE, INITIAL_HOTSPOTS);

if (!complaints || complaints.length === 0) {
  complaints = INITIAL_COMPLAINTS;
  saveJson(COMPLAINTS_FILE, complaints);
} else {
  // Ensure existing complaints in store have smartPriority populated
  complaints = complaints.map((c: any) => {
    const initial = INITIAL_COMPLAINTS.find(ic => ic.id === c.id);
    if (initial && initial.smartPriority) {
      return { ...c, smartPriority: c.smartPriority || initial.smartPriority };
    }
    return c;
  });
  saveJson(COMPLAINTS_FILE, complaints);
}
if (!hotspots || hotspots.length === 0) {
  hotspots = INITIAL_HOTSPOTS;
  saveJson(HOTSPOTS_FILE, hotspots);
}

console.log(`[SARVAYA Central DB] Initialized with ${complaints.length} complaints and ${hotspots.length} hotspots.`);

export const apiApp = express();

apiApp.use(express.json({ limit: '15mb' }));

// 1. Health check & status
apiApp.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'SARVAYA Civic-AI Central Data Hub',
    serverTime: new Date().toISOString(),
    complaintsCount: complaints.length,
    hotspotsCount: hotspots.length,
  });
});

// 2. Full Sync (used by devices to synchronize in 1 trip)
apiApp.get('/api/sync', (req, res) => {
  res.json({
    complaints,
    hotspots,
    timestamp: Date.now(),
  });
});

// 3. Get all complaints
apiApp.get('/api/complaints', (req, res) => {
  res.json(complaints);
});

// 4. Create new complaint (Citizen submits from any device)
apiApp.post('/api/complaints', (req, res) => {
  const newComplaint = req.body;
  if (!newComplaint || !newComplaint.id) {
    return res.status(400).json({ error: 'Invalid complaint data' });
  }

  const existingIdx = complaints.findIndex((c: any) => c.id === newComplaint.id);
  if (existingIdx >= 0) {
    complaints[existingIdx] = newComplaint;
  } else {
    complaints = [newComplaint, ...complaints];
  }

  saveJson(COMPLAINTS_FILE, complaints);
  console.log(`[SARVAYA Central DB] New complaint received: ${newComplaint.id} (${newComplaint.title}) - Status: ${newComplaint.status}`);
  return res.status(201).json(newComplaint);
});

// 5. Update complaint (Admin changes status / assigns / notes)
apiApp.patch('/api/complaints/:id', (req, res) => {
  const { id } = req.params;
  const updates = req.body;

  const idx = complaints.findIndex((c: any) => c.id === id);
  if (idx === -1) {
    return res.status(404).json({ error: `Complaint ${id} not found` });
  }

  complaints[idx] = {
    ...complaints[idx],
    ...updates,
  };

  saveJson(COMPLAINTS_FILE, complaints);
  console.log(`[SARVAYA Central DB] Updated complaint ${id}: Status -> ${complaints[idx].status}`);
  return res.json(complaints[idx]);
});

// 6. Delete complaint / draft
apiApp.delete('/api/complaints/:id', (req, res) => {
  const { id } = req.params;
  complaints = complaints.filter((c: any) => c.id !== id);
  saveJson(COMPLAINTS_FILE, complaints);
  return res.json({ success: true, id });
});

// 7. Hotspots endpoints
apiApp.get('/api/hotspots', (req, res) => {
  res.json(hotspots);
});

apiApp.post('/api/hotspots', (req, res) => {
  const newHotspot = req.body;
  if (!newHotspot || !newHotspot.id) {
    return res.status(400).json({ error: 'Invalid hotspot data' });
  }

  const idx = hotspots.findIndex((h: any) => h.id === newHotspot.id);
  if (idx >= 0) {
    hotspots[idx] = newHotspot;
  } else {
    hotspots = [newHotspot, ...hotspots];
  }
  saveJson(HOTSPOTS_FILE, hotspots);
  return res.status(201).json(newHotspot);
});

// 8. Reset to default demo civic data
apiApp.post('/api/reset-demo', (req, res) => {
  complaints = [...INITIAL_COMPLAINTS];
  hotspots = [...INITIAL_HOTSPOTS];
  saveJson(COMPLAINTS_FILE, complaints);
  saveJson(HOTSPOTS_FILE, hotspots);
  console.log('[SARVAYA Central DB] Reset demo data to default baseline.');
  return res.json({ success: true, message: 'Reset to initial demo data' });
});
