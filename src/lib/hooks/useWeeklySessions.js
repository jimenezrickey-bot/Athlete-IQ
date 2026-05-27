import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../supabase'
import { usePolling } from './usePolling'

export function useWeeklySessions(weekStartDate, userId) {
  const [sessions, setSessions] = useState({})
  const [templates, setTemplates] = useState([])
  const [selectedDay, setSelectedDay] = useState(0)
  const [toast, setToast] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const showToast = (message) => {
    setToast(message)
    setTimeout(() => setToast(null), 3000)
  }

  const getWeekDates = useCallback((startDate) => {
    const start = new Date(startDate)
    const dates = {}
    for (let i = 0; i < 7; i++) {
      const date = new Date(start)
      date.setDate(date.getDate() + i)
      const dateStr = date.toISOString().split('T')[0]
      dates[i] = dateStr
    }
    return dates
  }, [])

  const fetchWorkoutTemplates = useCallback(async () => {
    const { data, error } = await supabase
      .from('workout_templates')
      .select('*')
      .order('day_of_week', { ascending: true })

    if (error) throw error
    return data || []
  }, [])

  const fetchWeekSessions = useCallback(async () => {
    if (!userId || !weekStartDate) return {}

    const weekDates = getWeekDates(weekStartDate)
    const dateStrings = Object.values(weekDates)

    const { data, error } = await supabase
      .from('daily_sessions')
      .select('*')
      .eq('user_id', userId)
      .in('session_date', dateStrings)

    if (error) throw error

    const sessionsByDate = {}
    data?.forEach(session => {
      sessionsByDate[session.session_date] = session
    })
    return sessionsByDate
  }, [userId, weekStartDate, getWeekDates])

  const initializeData = useCallback(async () => {
    setIsLoading(true)
    try {
      const [fetchedTemplates, fetchedSessions] = await Promise.all([
        fetchWorkoutTemplates(),
        fetchWeekSessions(),
      ])
      setTemplates(fetchedTemplates)
      setSessions(fetchedSessions)
      setSelectedDay(0)
    } finally {
      setIsLoading(false)
    }
  }, [fetchWorkoutTemplates, fetchWeekSessions])

  useEffect(() => {
    initializeData()
  }, [weekStartDate, userId, initializeData])

  const { data: polledSessions, refetch } = usePolling(fetchWeekSessions, 5000, !!userId)

  if (polledSessions && JSON.stringify(polledSessions) !== JSON.stringify(sessions)) {
    const newSessions = Object.entries(polledSessions).filter(
      ([date, session]) => !sessions[date] || sessions[date].id !== session.id
    )
    if (newSessions.length > 0) {
      setSessions(polledSessions)
      showToast(`New session logged by another user`)
    }
  }

  const saveSession = async (sessionDate, sessionData) => {
    try {
      const dayOfWeek = new Date(sessionDate).getDay()

      const { data, error } = await supabase
        .from('daily_sessions')
        .upsert({
          user_id: userId,
          session_date: sessionDate,
          day_of_week: dayOfWeek,
          ...sessionData,
          status: 'saved',
          updated_at: new Date().toISOString(),
        })
        .select()

      if (error) throw error

      setSessions(prev => ({
        ...prev,
        [sessionDate]: data[0],
      }))

      showToast('✓ Session saved')
      return data[0]
    } catch (error) {
      showToast(`Error: ${error.message}`)
      throw error
    }
  }

  const getWeekStats = useCallback(() => {
    const stats = {
      daysLogged: 0,
      totalThrows: 0,
      peakEffort: 0,
      totalBullpen: 0,
    }

    Object.values(sessions).forEach(session => {
      if (session) {
        stats.daysLogged += 1
        stats.totalThrows += session.throw_count_total || 0
        stats.peakEffort = Math.max(stats.peakEffort, session.peak_effort_percent || 0)
        stats.totalBullpen += session.bullpen_pitches || 0
      }
    })

    return stats
  }, [sessions])

  return {
    sessions,
    templates,
    selectedDay,
    setSelectedDay,
    saveSession,
    toast,
    isLoading,
    weekDates: getWeekDates(weekStartDate),
    stats: getWeekStats(),
    refetch,
  }
}
