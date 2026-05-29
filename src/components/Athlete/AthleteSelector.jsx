import { useState, useEffect } from 'react'
import { useAuth } from '../../lib/hooks/useAuth'
import { useAthleteAccess } from '../../lib/hooks/useAthleteAccess'
import { ParentLinkForm } from './ParentLinkForm'

export function AthleteSelector() {
  const { user, athletes, currentAthlete, switchAthlete, fetchAthletes } = useAuth()
  const { getAccessCode } = useAthleteAccess()
  const [accessCode, setAccessCode] = useState(null)
  const [showLinkForm, setShowLinkForm] = useState(false)
  const [copied, setCopied] = useState(false)

  // Fetch current athlete's access code
  useEffect(() => {
    if (currentAthlete) {
      getAccessCode(currentAthlete.id).then((code) => setAccessCode(code))
    }
  }, [currentAthlete, getAccessCode])

  const handleAthleteChange = (athlete) => {
    switchAthlete(athlete)
    getAccessCode(athlete.id).then((code) => setAccessCode(code))
  }

  const handleLinked = async (athleteId) => {
    setShowLinkForm(false)
    // Refresh athletes list
    await fetchAthletes(user.id, user.role)
  }

  const copyAccessCode = () => {
    if (accessCode) {
      navigator.clipboard.writeText(accessCode)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  // Show link form if parent has no athletes
  if (user?.role === 'parent' && (!athletes || athletes.length === 0) && !showLinkForm) {
    return (
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6">
        <p className="text-sm text-yellow-700">
          👋 No athletes linked yet.{' '}
          <button
            onClick={() => setShowLinkForm(true)}
            className="font-semibold underline hover:text-yellow-900"
          >
            Link to an athlete
          </button>{' '}
          using their access code.
        </p>
      </div>
    )
  }

  if (showLinkForm) {
    return (
      <div className="mb-6">
        <ParentLinkForm onLinked={handleLinked} onCancel={() => setShowLinkForm(false)} />
      </div>
    )
  }

  if (!currentAthlete) return null

  return (
    <div className="bg-blue-50 rounded-lg border border-blue-200 p-4 mb-6">
      {/* Athlete selector */}
      {athletes.length > 1 && (
        <div className="mb-4">
          <label className="text-xs font-semibold text-gray-600 uppercase mb-2 block">
            Select Athlete
          </label>
          <div className="flex gap-2 flex-wrap">
            {athletes.map((athlete) => (
              <button
                key={athlete.id}
                onClick={() => handleAthleteChange(athlete)}
                className={`px-3 py-1 rounded text-sm font-medium transition ${
                  currentAthlete.id === athlete.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                }`}
              >
                {athlete.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Access code display */}
      <div className="bg-white rounded p-3">
        <p className="text-xs text-gray-600 mb-1">
          <strong>{currentAthlete.name}'s Access Code</strong>
        </p>
        <div className="flex items-center gap-2">
          <code className="text-lg font-mono font-bold text-blue-600 flex-1 break-all">
            {accessCode || 'Loading...'}
          </code>
          <button
            onClick={copyAccessCode}
            disabled={!accessCode}
            title="Copy to clipboard"
            className="px-2 py-1 text-sm bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 rounded transition"
          >
            {copied ? '✓' : '📋'}
          </button>
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Share this code with coaches, parents, or anyone who needs to log data.
        </p>
      </div>

      {/* Link more athletes button for parents */}
      {user?.role === 'parent' && (
        <button
          onClick={() => setShowLinkForm(true)}
          className="mt-3 text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          + Link another athlete
        </button>
      )}
    </div>
  )
}
