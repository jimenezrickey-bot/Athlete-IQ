import { useState } from 'react'
import { useAuth } from '../../lib/hooks/useAuth'
import { usePitchingSessions } from '../../lib/hooks/usePitchingSessions'
import { Toast } from '../common/Toast'

export function PitchingForm() {
  const { user } = useAuth()
  const { addSession, toast } = usePitchingSessions(user?.id)

  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    drills: '',
    throw_count_total: '',
    effort_percent: 75,
    bullpen_pitches: '',
    arm_feel: 'good',
    notes: '',
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState(null)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'effort_percent' || name === 'throw_count_total'
        ? parseInt(value) || ''
        : name === 'bullpen_pitches'
        ? value === '' ? '' : parseInt(value)
        : value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitMessage(null)

    try {
      await addSession(formData)
      setSubmitMessage({ text: '✓ Pitching session logged!', type: 'success' })
      setFormData({
        date: new Date().toISOString().split('T')[0],
        drills: '',
        throw_count_total: '',
        effort_percent: 75,
        bullpen_pitches: '',
        arm_feel: 'good',
        notes: '',
      })
    } catch (error) {
      setSubmitMessage({ text: `Error: ${error.message}`, type: 'error' })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-6">Log Pitching Session</h2>

      {(toast || submitMessage) && (
        <Toast message={toast || submitMessage.text} type={submitMessage?.type || 'info'} />
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Date</label>
          <input
            type="date"
            name="date"
            value={formData.date}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Drills (comma-separated)</label>
          <input
            type="text"
            name="drills"
            value={formData.drills}
            onChange={handleChange}
            placeholder="e.g., Long toss 120ft, PFP, Bullpen"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Total Throw Count</label>
          <input
            type="number"
            name="throw_count_total"
            value={formData.throw_count_total}
            onChange={handleChange}
            placeholder="e.g., 85"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Effort % ({formData.effort_percent}%)</label>
          <input
            type="range"
            name="effort_percent"
            min="0"
            max="100"
            value={formData.effort_percent}
            onChange={handleChange}
            className="w-full"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Bullpen Pitches</label>
          <input
            type="number"
            name="bullpen_pitches"
            value={formData.bullpen_pitches}
            onChange={handleChange}
            placeholder="e.g., 25"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Arm Feel</label>
          <select
            name="arm_feel"
            value={formData.arm_feel}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="great">Great</option>
            <option value="good">Good</option>
            <option value="okay">Okay</option>
            <option value="tight">Tight</option>
            <option value="sore">Sore</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Notes</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="Any additional notes..."
            rows="4"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded-lg transition"
        >
          {isSubmitting ? 'Logging...' : 'Log Session'}
        </button>
      </form>
    </div>
  )
}
