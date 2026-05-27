import { useState } from 'react'

export function GameSituationSelector({ onSave, onCancel, initialData }) {
  const [situation, setSituation] = useState(initialData || {
    inning: 1,
    outs: 0,
    runners_1b: false,
    runners_2b: false,
    runners_3b: false,
    score_home: 0,
    score_away: 0,
  })

  const handleChange = (field, value) => {
    setSituation(prev => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave({
      inning: situation.inning,
      outs: situation.outs,
      runners_1b: situation.runners_1b,
      runners_2b: situation.runners_2b,
      runners_3b: situation.runners_3b,
      score_before: `${situation.score_away}-${situation.score_home}`,
    })
  }

  return (
    <div className="bg-white rounded-lg shadow p-4 sm:p-6 mb-6 border-2 border-blue-300">
      <h4 className="text-sm font-semibold text-gray-700 mb-4 uppercase">Game Situation</h4>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4">
          {/* Inning */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Inning
            </label>
            <select
              value={situation.inning}
              onChange={(e) => handleChange('inning', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(i => (
                <option key={i} value={i}>{i}</option>
              ))}
            </select>
          </div>

          {/* Outs */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Outs
            </label>
            <select
              value={situation.outs}
              onChange={(e) => handleChange('outs', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={0}>0 outs</option>
              <option value={1}>1 out</option>
              <option value={2}>2 outs</option>
            </select>
          </div>
        </div>

        {/* Runners on Base */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Runners on Base
          </label>
          <div className="flex gap-4">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={situation.runners_1b}
                onChange={(e) => handleChange('runners_1b', e.target.checked)}
                className="mr-2 rounded"
              />
              <span className="text-sm text-gray-700">1B</span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={situation.runners_2b}
                onChange={(e) => handleChange('runners_2b', e.target.checked)}
                className="mr-2 rounded"
              />
              <span className="text-sm text-gray-700">2B</span>
            </label>
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={situation.runners_3b}
                onChange={(e) => handleChange('runners_3b', e.target.checked)}
                className="mr-2 rounded"
              />
              <span className="text-sm text-gray-700">3B</span>
            </label>
          </div>
        </div>

        {/* Score */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Away Score
            </label>
            <input
              type="number"
              min="0"
              value={situation.score_away}
              onChange={(e) => handleChange('score_away', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Home Score
            </label>
            <input
              type="number"
              min="0"
              value={situation.score_home}
              onChange={(e) => handleChange('score_home', parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3">
          <button
            type="submit"
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition"
          >
            Continue to At-Bat
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
