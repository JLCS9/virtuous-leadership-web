import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HelmetProvider } from 'react-helmet-async'
import './index.css'
import App from './App.jsx'
import { I18nProvider } from './i18n'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <HelmetProvider>
      <I18nProvider>
        <App />
      </I18nProvider>
    </HelmetProvider>
  </StrictMode>,
)
