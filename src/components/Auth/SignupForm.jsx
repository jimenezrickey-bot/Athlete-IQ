import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

export function SignupForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [name, setName] = useState('')
  const [role, setRole] = useState('player')
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [accessCode, setAccessCode] = useState(null)
  const [userId, setUserId] = useState(null)
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      // Validate inputs
      if (!email || !password || !name) {
        throw new Error('Please fill in all fields')
      }

      if (password.length < 6) {
        throw new Error('Password must be at least 6 characters')
      }

      // Sign up with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      })

      if (authError) {
        // Check if it's an email already registered error
        if (authError.message.includes('already registered')) {
          throw new Error('This email is already registered. Please log in instead.')
        }
        console.error('Auth error:', authError)
        throw new Error(`Signup failed: ${authError.message}`)
      }

      if (!authData.user) {
        throw new Error('Failed to create user. Please try again.')
      }

      console.log('Auth user created:', authData.user.id)

      // Update profile (profile auto-created by database trigger)
      // Wait a moment for the trigger to create the profile
      await new Promise((resolve) => setTimeout(resolve, 500))

      let profileError = null
      let retries = 3

      while (retries > 0) {
        const { error } = await supabase
          .from('profiles')
          .update({
            name,
            role,
          })
          .eq('user_id', authData.user.id)

        if (!error) {
          // Success
          profileError = null
          console.log('Profile updated successfully')
          break
        }

        profileError = error
        console.error(`Profile update failed (attempt ${4 - retries}):`, error)
        retries--

        if (retries > 0) {
          // Wait before retry
          await new Promise((resolve) => setTimeout(resolve, 500))
        }
      }

      if (profileError) {
        throw new Error(
          `Failed to save profile: ${profileError.message}. Check browser console for details.`
        )
      }

      // If player, fetch their athlete access code
      if (role === 'player') {
        const { data: athlete, error: athleteError } = await supabase
          .from('athletes')
          .select('access_code')
          .eq('user_id', authData.user.id)
          .single()

        if (!athleteError && athlete) {
          setAccessCode(athlete.access_code)
          setUserId(authData.user.id)
          // Don't navigate yet - show the access code
          return
        }
      }

      // Show success message
      setError(null)

      // Wait a moment for the session to be established
      await new Promise((resolve) => setTimeout(resolve, 1000))

      navigate('/dashboard')
    } catch (err) {
      console.error('Signup error:', err)
      setError(err.message || 'An error occurred during signup. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  // Show access code screen for new player
  if (accessCode) {
    return (
      <div className="w-full max-w-md mx-auto">
        <div className="bg-green-50 border-2 border-green-300 rounded-lg p-6">
          <h2 className="text-2xl font-bold text-green-700 mb-2">Welcome, {name}! 🎉</h2>
          <p className="text-gray-700 mb-4">
            Your account has been created. Here's your unique athlete access code:
          </p>

          <div className="bg-white border-2 border-green-500 rounded-lg p-4 mb-4 text-center">
            <p className="text-xs text-gray-600 mb-2">Your Access Code</p>
            <p className="text-3xl font-mono font-bold text-green-600 break-all">{accessCode}</p>
          </div>

          <p className="text-sm text-gray-600 mb-4">
            📌 <strong>Share this code</strong> with your parents, coaches, or friends so they can log game data for you.
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-6 text-sm text-blue-700">
            <p>
              <strong>Privacy Note:</strong> Only people with your access code can view or enter data for you. You can generate new codes or revoke old ones anytime in settings.
            </p>
          </div>

          <button
            onClick={() => navigate('/dashboard')}
            className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg transition"
          >
            Got it, go to dashboard →
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">Sign Up</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium mb-1">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-2.5 text-gray-600 hover:text-gray-800"
              title={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? '👁️' : '👁️‍🗨️'}
            </button>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Role</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="player">Player</option>
            <option value="coach">Coach</option>
            <option value="parent">Parent</option>
          </select>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white font-bold py-2 px-4 rounded-lg transition"
        >
          {isLoading ? 'Signing up...' : 'Sign Up'}
        </button>
      </form>

      <p className="text-center mt-4">
        Already have an account?{' '}
        <Link to="/login" className="text-blue-500 hover:underline">
          Login
        </Link>
      </p>
    </div>
  )
}
