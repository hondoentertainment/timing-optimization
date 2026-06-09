import { useState } from 'react'
import { Layout } from './components/Layout'
import { HomeView } from './components/HomeView'
import { PlanView } from './components/PlanView'
import { TrackView } from './components/TrackView'
import { ReviewView } from './components/ReviewView'
import { InterestsView } from './components/InterestsView'
import { SettingsView } from './components/SettingsView'
import { useAppStore } from './hooks/useAppStore'
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts'
import type { View } from './types'

function App() {
  const [view, setView] = useState<View>('home')
  const store = useAppStore()

  useKeyboardShortcuts({
    view,
    setView,
    currentWeek: store.currentWeek,
    setCurrentWeek: store.setCurrentWeek,
  })

  return (
    <Layout view={view} onViewChange={setView}>
      {view === 'home' && <HomeView store={store} onNavigate={setView} />}
      {view === 'plan' && <PlanView store={store} />}
      {view === 'track' && <TrackView store={store} />}
      {view === 'review' && <ReviewView store={store} />}
      {view === 'interests' && <InterestsView store={store} />}
      {view === 'settings' && <SettingsView store={store} />}
    </Layout>
  )
}

export default App
