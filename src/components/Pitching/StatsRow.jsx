export function StatsRow({ stats }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-4 mb-6">
      <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
        <p className="text-xs sm:text-sm text-gray-600">Days logged</p>
        <p className="text-xl sm:text-2xl font-bold text-gray-800">{stats.daysLogged}</p>
      </div>
      <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
        <p className="text-xs sm:text-sm text-gray-600">Total throws</p>
        <p className="text-xl sm:text-2xl font-bold text-gray-800">{stats.totalThrows}</p>
      </div>
      <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
        <p className="text-xs sm:text-sm text-gray-600">Peak effort</p>
        <p className="text-xl sm:text-2xl font-bold text-gray-800">
          {stats.peakEffort > 0 ? `${stats.peakEffort}%` : '—'}
        </p>
      </div>
      <div className="bg-gray-50 rounded-lg p-3 sm:p-4">
        <p className="text-xs sm:text-sm text-gray-600">Bullpen pitches</p>
        <p className="text-xl sm:text-2xl font-bold text-gray-800">{stats.totalBullpen}</p>
      </div>
    </div>
  )
}
