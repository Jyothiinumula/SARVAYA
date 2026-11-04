import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Register PWA service worker for offline runtime caching
registerSW({
  immediate: true,
  onOfflineReady() {
    console.log('[SARVAYA] Application cached for offline civic capture.');
  },
});

createRoot(document.getElementById('root')!).render(<App />);

