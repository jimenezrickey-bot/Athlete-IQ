export function HittingSessionSummary({ pitches, onEditPitch, onDeletePitch }) {
  const getQualityColor = (quality) => {
    switch (quality) {
      case 'soft':
        return 'text-yellow-600'
      case 'firm':
        return 'text-orange-600'
      case 'hard':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  const getTypeLabel = (type) => {
    const labels = {
      gb: 'GB',
      ld: 'LD',
      fb: 'FB',
      pu: 'PU',
    }
    return labels[type] || type
  }

  const getLocationLabel = (location) => {
    const labels = {
      pull: 'Pull',
      middle: 'Middle',
      oppo: 'Oppo',
    }
    return labels[location] || location
  }

  if (pitches.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg border-2 border-gray-200 p-6 mb-6">
        <p className="text-sm text-gray-500 text-center">No pitches logged yet. Select a zone to begin.</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <div className="flex justify-between items-center mb-4">
        <h4 className="text-sm font-semibold text-gray-700 uppercase">Pitches Logged</h4>
        <span className="text-xl font-bold text-blue-600">{pitches.length}</span>
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto">
        {pitches.map((pitch, index) => (
          <div
            key={index}
            className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-200 hover:bg-gray-100 transition"
          >
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="inline-block bg-blue-500 text-white font-bold text-xs px-2 py-1 rounded">
                  Zone {pitch.zone}
                </span>
                <span className={`text-xs font-semibold ${getQualityColor(pitch.contact_quality)}`}>
                  {pitch.contact_quality}
                </span>
                <span className="text-xs font-semibold text-gray-600">
                  {getTypeLabel(pitch.contact_type)}
                </span>
                <span className="text-xs font-semibold text-gray-600">
                  {getLocationLabel(pitch.contact_location)}
                </span>
              </div>
              {pitch.notes && (
                <p className="text-xs text-gray-500 italic">{pitch.notes}</p>
              )}
            </div>

            <div className="flex gap-2 ml-3">
              <button
                onClick={() => onEditPitch(index)}
                className="text-xs font-medium text-blue-600 hover:text-blue-800 px-2 py-1"
              >
                Edit
              </button>
              <button
                onClick={() => onDeletePitch(index)}
                className="text-xs font-medium text-red-600 hover:text-red-800 px-2 py-1"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
