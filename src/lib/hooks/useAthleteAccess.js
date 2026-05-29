import { useState, useCallback } from 'react'
import { supabase } from '../supabase'

export function useAthleteAccess() {
  const [accessCode, setAccessCode] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  // Get athlete's access code
  const getAccessCode = useCallback(async (athleteId) => {
    if (!athleteId) return

    try {
      setIsLoading(true)
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

  // Generate guest token for current game
  const generateGuestToken = useCallback(
    async (athleteId, gameId = null, type = 'hitting') => {
      if (!athleteId) return null

      try {
        setIsLoading(true)
        setError(null)

        // Generate random token
        const token = `GUEST-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

        // Set expiry to 2 hours from now
        const expiresAt = new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString()

        const { data, error: insertError } = await supabase
          .from('guest_access_tokens')
          .insert([
            {
              athlete_id: athleteId,
              game_id: gameId,
              token,
              type,
              expires_at: expiresAt,
              is_active: true,
            },
          ])
          .select()

        if (insertError) throw insertError

        return data?.[0]
      } catch (err) {
        console.error('Error generating guest token:', err)
        setError(err.message)
        return null
      } finally {
        setIsLoading(false)
      }
    },
    []
  )

  // Revoke guest token
  const revokeGuestToken = useCallback(async (tokenId) => {
    try {
      setIsLoading(true)
      const { error: updateError } = await supabase
        .from('guest_access_tokens')
        .update({ is_active: false })
        .eq('id', tokenId)

      if (updateError) throw updateError
      return true
    } catch (err) {
      console.error('Error revoking guest token:', err)
      setError(err.message)
      return false
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Parent links to athlete using athlete's access code
  const linkParentUsingAccessCode = useCallback(async (parentUserId, athleteAccessCode) => {
    try {
      setIsLoading(true)
      setError(null)

      // Verify the access code exists and get athlete ID
      const { data: athlete, error: athleteError } = await supabase
        .from('athletes')
        .select('id')
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
        message: 'Successfully linked to athlete!',
      }
    } catch (err) {
      console.error('Error linking parent:', err)
      setError(err.message)
      return { success: false, message: err.message }
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    accessCode,
    isLoading,
    error,
    getAccessCode,
    generateGuestToken,
    revokeGuestToken,
    linkParentUsingAccessCode,
  }
}
