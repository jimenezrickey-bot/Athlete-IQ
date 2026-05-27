import { useState } from 'react'

export function AtBatResultSelector({ onCompleteAtBat, onCancel }) {
  const [selectedResult, setSelectedResult] = useState('')
  const [notes, setNotes] = useState('')

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
      notes,
    })

    setSelectedResult('')
    setNotes('')
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6 border-2 border-green-300">
      <h4 className="text-sm font-semibold text-gray-700 mb-4 uppercase">At-Bat Result</h4>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
          {results.map(result => (
            <button
              key={result.id}
              type="button"
              onClick={() => setSelectedResult(result.id)}
              className={`
                p-3 rounded-lg border-2 font-medium transition text-left
                ${selectedResult === result.id
                  ? 'border-green-500 bg-green-50'
                  : 'border-gray-300 bg-white hover:border-gray-400'
                }
              `}
            >
              <span className="text-lg mr-2">{result.emoji}</span>
              {result.label}
            </button>
          ))}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            At-Bat Notes (Optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g., Single to left field, 2 outs, runner on 1st"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
            rows="2"
          />
        </div>

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
