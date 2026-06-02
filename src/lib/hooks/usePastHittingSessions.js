import { useState, useCallback } from 'react'
import { supabase } from '../supabase'
import { evaluateQAB } from '../utils/qabEvaluator'

export function usePastHittingSessions(athleteId) {
  const [sessions, setSessions] = useState([])
  const [currentGame, setCurrentGame] = useState(null)
  const [gameAtBats, setGameAtBats] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [toast, setToast] = useState(null)

  const showToast = useCallback((message, duration = 3000) => {
    setToast(message)
    setTimeout(() => setToast(null), duration)
  }, [])

  const fetchPastSessions = useCallback(async (dateStart = null, dateEnd = null) => {
    if (!athleteId) return
    try {
      setIsLoading(true)
      let query = supabase
        .from('hitting_sessions')
        .select('*')
        .eq('athlete_id', athleteId)
        .eq('status', 'complete')
        .order('date', { ascending: false })
      if (dateStart) query = query.gte('date', dateStart)
      if (dateEnd) query = query.lte('date', dateEnd)
      const { data, error } = await query
      if (error) throw error
      setSessions(data || [])
    } catch (error) {
      console.error('Error fetching past sessions:', error)
      showToast('Error loading past sessions', 4000)
    } finally {
      setIsLoading(false)
    }
  }, [athleteId, showToast])

  const fetchGameDetail = useCallback(async (sessionId) => {
    try {
      setIsLoading(true)
      const { data: sessionData, error: sessionError } = await supabase
        .from('hitting_sessions')
        .select('*')
        .eq('id', sessionId)
        .single()
      if (sessionError) throw sessionError
      setCurrentGame(sessionData)

      const { data: atBatsData, error: atBatsError } = await supabase
        .from('at_bats')
        .select('*')
        .eq('session_id', sessionId)
        .order('at_bat_number', { ascending: true })
      if (atBatsError) throw atBatsError

      const atBatsWithPitches = await Promise.all(
        (atBatsData || []).map(async (atBat) => {
          const { data: pitches, error: pitchError } = await supabase
            .from('hitting_events')
            .select('*')
            .eq('at_bat_id', atBat.id)
            .order('created_at', { ascending: true })
          if (pitchError) throw pitchError
          return {
            ...atBat,
            pitches: (pitches || []).map((p, i) => ({ ...p, pitch_num: i + 1 })),
          }
        })
      )
      setGameAtBats(atBatsWithPitches)
    } catch (error) {
      console.error('Error fetching game detail:', error)
      showToast('Error loading game details', 4000)
    } finally {
      setIsLoading(false)
    }
  }, [showToast])

  const updateAtBat = useCallback(async (atBatId, updatedData) => {
    try {
      const currentAtBat = gameAtBats.find(ab => ab.id === atBatId)
      if (!currentAtBat) return
      const qabResult = evaluateQAB(
        { ...currentAtBat, ...updatedData },
        currentAtBat.pitches
      )
      const { error } = await supabase
        .from('at_bats')
        .update({
          result: updatedData.result,
          rbis: updatedData.rbis || 0,
          notes: updatedData.notes || null,
          inning: updatedData.inning || currentAtBat.inning,
          outs: updatedData.outs ?? currentAtBat.outs,
          runners_on_base: {
            first: updatedData.runners_1b ?? false,
            second: updatedData.runners_2b ?? false,
            third: updatedData.runners_3b ?? false,
          },
          is_qab: qabResult.isQAB,
          qab_criteria: qabResult.criteria
            ? JSON.stringify(qabResult.criteria)
            : null,
        })
        .eq('id', atBatId)
      if (error) throw error
      setGameAtBats(prev =>
        prev.map(ab =>
          ab.id === atBatId
            ? { ...ab, ...updatedData, is_qab: qabResult.isQAB, qab_criteria: qabResult.criteria }
            : ab
        )
      )
      showToast('At-bat updated', 2000)
    } catch (error) {
      console.error('Error updating at-bat:', error)
      showToast('Error updating at-bat', 4000)
    }
  }, [gameAtBats, showToast])

  const updatePitch = useCallback(async (pitchId, updatedData) => {
    try {
      const { error } = await supabase
        .from('hitting_events')
        .update({
          strike_zone_location: updatedData.zone ?? undefined,
          pitch_outcome: updatedData.pitch_outcome ?? undefined,
          contact_quality: updatedData.contact_quality ?? undefined,
          contact_location: updatedData.contact_location ?? undefined,
          contact_type: updatedData.contact_type ?? undefined,
          notes: updatedData.notes ?? undefined,
        })
        .eq('id', pitchId)
      if (error) throw error
      setGameAtBats(prev =>
        prev.map(atBat => ({
          ...atBat,
          pitches: atBat.pitches.map(p =>
            p.id === pitchId ? { ...p, ...updatedData } : p
          ),
        }))
      )
      showToast('Pitch updated', 2000)
    } catch (error) {
      console.error('Error updating pitch:', error)
      showToast('Error updating pitch', 4000)
    }
  }, [showToast])

  const deletePitch = useCallback(async (pitchId, atBatId) => {
    try {
      const { error } = await supabase
        .from('hitting_events')
        .delete()
        .eq('id', pitchId)
      if (error) throw error
      setGameAtBats(prev =>
        prev.map(atBat => {
          if (atBat.id !== atBatId) return atBat
          const newPitches = atBat.pitches
            .filter(p => p.id !== pitchId)
            .map((p, i) => ({ ...p, pitch_num: i + 1 }))
          return { ...atBat, pitches: newPitches, pitch_count: newPitches.length }
        })
      )
      showToast('Pitch deleted', 2000)
    } catch (error) {
      console.error('Error deleting pitch:', error)
      showToast('Error deleting pitch', 4000)
    }
  }, [showToast])

  const addPitch = useCallback(async (atBatId, pitchData) => {
    try {
      const currentAtBat = gameAtBats.find(ab => ab.id === atBatId)
      if (!currentAtBat) return
      const pitchNum = currentAtBat.pitches.length + 1
      const { data, error } = await supabase
        .from('hitting_events')
        .insert([{
          at_bat_id: atBatId,
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
      setGameAtBats(prev =>
        prev.map(ab => {
          if (ab.id !== atBatId) return ab
          return {
            ...ab,
            pitches: [...ab.pitches, { ...data[0], pitch_num: pitchNum }],
            pitch_count: pitchNum,
          }
        })
      )
      showToast(`Pitch #${pitchNum} added`, 2000)
    } catch (error) {
      console.error('Error adding pitch:', error)
      showToast('Error adding pitch', 4000)
    }
  }, [gameAtBats, athleteId, showToast])

  const deleteAtBat = useCallback(async (atBatId) => {
    try {
      const { error: pitchError } = await supabase
        .from('hitting_events')
        .delete()
        .eq('at_bat_id', atBatId)
      if (pitchError) throw pitchError
      const { error: atBatError } = await supabase
        .from('at_bats')
        .delete()
        .eq('id', atBatId)
      if (atBatError) throw atBatError
      setGameAtBats(prev => prev.filter(ab => ab.id !== atBatId))
      showToast('At-bat deleted', 2000)
    } catch (error) {
      console.error('Error deleting at-bat:', error)
      showToast('Error deleting at-bat', 4000)
    }
  }, [showToast])

  const deleteSession = useCallback(async (sessionId) => {
    try {
      const { data: atBats, error: fetchError } = await supabase
        .from('at_bats')
        .select('id')
        .eq('session_id', sessionId)
      if (fetchError) throw fetchError
      if (atBats && atBats.length > 0) {
        const atBatIds = atBats.map(ab => ab.id)
        const { error: pitchError } = await supabase
          .from('hitting_events')
          .delete()
          .in('at_bat_id', atBatIds)
        if (pitchError) throw pitchError
      }
      const { error: atBatError } = await supabase
        .from('at_bats')
        .delete()
        .eq('session_id', sessionId)
      if (atBatError) throw atBatError
      const { error: sessionError } = await supabase
        .from('hitting_sessions')
        .delete()
        .eq('id', sessionId)
      if (sessionError) throw sessionError
      setSessions(prev => prev.filter(s => s.id !== sessionId))
      setCurrentGame(null)
      setGameAtBats([])
      showToast('Game deleted', 2000)
    } catch (error) {
      console.error('Error deleting game:', error)
      showToast('Error deleting game', 4000)
    }
  }, [showToast])

  return {
    sessions,
    currentGame,
    gameAtBats,
    isLoading,
    toast,
    fetchPastSessions,
    fetchGameDetail,
    updateAtBat,
    updatePitch,
    deletePitch,
    deleteAtBat,
    deleteSession,
    addPitch,
  }
}
