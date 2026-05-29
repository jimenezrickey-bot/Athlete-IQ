import { useState, useEffect } from 'react'

export function AtBatEditor({ atBat, onSave, onCancel }) {
  const [selectedResult, setSelectedResult] = useState(atBat?.result || '')
  const [rbis, setRbis] = useState(atBat?.rbis || 0)
  const [runnersAdvanced, setRunnersAdvanced] = useState(atBat?.runners_advanced || '')
  const [hitType, setHitType] = useState(atBat?.hit_type || 'normal')
  const [sacType, setSacType] = useState(atBat?.sac_type || '')
  const [notes, setNotes] = useState(atBat?.notes || '')
  const [inning, setInning] = useState(atBat?.inning || 1)
  const [outs, setOuts] = useState(atBat?.outs ?? 0)
  const [runners1b, setRunners1b] = useState(atBat?.runners_1b ?? false)
  const [runners2b, setRunners2b] = useState(atBat?.runners_2b ?? false)
  const [runners3b, setRunners3b] = useState(atBat?.runners_3b ?? false)
  const [scoreBefore, setScoreBefore] = useState(atBat?.score_before || '')

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

    onSave({
      result: selectedResult,
      rbis: parseInt(rbis) || 0,
      runners_advanced: runnersAdvanced,
      hit_type: hitType,
      sac_type: sacType || null,
      notes: notes,
      inning: parseInt(inning),
      outs: parseInt(outs),
      runners_1b: runners1b,
      runners_2b: runners2b,
      runners_3b: runners3b,
      score_before: scoreBefore,
    })
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-lg max-w-2xl w-full my-8">
        {/* Header */}
        <div className="bg-blue-50 border-b border-blue-200 p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800">
            Edit At-Bat #{atBat?.at_bat_num}
          </h2>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-6 max-h-96 overflow-y-auto">
          {/* Game Situation Section */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase">
              Game Situation
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Inning
                </label>
                <select
                  value={inning}
                  onChange={(e) => setInning(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
                    <option key={i} value={i}>
                      {i}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Outs</label>
                <select
                  value={outs}
                  onChange={(e) => setOuts(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                  <option value={0}>0 outs</option>
                  <option value={1}>1 out</option>
                  <option value={2}>2 outs</option>
                </select>
              </div>
            </div>

            {/* Runners on Base */}
            <div className="mt-3">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Runners on Base
              </label>
              <div className="flex gap-4">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={runners1b}
                    onChange={(e) => setRunners1b(e.target.checked)}
                    className="mr-2 rounded"
                  />
                  <span className="text-sm text-gray-700">1B</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={runners2b}
                    onChange={(e) => setRunners2b(e.target.checked)}
                    className="mr-2 rounded"
                  />
                  <span className="text-sm text-gray-700">2B</span>
                </label>
                <label className="flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={runners3b}
                    onChange={(e) => setRunners3b(e.target.checked)}
                    className="mr-2 rounded"
                  />
                  <span className="text-sm text-gray-700">3B</span>
                </label>
              </div>
            </div>

            {/* Score */}
            <div className="mt-3">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Score Before (Away-Home, e.g. "3-2")
              </label>
              <input
                type="text"
                value={scoreBefore}
                onChange={(e) => setScoreBefore(e.target.value)}
                placeholder="e.g., 3-2"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
          </div>

          {/* Result Selection */}
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3 uppercase">Result</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {results.map((result) => (
                <button
                  key={result.id}
                  type="button"
                  onClick={() => setSelectedResult(result.id)}
                  className={`p-2 rounded-lg border-2 font-medium transition text-center text-sm ${
                    selectedResult === result.id
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-300 bg-white hover:border-gray-400'
                  }`}
                >
                  <span className="text-lg mr-1">{result.emoji}</span>
                  <div>{result.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* RBIs & Runners Advanced */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">RBIs</label>
              <input
                type="number"
                min="0"
                max="4"
                value={rbis}
                onChange={(e) => setRbis(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Runners Advanced
              </label>
              <input
                type="text"
                value={runnersAdvanced}
                onChange={(e) => setRunnersAdvanced(e.target.value)}
                placeholder="e.g., 2B→3B, 3B→H"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              />
            </div>
          </div>

          {/* Hit Type & Sacrifice Type */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Hit Type</label>
              <div className="flex gap-2 flex-col">
                <label className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="hit_type"
                    value="normal"
                    checked={hitType === 'normal'}
                    onChange={(e) => setHitType(e.target.value)}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700">Normal</span>
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sacrifice Type
              </label>
              <select
                value={sacType}
                onChange={(e) => setSacType(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
              >
                <option value="">None</option>
                <option value="sac_bunt">Sac Bunt</option>
                <option value="sac_drag">Sac Drag</option>
                <option value="squeeze">Squeeze</option>
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="e.g., Single to left field on first pitch"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows="2"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 sticky bottom-0 bg-white pt-4 border-t">
            <button
              type="submit"
              disabled={!selectedResult}
              className="flex-1 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded-lg transition"
            >
              Save At-Bat
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
    </div>
  )
}
