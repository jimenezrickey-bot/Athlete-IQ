import { useState } from 'react'

export function useOptimisticUpdate(initialData) {
  const [data, setData] = useState(initialData)
  const [isPending, setIsPending] = useState(false)
  const [error, setError] = useState(null)

  const updateOptimistically = async (optimisticData, asyncFn) => {
    const previousData = data
    setData(optimisticData)
    setIsPending(true)
    setError(null)

    try {
      const result = await asyncFn()
      setData(result || optimisticData)
      return result
    } catch (err) {
      setData(previousData)
      setError(err)
      throw err
    } finally {
      setIsPending(false)
    }
  }

  return { data, setData, isPending, error, updateOptimistically }
}
