'use client'

import { useState, useEffect } from 'react'

interface ComparisonTabProps {
  onLoadComparison: (params: {
    layer: string
    startDate1: Date
    endDate1: Date
    startDate2: Date
    endDate2: Date
    cloudPercentage: number
  }) => void
  isLoading?: boolean
  hasDrawnArea?: boolean
}

export default function ComparisonTab({ onLoadComparison, isLoading = false, hasDrawnArea = false }: ComparisonTabProps) {
  const [layer, setLayer] = useState<string>('NDVI-L2A')
  const [date1, setDate1] = useState<string>('')
  const [date2, setDate2] = useState<string>('')
  const [cloudPercentage, setCloudPercentage] = useState<number>(20)

  const dataLayers = [
    { value: 'NDVI-L2A', label: '🌿 NDVI - Vegetation Index', description: 'Monitor plant health and growth' },
    { value: 'NDWI-L2A', label: '💧 NDWI - Water Index', description: 'Detect water bodies and moisture' },
    { value: 'GEOLOGY', label: '⛰️ Geology - Geological Data', description: 'Analyze rock and soil formations' },
    { value: 'LAI_SAVI', label: '🍃 LAI/SAVI - Leaf Area Index', description: 'Measure vegetation density' },
    { value: 'MOISTURE_INDEX', label: '💧 Moisture Index - Soil Moisture', description: 'Track water content in soil' }
  ]

  // Set default dates (30 days apart for each period)
  useEffect(() => {
    const today = new Date()
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
    const sixtyDaysAgo = new Date(today.getTime() - 60 * 24 * 60 * 60 * 1000)
    const ninetyDaysAgo = new Date(today.getTime() - 90 * 24 * 60 * 60 * 1000)
    
    // Date 1 period: 90 days ago to 60 days ago
    setDate1(ninetyDaysAgo.toISOString().split('T')[0])
    // Date 2 period: 60 days ago to 30 days ago  
    setDate2(sixtyDaysAgo.toISOString().split('T')[0])
  }, [])

  const handleLoadComparison = () => {
    if (!date1 || !date2) {
      alert('Please select both dates for comparison')
      return
    }

    if (!hasDrawnArea) {
      alert('Please draw an area on map first')
      return
    }

    const d1 = new Date(date1)
    const d2 = new Date(date2)

    if (d1 >= d2) {
      alert('Date 1 must be earlier than Date 2')
      return
    }

    // Create 30-day date ranges for each period
    const endDate1 = new Date(d1.getTime() + 30 * 24 * 60 * 60 * 1000)
    const endDate2 = new Date(d2.getTime() + 30 * 24 * 60 * 60 * 1000)

    onLoadComparison({
      layer,
      startDate1: d1,
      endDate1: endDate1,
      startDate2: d2,
      endDate2: endDate2,
      cloudPercentage
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center space-x-2">
          <span className="text-2xl">🔄</span>
          <span>Temporal Comparison</span>
        </h3>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center space-x-2">
              <span>📊</span>
              <span>Data Layer</span>
            </label>
            <select 
              id="comparison-layer-select"
              value={layer}
              onChange={(e) => setLayer(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white/80 backdrop-blur-sm"
            >
              {dataLayers.map((layerOption) => (
                <option key={layerOption.value} value={layerOption.value}>
                  {layerOption.label}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mt-2 ml-2">
              {dataLayers.find(l => l.value === layer)?.description}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center space-x-2">
                <span>📅</span>
                <span>Period 1 Start</span>
              </label>
              <input
                type="date"
                id="comparison-date-1"
                value={date1}
                onChange={(e) => setDate1(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white/80 backdrop-blur-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center space-x-2">
                <span>📅</span>
                <span>Period 2 Start</span>
              </label>
              <input
                type="date"
                id="comparison-date-2"
                value={date2}
                onChange={(e) => setDate2(e.target.value)}
                max={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white/80 backdrop-blur-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center space-x-2">
              <span>☁️</span>
              <span>Cloud Coverage: <span id="comparison-cloud-value" className="text-green-600 font-bold">{cloudPercentage}</span>%</span>
            </label>
            <div className="relative">
              <input
                type="range"
                id="comparison-cloud-percentage"
                min="0"
                max="100"
                value={cloudPercentage}
                className="w-full h-3 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-green-600"
                onInput={(e) => {
                  setCloudPercentage(parseInt(e.currentTarget.value))
                  document.getElementById('comparison-cloud-value')!.textContent = e.currentTarget.value
                }}
              />
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span className="flex items-center space-x-1">
                  <span>☀️</span>
                  <span>Clear</span>
                </span>
                <span className="flex items-center space-x-1">
                  <span>☁️</span>
                  <span>Cloudy</span>
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={handleLoadComparison}
            disabled={isLoading || !hasDrawnArea || !date1 || !date2}
            className={`w-full py-4 px-6 rounded-2xl transition-all duration-300 font-bold shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center space-x-3 ${
              hasDrawnArea && date1 && date2 && !isLoading
                ? 'nature-button text-white'
                : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }`}
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Processing Comparison...</span>
              </>
            ) : (
              <>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                </svg>
                <span>🔄 Load Comparison Images</span>
              </>
            )}
          </button>

         

          {hasDrawnArea && (!date1 || !date2) && (
            <div className="nature-card rounded-2xl p-5 border-l-4 border-yellow-500">
              <div className="flex items-center space-x-3">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-gray-800">Select Date Periods</p>
                  <p className="text-sm text-gray-600 mt-1">Choose two different time periods to compare changes over time in your selected area.</p>
                </div>
              </div>
            </div>
          )}

          
        </div>
      </div>
    </div>
  )
}