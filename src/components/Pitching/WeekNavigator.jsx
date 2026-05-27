export function WeekNavigator({ weekStartDate, onPrevWeek, onNextWeek }) {
  const formatDateRange = (startDate) => {
    const start = new Date(startDate)
    const end = new Date(start)
    end.setDate(end.getDate() + 6)

    const options = { month: 'short', day: 'numeric' }
    const startStr = start.toLocaleDateString('en-US', options)
    const endStr = end.toLocaleDateString('en-US', options)

    return `${startStr} – ${endStr}`
  }

  return (
    <div className="flex items-center justify-between mb-6">
      <button
        onClick={onPrevWeek}
        className="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded transition"
      >
        ‹
      </button>
      <h2 className="text-lg font-semibold text-gray-700">
        {formatDateRange(weekStartDate)}
      </h2>
      <button
        onClick={onNextWeek}
        className="px-3 py-2 text-gray-600 hover:bg-gray-100 rounded transition"
      >
        ›
      </button>
    </div>
  )
}
