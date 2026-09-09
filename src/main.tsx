import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { PrivacyProvider } from './PrivacyContext'
import './styles.css'
import './focus.css'
import './mobile.css'
import './focus-mobile.css'
import './relationship.css'
import './privacy.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <PrivacyProvider>
      <App />
    </PrivacyProvider>
  </React.StrictMode>,
)
