'use client'

import { useEffect, useState } from 'react'

interface LegendGradient {
  position: number
  color: string
  label: string
}

interface LegendConfig {
  type: 'continuous'
  minPosition: number
  maxPosition: number
  gradients: LegendGradient[]
}

interface SatelliteLegendProps {
  activeLayer?: string
  isVisible: boolean
}

const legendConfigs: Record<string, LegendConfig> = {
  'MOISTURE_INDEX': {
    type: 'continuous',
    minPosition: -1,
    maxPosition: 1,
    gradients: [
      {
        position: -0.8,
        color: '#800000',
        label: 'Very Dry'
      },
      {
        position: -0.24,
        color: '#ff0000',
        label: 'Dry'
      },
      {
        position: -0.032,
        color: '#ffff00',
        label: 'Low Moisture'
      },
      {
        position: 0.032,
        color: '#00ffff',
        label: 'Moderate Moisture'
      },
      {
        position: 0.24,
        color: '#0000ff',
        label: 'High Moisture'
      },
      {
        position: 0.8,
        color: '#000080',
        label: 'Very High Moisture'
      }
    ]
  },
  'NDVI-L2A': {
    type: 'continuous',
    minPosition: -1,
    maxPosition: 1.0,
    gradients: [
      {
        position: -0.2,
        color: '#000000',
        label: 'Water'
      },
      {
        position: 0,
        color: '#000000',
        label: 'Barren'
      },
      {
        position: 0.3,
        color: '#004c00',
        label: 'Sparse Vegetation'
      },
      {
        position: 0.5,
        color: '#2b8000',
        label: 'Moderate Vegetation'
      },
      {
        position: 0.8,
        color: '#aacc55',
        label: 'Dense Vegetation'
      },
      {
        position: 1.0,
        color: '#ffffff',
        label: 'Very Dense Vegetation'
      }
    ]
  }
}

export default function SatelliteLegend({ activeLayer, isVisible }: SatelliteLegendProps) {
  const [currentLegend, setCurrentLegend] = useState<LegendConfig | null>(null)

  useEffect(() => {
    if (isVisible && activeLayer && legendConfigs[activeLayer]) {
      setCurrentLegend(legendConfigs[activeLayer])
    } else {
      setCurrentLegend(null)
    }
  }, [isVisible, activeLayer])

  if (!isVisible || !currentLegend) {
    return null
  }

  const createGradientStyle = () => {
    const gradients = currentLegend.gradients
    const gradientStops = gradients.map(gradient => {
      const percentage = ((gradient.position - currentLegend.minPosition) / 
                        (currentLegend.maxPosition - currentLegend.minPosition)) * 100
      return `${gradient.color} ${percentage}%`
    }).join(', ')
    
    return `linear-gradient(to top, ${gradientStops})`
  }

  const getPositionPercentage = (position: number) => {
    return ((position - currentLegend.minPosition) / 
            (currentLegend.maxPosition - currentLegend.minPosition)) * 100
  }

  return (
    <div className="absolute bottom-20 right-8 z-[950] bg-white/95 backdrop-blur-sm rounded-xl shadow-2xl border border-green-200/50 p-3">
      <div className="flex items-stretch gap-2">
        {/* Gradient bar */}
        <div className="relative w-8 h-48 rounded-lg overflow-hidden border-2 border-gray-300 shadow-inner">
          <div 
            className="absolute inset-0 w-full h-full"
            style={{ background: createGradientStyle() }}
          />
        </div>

        {/* Min and Max values only */}
        <div className="relative h-48" style={{ width: '45px' }}>
          {/* Max value (top) */}
          <div
            className="absolute left-0 flex items-center gap-1"
            style={{
              top: '0%',
              transform: 'translateY(-50%)'
            }}
          >
            <div className="w-2 h-0.5 bg-gray-700" />
            <span className="text-xs font-medium text-gray-800">
              {currentLegend.maxPosition.toFixed(2)}
            </span>
          </div>

          {/* Min value (bottom) */}
          <div
            className="absolute left-0 flex items-center gap-1"
            style={{
              bottom: '0%',
              transform: 'translateY(50%)'
            }}
          >
            <div className="w-2 h-0.5 bg-gray-700" />
            <span className="text-xs font-medium text-gray-800">
              {currentLegend.minPosition.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}