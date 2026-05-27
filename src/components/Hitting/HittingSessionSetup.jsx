import { useState } from 'react'

export function HittingSessionSetup({ onStartSession, sessionInProgress }) {
  const [setupData, setSetupData] = useState({
    session_date: new Date().toISOString().split('T')[0],
    opponent: '',
    mode: 'live_manual',
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setSetupData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleStart = (e) => {
    e.preventDefault()

    if (!setupData.opponent.trim()) {
      alert('Please enter an opponent name')
      return
    }

    onStartSession(setupData)
  }

  // If session is in progress, show different UI
  if (sessionInProgress) {
    return (
      <div className="bg-green-50 rounded-lg shadow p-6 mb-6 border-2 border-green-300">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <div>
            <h3 className="font-semibold text-gray-800">Session in progress</h3>
            <p className="text-sm text-gray-600">Select zones and log pitches below</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <h3 className="text-lg font-semibold text-gray-800 mb-4">New Hitting Session</h3>

      <form onSubmit={handleStart}>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Session Date
            </label>
            <input
              type="date"
              name="session_date"
              value={setupData.session_date}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Opponent
            </label>
            <input
              type="text"
              name="opponent"
              value={setupData.opponent}
              onChange={handleChange}
              placeholder="e.g., Central High"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Entry Mode
          </label>
          <div className="flex gap-3">
            <label className="flex items-center cursor-pointer">
              <input
                type="radio"
                name="mode"
                value="live_manual"
                checked={setupData.mode === 'live_manual'}
                onChange={handleChange}
                className="mr-2"
              />
              <span className="text-sm text-gray-700">Live Manual</span>
            </label>
            <label className="flex items-center cursor-pointer opacity-50 cursor-not-allowed">
              <input
                type="radio"
                name="mode"
                value="gamechanger_import"
                disabled
                className="mr-2"
              />
              <span className="text-sm text-gray-500">GameChanger Import (Coming Soon)</span>
            </label>
          </div>
        </div>

        <button
          type="submit"
          className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition"
        >
          Start Session
        </button>
      </form>
    </div>
  )
}
