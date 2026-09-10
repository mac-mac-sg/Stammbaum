import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { EditProvider } from './EditContext'
import { PrivacyProvider } from './PrivacyContext'
import { registerServiceWorker } from './registerServiceWorker'
import { assertValidGenealogy } from './dataValidation'
import { people, peopleById, rootId } from './data'
import './styles.css'
import './focus.css'
import './mobile.css'
import './focus-mobile.css'
import './relationship.css'
import './privacy.css'
import './mobile-search.css'
import './edit.css'
import './corrections.css'

assertValidGenealogy(people, peopleById, rootId)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <EditProvider>
      <PrivacyProvider>
        <App />
      </PrivacyProvider>
    </EditProvider>
  </React.StrictMode>,
)

registerServiceWorker()
