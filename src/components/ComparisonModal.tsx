'use client'

import { useState, useRef, useEffect } from 'react'

interface ComparisonModalProps {
  isOpen: boolean
  onClose: () => void
  image1Url: string
  image2Url: string
  date1: string
  date2: string
  layer: string
  locationName?: string
}

export default function ComparisonModal({
  isOpen,
  onClose,
  image1Url,
  image2Url,
  date1,
  date2,
  layer,
  locationName = "Selected Area"
}: ComparisonModalProps) {
  const [activeView, setActiveView] = useState<'side-by-side' | 'slider'>('side-by-side')
  const [activeImage, setActiveImage] = useState<'left' | 'right' | 'both'>('both')
  const [zoomLevel, setZoomLevel] = useState(1)
  const [sliderPosition, setSliderPosition] = useState(50)
  const [isDragging, setIsDragging] = useState(false)
  const sliderContainerRef = useRef<HTMLDivElement>(null)

  if (!isOpen) return null

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.2, 3))
  }

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.2, 0.5))
  }

  const handleReset = () => {
    setZoomLevel(1)
    setActiveImage('both')
    setSliderPosition(50)
  }

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !sliderContainerRef.current) return

    const containerRect = sliderContainerRef.current.getBoundingClientRect()
    const x = e.clientX - containerRect.left
    const percentage = (x / containerRect.width) * 100
    setSliderPosition(Math.min(Math.max(percentage, 0), 100))
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove)
      document.addEventListener('mouseup', handleMouseUp)
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
      }
    }
  }, [isDragging])

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[9999] p-4 pt-20">
      <div className="bg-white rounded-xl shadow-2xl max-w-[95vw] w-full max-h-[85vh] flex flex-col overflow-hidden">
        {/* Header with Tabs and Close Button on Same Level */}
        <div className="bg-white border-b p-4 flex-shrink-0">
          <div className="flex items-center justify-between">
            {/* Tab Selection */}
            <div className="flex bg-gray-100 rounded-lg">
              <button
                onClick={() => setActiveView('side-by-side')}
                className={`px-4 py-2 text-sm font-medium rounded-l-lg transition-colors ${
                  activeView === 'side-by-side' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-700 hover:bg-gray-200'
                }`}
              >
                📊 Side-by-Side
              </button>
              <button
                onClick={() => setActiveView('slider')}
                className={`px-4 py-2 text-sm font-medium rounded-r-lg transition-colors ${
                  activeView === 'slider' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-700 hover:bg-gray-200'
                }`}
              >
                🎚️ Slider
              </button>
            </div>

            {/* Close Button */}
            <button
              onClick={onClose}
              className="text-gray-600 hover:bg-gray-100 p-2 rounded-lg transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Image Comparison Area - Directly Below */}
        <div className="flex-1 overflow-hidden p-4">
          {activeView === 'side-by-side' ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 h-full">
              {/* Image 1 - Earlier Date */}
              {(activeImage === 'left' || activeImage === 'both') && (
                <div className="flex flex-col h-full min-w-0">
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 mb-2 flex-shrink-0">
                    <h3 className="font-semibold text-blue-900 text-sm">
                      Image from {date1.split(' - ')[0]}
                    </h3>
                  </div>
                  <div className="flex-1 bg-gray-100 rounded-lg overflow-auto shadow-lg border border-gray-200">
                    <div className="w-full h-full flex items-center justify-center p-2">
                      <img
                        src={image1Url}
                        alt={`Satellite image from ${date1}`}
                        className="max-w-full max-h-full object-contain"
                        style={{ 
                          transform: `scale(${zoomLevel})`,
                          transformOrigin: 'center',
                          width: '450px',
                          height: '450px'
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Image 2 - Later Date */}
              {(activeImage === 'right' || activeImage === 'both') && (
                <div className="flex flex-col h-full min-w-0">
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-2 mb-2 flex-shrink-0">
                    <h3 className="font-semibold text-purple-900 text-sm">
                      Image from {date2.split(' - ')[0]}
                    </h3>
                  </div>
                  <div className="flex-1 bg-gray-100 rounded-lg overflow-auto shadow-lg border border-gray-200">
                    <div className="w-full h-full flex items-center justify-center p-2">
                      <img
                        src={image2Url}
                        alt={`Satellite image from ${date2}`}
                        className="max-w-full max-h-full object-contain"
                        style={{ 
                          transform: `scale(${zoomLevel})`,
                          transformOrigin: 'center',
                          width: '450px',
                          height: '450px'
                        }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex flex-col h-full">
              <div className="text-center mb-2 text-sm text-gray-600">
                Drag the slider to compare • Older image on left, newer on right
              </div>
              <div 
                ref={sliderContainerRef}
                className="flex-1 relative bg-gray-100 rounded-lg overflow-hidden shadow-lg border border-gray-200 min-h-[480px]"
                style={{ cursor: isDragging ? 'ew-resize' : 'default' }}
              >
                <div 
                  className="absolute inset-0 flex items-center justify-center"
                  style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'center' }}
                >
                  <img
                    src={image1Url}
                    alt={`Older satellite image from ${date1}`}
                    className="object-contain"
                    style={{ width: '450px', height: '450px' }}
                    draggable={false}
                  />
                </div>

                <div 
                  className="absolute inset-0 flex items-center justify-center"
                  style={{ 
                    clipPath: `inset(0 ${100 - sliderPosition}% 0 0)`,
                    transform: `scale(${zoomLevel})`, 
                    transformOrigin: 'center'
                  }}
                >
                  <img
                    src={image2Url}
                    alt={`Newer satellite image from ${date2}`}
                    className="object-contain"
                    style={{ width: '450px', height: '450px' }}
                    draggable={false}
                  />
                </div>

                <div
                  className="absolute top-0 bottom-0 w-1 bg-white shadow-lg cursor-ew-resize"
                  style={{ left: `${sliderPosition}%`, transform: 'translateX(-50%)' }}
                  onMouseDown={handleMouseDown}
                >
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white rounded-full shadow-lg p-2 border-2 border-gray-300">
                    <svg className="w-4 h-4 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l4-4 4 4m0 6l-4 4-4-4" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}