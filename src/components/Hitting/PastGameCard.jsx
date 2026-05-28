import { useState, useEffect } from 'react'
import { supabase } from '../../lib/supabase'

export function PastGameCard({ session, onClick }) {
  const [stats, setStats] = useState({
    ab: 0,
    hits: 0,
    strikeouts: 0,
    walks: 0,
    qabs: 0,
    qabPercentage: 0,
  })

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data: atBats, error } = await supabase
          .from('at_bats')
          .select('*')
          .eq('session_id', session.id)

        if (error) throw error

        const ab = atBats?.length || 0
        const hits = atBats?.filter(
          (a) => ['single', 'double', 'triple', 'home_run'].includes(a.result)
        ).length || 0
        const strikeouts = atBats?.filter((a) => a.result === 'strikeout').length || 0
        const walks = atBats?.filter((a) => a.result === 'walk').length || 0
        const qabs = atBats?.filter((a) => a.is_qab).length || 0
        const qabPercentage = ab > 0 ? Math.round((qabs / ab) * 100) : 0

        setStats({
          ab,
          hits,
          strikeouts,
          walks,
          qabs,
          qabPercentage,
        })
      } catch (error) {
        console.error('Error fetching game stats:', error)
      }
    }

    fetchStats()
  }, [session.id])

  const gameDate = new Date(session.date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })

  return (
    <button
      onClick={onClick}
      className="w-full bg-white rounded-lg shadow p-4 mb-3 border border-gray-200 hover:shadow-md hover:border-blue-300 transition text-left"
    >
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div>
          <p className="text-sm font-semibold text-gray-800">{session.opponent}</p>
          <p className="text-xs text-gray-500">{gameDate}</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
        <div className="text-center bg-blue-50 p-2 rounded">
          <p className="text-xs text-gray-600 font-semibold">AB</p>
          <p className="text-lg font-bold text-blue-600">{stats.ab}</p>
        </div>
        <div className="text-center bg-green-50 p-2 rounded">
          <p className="text-xs text-gray-600 font-semibold">H</p>
          <p className="text-lg font-bold text-green-600">{stats.hits}</p>
        </div>
        <div className="text-center bg-yellow-50 p-2 rounded">
          <p className="text-xs text-gray-600 font-semibold">K</p>
          <p className="text-lg font-bold text-yellow-600">{stats.strikeouts}</p>
        </div>
        <div className="text-center bg-purple-50 p-2 rounded">
          <p className="text-xs text-gray-600 font-semibold">BB</p>
          <p className="text-lg font-bold text-purple-600">{stats.walks}</p>
        </div>
        <div className="text-center bg-orange-50 p-2 rounded">
          <p className="text-xs text-gray-600 font-semibold">QAB%</p>
          <p className="text-lg font-bold text-orange-600">{stats.qabPercentage}%</p>
        </div>
      </div>

      {/* QAB Count */}
      {stats.qabs > 0 && (
        <p className="text-xs text-orange-600 font-semibold mt-3">
          ✅ {stats.qabs} Quality At-Bat{stats.qabs !== 1 ? 's' : ''}
        </p>
      )}
    </button>
  )
}
