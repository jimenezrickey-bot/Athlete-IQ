export function WorkoutSelector({ templates, selectedTemplate, onSelectTemplate }) {
  const getEffortColor = (effortLevel) => {
    switch (effortLevel) {
      case 'Light':
        return 'text-blue-600'
      case 'Medium':
        return 'text-yellow-600'
      case 'Heavy':
        return 'text-red-600'
      case 'Off':
        return 'text-gray-600'
      default:
        return 'text-gray-600'
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-4 sm:p-6 mb-6">
      <label className="block text-sm font-semibold text-gray-700 mb-3">
        Select Workout
      </label>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {templates.map(template => (
          <button
            key={template.id}
            onClick={() => onSelectTemplate(template)}
            className={`
              text-left p-3 rounded-lg border-2 transition
              ${selectedTemplate.id === template.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 bg-white hover:border-gray-300'
              }
            `}
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium text-gray-800 text-sm">
                  {template.name}
                </p>
                <p className={`text-xs mt-1 font-semibold ${getEffortColor(template.effort_level)}`}>
                  {template.effort_level}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}
