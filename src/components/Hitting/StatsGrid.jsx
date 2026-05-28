import { StatCard } from './StatCard'
import { formatStat } from '../../lib/utils/statsCalculator'

export function StatsGrid({ stats, totalGames }) {
  if (!stats) {
    return (
      <div className="bg-gray-50 rounded-lg border-2 border-gray-200 p-6 text-center">
        <p className="text-gray-600">
          No statistics available for this date range
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Primary Stats Row - Core Offensive Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <StatCard
          label="Batting Average"
          value={formatStat(stats.ba, 'ba')}
          type="ba"
          context={`${stats.totalABs} ABs`}
          metric="ba"
        />
        <StatCard
          label="On-Base %"
          value={formatStat(stats.obp, 'percentage')}
          type="percentage"
          context={`OBP`}
          metric="obp"
        />
        <StatCard
          label="Slugging %"
          value={formatStat(stats.slg, 'percentage')}
          type="percentage"
          context={`SLG`}
          metric="slg"
        />
        <StatCard
          label="OPS"
          value={formatStat(stats.ops, 'ops')}
          type="ops"
          context={`OBP+SLG`}
          metric="ops"
        />
      </div>

      {/* Secondary Stats Row - Additional Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
        <StatCard
          label="Quality ABs"
          value={formatStat(stats.qabPercentage, 'percentage')}
          type="percentage"
          context={`QAB%`}
          metric="qab"
        />
        <StatCard
          label="Strikeout Rate"
          value={formatStat(stats.strikeoutRate, 'percentage')}
          type="percentage"
          context={`K%`}
          metric="k_rate"
        />
        <StatCard
          label="Walk Rate"
          value={formatStat(stats.walkRate, 'percentage')}
          type="percentage"
          context={`BB%`}
          metric="bb_rate"
        />
        <StatCard
          label="RBIs"
          value={formatStat(stats.rbiTotal, 'count')}
          type="count"
          context={`Total`}
        />
        <StatCard
          label="Contact Rate"
          value={formatStat(stats.contactRate, 'percentage')}
          type="percentage"
          context={`Contact%`}
          metric="contact_rate"
        />
        <StatCard
          label="Games"
          value={formatStat(totalGames || stats.games, 'count')}
          type="count"
          context={`Sessions`}
        />
      </div>
    </div>
  )
}
