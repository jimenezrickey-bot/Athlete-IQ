import { useState, useEffect } from 'react'
import { useAuth } from '../../lib/hooks/useAuth'
import { useWeeklySessions } from '../../lib/hooks/useWeeklySessions'
import { Toast } from '../common/Toast'

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

const DAY_PROGRAMS = {
  0: { label: 'Medium', type: 'medium', drills: ['Plyo warm-up', 'Medium throwing block (40-50 throws, build to 75% effort, 105-120 ft)'] },
  1: { label: 'Light', type: 'light', drills: ['Reverse throws × 10', 'Constraint picks (blue) × 10', 'Light throwing block (20-30 throws, low effort)'] },
  2: { label: 'Heavy + Bullpen', type: 'heavy', drills: ['Reverse throws × 10', 'Constraint picks (blue) × 10', 'Short split rockers w/ constraint (3R, 3Y, 3Grey)', 'Heavy throwing block (50-65 throws, build to 90-95% effort)', 'Pulldown (1 every 5-10 ft back in to 60 ft)', 'Lighter bullpen (15-20 pitches)'] },
  3: { label: 'Off / Recovery', type: 'off', drills: [] },
  4: { label: 'Medium (Prep Day)', type: 'medium', drills: ['Reverse throws × 10', 'Constraint picks (blue) × 8', 'Short split rockers w/ constraint (3R, 3Y)', 'Plyos', 'Medium throwing block (40-50 throws, build to 75% effort, 90-105 ft)'] },
  5: { label: 'Heavy Bullpen', type: 'bullpen', drills: ['Heavy bullpen (30+ pitches)'] },
  6: { label: 'Off / Recovery', type: 'off', drills: [] },
}

const getMonday = (date) => {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  return new Date(d.setDate(diff)).toISOString().split('T')[0]
}

