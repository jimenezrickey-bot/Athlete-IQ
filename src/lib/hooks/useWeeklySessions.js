import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../supabase'

export function useWeeklySessions(weekStartDate, athleteId) {
  const [sessions, setSessions] = useState({})
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

  const fetchWeekSessions = useCallback(async () => {
    if (!athleteId || !weekStartDate) return {}

    const weekDates = getWeekDates(weekStartDate)
    const dateStrings = Object.values(weekDates)

    const { data, error } = await supabase
      .from('daily_sessions')
      .select('*')
      .eq('athlete_id', athleteId)
      .in('date', dateStrings)

    if (error) throw error

    const sessionsByDate = {}
    data?.forEach(session => {
      sessionsByDate[session.date] = session
    })
    return sessionsByDate
  }, [athleteId, weekStartDate, getWeekDates])

  const initializeData = useCallback(async () => {
    setIsLoading(true)
    try {
      const fetchedSessions = await fetchWeekSessions()
      setSessions(fetchedSessions)
      setSelectedDay(0)
    } finally {
      setIsLoading(false)
    }
  }, [fetchWeekSessions])

  useEffect(() => {
    initializeData()
  }, [weekStartDate, athleteId, initializeData])

  const saveSession = async (sessionDate, sessionData) => {
    try {
      const { data, error } = await supabase
        .from('daily_sessions')
        .upsert({
          athlete_id: athleteId,
          date: sessionDate,
          ...sessionData,
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
        stats.totalThrows += session.throw_count || 0
        stats.peakEffort = Math.max(stats.peakEffort, session.effort_percent || 0)
        stats.totalBullpen += session.bullpen_pitches || 0
      }
    })

    return stats
  }, [sessions])

  return {
    sessions,
    selectedDay,
    setSelectedDay,
    saveSession,
    toast,
    isLoading,
    weekDates: getWeekDates(weekStartDate),
    stats: getWeekStats(),
  }
}
