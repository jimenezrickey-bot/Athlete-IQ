/**
 * Baseball statistics calculator utility
 * Calculates batting average, OBP, SLG, OPS, and other hitting metrics
 */

/**
 * Calculate Batting Average
 * BA = Hits / At-Bats
 * @param {Array} atBats - Array of at-bat objects
 * @returns {number} BA value (0.000-1.000)
 */
export function calculateBattingAverage(atBats) {
  if (!atBats || atBats.length === 0) return 0

  const hits = atBats.filter((ab) =>
    ['single', 'double', 'triple', 'home_run'].includes(ab.result)
  ).length

  const totalABs = atBats.filter((ab) =>
    ![
      'walk',
      'hbp',
      'sac_fly',
      'reached_on_error',
    ].includes(ab.result)
  ).length

  if (totalABs === 0) return 0
  return hits / totalABs
}

/**
 * Calculate On-Base Percentage
 * OBP = (Hits + Walks + HBP) / (AB + Walks + HBP + Sac Flies)
 * @param {Array} atBats - Array of at-bat objects
 * @returns {number} OBP value (0.000-1.000)
 */
export function calculateOBP(atBats) {
  if (!atBats || atBats.length === 0) return 0

  const hits = atBats.filter((ab) =>
    ['single', 'double', 'triple', 'home_run'].includes(ab.result)
  ).length

  const walks = atBats.filter((ab) => ab.result === 'walk').length
  const hbp = atBats.filter((ab) => ab.result === 'hbp').length
  const sacFlies = atBats.filter((ab) => ab.sac_type === 'sac_fly').length

  const totalABs = atBats.filter((ab) =>
    ![
      'walk',
      'hbp',
      'sac_fly',
      'reached_on_error',
    ].includes(ab.result)
  ).length

  const denominator = totalABs + walks + hbp + sacFlies

  if (denominator === 0) return 0
  return (hits + walks + hbp) / denominator
}

/**
 * Calculate Slugging Percentage
 * SLG = Total Bases / At-Bats (1B=1, 2B=2, 3B=3, HR=4)
 * @param {Array} atBats - Array of at-bat objects
 * @returns {number} SLG value (0.000-4.000)
 */
export function calculateSLG(atBats) {
  if (!atBats || atBats.length === 0) return 0

  const totalBases = atBats.reduce((sum, ab) => {
    let bases = 0
    switch (ab.result) {
      case 'single':
        bases = 1
        break
      case 'double':
        bases = 2
        break
      case 'triple':
        bases = 3
        break
      case 'home_run':
        bases = 4
        break
      default:
        bases = 0
    }
    return sum + bases
  }, 0)

  const totalABs = atBats.filter((ab) =>
    ![
      'walk',
      'hbp',
      'sac_fly',
      'reached_on_error',
    ].includes(ab.result)
  ).length

  if (totalABs === 0) return 0
  return totalBases / totalABs
}

/**
 * Calculate OPS (On-Base Plus Slugging)
 * OPS = OBP + SLG
 * @param {number} obp - On-Base Percentage
 * @param {number} slg - Slugging Percentage
 * @returns {number} OPS value
 */
export function calculateOPS(obp, slg) {
  return obp + slg
}

/**
 * Calculate Quality At-Bat Percentage
 * QAB% = Quality At-Bats / Total At-Bats × 100
 * @param {Array} atBats - Array of at-bat objects
 * @returns {number} Percentage (0-100)
 */
export function calculateQABPercentage(atBats) {
  if (!atBats || atBats.length === 0) return 0

  const qabs = atBats.filter((ab) => ab.is_qab).length
  return (qabs / atBats.length) * 100
}

/**
 * Calculate Strikeout Rate
 * K% = Strikeouts / At-Bats × 100
 * @param {Array} atBats - Array of at-bat objects
 * @returns {number} Percentage (0-100)
 */
export function calculateStrikeoutRate(atBats) {
  if (!atBats || atBats.length === 0) return 0

  const strikeouts = atBats.filter((ab) => ab.result === 'strikeout').length

  const totalABs = atBats.filter((ab) =>
    ![
      'walk',
      'hbp',
      'sac_fly',
      'reached_on_error',
    ].includes(ab.result)
  ).length

  if (totalABs === 0) return 0
  return (strikeouts / totalABs) * 100
}

/**
 * Calculate Walk Rate
 * BB% = Walks / At-Bats × 100
 * @param {Array} atBats - Array of at-bat objects
 * @returns {number} Percentage (0-100)
 */
export function calculateWalkRate(atBats) {
  if (!atBats || atBats.length === 0) return 0

  const walks = atBats.filter((ab) => ab.result === 'walk').length

  const totalABs = atBats.filter((ab) =>
    ![
      'walk',
      'hbp',
      'sac_fly',
      'reached_on_error',
    ].includes(ab.result)
  ).length

  if (totalABs === 0) return 0
  return (walks / totalABs) * 100
}

/**
 * Calculate RBI Total
 * @param {Array} atBats - Array of at-bat objects
 * @returns {number} Total RBIs
 */
export function calculateRBITotal(atBats) {
  if (!atBats || atBats.length === 0) return 0

  return atBats.reduce((sum, ab) => sum + (ab.rbis || 0), 0)
}

/**
 * Calculate Contact Rate
 * Contact% = Pitches in play / Total pitches × 100
 * @param {Array} atBats - Array of at-bat objects
 * @param {Array} pitches - Array of pitch objects (optional, for more accurate calculation)
 * @returns {number} Percentage (0-100)
 */
