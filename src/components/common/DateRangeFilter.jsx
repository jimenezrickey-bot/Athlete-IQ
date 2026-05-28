import { useState } from 'react'

export function DateRangeFilter({ onFilterChange }) {
  const [filterType, setFilterType] = useState('last7')
  const [customStart, setCustomStart] = useState('')
  const [customEnd, setCustomEnd] = useState('')

  const getDateRange = (type) => {
    const today = new Date()
    let start, end

    switch (type) {
      case 'last7':
        end = today
        start = new Date(today)
        start.setDate(today.getDate() - 7)
        break
      case 'last30':
        end = today
        start = new Date(today)
        start.setDate(today.getDate() - 30)
        break
      case 'thisMonth':
        start = new Date(today.getFullYear(), today.getMonth(), 1)
        end = today
        break
      case 'custom':
        if (!customStart || !customEnd) return
        start = new Date(customStart)
        end = new Date(customEnd)
        break
      default:
        return
    }

    return {
      start: start.toISOString().split('T')[0],
      end: end.toISOString().split('T')[0],
    }
  }

  const handleFilterChange = (type) => {
    setFilterType(type)
    const range = getDateRange(type)
    if (range) {
      onFilterChange(range.start, range.end)
    }
  }

  const handleCustomFilter = () => {
    const range = getDateRange('custom')
    if (range) {
      onFilterChange(range.start, range.end)
    }
  }

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-6 border border-gray-200">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Filter by Date</h3>

      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => handleFilterChange('last7')}
          className={`px-3 py-1 rounded-lg text-sm font-medium transition ${
            filterType === 'last7'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Last 7 days
        </button>
        <button
          onClick={() => handleFilterChange('last30')}
          className={`px-3 py-1 rounded-lg text-sm font-medium transition ${
            filterType === 'last30'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Last 30 days
        </button>
        <button
          onClick={() => handleFilterChange('thisMonth')}
          className={`px-3 py-1 rounded-lg text-sm font-medium transition ${
            filterType === 'thisMonth'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          This month
        </button>
        <button
          onClick={() => setFilterType('custom')}
          className={`px-3 py-1 rounded-lg text-sm font-medium transition ${
            filterType === 'custom'
              ? 'bg-blue-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          Custom
        </button>
      </div>

      {filterType === 'custom' && (
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-600 mb-1">
              From
            </label>
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex-1">
            <label className="block text-xs font-medium text-gray-600 mb-1">
              To
            </label>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex items-end">
            <button
              onClick={handleCustomFilter}
              className="w-full sm:w-auto bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition text-sm"
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
