import { useState } from 'react'

export function PitchEntryForm({ zone, onAddPitch, onCancel }) {
  const [formData, setFormData] = useState({
    contact_quality: '',
    contact_location: '',
    contact_type: '',
    notes: '',
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!formData.contact_quality || !formData.contact_location || !formData.contact_type) {
      alert('Please select contact quality, location, and type')
      return
    }

    onAddPitch({
      zone,
      ...formData,
    })

    // Reset form
    setFormData({
      contact_quality: '',
      contact_location: '',
      contact_type: '',
      notes: '',
    })
  }

  return (
    <div className="bg-blue-50 rounded-lg shadow p-6 mb-6 border-2 border-blue-300">
      <h4 className="text-sm font-semibold text-gray-700 mb-4 uppercase">
        Zone {zone} — Contact Details
      </h4>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contact Quality
            </label>
            <select
              name="contact_quality"
              value={formData.contact_quality}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select quality</option>
              <option value="soft">Soft</option>
              <option value="firm">Firm</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contact Location
            </label>
            <select
              name="contact_location"
              value={formData.contact_location}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select location</option>
              <option value="pull">Pull</option>
              <option value="middle">Middle</option>
              <option value="oppo">Opposite Field</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contact Type
            </label>
            <select
              name="contact_type"
              value={formData.contact_type}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select type</option>
              <option value="gb">GB (Ground Ball)</option>
              <option value="ld">LD (Line Drive)</option>
              <option value="fb">FB (Fly Ball)</option>
              <option value="pu">PU (Popup)</option>
            </select>
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes (Optional)
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            placeholder="e.g., 2-0 count, fastball, etc."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            rows="2"
          />
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition"
          >
            Add Pitch
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg transition"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
