const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export function DaySelector({ templates, selectedDay, onSelectDay, weekDates }) {
  const getEffortColor = (effortLevel) => {
    switch (effortLevel) {
      case 'Light':
        return 'bg-blue-100 text-blue-900'
      case 'Medium':
        return 'bg-yellow-100 text-yellow-900'
      case 'Heavy':
        return 'bg-red-100 text-red-900'
      case 'Off':
        return 'bg-gray-100 text-gray-900'
      default:
        return 'bg-gray-100 text-gray-900'
    }
  }

  return (
    <div className="mb-8">
      <div className="grid grid-cols-7 gap-1 sm:gap-2">
        {DAYS.map((day, index) => {
          const template = templates.find(t => t.day_of_week === index)
          const isSelected = selectedDay === index
          const effort = template?.effort_level || '—'

          return (
            <button
              key={index}
              onClick={() => onSelectDay(index)}
              className={`
                flex flex-col items-center py-2 sm:py-3 px-1 sm:px-2 rounded-lg transition text-xs sm:text-sm
                ${isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : 'bg-white border border-gray-200 hover:bg-gray-50'}
              `}
            >
              <span className="font-semibold text-gray-800">{day}</span>
              <span className={`text-xs px-1.5 py-0.5 rounded mt-0.5 sm:mt-1 ${getEffortColor(effort)}`}>
                {effort}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
