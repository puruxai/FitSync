import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { PWAService } from './services/pwa/pwaService'
import { EnvironmentValidationService } from './services/deployment/envValidation'

// Register PWA service worker
PWAService.registerServiceWorker();

// Validate required environment variables at startup
EnvironmentValidationService.validateEnvironment();

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
