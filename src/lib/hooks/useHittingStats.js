import { useState, useCallback } from 'react'
import { supabase } from '../supabase'
import { calculateAllStats } from '../utils/statsCalculator'

export function useHittingStats(athleteId) {
  const [stats, setStats] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [cachedDateRange, setCachedDateRange] = useState(null)

  const getDateRange = useCallback((type) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    let startDate = new Date(today)

    switch (type) {
      case 'all':
        startDate = new Date('2000-01-01') // Far back in time
        break
      case 'last7':
        startDate.setDate(today.getDate() - 7)
        break
      case 'last30':
        startDate.setDate(today.getDate() - 30)
        break
      case 'thisMonth':
        startDate.setDate(1)
        break
      default:
        return null
    }

    const endDate = new Date(today)
    endDate.setDate(today.getDate() + 1) // Include all of today

    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
    }
  }, [])

  const fetchStatsForDateRange = useCallback(
    async (startDate, endDate) => {
      if (!athleteId) return

      setIsLoading(true)
      setError(null)

      try {
        // Fetch all at-bats in the date range
        const { data: atBatsData, error: atBatsError } = await supabase
          .from('at_bats')
          .select(
            `
            id,
            result,
            rbis,
            is_qab,
            session_id,
            hitting_sessions!at_bats_session_id_fkey (
              athlete_id,
              date
            )
          `
          )
          .eq('hitting_sessions.athlete_id', athleteId)
          .gte('hitting_sessions.date', startDate)
          .lte('hitting_sessions.date', endDate)

        if (atBatsError) throw atBatsError

        // Fetch all pitches for these at-bats for contact rate calculation
        const atBatIds = atBatsData?.map((ab) => ab.id) || []
        let pitchesData = []

        if (atBatIds.length > 0) {
          const { data: pitches, error: pitchesError } = await supabase
            .from('hitting_events')
            .select('id, at_bat_id, pitch_outcome')
            .in('at_bat_id', atBatIds)

          if (pitchesError) throw pitchesError
          pitchesData = pitches || []
        }

        // Flatten the at-bats data
        const flattenedAtBats = atBatsData?.map((ab) => ({
          ...ab,
          athlete_id: ab.hitting_sessions?.athlete_id,
          date: ab.hitting_sessions?.date,
        })) || []

        // Calculate all stats
        const calculatedStats = calculateAllStats(flattenedAtBats, pitchesData)

        // Count unique games (sessions) in this date range
        const uniqueGames = new Set(
          flattenedAtBats.map((ab) => ab.session_id)
        ).size

        setStats({
          ...calculatedStats,
          games: uniqueGames,
          totalAtBats: flattenedAtBats.length,
          dateRange: { startDate, endDate },
        })

        // Cache the date range to avoid redundant queries
        setCachedDateRange({ startDate, endDate })
      } catch (err) {
        console.error('Error fetching hitting stats:', err)
        setError(err.message)
        setStats(null)
      } finally {
        setIsLoading(false)
      }
    },
    [athleteId]
  )

  const fetchStatsForPreset = useCallback(
    async (preset) => {
      const range = getDateRange(preset)
      if (!range) return

      await fetchStatsForDateRange(range.startDate, range.endDate)
    },
    [fetchStatsForDateRange, getDateRange]
  )

  const fetchStatsForCustomRange = useCallback(
    async (startDate, endDate) => {
      // Validate dates
      if (!startDate || !endDate) {
        setError('Invalid date range')
        return
      }

      const start = new Date(startDate)
      const end = new Date(endDate)

      if (start > end) {
        setError('Start date must be before end date')
        return
      }

      await fetchStatsForDateRange(startDate, endDate)
    },
    [fetchStatsForDateRange]
  )

  return {
    stats,
    isLoading,
    error,
    fetchStatsForPreset,
    fetchStatsForCustomRange,
    fetchStatsForDateRange,
    getDateRange,
    cachedDateRange,
  }
}
