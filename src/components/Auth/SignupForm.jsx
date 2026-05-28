import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'

export function SignupForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState('player')
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
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
        throw authError
      }

      if (!authData.user) {
        throw new Error('Failed to create user. Please try again.')
      }

      // Create profile with retry logic
      let profileError = null
      let retries = 3

      while (retries > 0) {
        const { error } = await supabase
          .from('profiles')
          .insert([
            {
              user_id: authData.user.id,
              name,
              role,
            },
          ])

        if (!error) {
          // Success
          profileError = null
          break
        }

        profileError = error
        retries--

        if (retries > 0) {
          // Wait before retry
          await new Promise((resolve) => setTimeout(resolve, 500))
        }
      }

      if (profileError) {
        throw new Error(
          `Failed to save profile: ${profileError.message}. Please contact support.`
        )
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
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
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
