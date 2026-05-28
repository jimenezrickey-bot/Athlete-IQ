import { getPerformanceColor, getColorClasses } from '../../lib/utils/statsCalculator'

export function StatCard({ label, value, type = 'count', context = '', metric = null }) {
  if (value === null || value === undefined) {
    return (
      <div className="bg-gray-50 rounded-lg shadow p-4 border border-gray-200 text-center">
        <p className="text-xs text-gray-600 font-semibold mb-2 uppercase">{label}</p>
        <p className="text-2xl font-bold text-gray-400">—</p>
        {context && <p className="text-xs text-gray-500 mt-2">{context}</p>}
      </div>
    )
  }

  // Get color category based on metric performance
  let colorCategory = 'average'
  if (metric) {
    colorCategory = getPerformanceColor(metric, value)
  }

  const colors = getColorClasses(colorCategory)

  return (
    <div
      className={`${colors.bg} rounded-lg shadow p-4 border-2 ${colors.border} text-center`}
    >
      <p className="text-xs text-gray-600 font-semibold mb-2 uppercase">{label}</p>
      <p className={`text-3xl font-bold ${colors.text}`}>{value}</p>
      {context && (
        <p className="text-xs text-gray-600 mt-2">
          {context}
        </p>
      )}
    </div>
  )
}
