import { useState, useCallback } from 'react'
import { supabase } from '../supabase'

export function usePitchingSessions(athleteId) {
  const [sessions, setSessions] = useState([])
  const [toast, setToast] = useState(null)

  const showToast = (message) => {
    setToast(message)
    setTimeout(() => setToast(null), 3000)
  }

  const fetchSessions = useCallback(async () => {
    if (!athleteId) return []
    const { data, error } = await supabase
      .from('daily_sessions')
      .select('*')
      .eq('athlete_id', athleteId)
      .order('date', { ascending: false })
    if (error) throw error
    setSessions(data || [])
    return data
  }, [athleteId])

  const addSession = async (sessionData) => {
    const { data, error } = await supabase
      .from('daily_sessions')
      .insert([{ ...sessionData, athlete_id: athleteId }])
      .select()
    if (error) throw error
    setSessions(prev => [data[0], ...prev])
    return data[0]
  }

  return {
    sessions,
    addSession,
    toast,
    fetchSessions,
  }
}
