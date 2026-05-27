export function StrikeZoneGrid({ selectedZone, onZoneSelect }) {
  const zones = [
    { id: 1, label: '1', position: 'top-left' },
    { id: 2, label: '2', position: 'top-center' },
    { id: 3, label: '3', position: 'top-right' },
    { id: 4, label: '4', position: 'middle-left' },
    { id: 5, label: '5', position: 'middle-center' },
    { id: 6, label: '6', position: 'middle-right' },
    { id: 7, label: '7', position: 'bottom-left' },
    { id: 8, label: '8', position: 'bottom-center' },
    { id: 9, label: '9', position: 'bottom-right' },
  ]

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <h4 className="text-sm font-semibold text-gray-700 mb-4 uppercase">Strike Zone</h4>

      <div className="flex justify-center">
        <div className="inline-grid grid-cols-3 gap-2 w-full max-w-sm">
          {zones.map(zone => (
            <button
              key={zone.id}
              onClick={() => onZoneSelect(zone.id)}
              className={`
                aspect-square rounded-lg border-2 font-bold text-lg transition duration-200
                ${selectedZone === zone.id
                  ? 'bg-blue-500 border-blue-600 text-white shadow-lg'
                  : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200 hover:border-gray-400'
                }
              `}
            >
              {zone.label}
            </button>
          ))}
        </div>
      </div>

      {selectedZone && (
        <div className="mt-4 text-center text-sm text-gray-600 bg-blue-50 py-2 px-3 rounded">
          Zone {selectedZone} selected
        </div>
      )}
    </div>
  )
}
