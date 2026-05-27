export function Toast({ message, type = 'info' }) {
  if (!message) return null

  const bgColor = {
    success: 'bg-green-100 border-green-400 text-green-700',
    error: 'bg-red-100 border-red-400 text-red-700',
    info: 'bg-blue-100 border-blue-400 text-blue-700',
  }[type]

  return (
    <div className={`fixed top-4 right-4 border px-4 py-3 rounded ${bgColor}`}>
      {message}
    </div>
  )
}