export function PitchingWeeklyDashboard() {
  const { currentAthlete } = useAuth()
  const [weekStartDate, setWeekStartDate] = useState(getMonday(new Date()))

  const {
    sessions,
    selectedDay,
    setSelectedDay,
    saveSession,
    toast,
    isLoading,
    weekDates,
    stats,
  } = useWeeklySessions(weekStartDate, currentAthlete?.id)

  const [formData, setFormData] = useState({
    throw_count: '',
    effort_percent: '',
    max_distance: '',
    bullpen_pitches: '',
    bullpen_strikes: '',
    bullpen_effort: '',
    notes: '',
    drills_completed: [],
  })

  const [isSaving, setIsSaving] = useState(false)
  const [submitMessage, setSubmitMessage] = useState(null)

  const selectedDate = weekDates[selectedDay]
  const existingSession = sessions[selectedDate]
  const dayProgram = DAY_PROGRAMS[selectedDay]

  useEffect(() => {
    if (existingSession) {
      setFormData({
        throw_count: existingSession.throw_count || '',
        effort_percent: existingSession.effort_percent || '',
        max_distance: existingSession.max_distance || '',
        bullpen_pitches: existingSession.bullpen_pitches || '',
        bullpen_strikes: existingSession.bullpen_strikes || '',
        bullpen_effort: existingSession.bullpen_effort || '',
        notes: existingSession.notes || '',
        drills_completed: existingSession.drills_completed || [],
      })
    } else {
      setFormData({
        throw_count: '',
        effort_percent: '',
        max_distance: '',
        bullpen_pitches: '',
        bullpen_strikes: '',
        bullpen_effort: '',
        notes: '',
        drills_completed: [],
      })
    }
  }, [selectedDay, existingSession])

  const handleDrillToggle = (drill) => {
    setFormData(prev => ({
      ...prev,
      drills_completed: prev.drills_completed.includes(drill)
        ? prev.drills_completed.filter(d => d !== drill)
        : [...prev.drills_completed, drill],
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSaving(true)
    setSubmitMessage(null)
    try {
      await saveSession(selectedDate, {
        day_type: dayProgram.label,
        throw_count: formData.throw_count ? parseInt(formData.throw_count) : null,
        effort_percent: formData.effort_percent ? parseInt(formData.effort_percent) : null,
        max_distance: formData.max_distance ? parseInt(formData.max_distance) : null,
        bullpen_pitches: formData.bullpen_pitches ? parseInt(formData.bullpen_pitches) : null,
        bullpen_strikes: formData.bullpen_strikes ? parseInt(formData.bullpen_strikes) : null,
        bullpen_effort: formData.bullpen_effort ? parseInt(formData.bullpen_effort) : null,
        notes: formData.notes || null,
        drills_completed: formData.drills_completed,
      })
      setSubmitMessage({ text: '✓ Session saved', type: 'success' })
    } catch (error) {
      setSubmitMessage({ text: `Error: ${error.message}`, type: 'error' })
    } finally {
      setIsSaving(false)
    }
  }

  const handlePrevWeek = () => {
    const prev = new Date(weekStartDate)
    prev.setDate(prev.getDate() - 7)
    setWeekStartDate(prev.toISOString().split('T')[0])
  }

  const handleNextWeek = () => {
    const next = new Date(weekStartDate)
    next.setDate(next.getDate() + 7)
    setWeekStartDate(next.toISOString().split('T')[0])
  }

  const formatWeekRange = () => {
    const start = new Date(weekStartDate + 'T00:00:00')
    const end = new Date(start)
    end.setDate(start.getDate() + 6)
    return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
  }

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (!currentAthlete) {
    return (
      <div className="text-center py-12 text-gray-500">
        No athlete selected. Please select an athlete to continue.
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto px-3 sm:px-4 py-6">
      {(toast || submitMessage) && (
        <Toast message={submitMessage?.text || toast} type={submitMessage?.type || 'info'} />
      )}

      <h1 className="text-2xl font-bold text-gray-800 mb-6">Pitching Tracker</h1>

      {/* Week navigation */}
      <div className="flex items-center justify-between mb-4 bg-white rounded-lg shadow p-3">
        <button onClick={handlePrevWeek} className="p-2 hover:bg-gray-100 rounded">◀</button>
        <span className="text-sm font-medium text-gray-700">{formatWeekRange()}</span>
        <button onClick={handleNextWeek} className="p-2 hover:bg-gray-100 rounded">▶</button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-white rounded-lg shadow p-3">
          <div className="text-xs text-gray-500">Days logged</div>
          <div className="text-2xl font-bold">{stats.daysLogged}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-3">
          <div className="text-xs text-gray-500">Total throws</div>
          <div className="text-2xl font-bold">{stats.totalThrows}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-3">
          <div className="text-xs text-gray-500">Peak effort</div>
          <div className="text-2xl font-bold">{stats.peakEffort ? `${stats.peakEffort}%` : '—'}</div>
        </div>
        <div className="bg-white rounded-lg shadow p-3">
          <div className="text-xs text-gray-500">Bullpen pitches</div>
          <div className="text-2xl font-bold">{stats.totalBullpen}</div>
        </div>
      </div>

      {/* Day selector */}
      <div className="flex gap-1 overflow-x-auto pb-2 mb-4">
        {DAYS.map((day, i) => {
          const date = weekDates[i]
          const hasSession = !!sessions[date]
          return (
            <button
              key={i}
              onClick={() => setSelectedDay(i)}
              className={`flex-shrink-0 flex flex-col items-center px-3 py-2 rounded-lg text-xs font-medium transition ${
                selectedDay === i
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              <span>{day.slice(0, 3)}</span>
              <span className="text-xs opacity-75">{DAY_PROGRAMS[i].label.split(' ')[0]}</span>
              {hasSession && <span className="w-1.5 h-1.5 rounded-full bg-green-400 mt-1"></span>}
            </button>
          )
        })}
      </div>

      {/* Day content */}
      {dayProgram.type === 'off' ? (
        <div className="bg-white rounded-lg shadow p-8 text-center text-gray-400">
          <div className="text-4xl mb-2">🌙</div>
          <div className="font-medium">{DAYS[selectedDay]} — Rest & Recovery</div>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          {/* Drills */}
          <div className="bg-white rounded-lg shadow p-4 mb-4">
            <h3 className="font-semibold text-gray-700 mb-3">{dayProgram.label}</h3>
            <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-2">Drills</div>
            <div className="space-y-2">
              {dayProgram.drills.map((drill, i) => (
                <div
                  key={i}
                  onClick={() => handleDrillToggle(drill)}
                  className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition ${
                    formData.drills_completed.includes(drill)
                      ? 'bg-green-50 border-green-200'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <div className={`w-5 h-5 rounded flex-shrink-0 border-2 flex items-center justify-center mt-0.5 ${
                    formData.drills_completed.includes(drill)
                      ? 'bg-green-500 border-green-500'
                      : 'border-gray-300'
                  }`}>
                    {formData.drills_completed.includes(drill) && (
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                  <span className="text-sm text-gray-700">{drill}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Throw log */}
          {dayProgram.type !== 'bullpen' && (
            <div className="bg-white rounded-lg shadow p-4 mb-4">
              <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">Throw log</div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Total throws</label>
                  <input
                    type="number"
                    inputMode="numeric"
                    placeholder="e.g. 48"
                    value={formData.throw_count}
                    onChange={e => setFormData(prev => ({ ...prev, throw_count: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Peak effort %</label>
                  <input
                    type="number"
                    inputMode="numeric"
                    placeholder="e.g. 75"
                    value={formData.effort_percent}
                    onChange={e => setFormData(prev => ({ ...prev, effort_percent: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs text-gray-500 mb-1">Max distance (ft)</label>
                  <input
                    type="number"
                    inputMode="numeric"
                    placeholder="e.g. 120"
                    value={formData.max_distance}
                    onChange={e => setFormData(prev => ({ ...prev, max_distance: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Bullpen log */}
          {(dayProgram.type === 'heavy' || dayProgram.type === 'bullpen') && (
            <div className="bg-white rounded-lg shadow p-4 mb-4">
              <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">Bullpen log</div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Pitches thrown</label>
                  <input
                    type="number"
                    inputMode="numeric"
                    placeholder="e.g. 18"
                    value={formData.bullpen_pitches}
                    onChange={e => setFormData(prev => ({ ...prev, bullpen_pitches: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Strikes</label>
                  <input
                    type="number"
                    inputMode="numeric"
                    placeholder="e.g. 13"
                    value={formData.bullpen_strikes}
                    onChange={e => setFormData(prev => ({ ...prev, bullpen_strikes: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs text-gray-500 mb-1">Effort %</label>
                  <input
                    type="number"
                    inputMode="numeric"
                    placeholder="e.g. 90"
                    value={formData.bullpen_effort}
                    onChange={e => setFormData(prev => ({ ...prev, bullpen_effort: e.target.value }))}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="bg-white rounded-lg shadow p-4 mb-4">
            <div className="text-xs font-medium text-gray-400 uppercase tracking-wide mb-3">Notes / arm feel</div>
            <textarea
              placeholder="How did the arm feel? Anything for the coach..."
              value={formData.notes}
              onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm resize-none"
            />
          </div>

          <button
            type="submit"
            disabled={isSaving}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 rounded-lg transition"
          >
            {isSaving ? 'Saving...' : 'Save session'}
          </button>
        </form>
      )}
    </div>
  )
}
