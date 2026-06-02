import { useState, useCallback } from 'react'
import { supabase } from '../supabase'

export function useAthleteAccess() {
  const [accessCode, setAccessCode] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const getAccessCode = useCallback(async (athleteId) => {
    if (!athleteId) return
    try {
      setIsLoading(true)
      setError(null)
      const { data, error: fetchError } = await supabase
        .from('athletes')
        .select('access_code')
        .eq('id', athleteId)
        .single()
      if (fetchError) throw fetchError
      setAccessCode(data?.access_code || null)
      return data?.access_code
    } catch (err) {
      console.error('Error fetching access code:', err)
      setError(err.message)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [])

  const linkParentUsingAccessCode = useCallback(async (parentUserId, athleteAccessCode) => {
    try {
      setIsLoading(true)
      setError(null)

      // Find athlete by access code
      const { data: athlete, error: athleteError } = await supabase
        .from('athletes')
        .select('id, name')
        .eq('access_code', athleteAccessCode)
        .single()

      if (athleteError) {
        throw new Error('Invalid access code. Please check and try again.')
      }

      // Create parent-athlete relationship
      const { error: linkError } = await supabase
        .from('parent_athlete_relationships')
        .upsert(
          {
            parent_user_id: parentUserId,
            athlete_id: athlete.id,
            verified: true,
          },
          { onConflict: 'parent_user_id,athlete_id' }
        )

      if (linkError) throw linkError

      return {
        success: true,
        athleteId: athlete.id,
        athleteName: athlete.name,
        message: `Successfully linked to ${athlete.name}!`,
      }
    } catch (err) {
      console.error('Error linking parent:', err)
      setError(err.message)
      return { success: false, message: err.message }
    } finally {
      setIsLoading(false)
    }
  }, [])

  const unlinkParent = useCallback(async (parentUserId, athleteId) => {
    try {
      setIsLoading(true)
      setError(null)

      const { error: unlinkError } = await supabase
        .from('parent_athlete_relationships')
        .delete()
        .eq('parent_user_id', parentUserId)
        .eq('athlete_id', athleteId)

      if (unlinkError) throw unlinkError

      return { success: true, message: 'Successfully unlinked.' }
    } catch (err) {
      console.error('Error unlinking parent:', err)
      setError(err.message)
      return { success: false, message: err.message }
    } finally {
      setIsLoading(false)
    }
  }, [])

  const getLinkedAthletes = useCallback(async (parentUserId) => {
    try {
      setIsLoading(true)
      setError(null)

      const { data, error: fetchError } = await supabase
        .from('parent_athlete_relationships')
        .select('athlete_id, athletes(id, name, access_code)')
        .eq('parent_user_id', parentUserId)
        .eq('verified', true)

      if (fetchError) throw fetchError

      return data?.map(rel => rel.athletes).filter(Boolean) || []
    } catch (err) {
      console.error('Error fetching linked athletes:', err)
      setError(err.message)
      return []
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    accessCode,
    isLoading,
    error,
    getAccessCode,
    linkParentUsingAccessCode,
    unlinkParent,
    getLinkedAthletes,
  }
}
