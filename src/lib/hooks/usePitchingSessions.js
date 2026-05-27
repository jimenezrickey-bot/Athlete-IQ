import { useState, useCallback } from 'react'
import { usePolling } from './usePolling'
import { supabase } from '../supabase'

export function usePitchingSessions(userId) {
  const [sessions, setSessions] = useState([])
  const [toast, setToast] = useState(null)

  const showToast = (message) => {
    setToast(message)
    setTimeout(() => setToast(null), 3000)
  }

  const fetchSessions = useCallback(async () => {
    if (!userId) return []

    const { data, error } = await supabase
      .from('pitching_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('date', { ascending: false })

    if (error) throw error
    return data
  }, [userId])

  const { data: polledSessions, refetch } = usePolling(fetchSessions, 5000, !!userId)

  if (polledSessions && JSON.stringify(polledSessions) !== JSON.stringify(sessions)) {
    const newSessions = polledSessions.filter(
      ps => !sessions.find(s => s.id === ps.id)
    )
    if (newSessions.length > 0) {
      setSessions(polledSessions)
      showToast(`New session logged by another user`)
    } else {
      setSessions(polledSessions)
    }
  }

  const addSession = async (sessionData) => {
    const { data, error } = await supabase
      .from('pitching_sessions')
      .insert([{ ...sessionData, user_id: userId }])
      .select()

    if (error) throw error

    setSessions([data[0], ...sessions])
    return data[0]
  }

  return {
    sessions,
    addSession,
    toast,
    refetch,
  }
}
