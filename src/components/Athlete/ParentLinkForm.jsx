import { useState } from 'react'
import { useAthleteAccess } from '../../lib/hooks/useAthleteAccess'
import { useAuth } from '../../lib/hooks/useAuth'

export function ParentLinkForm({ onLinked, onCancel }) {
  const { user } = useAuth()
  const { linkParentUsingAccessCode, isLoading, error } = useAthleteAccess()
  const [accessCode, setAccessCode] = useState('')
  const [message, setMessage] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setMessage(null)

    if (!accessCode.trim()) {
      setMessage({ type: 'error', text: 'Please enter an access code' })
      return
    }

    const result = await linkParentUsingAccessCode(user.id, accessCode.trim().toUpperCase())

    if (result.success) {
      setMessage({ type: 'success', text: result.message })
      setAccessCode('')
      // Callback to parent component to refresh athlete list
      if (onLinked) {
        setTimeout(() => onLinked(result.athleteId), 1000)
      }
    } else {
      setMessage({ type: 'error', text: result.message })
    }
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Link to Athlete</h2>
        <p className="text-sm text-gray-600 mb-6">
          Enter the athlete's access code to link their account to yours.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {message && (
            <div
              className={`rounded p-3 text-sm ${
                message.type === 'success'
                  ? 'bg-green-100 border border-green-400 text-green-700'
                  : 'bg-red-100 border border-red-400 text-red-700'
              }`}
            >
              {message.text}
            </div>
          )}

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 rounded p-3 text-sm">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Athlete Access Code
            </label>
            <input
              type="text"
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value.toUpperCase())}
              placeholder="E.g., MAX-2024-ABC123"
              maxLength="20"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
            <p className="text-xs text-gray-500 mt-1">
              Ask the athlete to share their code with you
            </p>
          </div>

          <div className="flex gap-2 pt-4">
            <button
              type="submit"
              disabled={isLoading}
              className="flex-1 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded-lg transition"
            >
              {isLoading ? 'Linking...' : 'Link Athlete'}
            </button>
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg transition"
              >
                Cancel
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  )
}
