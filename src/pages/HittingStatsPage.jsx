import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/hooks/useAuth'
import { useHittingStats } from '../lib/hooks/useHittingStats'
import { supabase } from '../lib/supabase'
import { StatsGrid } from '../components/Hitting/StatsGrid'
import { DetailedAnalysis } from '../components/Hitting/DetailedAnalysis'
import { Toast } from '../components/common/Toast'

export function HittingStatsPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const {
    stats,
    isLoading,
    error,
    fetchStatsForPreset,
    fetchStatsForCustomRange,
    getDateRange,
  } = useHittingStats(user?.id)

  const [selectedPreset, setSelectedPreset] = useState('last30')
  const [customStartDate, setCustomStartDate] = useState('')
  const [customEndDate, setCustomEndDate] = useState('')
  const [showCustomRange, setShowCustomRange] = useState(false)
  const [atBats, setAtBats] = useState([])

  // Fetch stats on mount and when preset changes
  useEffect(() => {
    if (user?.id && selectedPreset) {
      if (selectedPreset === 'custom') {
        // Only fetch if custom range is set
        if (customStartDate && customEndDate) {
          fetchStatsForCustomRange(customStartDate, customEndDate)
        }
      } else {
        fetchStatsForPreset(selectedPreset)
      }
    }
  }, [user?.id, selectedPreset])

  // Fetch at-bats data for detailed analysis
  useEffect(() => {
    if (!user?.id || !stats?.dateRange) return

    const fetchAtBats = async () => {
      const { data, error: err } = await supabase
        .from('at_bats')
        .select(
          `
          id,
          result,
          rbis,
          is_qab,
          session_id,
          hitting_sessions!at_bats_session_id_fkey (
            user_id,
            date
          )
        `
        )
        .eq('hitting_sessions.user_id', user.id)
        .gte('hitting_sessions.date', stats.dateRange.startDate)
        .lte('hitting_sessions.date', stats.dateRange.endDate)
        .order('hitting_sessions.date', { ascending: false })

      if (!err) {
        setAtBats(data || [])
      }
    }

    fetchAtBats()
  }, [user?.id, stats?.dateRange])

  const handlePresetChange = (preset) => {
    setSelectedPreset(preset)
    setShowCustomRange(preset === 'custom')

    if (preset !== 'custom') {
      setCustomStartDate('')
      setCustomEndDate('')
    }
  }

  const handleCustomRangeSubmit = () => {
    if (customStartDate && customEndDate) {
      fetchStatsForCustomRange(customStartDate, customEndDate)
    }
  }

  const getTodayString = () => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  }

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
      {error && <Toast message={`Error: ${error}`} type="error" />}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate('/hitting')}
          className="text-blue-600 hover:text-blue-800 font-semibold text-sm"
        >
          ← Back to Tracker
        </button>
      </div>

      {/* Page Title */}
      <div className="mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1">
          Hitting Statistics
        </h1>
        <p className="text-sm text-gray-600">
          Track your batting performance over time
        </p>
      </div>

      {/* Date Range Filter */}
      <div className="bg-white rounded-lg shadow p-4 sm:p-6 mb-6 border border-gray-200">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">Date Range</h2>

        {/* Preset Buttons */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 mb-4">
          <button
            onClick={() => handlePresetChange('all')}
            className={`px-3 py-2 rounded-lg font-medium transition text-sm ${
              selectedPreset === 'all'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Time
          </button>
          <button
            onClick={() => handlePresetChange('last7')}
            className={`px-3 py-2 rounded-lg font-medium transition text-sm ${
              selectedPreset === 'last7'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Last 7 Days
          </button>
          <button
            onClick={() => handlePresetChange('last30')}
            className={`px-3 py-2 rounded-lg font-medium transition text-sm ${
              selectedPreset === 'last30'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Last 30 Days
          </button>
          <button
            onClick={() => handlePresetChange('thisMonth')}
            className={`px-3 py-2 rounded-lg font-medium transition text-sm ${
              selectedPreset === 'thisMonth'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            This Month
          </button>
          <button
            onClick={() => handlePresetChange('custom')}
            className={`px-3 py-2 rounded-lg font-medium transition text-sm ${
              selectedPreset === 'custom'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Custom
          </button>
        </div>

        {/* Custom Range Inputs */}
        {showCustomRange && (
          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  max={getTodayString()}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <button
              onClick={handleCustomRangeSubmit}
              disabled={!customStartDate || !customEndDate || isLoading}
              className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded-lg transition"
            >
              {isLoading ? 'Loading...' : 'Apply Range'}
            </button>
          </div>
        )}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center min-h-96">
          <div className="text-gray-600 text-center">
            <div className="animate-spin text-blue-500 text-4xl mb-3">⚾</div>
            <p>Loading statistics...</p>
          </div>
        </div>
      )}

      {/* Stats Display */}
      {!isLoading && stats && (
        <>
          {/* Summary Cards Grid */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Performance Metrics</h2>
            <StatsGrid stats={stats} totalGames={stats.games} />
          </div>

          {/* Detailed Analysis */}
          {atBats.length > 0 && <DetailedAnalysis stats={stats} atBats={atBats} />}

          {/* No Data Message */}
          {atBats.length === 0 && (
            <div className="bg-yellow-50 rounded-lg border-2 border-yellow-200 p-6 text-center mt-6">
              <p className="text-yellow-800">
                No at-bat data available for the selected date range. Log some games first!
              </p>
              <button
                onClick={() => navigate('/hitting')}
                className="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-lg transition"
              >
                Go to Hitting Tracker
              </button>
            </div>
          )}
        </>
      )}

      {/* No Stats Message */}
      {!isLoading && !stats && !error && (
        <div className="bg-gray-50 rounded-lg border-2 border-gray-200 p-6 text-center">
          <p className="text-gray-600">
            No statistics available for the selected date range
          </p>
        </div>
      )}
    </div>
  )
}
