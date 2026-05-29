import { Header } from '../components/common/Header'
import { AthleteSelector } from '../components/Athlete/AthleteSelector'
import { PitchingWeeklyDashboard } from '../components/Pitching/PitchingWeeklyDashboard'

export function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-100">
      <Header />
      <main className="max-w-6xl mx-auto px-4 py-8">
        <AthleteSelector />
        <PitchingWeeklyDashboard />
      </main>
    </div>
  )
}
