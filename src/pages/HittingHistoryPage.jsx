import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/hooks/useAuth'
import { usePastHittingSessions } from '../lib/hooks/usePastHittingSessions'
import { DateRangeFilter } from '../components/common/DateRangeFilter'
import { PastGameCard } from '../components/Hitting/PastGameCard'
import { Toast } from '../components/common/Toast'

export function HittingHistoryPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { sessions, isLoading, toast, fetchPastSessions } = usePastHittingSessions(user?.id)
  const [searchOpponent, setSearchOpponent] = useState('')
  const [filteredSessions, setFilteredSessions] = useState([])

  // Initialize with last 30 days
  useEffect(() => {
    if (user?.id) {
      const today = new Date()
      const thirtyDaysAgo = new Date(today)
      thirtyDaysAgo.setDate(today.getDate() - 30)

      fetchPastSessions(
        thirtyDaysAgo.toISOString().split('T')[0],
        today.toISOString().split('T')[0]
      )
    }
  }, [user?.id, fetchPastSessions])

  // Filter sessions by opponent and opponent search
  useEffect(() => {
    let filtered = sessions

    if (searchOpponent) {
      filtered = filtered.filter((session) =>
        session.opponent.toLowerCase().includes(searchOpponent.toLowerCase())
      )
    }

    setFilteredSessions(filtered)
  }, [sessions, searchOpponent])

  const handleFilterChange = (startDate, endDate) => {
    fetchPastSessions(startDate, endDate)
    setSearchOpponent('')
  }

  const handleGameClick = (sessionId) => {
    navigate(`/hitting/history/${sessionId}`)
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-6 sm:py-8 flex items-center justify-center min-h-screen">
        <div className="text-gray-600">Loading past games...</div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
      {toast && <Toast message={toast} type="success" />}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Hitting History</h1>
        <button
          onClick={() => navigate('/hitting')}
          className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition text-sm"
        >
          Live Entry
        </button>
      </div>

      {/* Filter */}
      <DateRangeFilter onFilterChange={handleFilterChange} />

      {/* Search */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="Search by opponent..."
          value={searchOpponent}
          onChange={(e) => setSearchOpponent(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Games List */}
      {filteredSessions.length === 0 ? (
        <div className="bg-gray-50 rounded-lg border-2 border-gray-200 p-6 text-center">
          <p className="text-gray-600 font-medium">No games found in this date range</p>
          <p className="text-sm text-gray-500 mt-1">
            Try adjusting the date filter or search for a different opponent
          </p>
        </div>
      ) : (
        <div>
          <p className="text-sm text-gray-600 mb-4">
            {filteredSessions.length} game{filteredSessions.length !== 1 ? 's' : ''} found
          </p>
          {filteredSessions.map((session) => (
            <PastGameCard
              key={session.id}
              session={session}
              onClick={() => handleGameClick(session.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
