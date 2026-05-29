import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/hooks/useAuth'
import { usePastHittingSessions } from '../lib/hooks/usePastHittingSessions'
import { AtBatDetail } from '../components/Hitting/AtBatDetail'
import { AtBatEditor } from '../components/Hitting/AtBatEditor'
import { PitchEditor } from '../components/Hitting/PitchEditor'
import { Toast } from '../components/common/Toast'

export function HittingGameDetailPage() {
  const { sessionId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const {
    currentGame,
    gameAtBats,
    isLoading,
    toast,
    fetchGameDetail,
    updateAtBat,
    updatePitch,
    deletePitch,
    deleteAtBat,
    deleteSession,
  } = usePastHittingSessions(user?.id)

  const [editingAtBat, setEditingAtBat] = useState(null)
  const [editingPitch, setEditingPitch] = useState(null)
  const [editingAtBatId, setEditingAtBatId] = useState(null)

  useEffect(() => {
    if (sessionId) {
      fetchGameDetail(sessionId)
    }
  }, [sessionId, fetchGameDetail])

  const handleEditAtBat = (atBat) => {
    setEditingAtBat(atBat)
  }

  const handleSaveAtBat = (updatedData) => {
    if (editingAtBat) {
      updateAtBat(editingAtBat.id, updatedData)
      setEditingAtBat(null)
    }
  }

  const handleEditPitch = (pitchId) => {
    const atBat = gameAtBats.find((ab) =>
      ab.pitches.find((p) => p.id === pitchId)
    )
    if (atBat) {
      const pitch = atBat.pitches.find((p) => p.id === pitchId)
      setEditingPitch(pitch)
      setEditingAtBatId(atBat.id)
    }
  }

  const handleSavePitch = (updatedData) => {
    if (editingPitch) {
      updatePitch(editingPitch.id, updatedData)
      setEditingPitch(null)
      setEditingAtBatId(null)
    }
  }

  const handleDeletePitch = (pitchId) => {
    const atBat = gameAtBats.find((ab) =>
      ab.pitches.find((p) => p.id === pitchId)
    )
    if (atBat) {
      deletePitch(pitchId, atBat.id)
    }
  }

  const handleDeleteAtBat = (atBatId) => {
    if (window.confirm('Delete this at-bat and all its pitches? This cannot be undone.')) {
      deleteAtBat(atBatId)
    }
  }

  const handleDeleteGame = () => {
    if (
      window.confirm(
        `Delete this entire game (${gameAtBats.length} at-bats)? This cannot be undone.`
      )
    ) {
      deleteSession(currentGame.id)
      navigate('/hitting/history')
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-6 sm:py-8 flex items-center justify-center min-h-screen">
        <div className="text-gray-600">Loading game details...</div>
      </div>
    )
  }

  if (!currentGame) {
    return (
      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
        <p className="text-gray-600">Game not found</p>
        <button
          onClick={() => navigate('/hitting/history')}
          className="mt-4 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg"
        >
          Back to History
        </button>
      </div>
    )
  }

  const gameDate = new Date(currentGame.date).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  })

  // Calculate game stats
  const ab = gameAtBats.length
  const hits = gameAtBats.filter((a) =>
    ['single', 'double', 'triple', 'home_run'].includes(a.result)
  ).length
  const strikeouts = gameAtBats.filter((a) => a.result === 'strikeout').length
  const walks = gameAtBats.filter((a) => a.result === 'walk').length
  const qabs = gameAtBats.filter((a) => a.is_qab).length
  const qabPercentage = ab > 0 ? Math.round((qabs / ab) * 100) : 0

  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
      {toast && <Toast message={toast} type="success" />}

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate('/hitting/history')}
          className="text-blue-600 hover:text-blue-800 font-semibold text-sm"
        >
          ← Back to History
        </button>
      </div>

      {/* Game Header Card */}
      <div className="bg-blue-50 rounded-lg shadow p-4 sm:p-6 mb-6 border-2 border-blue-300">
        <div className="flex justify-between items-start mb-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1">
              vs {currentGame.opponent}
            </h1>
            <p className="text-sm text-gray-600">{gameDate}</p>
          </div>
          <button
            onClick={handleDeleteGame}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition text-sm"
            title="Delete this game"
          >
            🗑️ Delete
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
          <div className="text-center bg-white p-3 rounded-lg">
            <p className="text-xs text-gray-600 font-semibold mb-1">AB</p>
            <p className="text-2xl font-bold text-blue-600">{ab}</p>
          </div>
          <div className="text-center bg-white p-3 rounded-lg">
            <p className="text-xs text-gray-600 font-semibold mb-1">H</p>
            <p className="text-2xl font-bold text-green-600">{hits}</p>
          </div>
          <div className="text-center bg-white p-3 rounded-lg">
            <p className="text-xs text-gray-600 font-semibold mb-1">K</p>
            <p className="text-2xl font-bold text-yellow-600">{strikeouts}</p>
          </div>
          <div className="text-center bg-white p-3 rounded-lg">
            <p className="text-xs text-gray-600 font-semibold mb-1">BB</p>
            <p className="text-2xl font-bold text-purple-600">{walks}</p>
          </div>
          <div className="text-center bg-white p-3 rounded-lg">
            <p className="text-xs text-gray-600 font-semibold mb-1">QAB%</p>
            <p className="text-2xl font-bold text-orange-600">{qabPercentage}%</p>
          </div>
        </div>
      </div>

      {/* At-Bats List */}
      {gameAtBats.length === 0 ? (
        <div className="bg-gray-50 rounded-lg border-2 border-gray-200 p-6 text-center">
          <p className="text-gray-600">No at-bats recorded for this game</p>
        </div>
      ) : (
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-3">At-Bats</h2>
          {gameAtBats.map((atBat) => (
            <AtBatDetail
              key={atBat.id}
              atBat={atBat}
              onEdit={handleEditAtBat}
              onEditPitch={handleEditPitch}
              onDeletePitch={handleDeletePitch}
              onDeleteAtBat={handleDeleteAtBat}
            />
          ))}
        </div>
      )}

      {/* At-Bat Editor Modal */}
      {editingAtBat && (
        <AtBatEditor
          atBat={editingAtBat}
          onSave={handleSaveAtBat}
          onCancel={() => setEditingAtBat(null)}
        />
      )}

      {/* Pitch Editor Modal */}
      {editingPitch && (
        <PitchEditor
          pitch={editingPitch}
          onSave={handleSavePitch}
          onDelete={() => {
            deletePitch(editingPitch.id, editingAtBatId)
            setEditingPitch(null)
            setEditingAtBatId(null)
          }}
          onCancel={() => {
            setEditingPitch(null)
            setEditingAtBatId(null)
          }}
        />
      )}
    </div>
  )
}
