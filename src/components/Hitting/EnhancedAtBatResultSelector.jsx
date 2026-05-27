import { useState } from 'react'

export function EnhancedAtBatResultSelector({ onCompleteAtBat, onCancel, initialData }) {
  const [selectedResult, setSelectedResult] = useState(initialData?.result || '')
  const [rbis, setRbis] = useState(initialData?.rbis || 0)
  const [runnersAdvanced, setRunnersAdvanced] = useState(initialData?.runners_advanced || '')
  const [hitType, setHitType] = useState(initialData?.hit_type || 'normal')
  const [sacType, setSacType] = useState(initialData?.sac_type || '')
  const [notes, setNotes] = useState(initialData?.notes || '')

  const results = [
    { id: 'strikeout', label: 'Strikeout', emoji: '⚾' },
    { id: 'single', label: 'Single', emoji: '1️⃣' },
    { id: 'double', label: 'Double', emoji: '2️⃣' },
    { id: 'triple', label: 'Triple', emoji: '3️⃣' },
    { id: 'home_run', label: 'Home Run', emoji: '🚀' },
    { id: 'out', label: 'Out', emoji: '❌' },
    { id: 'walk', label: 'Walk', emoji: '🚶' },
    { id: 'hbp', label: 'Hit by Pitch', emoji: '💥' },
    { id: 'sac_fly', label: 'Sac Fly', emoji: '🦅' },
    { id: 'reached_on_error', label: 'Reached on Error', emoji: '📝' },
  ]

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!selectedResult) {
      alert('Please select an at-bat result')
      return
    }

    onCompleteAtBat({
      result: selectedResult,
      rbis: parseInt(rbis) || 0,
      runners_advanced: runnersAdvanced,
      hit_type: hitType,
      sac_type: sacType || null,
      notes: notes,
    })

    // Reset form
    setSelectedResult('')
    setRbis(0)
    setRunnersAdvanced('')
    setHitType('normal')
    setSacType('')
    setNotes('')
  }

  return (
    <div className="bg-white rounded-lg shadow p-4 sm:p-6 mb-6 border-2 border-green-300">
      <h4 className="text-sm font-semibold text-gray-700 mb-4 uppercase">At-Bat Result</h4>

      <form onSubmit={handleSubmit}>
        {/* Result Selection */}
        <div className="mb-4">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Result
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {results.map(result => (
              <button
                key={result.id}
                type="button"
                onClick={() => setSelectedResult(result.id)}
                className={`
                  p-2 sm:p-3 rounded-lg border-2 font-medium transition text-center text-sm sm:text-base
                  ${selectedResult === result.id
                    ? 'border-green-500 bg-green-50'
                    : 'border-gray-300 bg-white hover:border-gray-400'
                  }
                `}
              >
                <span className="text-lg mr-1">{result.emoji}</span>
                {result.label}
              </button>
            ))}
          </div>
        </div>

        {/* RBIs */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            RBIs
          </label>
          <input
            type="number"
            min="0"
            max="4"
            value={rbis}
            onChange={(e) => setRbis(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Runners Advanced */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Runners Advanced (e.g., "2B→3B, 3B→H")
          </label>
          <textarea
            value={runnersAdvanced}
            onChange={(e) => setRunnersAdvanced(e.target.value)}
            placeholder="1B→2B, 2B→3B, 3B→H, etc."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
            rows="2"
          />
        </div>

        {/* Hit Type */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Hit Type
          </label>
          <div className="flex gap-3">
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="hit_type"
                value="normal"
                checked={hitType === 'normal'}
                onChange={(e) => setHitType(e.target.value)}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Normal Hit</span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="hit_type"
                value="bunt"
                checked={hitType === 'bunt'}
                onChange={(e) => setHitType(e.target.value)}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Bunt</span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="hit_type"
                value="hit_and_run"
                checked={hitType === 'hit_and_run'}
                onChange={(e) => setHitType(e.target.value)}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Hit & Run</span>
            </label>
          </div>
        </div>

        {/* Sacrifice Type */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Sacrifice Play (if applicable)
          </label>
          <select
            value={sacType}
            onChange={(e) => setSacType(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <option value="">None</option>
            <option value="sac_bunt">Sac Bunt</option>
            <option value="sac_drag">Sac Drag</option>
            <option value="squeeze">Squeeze Play</option>
          </select>
        </div>

        {/* Notes */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes (Optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g., Single to left field, 2 outs, on a 1-1 count"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
            rows="2"
          />
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={!selectedResult}
            className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded-lg transition"
          >
            Complete At-Bat
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
