import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../supabase'

export function useHittingSessions(athleteId) {
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

  const fetchSessions = useCallback(async () => {
    if (!athleteId) return
    try {
      setIsLoading(true)
      const { data, error } = await supabase
        .from('hitting_sessions')
        .select('*')
        .eq('athlete_id', athleteId)
        .order('date', { ascending: false })
      if (error) throw error
      setSessions(data || [])
    } catch (error) {
      console.error('Error fetching sessions:', error)
      showToast('Error loading sessions', 4000)
    } finally {
      setIsLoading(false)
    }
  }, [athleteId, showToast])

  const fetchAtBats = useCallback(async (sessionId) => {
    try {
      const { data, error } = await supabase
        .from('at_bats')
        .select('*')
        .eq('session_id', sessionId)
        .order('at_bat_number', { ascending: true })
      if (error) throw error
      setAtBats(data || [])
    } catch (error) {
      console.error('Error fetching at-bats:', error)
      showToast('Error loading at-bats', 4000)
    }
  }, [showToast])

  const fetchPitches = useCallback(async (atBatId) => {
    try {
      const { data, error } = await supabase
        .from('hitting_events')
        .select('*')
        .eq('at_bat_id', atBatId)
        .order('created_at', { ascending: true })
      if (error) throw error
      const renumbered = (data || []).map((p, i) => ({ ...p, pitch_num: i + 1 }))
      setPitches(renumbered)
    } catch (error) {
      console.error('Error fetching pitches:', error)
      showToast('Error loading pitches', 4000)
    }
  }, [showToast])

  const startSession = useCallback(async (setupData) => {
    try {
      const { data, error } = await supabase
        .from('hitting_sessions')
        .insert([{
          athlete_id: athleteId,
          date: setupData.session_date,
          opponent: setupData.opponent,
          mode: setupData.mode,
          status: 'draft',
        }])
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
  }, [athleteId, showToast])

  const startAtBat = useCallback(async () => {
    if (!currentSession) {
      showToast('No game in progress', 3000)
      return
    }
    try {
      const nextAtBatNum = atBats.length + 1
      const { data, error } = await supabase
        .from('at_bats')
        .insert([{
          session_id: currentSession.id,
          athlete_id: athleteId,
          at_bat_number: nextAtBatNum,
        }])
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
  }, [currentSession, atBats.length, athleteId, showToast])

  const setGameSituation = useCallback(async (situationData) => {
    if (!currentAtBat) return
    try {
      const { error } = await supabase
        .from('at_bats')
        .update({
          inning: situationData.inning,
          outs: situationData.outs,
          runners_on_base: {
            first: situationData.runners_1b || false,
            second: situationData.runners_2b || false,
            third: situationData.runners_3b || false,
          },
        })
        .eq('id', currentAtBat.id)
      if (error) throw error
      setCurrentAtBat(prev => ({ ...prev, ...situationData }))
      showToast('Game situation saved', 1500)
    } catch (error) {
      console.error('Error setting game situation:', error)
      showToast('Error saving game situation', 4000)
    }
  }, [currentAtBat, showToast])

  const addPitch = useCallback(async (pitchData) => {
    if (!currentAtBat) {
      showToast('No at-bat in progress', 3000)
      return
    }
    try {
      const pitchNum = pitches.length + 1
      const newPitch = {
        id: `temp-${Date.now()}`,
        at_bat_id: currentAtBat.id,
        athlete_id: athleteId,
        pitch_num: pitchNum,
        strike_zone_location: pitchData.zone,
        pitch_outcome: pitchData.pitch_outcome,
        contact_quality: pitchData.contact_quality || null,
        contact_location: pitchData.contact_location || null,
        contact_type: pitchData.contact_type || null,
        notes: pitchData.notes || null,
      }
      setPitches(prev => [...prev, newPitch])

      const { data, error } = await supabase
        .from('hitting_events')
        .insert([{
          at_bat_id: currentAtBat.id,
          athlete_id: athleteId,
          pitch_num: pitchNum,
          strike_zone_location: pitchData.zone,
          pitch_outcome: pitchData.pitch_outcome,
          contact_quality: pitchData.contact_quality || null,
          contact_location: pitchData.contact_location || null,
          contact_type: pitchData.contact_type || null,
          notes: pitchData.notes || null,
        }])
        .select()
      if (error) throw error

      setPitches(prev => prev.map(p => p.id === newPitch.id ? data[0] : p))
      setCurrentAtBat(prev => ({ ...prev, pitch_count: pitchNum }))
      showToast(`Pitch #${pitchNum} added`, 1500)
    } catch (error) {
      console.error('Error adding pitch:', error)
      setPitches(prev => prev.slice(0, -1))
      showToast(`Error: ${error.message || 'Failed to save pitch'}`, 4000)
    }
  }, [currentAtBat, pitches.length, athleteId, showToast])

  const completeAtBat = useCallback(async (resultData) => {
    if (!currentAtBat) return
    try {
      const { error } = await supabase
        .from('at_bats')
        .update({
          result: resultData.result,
          notes: resultData.notes || null,
          pitch_count: pitches.length,
          inning: currentAtBat.inning || null,
          outs: currentAtBat.outs || null,
          runners_on_base: currentAtBat.runners_on_base || null,
          rbis: resultData.rbis || 0,
          is_qab: resultData.is_qab || false,
          qab_criteria: resultData.qab_criteria
            ? JSON.stringify(resultData.qab_criteria)
            : null,
        })
        .eq('id', currentAtBat.id)
      if (error) throw error

      await fetchAtBats(currentSession.id)
      const qabLabel = resultData.is_qab ? ' ✅ QUALITY AT-BAT' : ''
      setCurrentAtBat(null)
      setPitches([])
      showToast(
        `At-Bat #${currentAtBat.at_bat_number} complete — ${resultData.result}${qabLabel}`,
        2000
      )
    } catch (error) {
      console.error('Error completing at-bat:', error)
      showToast('Error completing at-bat', 4000)
    }
  }, [currentAtBat, pitches.length, currentSession, fetchAtBats, showToast])

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
      setPitches(prev => {
        const updated = [...prev]
        updated[pitchIndex] = { ...updated[pitchIndex], ...updatePayload }
        return updated
      })
      const { error } = await supabase
        .from('hitting_events')
        .update(updatePayload)
        .eq('id', pitch.id)
      if (error) throw error
      showToast('Pitch updated', 2000)
    } catch (error) {
      console.error('Error editing pitch:', error)
      if (currentAtBat) await fetchPitches(currentAtBat.id)
      showToast('Error updating pitch', 4000)
    }
  }, [pitches, currentAtBat, fetchPitches, showToast])

  const deletePitch = useCallback(async (pitchIndex) => {
    if (!pitches[pitchIndex]) return
    const pitch = pitches[pitchIndex]
    try {
      setPitches(prev => prev.filter((_, i) => i !== pitchIndex))
      const { error } = await supabase
        .from('hitting_events')
        .delete()
        .eq('id', pitch.id)
      if (error) throw error
      if (currentAtBat) await fetchPitches(currentAtBat.id)
      showToast('Pitch deleted', 2000)
    } catch (error) {
      console.error('Error deleting pitch:', error)
      if (currentAtBat) await fetchPitches(currentAtBat.id)
      showToast('Error deleting pitch', 4000)
    }
  }, [pitches, currentAtBat, fetchPitches, showToast])

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

  useEffect(() => {
    if (!athleteId || currentSession) return
    const interval = setInterval(() => { fetchSessions() }, 10000)
    return () => clearInterval(interval)
  }, [athleteId, currentSession, fetchSessions])

  useEffect(() => {
    if (athleteId) fetchSessions()
  }, [athleteId, fetchSessions])

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