export function calculateContactRate(atBats, pitches = null) {
  // If pitch data is available, calculate from actual pitches
  if (pitches && pitches.length > 0) {
    const inPlayPitches = pitches.filter((p) => p.pitch_outcome === 'in_play')
      .length
    const totalPitches = pitches.length

    if (totalPitches === 0) return 0
    return (inPlayPitches / totalPitches) * 100
  }

  // Fallback: estimate from at-bats
  if (!atBats || atBats.length === 0) return 0

  const totalABs = atBats.filter((ab) =>
    ![
      'walk',
      'hbp',
      'sac_fly',
      'reached_on_error',
    ].includes(ab.result)
  ).length

  const strikeouts = atBats.filter((ab) => ab.result === 'strikeout').length

  if (totalABs === 0) return 0

  // Estimate: swings = ABs + strikeouts (rough approximation)
  // Contact = 1 - (K / swings)
  const estimatedSwings = totalABs + strikeouts
  if (estimatedSwings === 0) return 100

  return ((estimatedSwings - strikeouts) / estimatedSwings) * 100
}

/**
 * Get performance color category for a metric
 * @param {string} metric - Metric name (ba, obp, slg, ops, qab, k_rate, bb_rate, contact_rate)
 * @param {number} value - Metric value
 * @returns {string} Color category: 'excellent' | 'good' | 'average' | 'needs-work'
 */
export function getPerformanceColor(metric, value) {
  switch (metric) {
    case 'ba':
      if (value >= 0.3) return 'excellent'
      if (value >= 0.25) return 'good'
      if (value >= 0.2) return 'average'
      return 'needs-work'

    case 'obp':
      if (value >= 0.4) return 'excellent'
      if (value >= 0.35) return 'good'
      if (value >= 0.3) return 'average'
      return 'needs-work'

    case 'slg':
      if (value >= 0.5) return 'excellent'
      if (value >= 0.4) return 'good'
      if (value >= 0.35) return 'average'
      return 'needs-work'

    case 'ops':
      if (value >= 0.9) return 'excellent'
      if (value >= 0.75) return 'good'
      if (value >= 0.65) return 'average'
      return 'needs-work'

    case 'qab':
      if (value >= 60) return 'excellent'
      if (value >= 50) return 'good'
      if (value >= 40) return 'average'
      return 'needs-work'

    case 'k_rate':
      if (value < 25) return 'excellent'
      if (value < 35) return 'good'
      if (value < 40) return 'average'
      return 'needs-work'

    case 'bb_rate':
      if (value >= 10) return 'excellent'
      if (value >= 8) return 'good'
      if (value >= 5) return 'average'
      return 'needs-work'

    case 'contact_rate':
      if (value >= 75) return 'excellent'
      if (value >= 70) return 'good'
      if (value >= 60) return 'average'
      return 'needs-work'

    default:
      return 'average'
  }
}

/**
 * Get Tailwind color classes based on performance category
 * @param {string} category - Performance category from getPerformanceColor
 * @returns {object} Object with bg, text, and border classes
 */
export function getColorClasses(category) {
  switch (category) {
    case 'excellent':
      return {
        bg: 'bg-green-50',
        text: 'text-green-700',
        border: 'border-green-300',
        badge: 'bg-green-100 text-green-800',
      }
    case 'good':
      return {
        bg: 'bg-blue-50',
        text: 'text-blue-700',
        border: 'border-blue-300',
        badge: 'bg-blue-100 text-blue-800',
      }
    case 'average':
      return {
        bg: 'bg-yellow-50',
        text: 'text-yellow-700',
        border: 'border-yellow-300',
        badge: 'bg-yellow-100 text-yellow-800',
      }
    case 'needs-work':
      return {
        bg: 'bg-red-50',
        text: 'text-red-700',
        border: 'border-red-300',
        badge: 'bg-red-100 text-red-800',
      }
    default:
      return {
        bg: 'bg-gray-50',
        text: 'text-gray-700',
        border: 'border-gray-300',
        badge: 'bg-gray-100 text-gray-800',
      }
  }
}

/**
 * Format statistic for display
 * @param {number} value - Stat value
 * @param {string} type - Type of stat: ba, percentage, count, or ops
 * @returns {string} Formatted stat string
 */
export function formatStat(value, type) {
  switch (type) {
    case 'ba':
      return '.' + Math.round(value * 1000).toString().padStart(3, '0')
    case 'percentage':
      return Math.round(value) + '%'
    case 'count':
      return Math.round(value).toString()
    case 'ops':
      return Math.round(value * 100) / 100
    case 'decimal':
      return Math.round(value * 100) / 100
    default:
      return value.toFixed(2)
  }
}

/**
 * Calculate all statistics at once
 * @param {Array} atBats - Array of at-bat objects
 * @param {Array} pitches - Array of pitch objects (optional)
 * @returns {object} Object containing all calculated statistics
 */
export function calculateAllStats(atBats, pitches = null) {
  const ba = calculateBattingAverage(atBats)
  const obp = calculateOBP(atBats)
  const slg = calculateSLG(atBats)
  const ops = calculateOPS(obp, slg)

  return {
    ba,
    obp,
    slg,
    ops,
    qabPercentage: calculateQABPercentage(atBats),
    strikeoutRate: calculateStrikeoutRate(atBats),
    walkRate: calculateWalkRate(atBats),
    rbiTotal: calculateRBITotal(atBats),
    contactRate: calculateContactRate(atBats, pitches),
    totalABs: atBats.filter((ab) =>
      ![
        'walk',
        'hbp',
        'sac_fly',
        'reached_on_error',
      ].includes(ab.result)
    ).length,
    games: atBats.length > 0 ? 1 : 0, // Will be set by caller based on date range
  }
}
