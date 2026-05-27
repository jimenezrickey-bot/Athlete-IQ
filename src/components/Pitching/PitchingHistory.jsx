import { useAuth } from '../../lib/hooks/useAuth'
import { usePitchingSessions } from '../../lib/hooks/usePitchingSessions'

export function PitchingHistory() {
  const { user } = useAuth()
  const { sessions } = usePitchingSessions(user?.id)

  if (sessions.length === 0) {
    return (
      <div className="w-full max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
        <h2 className="text-2xl font-bold mb-4">Recent Sessions</h2>
        <p className="text-gray-500">No pitching sessions yet. Log your first session!</p>
      </div>
    )
  }

  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-4">Recent Sessions</h2>
      <div className="space-y-4">
        {sessions.map(session => (
          <div key={session.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50">
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-semibold">{session.date}</h3>
              <span className="text-sm text-gray-500">Throws: {session.throw_count_total}</span>
            </div>
            {session.drills && (
              <p className="text-sm text-gray-600 mb-2">
                <strong>Drills:</strong> {session.drills}
              </p>
            )}
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>Effort: {session.effort_percent}%</div>
              <div>Bullpen: {session.bullpen_pitches || '-'}</div>
              <div>Arm Feel: {session.arm_feel}</div>
            </div>
            {session.notes && (
              <p className="text-sm text-gray-600 mt-2 italic">"{session.notes}"</p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
