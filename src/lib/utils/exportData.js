import * as XLSX from 'xlsx'

/**
 * Export hitting data to Excel file
 * @param {Array} sessions - hitting_sessions data
 * @param {Array} atBats - at_bats data with pitches
 */
export function exportHittingDataToExcel(sessions, atBats) {
  const workbook = XLSX.utils.book_new()

  // 1. SUMMARY SHEET - One row per game with stats
  const summaryData = sessions.map((session) => {
    const gameAtBats = atBats.filter((ab) => ab.session_id === session.id)
    const hits = gameAtBats.filter((ab) =>
      ['single', 'double', 'triple', 'home_run'].includes(ab.result)
    ).length
    const singles = gameAtBats.filter((ab) => ab.result === 'single').length
    const doubles = gameAtBats.filter((ab) => ab.result === 'double').length
    const triples = gameAtBats.filter((ab) => ab.result === 'triple').length
    const homeRuns = gameAtBats.filter((ab) => ab.result === 'home_run').length
    const strikeouts = gameAtBats.filter((ab) => ab.result === 'strikeout').length
    const walks = gameAtBats.filter((ab) => ab.result === 'walk').length
    const outs = gameAtBats.filter((ab) => ab.result === 'out').length
    const hbp = gameAtBats.filter((ab) => ab.result === 'hbp').length
    const rbis = gameAtBats.reduce((sum, ab) => sum + (ab.rbis || 0), 0)
    const qabs = gameAtBats.filter((ab) => ab.is_qab).length
    const totalABs = gameAtBats.filter((ab) =>
      !['walk', 'hbp', 'sac_fly', 'reached_on_error'].includes(ab.result)
    ).length
    const ba = totalABs > 0 ? (hits / totalABs).toFixed(3) : '-'
    const qabPercent = gameAtBats.length > 0 ? Math.round((qabs / gameAtBats.length) * 100) : 0

    return {
      Date: new Date(session.date).toLocaleDateString('en-US'),
      Opponent: session.opponent,
      'At-Bats': gameAtBats.length,
      'Hit': hits,
      'Single': singles,
      'Double': doubles,
      'Triple': triples,
      'Home Run': homeRuns,
      'Strikeout': strikeouts,
      'Walk': walks,
      'Out': outs,
      'HBP': hbp,
      'RBI': rbis,
      'BA': ba,
      'QAB': qabs,
      'QAB%': qabPercent + '%',
    }
  })

  const summarySheet = XLSX.utils.json_to_sheet(summaryData)
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Game Summary')

  // 2. DETAILED SHEET - All at-bats with game context
  const detailedData = []
  sessions.forEach((session) => {
    const gameAtBats = atBats.filter((ab) => ab.session_id === session.id)
    gameAtBats.forEach((atBat) => {
      detailedData.push({
        Date: new Date(session.date).toLocaleDateString('en-US'),
        Opponent: session.opponent,
        'AB#': atBat.at_bat_num,
        Inning: atBat.inning || '-',
        Outs: atBat.outs !== null ? atBat.outs : '-',
        'Runners on Base': getRunnersOnBase(atBat),
        'Score Before': atBat.score_before || '-',
        'Pitch Count': atBat.pitch_count || '-',
        Result: formatResult(atBat.result),
        'Hit Type': atBat.hit_type || '-',
        'Sac Type': atBat.sac_type || '-',
        RBI: atBat.rbis || 0,
        'QAB': atBat.is_qab ? 'Yes' : 'No',
        'Runners Advanced': atBat.runners_advanced || '-',
        Notes: atBat.notes || '-',
      })
    })
  })

  const detailedSheet = XLSX.utils.json_to_sheet(detailedData)
  XLSX.utils.book_append_sheet(workbook, detailedSheet, 'At-Bats')

  // 3. PITCH-BY-PITCH SHEET - Every pitch
  const pitchData = []
  sessions.forEach((session) => {
    const gameAtBats = atBats.filter((ab) => ab.session_id === session.id)
    gameAtBats.forEach((atBat) => {
      atBat.pitches?.forEach((pitch) => {
        pitchData.push({
          Date: new Date(session.date).toLocaleDateString('en-US'),
          Opponent: session.opponent,
          'AB#': atBat.at_bat_num,
          'Pitch#': pitch.pitch_num || '-',
          Zone: pitch.strike_zone_location || '-',
          'Pitch Outcome': formatPitchOutcome(pitch.pitch_outcome) || '-',
          'Contact Quality': pitch.contact_quality || '-',
          'Contact Location': pitch.contact_location || '-',
          'Contact Type': formatContactType(pitch.contact_type) || '-',
          Notes: pitch.notes || '-',
        })
      })
    })
  })

  const pitchSheet = XLSX.utils.json_to_sheet(pitchData)
  XLSX.utils.book_append_sheet(workbook, pitchSheet, 'Pitch-by-Pitch')

  // Set column widths
  const setColumnWidth = (sheet, widths) => {
    sheet['!cols'] = widths.map((w) => ({ wch: w }))
  }

  setColumnWidth(summarySheet, [12, 12, 10, 6, 8, 8, 8, 8, 8, 8, 8, 8, 6, 6, 8])
  setColumnWidth(
    detailedSheet,
    [12, 12, 6, 8, 6, 16, 12, 10, 12, 10, 10, 6, 6, 16, 16]
  )
  setColumnWidth(pitchSheet, [12, 12, 6, 7, 6, 14, 16, 16, 12, 16])

  // Generate filename with date
  const today = new Date().toISOString().split('T')[0]
  const filename = `Max_Hitting_Data_${today}.xlsx`

  // Write the file
  XLSX.writeFile(workbook, filename)
}

function formatResult(result) {
  const map = {
    strikeout: 'Strikeout',
    single: 'Single',
    double: 'Double',
    triple: 'Triple',
    home_run: 'Home Run',
    out: 'Out',
    walk: 'Walk',
    hbp: 'HBP',
    sac_fly: 'Sac Fly',
    reached_on_error: 'Reached on Error',
  }
  return map[result] || result
}

function formatPitchOutcome(outcome) {
  const map = {
    strike_looking: 'Strike (Looking)',
    strike_swinging: 'Strike (Swinging)',
    ball: 'Ball',
    foul: 'Foul',
    foul_tip: 'Foul Tip',
    in_play: 'In Play',
    hbp: 'HBP',
  }
  return map[outcome] || outcome
}

function formatContactType(type) {
  const map = {
    gb: 'Ground Ball',
    ld: 'Line Drive',
    fb: 'Fly Ball',
    pu: 'Popup',
  }
  return map[type] || type
}

function getRunnersOnBase(atBat) {
  const runners = []
  if (atBat.runners_1b) runners.push('1B')
  if (atBat.runners_2b) runners.push('2B')
  if (atBat.runners_3b) runners.push('3B')
  return runners.length > 0 ? runners.join(', ') : 'Empty'
}
