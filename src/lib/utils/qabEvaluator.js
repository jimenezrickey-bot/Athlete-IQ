/**
 * Evaluates if an at-bat qualifies as a Quality At-Bat (QAB)
 * based on all 10 scenarios defined
 */
export function evaluateQAB(atBat, pitches = []) {
  const criteria = []

  // 1. Walk, HBP, or Catcher's Interference
  if (['walk', 'hbp'].includes(atBat.result)) {
    criteria.push('Walk/HBP/CI')
  }

  // 2. All hard hit balls (base hits excluded if bloops)
  if (
    atBat.contact_quality === 'hard' &&
    ['single', 'double', 'triple', 'home_run'].includes(atBat.result)
  ) {
    criteria.push('Hard hit ball')
  }

  // 3. 8+ pitch at-bats
  if (pitches.length >= 8) {
    criteria.push('8+ pitch at-bat')
  }

  // 4. Seeing 4+ pitches after 0-2 count
  const hadZeroTwo = checkForZeroTwoCount(pitches)
  const pitchesAfterZeroTwo = countPitchesAfterZeroTwo(pitches)
  if (hadZeroTwo && pitchesAfterZeroTwo >= 4) {
    criteria.push('4+ pitches after 0-2 count')
  }

  // 5. Moving a runner from 2nd to 3rd with 0 outs
  if (
    atBat.runners_advanced &&
    atBat.runners_advanced.includes('2B→3B') &&
    atBat.outs === 0
  ) {
    criteria.push('Moved runner 2B→3B (0 outs)')
  }

  // 6. Driving in a run from 3rd with less than 2 outs
  if (atBat.rbis > 0 && atBat.runners_3b && atBat.outs < 2) {
    criteria.push(`RBI from 3B (<2 outs)`)
  }

  // 7. Any RBI (Sac fly, 2 out RBI, etc.)
  if (atBat.rbis && atBat.rbis > 0) {
    criteria.push(`${atBat.rbis} RBI(s)`)
  }

  // 8. Executing a Sac Bunt, Sac Drag, Squeeze
  if (atBat.sac_type && ['sac_bunt', 'sac_drag', 'squeeze'].includes(atBat.sac_type)) {
    const sacLabels = {
      sac_bunt: 'Sac Bunt',
      sac_drag: 'Sac Drag',
      squeeze: 'Squeeze Play',
    }
    criteria.push(sacLabels[atBat.sac_type])
  }

  // 9. Executing a Bunt for a Hit
  if (
    atBat.hit_type === 'bunt' &&
    ['single', 'double'].includes(atBat.result)
  ) {
    criteria.push('Bunt for hit')
  }

  // 10. Executing a Hit & Run
  if (atBat.hit_type === 'hit_and_run') {
    criteria.push('Hit & Run executed')
  }

  return {
    isQAB: criteria.length > 0,
    criteria: criteria,
    criteriaCount: criteria.length,
  }
}

/**
 * Check if at any point the count was 0-2
 */
function checkForZeroTwoCount(pitches) {
  let balls = 0
  let strikes = 0

  for (const pitch of pitches) {
    if (pitch.pitch_outcome === 'ball') balls++
    if (pitch.pitch_outcome === 'strike_looking' || pitch.pitch_outcome === 'strike_swinging') strikes++
    if (pitch.pitch_outcome === 'foul' || pitch.pitch_outcome === 'foul_tip') strikes++

    if (balls === 0 && strikes === 2) {
      return true
    }
  }

  return false
}

/**
 * Count pitches thrown after reaching 0-2 count
 */
function countPitchesAfterZeroTwo(pitches) {
  let balls = 0
  let strikes = 0
  let zeroTwoReached = false
  let pitchesAfter = 0

  for (const pitch of pitches) {
    if (pitch.pitch_outcome === 'ball') balls++
    if (pitch.pitch_outcome === 'strike_looking' || pitch.pitch_outcome === 'strike_swinging') strikes++
    if (pitch.pitch_outcome === 'foul' || pitch.pitch_outcome === 'foul_tip') strikes++

    if (balls === 0 && strikes === 2) {
      zeroTwoReached = true
      continue
    }

    if (zeroTwoReached) {
      pitchesAfter++
    }
  }

  return pitchesAfter
}

/**
 * Format QAB criteria for display
 */
export function formatQABCriteria(criteria) {
  return criteria.join(' • ')
}
