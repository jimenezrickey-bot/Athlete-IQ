export function AtBatStatus({ atBatNum, pitchCount }) {
  return (
    <div className="bg-blue-50 rounded-lg shadow p-4 mb-6 border-2 border-blue-300">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-xs text-gray-600 uppercase font-semibold mb-1">At-Bat</p>
          <p className="text-3xl font-bold text-blue-600">#{atBatNum}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-600 uppercase font-semibold mb-1">Pitch Count</p>
          <p className="text-3xl font-bold text-orange-600">{pitchCount}</p>
        </div>
      </div>
    </div>
  )
}
