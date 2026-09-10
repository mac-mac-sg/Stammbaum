import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { EditProvider } from './EditContext'
import { FamilyNavigationProvider } from './FamilyNavigationContext'
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
import './partner-person.css'
import './tree-couples.css'
import './home.css'
import './install.css'
import './theme.css'
import './theme-fixes.css'
import './ux-simplification.css'
import './design-polish.css'

assertValidGenealogy(people, peopleById, rootId)

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <EditProvider>
      <PrivacyProvider>
        <FamilyNavigationProvider>
          <App />
        </FamilyNavigationProvider>
      </PrivacyProvider>
    </EditProvider>
  </React.StrictMode>,
)

registerServiceWorker()
