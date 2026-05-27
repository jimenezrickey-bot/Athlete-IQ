export function ArmFeelNotes({ armFeel, notes, onArmFeelChange, onNotesChange }) {
  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6">
      <h4 className="text-sm font-semibold text-gray-700 mb-4 uppercase">Notes / Arm Feel</h4>

      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Arm Feel
        </label>
        <select
          value={armFeel}
          onChange={(e) => onArmFeelChange(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="great">Great</option>
          <option value="good">Good</option>
          <option value="okay">Okay</option>
          <option value="tight">Tight</option>
          <option value="sore">Sore</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Notes
        </label>
        <textarea
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          placeholder="How did the arm feel? Anything for the coach..."
          rows="4"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  )
}
