import { useState } from 'react'
import { formatStat } from '../../lib/utils/statsCalculator'

export function DetailedAnalysis({ stats, atBats }) {
  const [isExpanded, setIsExpanded] = useState(false)

  if (!stats || !atBats || atBats.length === 0) {
    return null
  }

  // Calculate at-bat outcome breakdown
  const hits = atBats.filter((ab) =>
    ['single', 'double', 'triple', 'home_run'].includes(ab.result)
  ).length
  const outs = atBats.filter((ab) =>
    ['out', 'strikeout'].includes(ab.result)
  ).length
  const walks = atBats.filter((ab) => ab.result === 'walk').length
  const othersCount = atBats.filter((ab) =>
    ['hbp', 'sac_fly', 'reached_on_error'].includes(ab.result)
  ).length

  // Calculate hit type distribution
  const singles = atBats.filter((ab) => ab.result === 'single').length
  const doubles = atBats.filter((ab) => ab.result === 'double').length
  const triples = atBats.filter((ab) => ab.result === 'triple').length
  const homeRuns = atBats.filter((ab) => ab.result === 'home_run').length

  // Calculate QAB improvement
  const recentABsCount = Math.min(10, atBats.length)
  const recentABs = atBats.slice(0, recentABsCount)
  const recentQABs = recentABs.filter((ab) => ab.is_qab).length
  const recentQABPercentage = (recentQABs / recentABsCount) * 100

  const overallQABPercentage = stats.qabPercentage

  let qabTrend = 'stable'
  if (recentQABPercentage > overallQABPercentage + 5) {
    qabTrend = 'improving'
  } else if (recentQABPercentage < overallQABPercentage - 5) {
    qabTrend = 'declining'
  }

  const getTrendColor = (trend) => {
    switch (trend) {
      case 'improving':
        return 'text-green-600'
      case 'declining':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  const getTrendEmoji = (trend) => {
    switch (trend) {
      case 'improving':
        return '📈'
      case 'declining':
        return '📉'
      default:
        return '→'
    }
  }

  return (
    <div className="mt-6 space-y-4">
      {/* Toggle Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full bg-blue-50 hover:bg-blue-100 border-2 border-blue-300 rounded-lg p-4 text-center font-semibold text-blue-700 transition"
      >
        {isExpanded ? '▼' : '▶'} Detailed Analysis
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="bg-white rounded-lg shadow p-4 sm:p-6 space-y-6 border border-gray-200">
          {/* At-Bat Breakdown */}
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-4">
              At-Bat Breakdown
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-green-50 rounded-lg p-3 text-center border border-green-200">
                <p className="text-xs text-gray-600 font-semibold">Hits</p>
                <p className="text-2xl font-bold text-green-600">{hits}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {hits > 0 ? formatStat((hits / atBats.length) * 100, 'percentage') : '0%'}
                </p>
              </div>
              <div className="bg-red-50 rounded-lg p-3 text-center border border-red-200">
                <p className="text-xs text-gray-600 font-semibold">Outs</p>
                <p className="text-2xl font-bold text-red-600">{outs}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {outs > 0 ? formatStat((outs / atBats.length) * 100, 'percentage') : '0%'}
                </p>
              </div>
              <div className="bg-purple-50 rounded-lg p-3 text-center border border-purple-200">
                <p className="text-xs text-gray-600 font-semibold">Walks</p>
                <p className="text-2xl font-bold text-purple-600">{walks}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {walks > 0 ? formatStat((walks / atBats.length) * 100, 'percentage') : '0%'}
                </p>
              </div>
              <div className="bg-gray-50 rounded-lg p-3 text-center border border-gray-200">
                <p className="text-xs text-gray-600 font-semibold">Other</p>
                <p className="text-2xl font-bold text-gray-600">{othersCount}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {othersCount > 0
                    ? formatStat((othersCount / atBats.length) * 100, 'percentage')
                    : '0%'}
                </p>
              </div>
            </div>
          </div>

          {/* Hit Type Distribution */}
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-4">Hit Distribution</h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-blue-50 rounded-lg p-3 text-center border border-blue-200">
                <p className="text-xs text-gray-600 font-semibold">Singles</p>
                <p className="text-2xl font-bold text-blue-600">{singles}</p>
              </div>
              <div className="bg-cyan-50 rounded-lg p-3 text-center border border-cyan-200">
                <p className="text-xs text-gray-600 font-semibold">Doubles</p>
                <p className="text-2xl font-bold text-cyan-600">{doubles}</p>
              </div>
              <div className="bg-indigo-50 rounded-lg p-3 text-center border border-indigo-200">
                <p className="text-xs text-gray-600 font-semibold">Triples</p>
                <p className="text-2xl font-bold text-indigo-600">{triples}</p>
              </div>
              <div className="bg-orange-50 rounded-lg p-3 text-center border border-orange-200">
                <p className="text-xs text-gray-600 font-semibold">Home Runs</p>
                <p className="text-2xl font-bold text-orange-600">{homeRuns}</p>
              </div>
            </div>
          </div>

          {/* Performance Trend */}
          <div>
            <h3 className="text-lg font-bold text-gray-800 mb-4">Performance Trend</h3>
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-700">
                    QAB% (Last {recentABsCount} ABs)
                  </span>
                  <span className={`text-lg font-bold ${getTrendColor(qabTrend)}`}>
                    {getTrendEmoji(qabTrend)} {formatStat(recentQABPercentage, 'percentage')}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold text-gray-700">
                    QAB% (Overall)
                  </span>
                  <span className="text-lg font-bold text-gray-700">
                    {formatStat(overallQABPercentage, 'percentage')}
                  </span>
                </div>
                <div className="text-sm text-gray-600 pt-2 border-t border-blue-200">
                  {qabTrend === 'improving' && (
                    <p>
                      Quality at-bats are <span className="font-semibold text-green-600">improving</span>! Keep
                      up the good plate discipline.
                    </p>
                  )}
                  {qabTrend === 'declining' && (
                    <p>
                      Quality at-bats have <span className="font-semibold text-red-600">declined</span> recently. Focus on
                      discipline at the plate.
                    </p>
                  )}
                  {qabTrend === 'stable' && (
                    <p>
                      Quality at-bat rate is <span className="font-semibold">stable</span>. Stay consistent with your
                      plate approach.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
