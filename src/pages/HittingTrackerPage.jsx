import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/hooks/useAuth'
import { useHittingSessions } from '../lib/hooks/useHittingSessions'
import { evaluateQAB, formatQABCriteria } from '../lib/utils/qabEvaluator'
import { Toast } from '../components/common/Toast'
import { HittingSessionSetup } from '../components/Hitting/HittingSessionSetup'
import { GameSituationSelector } from '../components/Hitting/GameSituationSelector'
import { StrikeZoneGrid } from '../components/Hitting/StrikeZoneGrid'
import { PitchOutcomeSelector } from '../components/Hitting/PitchOutcomeSelector'
import { ContactDetailsForm } from '../components/Hitting/ContactDetailsForm'
import { AtBatStatus } from '../components/Hitting/AtBatStatus'
import { EnhancedAtBatResultSelector } from '../components/Hitting/EnhancedAtBatResultSelector'
import { GameSummary } from '../components/Hitting/GameSummary'

export function HittingTrackerPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const {
    currentSession,
    currentAtBat,
    atBats,
    pitches,
    isLoading,
    toast,
    startSession,
    startAtBat,
    setGameSituation,
    addPitch,
    completeAtBat,
    endSession,
  } = useHittingSessions(user?.id)

  const [selectedZone, setSelectedZone] = useState(null)
  const [selectedOutcome, setSelectedOutcome] = useState(null)
  const [showGameSituation, setShowGameSituation] = useState(false)
  const [showResult, setShowResult] = useState(false)

  // Session setup
  const handleSessionSetup = async (setupData) => {
    const newSession = await startSession(setupData)
    if (newSession) {
      setTimeout(() => handleStartAtBat(), 500)
    }
  }

  // Start at-bat - show game situation form
  const handleStartAtBat = async () => {
    setSelectedZone(null)
    setSelectedOutcome(null)
    setShowGameSituation(true)
    setShowResult(false)
    await startAtBat()
  }

  // Save game situation - move to pitch logging
  const handleSaveGameSituation = async (situationData) => {
    await setGameSituation(situationData)
    setShowGameSituation(false)
  }

  // Zone selection
  const handleZoneSelect = (zoneId) => {
    setSelectedZone(zoneId)
  }

  // Pitch outcome selection
  const handleOutcomeSelect = (outcome) => {
    setSelectedOutcome(outcome)
    if (outcome !== 'in_play') {
      addPitch({
        zone: selectedZone,
        pitch_outcome: outcome,
      })
      setSelectedZone(null)
      setSelectedOutcome(null)
    }
  }

  const handleCancelOutcome = () => {
    setSelectedOutcome(null)
  }

  // Add in-play pitch with contact details
  const handleAddPitch = async (pitchData) => {
    await addPitch({
      ...pitchData,
      pitch_outcome: 'in_play',
    })
    setSelectedZone(null)
    setSelectedOutcome(null)
  }

  const handleCancelPitch = () => {
    setSelectedZone(null)
    setSelectedOutcome(null)
  }

  // Complete at-bat with result
  const handleCompleteAtBat = async (resultData) => {
    // Evaluate QAB
    const qabResult = evaluateQAB(
      { ...currentAtBat, ...resultData },
      pitches
    )

    // Save with QAB data
    await completeAtBat({
      ...resultData,
      is_qab: qabResult.isQAB,
      qab_criteria: qabResult.criteria,
    })

    setShowResult(false)
  }

  const handleEndGame = async () => {
    if (window.confirm('End this game? You can view and edit at-bats later.')) {
      await endSession()
    }
  }

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  // No session - show setup
  if (!currentSession) {
    return (
      <div className="max-w-4xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
        {toast && <Toast message={toast} type="success" />}
        <div className="flex justify-between items-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800">Hitting Tracker</h1>
          <button
            onClick={() => navigate('/hitting/history')}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded-lg transition text-sm"
          >
            History
          </button>
        </div>
        <HittingSessionSetup onStartSession={handleSessionSetup} sessionInProgress={false} />
      </div>
    )
  }

  // Session active
  return (
    <div className="max-w-4xl mx-auto px-3 sm:px-4 py-6 sm:py-8">
      {toast && <Toast message={toast} type="success" />}

      {/* Top Navigation */}
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => navigate('/hitting/history')}
          className="text-blue-600 hover:text-blue-800 font-semibold text-sm"
        >
          ← History
        </button>
      </div>

      {/* Game Header */}
      <div className="bg-green-50 rounded-lg shadow p-4 sm:p-6 mb-6 border-2 border-green-300">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-1">
              vs {currentSession.opponent}
            </h1>
            <p className="text-sm text-gray-600">
              {new Date(currentSession.date).toLocaleDateString()}
            </p>
          </div>
          <button
            onClick={handleEndGame}
            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-lg transition text-sm sm:text-base"
          >
            End Game
          </button>
        </div>
      </div>

      {/* No at-bat - show start button */}
      {!currentAtBat ? (
        <div className="bg-blue-50 rounded-lg shadow p-6 mb-6 border-2 border-blue-300 text-center">
          {atBats.length === 0 ? (
            <>
              <p className="text-gray-700 font-semibold mb-4">Ready to start at-bat #1?</p>
              <button
                onClick={handleStartAtBat}
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-lg transition"
              >
                Start At-Bat
              </button>
            </>
          ) : (
            <>
              <p className="text-gray-700 font-semibold mb-4">
                Start at-bat #{atBats.length + 1}?
              </p>
              <button
                onClick={handleStartAtBat}
                className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-lg transition"
              >
                Start Next At-Bat
              </button>
            </>
          )}
        </div>
      ) : (
        <>
          {/* Game Situation Form */}
          {showGameSituation ? (
            <GameSituationSelector
              onSave={handleSaveGameSituation}
              onCancel={() => setShowGameSituation(false)}
            />
          ) : (
            <>
              {/* At-Bat Status */}
              <AtBatStatus atBatNum={currentAtBat.at_bat_num} pitchCount={pitches.length} />

              {/* Game Situation Display */}
              {currentAtBat.inning && (
                <div className="bg-blue-50 rounded-lg p-3 sm:p-4 mb-4 text-sm border border-blue-200">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
                    <div>
                      <p className="text-xs font-semibold text-gray-600">Inning</p>
                      <p className="font-bold text-gray-800">{currentAtBat.inning}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-600">Outs</p>
                      <p className="font-bold text-gray-800">{currentAtBat.outs}</p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-600">Runners</p>
                      <p className="font-bold text-gray-800">
                        {[currentAtBat.runners_1b && '1', currentAtBat.runners_2b && '2', currentAtBat.runners_3b && '3']
                          .filter(Boolean)
                          .join('-') || 'None'}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-600">Score</p>
                      <p className="font-bold text-gray-800">{currentAtBat.score_before || '-'}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowGameSituation(true)}
                    className="mt-2 text-xs text-blue-600 hover:text-blue-800 font-semibold"
                  >
                    Edit Situation
                  </button>
                </div>
              )}

              {/* Strike Zone Grid */}
              <StrikeZoneGrid selectedZone={selectedZone} onZoneSelect={handleZoneSelect} />

              {/* Pitch Outcome Selector */}
              {selectedZone && !selectedOutcome && (
                <PitchOutcomeSelector
                  onSelectOutcome={handleOutcomeSelect}
                  onCancel={handleCancelPitch}
                />
              )}

              {/* Contact Details Form */}
              {selectedZone && selectedOutcome === 'in_play' && (
                <ContactDetailsForm
                  zone={selectedZone}
                  onAddPitch={handleAddPitch}
                  onCancel={handleCancelPitch}
                />
              )}

              {/* Pitches Summary */}
              {pitches.length > 0 && (
                <div className="bg-white rounded-lg shadow p-4 sm:p-6 mb-6">
                  <h4 className="text-sm font-semibold text-gray-700 mb-4 uppercase">
                    Pitches in At-Bat
                  </h4>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {pitches.map((pitch, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between bg-gray-50 p-3 rounded-lg border border-gray-200"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <span className="inline-block bg-blue-500 text-white font-bold text-xs px-2 py-1 rounded">
                              #{index + 1}
                            </span>
                            <span className="inline-block bg-gray-400 text-white font-bold text-xs px-2 py-1 rounded">
                              Zone {pitch.strike_zone_location}
                            </span>
                            <span className="text-xs font-semibold text-gray-700">
                              {pitch.pitch_outcome.replace(/_/g, ' ')}
                            </span>
                          </div>
                          {pitch.contact_quality && (
                            <p className="text-xs text-gray-500">
                              {pitch.contact_quality} • {pitch.contact_location} • {pitch.contact_type}
                            </p>
                          )}
                          {pitch.notes && (
                            <p className="text-xs text-gray-500 italic">{pitch.notes}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* At-Bat Result Selector */}
              {!showResult && pitches.length > 0 && (
                <div className="text-center mb-6">
                  <button
                    onClick={() => setShowResult(true)}
                    className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-lg transition"
                  >
                    Continue to Result
                  </button>
                </div>
              )}

              {showResult && (
                <EnhancedAtBatResultSelector
                  onCompleteAtBat={handleCompleteAtBat}
                  onCancel={() => setShowResult(false)}
                />
              )}
            </>
          )}
        </>
      )}

      {/* Game Summary with QAB */}
      {atBats.length > 0 && (
        <GameSummary atBats={atBats} onViewAtBat={() => {}} />
      )}
    </div>
  )
}
