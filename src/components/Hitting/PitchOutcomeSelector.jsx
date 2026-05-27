export function PitchOutcomeSelector({ onSelectOutcome, onCancel }) {
  const outcomes = [
    { id: 'strike_looking', label: 'Strike Looking', color: 'text-red-600' },
    { id: 'strike_swinging', label: 'Strike Swinging', color: 'text-red-600' },
    { id: 'ball', label: 'Ball', color: 'text-green-600' },
    { id: 'foul', label: 'Foul', color: 'text-yellow-600' },
    { id: 'foul_tip', label: 'Foul Tip', color: 'text-yellow-700' },
    { id: 'in_play', label: 'In Play', color: 'text-blue-600' },
    { id: 'hbp', label: 'Hit by Pitch', color: 'text-purple-600' },
  ]

  return (
    <div className="bg-white rounded-lg shadow p-6 mb-6 border-2 border-gray-300">
      <h4 className="text-sm font-semibold text-gray-700 mb-4 uppercase">Pitch Outcome</h4>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
        {outcomes.map(outcome => (
          <button
            key={outcome.id}
            onClick={() => onSelectOutcome(outcome.id)}
            className={`
              text-left p-3 rounded-lg border-2 font-medium transition
              ${outcome.color} border-current bg-opacity-5 hover:bg-opacity-10
            `}
          >
            {outcome.label}
          </button>
        ))}
      </div>

      <button
        onClick={onCancel}
        className="w-full bg-gray-300 hover:bg-gray-400 text-gray-800 font-bold py-2 px-4 rounded-lg transition"
      >
        Cancel
      </button>
    </div>
  )
}
