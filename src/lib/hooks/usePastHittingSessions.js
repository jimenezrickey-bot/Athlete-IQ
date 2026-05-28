import { useState, useCallback } from 'react'
import { supabase } from '../supabase'
import { evaluateQAB } from '../utils/qabEvaluator'

export function usePastHittingSessions(userId) {
  const [sessions, setSessions] = useState([])
  const [currentGame, setCurrentGame] = useState(null)
  const [gameAtBats, setGameAtBats] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [toast, setToast] = useState(null)

  const showToast = useCallback((message, duration = 3000) => {
    setToast(message)
    setTimeout(() => setToast(null), duration)
  }, [])

  // Fetch past sessions with optional date range
  const fetchPastSessions = useCallback(async (dateStart = null, dateEnd = null) => {
    if (!userId) return

    try {
      setIsLoading(true)
      let query = supabase
        .from('hitting_sessions')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'complete')
        .order('date', { ascending: false })

      if (dateStart) {
        query = query.gte('date', dateStart)
      }
      if (dateEnd) {
        query = query.lte('date', dateEnd)
      }

      const { data, error } = await query

      if (error) throw error
      setSessions(data || [])
    } catch (error) {
      console.error('Error fetching past sessions:', error)
      showToast('Error loading past sessions', 4000)
    } finally {
      setIsLoading(false)
    }
  }, [userId, showToast])

  // Fetch all at-bats for a specific game
  const fetchGameDetail = useCallback(async (sessionId) => {
    try {
      setIsLoading(true)

      // Get the session
      const { data: sessionData, error: sessionError } = await supabase
        .from('hitting_sessions')
        .select('*')
        .eq('id', sessionId)
        .single()

      if (sessionError) throw sessionError

      setCurrentGame(sessionData)

      // Get all at-bats for this session with their pitches
      const { data: atBatsData, error: atBatsError } = await supabase
        .from('at_bats')
        .select('*')
        .eq('session_id', sessionId)
        .order('at_bat_num', { ascending: true })

      if (atBatsError) throw atBatsError

      // Fetch pitches for each at-bat
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
            pitches: (pitches || []).map((pitch, index) => ({
              ...pitch,
              pitch_num: index + 1,
            })),
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

  // Update an at-bat with new data
  const updateAtBat = useCallback(async (atBatId, updatedData) => {
    try {
      // Get current at-bat and its pitches for QAB recalculation
      const currentAtBat = gameAtBats.find((ab) => ab.id === atBatId)
      if (!currentAtBat) {
        showToast('At-bat not found', 3000)
        return
      }

      // Evaluate QAB with updated data
      const qabResult = evaluateQAB(
        { ...currentAtBat, ...updatedData },
        currentAtBat.pitches
      )

      // Update Supabase
      const { error } = await supabase
        .from('at_bats')
        .update({
          result: updatedData.result,
          rbis: updatedData.rbis || 0,
          runners_advanced: updatedData.runners_advanced || null,
          hit_type: updatedData.hit_type || 'normal',
          sac_type: updatedData.sac_type || null,
          notes: updatedData.notes || null,
          inning: updatedData.inning || currentAtBat.inning,
          outs: updatedData.outs ?? currentAtBat.outs,
          runners_1b: updatedData.runners_1b ?? currentAtBat.runners_1b,
          runners_2b: updatedData.runners_2b ?? currentAtBat.runners_2b,
          runners_3b: updatedData.runners_3b ?? currentAtBat.runners_3b,
          score_before: updatedData.score_before || currentAtBat.score_before,
          is_qab: qabResult.isQAB,
          qab_criteria: qabResult.criteria ? JSON.stringify(qabResult.criteria) : null,
        })
        .eq('id', atBatId)

      if (error) throw error

      // Update local state
      setGameAtBats((prev) =>
        prev.map((ab) =>
          ab.id === atBatId
            ? {
                ...ab,
                ...updatedData,
                is_qab: qabResult.isQAB,
                qab_criteria: qabResult.criteria,
              }
            : ab
        )
      )

      showToast('At-bat updated', 2000)
    } catch (error) {
      console.error('Error updating at-bat:', error)
      showToast('Error updating at-bat', 4000)
    }
  }, [gameAtBats, showToast])

  // Update a pitch
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

      // Update local state - find and update the pitch in the correct at-bat
      setGameAtBats((prev) =>
        prev.map((atBat) => ({
          ...atBat,
          pitches: atBat.pitches.map((pitch) =>
            pitch.id === pitchId ? { ...pitch, ...updatedData } : pitch
          ),
        }))
      )

      showToast('Pitch updated', 2000)
    } catch (error) {
      console.error('Error updating pitch:', error)
      showToast('Error updating pitch', 4000)
    }
  }, [showToast])

  // Delete a pitch
  const deletePitch = useCallback(async (pitchId, atBatId) => {
    try {
      const { error } = await supabase
        .from('hitting_events')
        .delete()
        .eq('id', pitchId)

      if (error) throw error

      // Update local state and re-renumber pitches
      setGameAtBats((prev) =>
        prev.map((atBat) => {
          if (atBat.id !== atBatId) return atBat

          const newPitches = atBat.pitches
            .filter((p) => p.id !== pitchId)
            .map((p, index) => ({
              ...p,
              pitch_num: index + 1,
            }))

          // Recalculate pitch count for the at-bat
          return {
            ...atBat,
            pitches: newPitches,
            pitch_count: newPitches.length,
          }
        })
      )

      showToast('Pitch deleted', 2000)
    } catch (error) {
      console.error('Error deleting pitch:', error)
      showToast('Error deleting pitch', 4000)
    }
  }, [showToast])

  // Add a new pitch to an at-bat
  const addPitch = useCallback(async (atBatId, pitchData) => {
    try {
      const currentAtBat = gameAtBats.find((ab) => ab.id === atBatId)
      if (!currentAtBat) {
        showToast('At-bat not found', 3000)
        return
      }

      const pitchNum = currentAtBat.pitches.length + 1

      const { data, error } = await supabase
        .from('hitting_events')
        .insert([
          {
            at_bat_id: atBatId,
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

      // Update local state
      setGameAtBats((prev) =>
        prev.map((ab) => {
          if (ab.id !== atBatId) return ab

          return {
            ...ab,
            pitches: [
              ...ab.pitches,
              {
                ...data[0],
                pitch_num: pitchNum,
              },
            ],
            pitch_count: pitchNum,
          }
        })
      )

      showToast(`Pitch #${pitchNum} added`, 2000)
    } catch (error) {
      console.error('Error adding pitch:', error)
      showToast('Error adding pitch', 4000)
    }
  }, [gameAtBats, showToast])

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
    addPitch,
  }
}
