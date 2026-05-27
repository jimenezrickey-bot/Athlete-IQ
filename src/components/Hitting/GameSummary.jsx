export function GameSummary({ atBats, onViewAtBat }) {
  const getResultEmoji = (result) => {
    const emojis = {
      strikeout: '⚾',
      single: '1️⃣',
      double: '2️⃣',
      triple: '3️⃣',
      home_run: '🚀',
      out: '❌',
      walk: '🚶',
      hbp: '💥',
      sac_fly: '🦅',
      reached_on_error: '📝',
    }
    return emojis[result] || '❓'
  }

  const getResultLabel = (result) => {
    const labels = {
      strikeout: 'Strikeout',
      single: 'Single',
      double: 'Double',
      triple: 'Triple',
      home_run: 'Home Run',
      out: 'Out',
      walk: 'Walk',
      hbp: 'Hit by Pitch',
      sac_fly: 'Sac Fly',
      reached_on_error: 'Reached on Error',
    }
    return labels[result] || result
  }

  if (atBats.length === 0) {
    return (
      <div className="bg-gray-50 rounded-lg border-2 border-gray-200 p-6">
        <p className="text-sm text-gray-500 text-center">No at-bats logged yet.</p>
      </div>
    )
  }

  const hits = atBats.filter(ab => ['single', 'double', 'triple', 'home_run'].includes(ab.result)).length
  const strikeouts = atBats.filter(ab => ab.result === 'strikeout').length
  const walks = atBats.filter(ab => ab.result === 'walk').length
  const outs = atBats.filter(ab => ab.result === 'out').length
  const qabs = atBats.filter(ab => ab.is_qab).length
  const qabPercentage = atBats.length > 0 ? Math.round((qabs / atBats.length) * 100) : 0

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <h4 className="text-sm font-semibold text-gray-700 mb-4 uppercase">Game Summary</h4>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
        <div className="text-center bg-blue-50 p-3 rounded-lg">
          <p className="text-xs text-gray-600 font-semibold mb-1">AB</p>
          <p className="text-2xl font-bold text-blue-600">{atBats.length}</p>
        </div>
        <div className="text-center bg-green-50 p-3 rounded-lg">
          <p className="text-xs text-gray-600 font-semibold mb-1">H</p>
          <p className="text-2xl font-bold text-green-600">{hits}</p>
        </div>
        <div className="text-center bg-yellow-50 p-3 rounded-lg">
          <p className="text-xs text-gray-600 font-semibold mb-1">K</p>
          <p className="text-2xl font-bold text-yellow-600">{strikeouts}</p>
        </div>
        <div className="text-center bg-purple-50 p-3 rounded-lg">
          <p className="text-xs text-gray-600 font-semibold mb-1">BB</p>
          <p className="text-2xl font-bold text-purple-600">{walks}</p>
        </div>
        <div className="text-center bg-orange-50 p-3 rounded-lg">
          <p className="text-xs text-gray-600 font-semibold mb-1">QAB%</p>
          <p className="text-2xl font-bold text-orange-600">{qabPercentage}%</p>
        </div>
      </div>

      {/* At-Bat List */}
      <div className="space-y-2 max-h-64 overflow-y-auto">
        {atBats.map((atBat, index) => (
          <button
            key={atBat.id}
            onClick={() => onViewAtBat(atBat.id)}
            className="w-full flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-200 hover:bg-gray-100 transition text-left"
          >
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <span className="inline-block bg-gray-300 text-white font-bold text-xs px-2 py-1 rounded">
                  AB {atBat.at_bat_num}
                </span>
                <span className="text-sm font-semibold text-gray-700">
                  {atBat.pitch_count} pitch{atBat.pitch_count !== 1 ? 'es' : ''}
                </span>
              </div>
              {atBat.notes && (
                <p className="text-xs text-gray-500 italic mt-1">{atBat.notes}</p>
              )}
            </div>

            <div className="text-right ml-3">
              {atBat.result && (
                <>
                  <div className="flex items-center justify-end gap-2 mb-1">
                    <span className="text-lg">{getResultEmoji(atBat.result)}</span>
                    {atBat.is_qab && (
                      <span className="inline-block bg-orange-500 text-white font-bold text-xs px-2 py-1 rounded">
                        QAB
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-600 font-semibold">{getResultLabel(atBat.result)}</p>
                </>
              )}
              {atBat.rbis > 0 && (
                <p className="text-xs text-green-600 font-semibold mt-1">{atBat.rbis} RBI</p>
              )}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
