export function PitchTable({ pitches, onEditPitch, onDeletePitch }) {
  const getPitchOutcomeLabel = (outcome) => {
    const labels = {
      strike_looking: 'Strike (Looking)',
      strike_swinging: 'Strike (Swinging)',
      ball: 'Ball',
      foul: 'Foul',
      foul_tip: 'Foul Tip',
      in_play: 'In Play',
      hbp: 'HBP',
    }
    return labels[outcome] || outcome
  }

  if (pitches.length === 0) {
    return <p className="text-xs text-gray-500 italic">No pitches logged</p>
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-xs">
        <thead className="bg-gray-100 border-b border-gray-200">
          <tr>
            <th className="text-left py-2 px-2 font-semibold text-gray-700">#</th>
            <th className="text-left py-2 px-2 font-semibold text-gray-700">Zone</th>
            <th className="text-left py-2 px-2 font-semibold text-gray-700">Outcome</th>
            <th className="text-left py-2 px-2 font-semibold text-gray-700">Quality</th>
            <th className="text-left py-2 px-2 font-semibold text-gray-700">Location</th>
            <th className="text-left py-2 px-2 font-semibold text-gray-700">Type</th>
            <th className="text-center py-2 px-2 font-semibold text-gray-700">Actions</th>
          </tr>
        </thead>
        <tbody>
          {pitches.map((pitch) => (
            <tr
              key={pitch.id}
              className="border-b border-gray-200 hover:bg-gray-50 transition"
            >
              <td className="py-2 px-2 font-semibold text-gray-700">
                {pitch.pitch_num}
              </td>
              <td className="py-2 px-2">
                <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded font-semibold">
                  Zone {pitch.strike_zone_location}
                </span>
              </td>
              <td className="py-2 px-2">
                <span className="text-gray-700">
                  {getPitchOutcomeLabel(pitch.pitch_outcome)}
                </span>
              </td>
              <td className="py-2 px-2">
                {pitch.contact_quality ? (
                  <span className="capitalize text-gray-700">{pitch.contact_quality}</span>
                ) : (
                  <span className="text-gray-400">—</span>
                )}
              </td>
              <td className="py-2 px-2">
                {pitch.contact_location ? (
                  <span className="capitalize text-gray-700">{pitch.contact_location}</span>
                ) : (
                  <span className="text-gray-400">—</span>
                )}
              </td>
              <td className="py-2 px-2">
                {pitch.contact_type ? (
                  <span className="uppercase text-gray-700 font-semibold">
                    {pitch.contact_type}
                  </span>
                ) : (
                  <span className="text-gray-400">—</span>
                )}
              </td>
              <td className="py-2 px-2 text-center">
                <div className="flex gap-2 justify-center">
                  <button
                    onClick={() => onEditPitch(pitch.id)}
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDeletePitch(pitch.id)}
                    className="text-red-600 hover:text-red-800 font-medium"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
