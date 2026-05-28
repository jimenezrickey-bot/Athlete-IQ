import { useState } from 'react'

export function PitchEditor({ pitch, onSave, onDelete, onCancel }) {
  const [zone, setZone] = useState(pitch?.strike_zone_location || 1)
  const [outcome, setOutcome] = useState(pitch?.pitch_outcome || 'strike_looking')
  const [contactQuality, setContactQuality] = useState(pitch?.contact_quality || '')
  const [contactLocation, setContactLocation] = useState(pitch?.contact_location || '')
  const [contactType, setContactType] = useState(pitch?.contact_type || '')
  const [notes, setNotes] = useState(pitch?.notes || '')

  const handleSubmit = (e) => {
    e.preventDefault()

    onSave({
      zone: parseInt(zone),
      pitch_outcome: outcome,
      contact_quality: contactQuality || null,
      contact_location: contactLocation || null,
      contact_type: contactType || null,
      notes: notes || null,
    })
  }

  const handleDelete = () => {
    if (window.confirm(`Delete Pitch #${pitch.pitch_num}?`)) {
      onDelete()
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-lg max-w-lg w-full">
        {/* Header */}
        <div className="bg-blue-50 border-b border-blue-200 p-4 sm:p-6">
          <h2 className="text-lg sm:text-xl font-bold text-gray-800">
            Edit Pitch #{pitch?.pitch_num}
          </h2>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
          {/* Zone Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Strike Zone (1-9)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((z) => (
                <button
                  key={z}
                  type="button"
                  onClick={() => setZone(z)}
                  className={`p-3 rounded-lg border-2 font-bold transition ${
                    zone === z
                      ? 'bg-blue-500 text-white border-blue-600'
                      : 'bg-gray-100 text-gray-800 border-gray-300 hover:border-gray-400'
                  }`}
                >
                  {z}
                </button>
              ))}
            </div>
          </div>

          {/* Pitch Outcome */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pitch Outcome
            </label>
            <select
              value={outcome}
              onChange={(e) => setOutcome(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="strike_looking">Strike (Looking)</option>
              <option value="strike_swinging">Strike (Swinging)</option>
              <option value="ball">Ball</option>
              <option value="foul">Foul</option>
              <option value="foul_tip">Foul Tip</option>
              <option value="in_play">In Play</option>
              <option value="hbp">HBP</option>
            </select>
          </div>

          {/* Contact Quality */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contact Quality
            </label>
            <div className="flex gap-3">
              {['soft', 'firm', 'hard'].map((quality) => (
                <label key={quality} className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="contact_quality"
                    value={quality}
                    checked={contactQuality === quality}
                    onChange={(e) => setContactQuality(e.target.value)}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700 capitalize">{quality}</span>
                </label>
              ))}
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="contact_quality"
                  value=""
                  checked={contactQuality === ''}
                  onChange={(e) => setContactQuality(e.target.value)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">None</span>
              </label>
            </div>
          </div>

          {/* Contact Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contact Location
            </label>
            <div className="flex gap-3">
              {['pull', 'middle', 'oppo'].map((location) => (
                <label key={location} className="flex items-center cursor-pointer">
                  <input
                    type="radio"
                    name="contact_location"
                    value={location}
                    checked={contactLocation === location}
                    onChange={(e) => setContactLocation(e.target.value)}
                    className="mr-2"
                  />
                  <span className="text-sm text-gray-700 capitalize">{location}</span>
                </label>
              ))}
              <label className="flex items-center cursor-pointer">
                <input
                  type="radio"
                  name="contact_location"
                  value=""
                  checked={contactLocation === ''}
                  onChange={(e) => setContactLocation(e.target.value)}
                  className="mr-2"
                />
                <span className="text-sm text-gray-700">None</span>
              </label>
            </div>
          </div>

          {/* Contact Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Contact Type
            </label>
            <select
              value={contactType}
              onChange={(e) => setContactType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
            >
              <option value="">None</option>
              <option value="gb">Ground Ball (GB)</option>
              <option value="ld">Line Drive (LD)</option>
              <option value="fb">Fly Ball (FB)</option>
              <option value="pu">Popup (PU)</option>
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional notes about this pitch..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              rows="2"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-lg transition"
            >
              Save Pitch
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition"
            >
              Delete
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
    </div>
  )
}
