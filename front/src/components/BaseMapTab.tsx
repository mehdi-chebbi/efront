'use client'

interface BaseMapTabProps {
  currentBaseMap: string
  onBaseMapChange: (mapName: string) => void
}

export default function BaseMapTab({
  currentBaseMap,
  onBaseMapChange
}: BaseMapTabProps) {
  const baseMaps = [
    { id: 'OpenStreetMap', name: 'Street Map', icon: '', color: 'from-gray-600 to-gray-700' },
    { id: 'Satellite', name: 'Satellite', icon: '', color: 'from-blue-600 to-indigo-700' },
    { id: 'Dark', name: 'Dark Mode', icon: '', color: 'from-gray-800 to-black' },
    { id: 'Light', name: 'Light Mode', icon: '', color: 'from-yellow-400 to-orange-400' },
    { id: 'Topographic', name: 'Topographic', icon: '', color: 'from-green-700 to-emerald-800' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center space-x-2">
          <span className="text-2xl">🗺️</span>
          <span>Choose Base Map</span>
        </h3>
        
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            {baseMaps.map((map) => (
              <button
                key={map.id}
                onClick={() => onBaseMapChange(map.id)}
                className={`p-4 rounded-2xl border-2 transition-all duration-300 text-left group hover:scale-105 shadow-lg hover:shadow-xl transform hover:-translate-y-1 ${
                  currentBaseMap === map.id
                    ? 'border-green-500 shadow-lg bg-green-50'
                    : 'border-gray-200 hover:border-green-300 hover:shadow-md bg-white/80 backdrop-blur-sm'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`text-3xl group-hover:scale-110 transition-transform duration-300 ${
                    currentBaseMap === map.id ? 'animate-pulse' : ''
                  }`}>
                    {map.icon}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-semibold text-gray-900 whitespace-nowrap">{map.name}</div>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}