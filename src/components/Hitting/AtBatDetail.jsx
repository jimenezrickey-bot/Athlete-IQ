import { useState } from 'react'
import { PitchTable } from './PitchTable'

export function AtBatDetail({ atBat, onEdit, onEditPitch, onDeletePitch, onDeleteAtBat }) {
  const [isExpanded, setIsExpanded] = useState(false)

  const getResultEmoji = (result) => {
    const emojis = {
      strikeout: '⚾',
      single: '1️⃣',
      double: '2️⃣',
      triple: '3️⃣',
      home_run: '🚀',
      out: '❌',
      walk: '🚶',
      hbp: '💥',
      sac_fly: '🦅',
      reached_on_error: '📝',
    }
    return emojis[result] || '❓'
  }

  const getResultLabel = (result) => {
    const labels = {
      strikeout: 'Strikeout',
      single: 'Single',
      double: 'Double',
      triple: 'Triple',
      home_run: 'Home Run',
      out: 'Out',
      walk: 'Walk',
      hbp: 'Hit by Pitch',
      sac_fly: 'Sac Fly',
      reached_on_error: 'Reached on Error',
    }
    return labels[result] || result
  }

  const getGameSituation = () => {
    const parts = []
    if (atBat.inning) parts.push(`Inning ${atBat.inning}`)
    if (atBat.outs !== null && atBat.outs !== undefined) {
      parts.push(`${atBat.outs} out${atBat.outs !== 1 ? 's' : ''}`)
    }

    const runners = []
    if (atBat.runners_1b) runners.push('1B')
    if (atBat.runners_2b) runners.push('2B')
    if (atBat.runners_3b) runners.push('3B')
    if (runners.length > 0) {
      parts.push(`Runners: ${runners.join(', ')}`)
    } else {
      parts.push('Bases empty')
    }

    return parts.join(' • ')
  }

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-3 border border-gray-200">
      {/* Header - Clickable to expand */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full text-left hover:bg-gray-50 p-2 rounded transition -m-2"
      >
        <div className="flex items-start justify-between">
          <div className="flex-1">
            {/* AB# and pitch count */}
            <div className="flex items-center gap-3 mb-2">
              <span className="inline-block bg-gray-300 text-white font-bold text-xs px-2 py-1 rounded">
                AB {atBat.at_bat_num}
              </span>
              <span className="text-sm font-semibold text-gray-700">
                {atBat.pitch_count} pitch{atBat.pitch_count !== 1 ? 'es' : ''}
              </span>
            </div>

            {/* Game situation */}
            <p className="text-xs text-gray-500 mb-2">{getGameSituation()}</p>

            {/* Notes if present */}
            {atBat.notes && (
              <p className="text-xs text-gray-600 italic">{atBat.notes}</p>
            )}
          </div>

          {/* Result and QAB badge */}
          <div className="text-right ml-3">
            {atBat.result && (
              <div className="flex items-center justify-end gap-2 mb-1">
                <span className="text-lg">{getResultEmoji(atBat.result)}</span>
                {atBat.is_qab && (
                  <span className="inline-block bg-orange-500 text-white font-bold text-xs px-2 py-1 rounded">
                    QAB
                  </span>
                )}
              </div>
            )}
            <p className="text-xs text-gray-600 font-semibold">{getResultLabel(atBat.result)}</p>
            {atBat.rbis > 0 && (
              <p className="text-xs text-green-600 font-semibold mt-1">{atBat.rbis} RBI</p>
            )}
          </div>
        </div>
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          {/* QAB Criteria if applicable */}
          {atBat.is_qab && atBat.qab_criteria && (
            <div className="bg-orange-50 rounded p-3 mb-4 border border-orange-200">
              <p className="text-xs font-semibold text-orange-700 mb-1">QAB Criteria Met:</p>
              <p className="text-xs text-orange-600">
                {Array.isArray(atBat.qab_criteria)
                  ? atBat.qab_criteria.join(', ')
                  : typeof atBat.qab_criteria === 'string'
                  ? atBat.qab_criteria
                  : 'N/A'}
              </p>
            </div>
          )}

          {/* Pitches Table */}
          <div className="mb-4">
            <p className="text-xs font-semibold text-gray-700 mb-2">Pitches</p>
            <PitchTable
              pitches={atBat.pitches}
              onEditPitch={onEditPitch}
              onDeletePitch={onDeletePitch}
            />
          </div>

          {/* Edit and Delete Buttons */}
          <div className="flex gap-2">
            <button
              onClick={() => onEdit(atBat)}
              className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition text-sm"
            >
              Edit At-Bat
            </button>
            {onDeleteAtBat && (
              <button
                onClick={() => onDeleteAtBat(atBat.id)}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition text-sm"
                title="Delete this at-bat"
              >
                Delete
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
