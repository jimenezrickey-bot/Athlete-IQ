export function WorkoutDetails({ template, selectedDrills, onDrillToggle, loggedDate, isDifferentFromDay }) {
  if (!template) {
    return (
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <p className="text-gray-500">Select a day to view the workout</p>
      </div>
    )
  }

  const drillsList = template.description
    .split('\n')
    .map(line => line.trim())
    .filter(line => line && !line.startsWith('-'))

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-1">{template.name}</h3>
        <p className="text-sm text-gray-600">{template.effort_level}</p>
        {isDifferentFromDay && (
          <p className="text-xs text-blue-600 mt-2 bg-blue-50 px-2 py-1 rounded inline-block">
            💡 Make-up workout: using {template.name.split(' ')[0].toLowerCase()}'s workout
          </p>
        )}
      </div>

      <div className="mb-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-3 uppercase">Drills</h4>
        <div className="space-y-3">
          {drillsList.map((drill, index) => (
            <label key={index} className="flex items-start cursor-pointer">
              <input
                type="checkbox"
                checked={selectedDrills.includes(drill)}
                onChange={() => onDrillToggle(drill)}
                className="mt-1 mr-3 rounded"
              />
              <span className="text-sm text-gray-700">{drill}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  )
}
