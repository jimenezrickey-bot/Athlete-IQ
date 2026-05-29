import { useState, useEffect, useContext, createContext } from 'react'
import { supabase } from '../supabase'

const AuthContext = createContext(null)

export function useAuth() {
  const [user, setUser] = useState(null)
  const [athletes, setAthletes] = useState([])
  const [currentAthlete, setCurrentAthlete] = useState(null)
  const [isLoading, setIsLoading] = useState(true)

  // Fetch user's athletes (for players and parents)
  const fetchAthletes = async (userId, userRole) => {
    if (!userId) return

    try {
      if (userRole === 'player') {
        // Players can only see their own athlete entry
        const { data, error } = await supabase
          .from('athletes')
          .select('*')
          .eq('user_id', userId)
          .single()

        if (!error && data) {
          setAthletes([data])
          setCurrentAthlete(data)
        }
      } else if (userRole === 'parent') {
        // Parents can see all linked athletes
        const { data, error } = await supabase
          .from('parent_athlete_relationships')
          .select('athlete_id, athletes(*)')
          .eq('parent_user_id', userId)
          .eq('verified', true)

        if (!error && data) {
          const athletesList = data.map((rel) => rel.athletes).filter(Boolean)
          setAthletes(athletesList)
          if (athletesList.length > 0) {
            // Default to first athlete if not previously selected
            setCurrentAthlete(athletesList[0])
          }
        }
      }
    } catch (error) {
      console.error('Error fetching athletes:', error)
    }
  }

  useEffect(() => {
    const getSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      const authUser = session?.user || null
      setUser(authUser)

      if (authUser) {
        // Get user's role from profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('user_id', authUser.id)
          .single()

        if (profile) {
          await fetchAthletes(authUser.id, profile.role)
        }
      }

      setIsLoading(false)
    }

    getSession()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        const authUser = session?.user || null
        setUser(authUser)

        if (!authUser) {
          setAthletes([])
          setCurrentAthlete(null)
        }
      }
    )

    return () => subscription?.unsubscribe()
  }, [])

  const logout = async () => {
    await supabase.auth.signOut()
    setUser(null)
    setAthletes([])
    setCurrentAthlete(null)
  }

  const switchAthlete = (athlete) => {
    setCurrentAthlete(athlete)
  }

  return {
    user,
    athletes,
    currentAthlete,
    isLoading,
    logout,
    switchAthlete,
    fetchAthletes,
  }
}

export { AuthContext }
