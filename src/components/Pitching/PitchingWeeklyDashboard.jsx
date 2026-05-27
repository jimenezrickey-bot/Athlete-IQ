import { useState, useEffect } from 'react'
import { useAuth } from '../../lib/hooks/useAuth'
import { useWeeklySessions } from '../../lib/hooks/useWeeklySessions'
import { Toast } from '../common/Toast'
import { WeekNavigator } from './WeekNavigator'
import { StatsRow } from './StatsRow'
import { DaySelector } from './DaySelector'
import { WorkoutSelector } from './WorkoutSelector'
import { WorkoutDetails } from './WorkoutDetails'
import { ThrowLogForm } from './ThrowLogForm'
import { ArmFeelNotes } from './ArmFeelNotes'
import { SaveStatus } from './SaveStatus'

const getMonday = (date) => {
  const d = new Date(date)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1)
  return new Date(d.setDate(diff)).toISOString().split('T')[0]
}

export function PitchingWeeklyDashboard() {
  const { user } = useAuth()
  const [weekStartDate, setWeekStartDate] = useState(getMonday(new Date()))

  const {
    sessions,
    templates,
    selectedDay,
    setSelectedDay,
    saveSession,
    toast,
    isLoading,
    weekDates,
    stats,
  } = useWeeklySessions(weekStartDate, user?.id)

  const [selectedTemplateId, setSelectedTemplateId] = useState(null)
  const [formData, setFormData] = useState({
    throw_count_total: '',
    peak_effort_percent: '',
    max_distance_ft: '',
    bullpen_pitches: '',
    arm_feel: 'good',
    notes: '',
    selected_drills: [],
  })

  const [sessionStatus, setSessionStatus] = useState('draft')
  const [isSaving, setIsSaving] = useState(false)
  const [submitMessage, setSubmitMessage] = useState(null)

  const defaultTemplate = templates.find(t => t.day_of_week === selectedDay)
  const selectedTemplate = templates.find(t => t.id === selectedTemplateId) || defaultTemplate
  const selectedDate = weekDates[selectedDay]
  const existingSession = sessions[selectedDate]

  useEffect(() => {
    if (defaultTemplate) {
      setSelectedTemplateId(defaultTemplate.id)
    }
  }, [selectedDay, defaultTemplate])

  useEffect(() => {
    if (existingSession) {
      setFormData({
        throw_count_total: existingSession.throw_count_total || '',
        peak_effort_percent: existingSession.peak_effort_percent || '',
        max_distance_ft: existingSession.max_distance_ft || '',
        bullpen_pitches: existingSession.bullpen_pitches || '',
        arm_feel: existingSession.arm_feel || 'good',
        notes: existingSession.notes || '',
        selected_drills: existingSession.selected_drills || [],
        effort_level: existingSession.effort_level || selectedTemplate?.effort_level,
      })
      setSessionStatus(existingSession.status || 'draft')
    } else {
      setFormData({
        throw_count_total: '',
        peak_effort_percent: '',
        max_distance_ft: '',
        bullpen_pitches: '',
        arm_feel: 'good',
        notes: '',
        selected_drills: [],
        effort_level: selectedTemplate?.effort_level,
      })
      setSessionStatus('draft')
    }
  }, [selectedDay, existingSession, selectedTemplate])

  const handleDrillToggle = (drill) => {
    setFormData(prev => ({
      ...prev,
      selected_drills: prev.selected_drills.includes(drill)
        ? prev.selected_drills.filter(d => d !== drill)
        : [...prev.selected_drills, drill],
    }))
    setSessionStatus('draft')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSaving(true)
    setSubmitMessage(null)

    try {
      if (!formData.throw_count_total || formData.peak_effort_percent === '') {
        throw new Error('Please fill in throw count and peak effort')
      }

      await saveSession(selectedDate, {
        throw_count_total: formData.throw_count_total,
        peak_effort_percent: formData.peak_effort_percent,
        max_distance_ft: formData.max_distance_ft || null,
        bullpen_pitches: formData.bullpen_pitches || null,
        arm_feel: formData.arm_feel,
        notes: formData.notes,
        selected_drills: formData.selected_drills,
        effort_level: selectedTemplate?.effort_level,
      })

      setSessionStatus('saved')
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

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
      {(toast || submitMessage) && (
        <Toast message={toast || submitMessage.text} type={submitMessage?.type || 'info'} />
      )}

      <div className="flex justify-between items-center mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Pitching Tracker</h1>
        <button className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium text-blue-600 hover:bg-blue-50 rounded transition">
          Athlete
        </button>
      </div>

      <WeekNavigator
        weekStartDate={weekStartDate}
        onPrevWeek={handlePrevWeek}
        onNextWeek={handleNextWeek}
      />

      <StatsRow stats={stats} />

      <DaySelector
        templates={templates}
        selectedDay={selectedDay}
        onSelectDay={setSelectedDay}
        weekDates={weekDates}
      />

      {templates.length > 0 && (
        <WorkoutSelector
          templates={templates}
          selectedTemplate={selectedTemplate}
          onSelectTemplate={(template) => setSelectedTemplateId(template.id)}
        />
      )}

      <form onSubmit={handleSubmit}>
        <WorkoutDetails
          template={selectedTemplate}
          selectedDrills={formData.selected_drills}
          onDrillToggle={handleDrillToggle}
          loggedDate={selectedDate}
          isDifferentFromDay={selectedTemplate?.id !== defaultTemplate?.id}
        />

        <ThrowLogForm
          formData={formData}
          onChange={setFormData}
        />

        <ArmFeelNotes
          armFeel={formData.arm_feel}
          notes={formData.notes}
          onArmFeelChange={(value) => setFormData(prev => ({ ...prev, arm_feel: value }))}
          onNotesChange={(value) => setFormData(prev => ({ ...prev, notes: value }))}
        />

        <div className="bg-white rounded-lg shadow p-4 sm:p-6 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <SaveStatus status={sessionStatus} isSaving={isSaving} />
          <button
            type="submit"
            disabled={isSaving}
            className="w-full sm:w-auto bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-bold py-2 px-4 sm:px-6 rounded-lg transition"
          >
            {isSaving ? 'Saving...' : 'Save Session'}
          </button>
        </div>
      </form>
    </div>
  )
}
