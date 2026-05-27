import { useEffect, useRef, useState } from 'react'

export function usePolling(queryFn, interval = 5000, enabled = true) {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const intervalRef = useRef(null)

  const fetchData = async () => {
    try {
      setIsLoading(true)
      const result = await queryFn()
      setData(result)
      setError(null)
    } catch (err) {
      setError(err)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (!enabled) return

    fetchData()

    intervalRef.current = setInterval(fetchData, interval)

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [interval, enabled, queryFn])

  const refetch = () => fetchData()

  return { data, error, isLoading, refetch }
}
