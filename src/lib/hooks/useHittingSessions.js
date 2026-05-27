import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../supabase'

export function useHittingSessions(userId) {
  const [sessions, setSessions] = useState([])
  const [currentSession, setCurrentSession] = useState(null)
  const [currentAtBat, setCurrentAtBat] = useState(null)
  const [atBats, setAtBats] = useState([])
  const [pitches, setPitches] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [toast, setToast] = useState(null)

  const showToast = useCallback((message, duration = 3000) => {
    setToast(message)
    setTimeout(() => setToast(null), duration)
  }, [])

  // Fetch all sessions for the user
  const fetchSessions = useCallback(async () => {
    if (!userId) return

    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('hitting_sessions')
        .select('*')
        .eq('user_id', userId)
        .order('date', { ascending: false })

      if (error) throw error
      setSessions(data || [])
    } catch (error) {
      console.error('Error fetching sessions:', error)
      showToast('Error loading sessions', 4000)
    } finally {
      setIsLoading(false)
    }
  }, [userId, showToast])

  // Fetch at-bats for a session
  const fetchAtBats = useCallback(async (sessionId) => {
    try {
      const { data, error } = await supabase
        .from('at_bats')
        .select('*')
        .eq('session_id', sessionId)
        .order('at_bat_num', { ascending: true })

      if (error) throw error
      setAtBats(data || [])
    } catch (error) {
      console.error('Error fetching at-bats:', error)
      showToast('Error loading at-bats', 4000)
    }
  }, [showToast])

  // Fetch pitches for an at-bat
  const fetchPitches = useCallback(async (atBatId) => {
    try {
      const { data, error } = await supabase
        .from('hitting_events')
        .select('*')
        .eq('at_bat_id', atBatId)
        .order('created_at', { ascending: true })

      if (error) throw error
      // Renumber pitches by their order in the array to ensure sequential numbering
      const renumberedPitches = (data || []).map((pitch, index) => ({
        ...pitch,
        pitch_num: index + 1,
      }))
      setPitches(renumberedPitches)
    } catch (error) {
      console.error('Error fetching pitches:', error)
      showToast('Error loading pitches', 4000)
    }
  }, [showToast])

  // Start a new session
  const startSession = useCallback(async (setupData) => {
    try {
      const { data, error } = await supabase
        .from('hitting_sessions')
        .insert([
          {
            user_id: userId,
            date: setupData.session_date,
            opponent: setupData.opponent,
            mode: setupData.mode,
            status: 'in_progress',
          },
        ])
        .select()

      if (error) throw error

      const newSession = data[0]
      setCurrentSession(newSession)
      setAtBats([])
      setCurrentAtBat(null)
      setPitches([])
      showToast('Game started', 2000)
      return newSession
    } catch (error) {
      console.error('Error starting session:', error)
      showToast('Error starting session', 4000)
      throw error
    }
  }, [userId, showToast])

  // Start a new at-bat within current session
  const startAtBat = useCallback(async () => {
    if (!currentSession) {
      showToast('No game in progress', 3000)
      return
    }

    try {
      const nextAtBatNum = atBats.length + 1

      const { data, error } = await supabase
        .from('at_bats')
        .insert([
          {
            session_id: currentSession.id,
            at_bat_num: nextAtBatNum,
            status: 'draft',
          },
        ])
        .select()

      if (error) throw error

      const newAtBat = data[0]
      setCurrentAtBat(newAtBat)
      setPitches([])
      showToast(`At-Bat #${nextAtBatNum} started`, 2000)
      return newAtBat
    } catch (error) {
      console.error('Error starting at-bat:', error)
      showToast('Error starting at-bat', 4000)
      throw error
    }
  }, [currentSession, atBats.length, showToast])

  // Set game situation for current at-bat
  const setGameSituation = useCallback(async (situationData) => {
    if (!currentAtBat) {
      showToast('No at-bat in progress', 3000)
      return
    }

    try {
      const { error } = await supabase
        .from('at_bats')
        .update({
          inning: situationData.inning,
          outs: situationData.outs,
          runners_1b: situationData.runners_1b,
          runners_2b: situationData.runners_2b,
          runners_3b: situationData.runners_3b,
          score_before: situationData.score_before,
        })
        .eq('id', currentAtBat.id)

      if (error) throw error

      // Update local state
      const updatedAtBat = { ...currentAtBat, ...situationData }
      setCurrentAtBat(updatedAtBat)

      showToast('Game situation saved', 1500)
    } catch (error) {
      console.error('Error setting game situation:', error)
      showToast('Error saving game situation', 4000)
    }
  }, [currentAtBat, showToast])

  // Add a pitch to current at-bat
  const addPitch = useCallback(async (pitchData) => {
    if (!currentAtBat) {
      showToast('No at-bat in progress', 3000)
      return
    }

    try {
      const pitchNum = pitches.length + 1

      // Optimistic update
      const newPitch = {
        id: `temp-${Date.now()}`,
        at_bat_id: currentAtBat.id,
        pitch_num: pitchNum,
        strike_zone_location: pitchData.zone,
        pitch_outcome: pitchData.pitch_outcome,
        contact_quality: pitchData.contact_quality || null,
        contact_location: pitchData.contact_location || null,
        contact_type: pitchData.contact_type || null,
        notes: pitchData.notes || null,
      }

      setPitches(prev => [...prev, newPitch])

      // Save to Supabase
      const { data, error } = await supabase
        .from('hitting_events')
        .insert([
          {
            at_bat_id: currentAtBat.id,
            pitch_num: pitchNum,
            strike_zone_location: pitchData.zone,
            pitch_outcome: pitchData.pitch_outcome,
            contact_quality: pitchData.contact_quality || null,
            contact_location: pitchData.contact_location || null,
            contact_type: pitchData.contact_type || null,
            notes: pitchData.notes || null,
          },
        ])
        .select()

      if (error) throw error

      // Replace temp ID with real ID
      setPitches(prev =>
        prev.map(p =>
          p.id === newPitch.id ? data[0] : p
        )
      )

      // Update at-bat pitch count
      const updatedAtBat = { ...currentAtBat, pitch_count: pitchNum }
      setCurrentAtBat(updatedAtBat)

      console.log(`✓ Pitch #${pitchNum} added:`, {
        outcome: pitchData.pitch_outcome,
        zone: pitchData.zone,
        contact: pitchData.contact_quality ? `${pitchData.contact_quality} ${pitchData.contact_location}` : 'none',
      })
      showToast(`Pitch #${pitchNum} added`, 1500)
    } catch (error) {
      console.error('Error adding pitch:', error)
      console.error('Pitch data:', pitchData)
      console.error('Current at-bat:', currentAtBat)
      setPitches(prev => prev.slice(0, -1))
      showToast(`Error: ${error.message || 'Failed to save pitch'}`, 4000)
    }
  }, [currentAtBat, pitches.length, showToast])

  // Complete current at-bat with result
  const completeAtBat = useCallback(async (resultData) => {
    if (!currentAtBat) {
      showToast('No at-bat in progress', 3000)
      return
    }

    try {
      const { error } = await supabase
        .from('at_bats')
        .update({
          result: resultData.result,
          notes: resultData.notes || null,
          status: 'complete',
          pitch_count: pitches.length,
          inning: currentAtBat.inning || null,
          outs: currentAtBat.outs || null,
          runners_1b: currentAtBat.runners_1b || false,
          runners_2b: currentAtBat.runners_2b || false,
          runners_3b: currentAtBat.runners_3b || false,
          score_before: currentAtBat.score_before || null,
          rbis: resultData.rbis || 0,
          runners_advanced: resultData.runners_advanced || null,
          hit_type: resultData.hit_type || null,
          sac_type: resultData.sac_type || null,
          is_qab: resultData.is_qab || false,
          qab_criteria: resultData.qab_criteria ? JSON.stringify(resultData.qab_criteria) : null,
        })
        .eq('id', currentAtBat.id)

      if (error) throw error

      // Refresh at-bats list
      await fetchAtBats(currentSession.id)

      const qabLabel = resultData.is_qab ? ' ✅ QUALITY AT-BAT' : ''
      setCurrentAtBat(null)
      setPitches([])
      showToast(`At-Bat #${currentAtBat.at_bat_num} complete — ${resultData.result}${qabLabel}`, 2000)
    } catch (error) {
      console.error('Error completing at-bat:', error)
      showToast('Error completing at-bat', 4000)
    }
  }, [currentAtBat, pitches.length, currentSession, fetchAtBats, showToast])

  // Edit a pitch
  const editPitch = useCallback(async (pitchIndex, updatedData) => {
    if (!pitches[pitchIndex]) return

    const pitch = pitches[pitchIndex]

    try {
      const updatePayload = {
        strike_zone_location: updatedData.zone ?? pitch.strike_zone_location,
        pitch_outcome: updatedData.pitch_outcome ?? pitch.pitch_outcome,
        contact_quality: updatedData.contact_quality ?? pitch.contact_quality,
        contact_location: updatedData.contact_location ?? pitch.contact_location,
        contact_type: updatedData.contact_type ?? pitch.contact_type,
        notes: updatedData.notes ?? pitch.notes,
      }

      // Optimistic update
      setPitches(prev => {
        const newPitches = [...prev]
        newPitches[pitchIndex] = { ...newPitches[pitchIndex], ...updatePayload }
        return newPitches
      })

      // Save to Supabase
      const { error } = await supabase
        .from('hitting_events')
        .update(updatePayload)
        .eq('id', pitch.id)

      if (error) throw error

      showToast('Pitch updated', 2000)
    } catch (error) {
      console.error('Error editing pitch:', error)
      if (currentAtBat) {
        await fetchPitches(currentAtBat.id)
      }
      showToast('Error updating pitch', 4000)
    }
  }, [pitches, currentAtBat, fetchPitches, showToast])

  // Delete a pitch
  const deletePitch = useCallback(async (pitchIndex) => {
    if (!pitches[pitchIndex]) return

    const pitch = pitches[pitchIndex]

    try {
      // Optimistic update
      setPitches(prev => prev.filter((_, i) => i !== pitchIndex))

      // Save to Supabase
      const { error } = await supabase
        .from('hitting_events')
        .delete()
        .eq('id', pitch.id)

      if (error) throw error

      // Renumber remaining pitches
      if (currentAtBat) {
        await fetchPitches(currentAtBat.id)
      }

      showToast('Pitch deleted', 2000)
    } catch (error) {
      console.error('Error deleting pitch:', error)
      if (currentAtBat) {
        await fetchPitches(currentAtBat.id)
      }
      showToast('Error deleting pitch', 4000)
    }
  }, [pitches, currentAtBat, fetchPitches, showToast])

  // End game session
  const endSession = useCallback(async () => {
    if (!currentSession) return

    try {
      const { error } = await supabase
        .from('hitting_sessions')
        .update({ status: 'complete' })
        .eq('id', currentSession.id)

      if (error) throw error

      setCurrentSession(null)
      setCurrentAtBat(null)
      setAtBats([])
      setPitches([])
      await fetchSessions()
      showToast('Game ended', 2000)
    } catch (error) {
      console.error('Error ending session:', error)
      showToast('Error ending session', 4000)
    }
  }, [currentSession, fetchSessions, showToast])

  // Polling for other users' sessions (disabled during active game)
  useEffect(() => {
    if (!userId || currentSession) return // Don't poll while game is in progress

    const interval = setInterval(() => {
      fetchSessions()
    }, 10000) // Poll every 10 seconds

    return () => clearInterval(interval)
  }, [userId, currentSession, fetchSessions])

  // Initial load
  useEffect(() => {
    if (userId) {
      fetchSessions()
    }
  }, [userId, fetchSessions])

  return {
    sessions,
    currentSession,
    currentAtBat,
    atBats,
    pitches,
    isLoading,
    toast,
    startSession,
    startAtBat,
    setGameSituation,
    addPitch,
    editPitch,
    deletePitch,
    completeAtBat,
    endSession,
    fetchSessions,
    fetchAtBats,
    fetchPitches,
  }
}
