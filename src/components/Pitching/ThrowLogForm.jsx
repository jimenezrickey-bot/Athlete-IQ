export function ThrowLogForm({ formData, onChange }) {
  const handleChange = (e) => {
    const { name, value } = e.target
    onChange({
      ...formData,
      [name]: name === 'throw_count_total' || name === 'peak_effort_percent' || name === 'max_distance_ft'
        ? value === '' ? '' : parseInt(value)
        : name === 'bullpen_pitches'
        ? value === '' ? '' : parseInt(value)
        : value,
    })
  }

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <h4 className="text-sm font-semibold text-gray-700 mb-4 uppercase">Throw Log</h4>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Total Throws
          </label>
          <input
            type="number"
            name="throw_count_total"
            value={formData.throw_count_total}
            onChange={handleChange}
            placeholder="e.g., 48"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Peak Effort %
          </label>
          <input
            type="number"
            name="peak_effort_percent"
            value={formData.peak_effort_percent}
            onChange={handleChange}
            placeholder="e.g., 75"
            min="0"
            max="100"
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Max Distance (ft)
          </label>
          <input
            type="number"
            name="max_distance_ft"
            value={formData.max_distance_ft}
            onChange={handleChange}
            placeholder="e.g., 120"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Bullpen Pitches
          </label>
          <input
            type="number"
            name="bullpen_pitches"
            value={formData.bullpen_pitches}
            onChange={handleChange}
            placeholder="e.g., 25"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  )
}
