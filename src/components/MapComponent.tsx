'use client'

import { useEffect, useRef, useState } from 'react'
import dynamic from 'next/dynamic'
import BaseMapTab from './BaseMapTab'
import SatelliteDataTab from './SatelliteDataTab'
import StatisticsTab from './StatisticsTab'
import ComparisonTab from './ComparisonTab'
import ComparisonModal from './ComparisonModal'
import TimeSeriesChart from './TimeSeriesChart'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { useAuth } from '@/contexts/AuthContext'
import SatelliteLegend from './SatelliteLegend'

// Dynamically import map core to avoid SSR issues
const MapCore = dynamic(() => import('./MapCore'), {
  ssr: false,
  loading: () => (
    <div className="h-screen w-full flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">Loading map...</p>
      </div>
    </div>
  )
})

interface MapProps {
  className?: string
}

export default function MapComponent({ className = '' }: MapProps) {
  const { user } = useAuth()
  const [currentBaseMap, setCurrentBaseMap] = useState<string>('OpenStreetMap')
  const [activeTab, setActiveTab] = useState<'basemap' | 'wms' | 'statistics' | 'comparison'>('basemap')
  const [statusText, setStatusText] = useState<string>('')
  const [imageMetadata, setImageMetadata] = useState<{
    areaName: string
    startDate: string
    endDate: string
    layer: string
    isVisible: boolean
  } | null>(null)
  const [hasDrawnArea, setHasDrawnArea] = useState<boolean>(false)
  const [isLoadingStatistics, setIsLoadingStatistics] = useState<boolean>(false)
  const [statisticsData, setStatisticsData] = useState<any>(null)
  const [showStatisticsModal, setShowStatisticsModal] = useState<boolean>(false)
  const [showAIModal, setShowAIModal] = useState<boolean>(false)
  const [isLoadingAI, setIsLoadingAI] = useState<boolean>(false)
  const [conversationHistory, setConversationHistory] = useState<Array<{role: 'user' | 'assistant', content: string}>>([])
  const [currentMessage, setCurrentMessage] = useState<string>('')
  const [isTyping, setIsTyping] = useState<boolean>(false)
  const [isSavingChat, setIsSavingChat] = useState<boolean>(false)
  const [activeDrawingTool, setActiveDrawingTool] = useState<string | null>(null)
  
  // Location cache for geocoding results
  const locationCache = useRef(new Map()).current
  
  // Comparison states
  const [showComparisonModal, setShowComparisonModal] = useState<boolean>(false)
  const [isLoadingComparison, setIsLoadingComparison] = useState<boolean>(false)
  const [comparisonData, setComparisonData] = useState<{
    image1Url: string
    image2Url: string
    date1: string
    date2: string
    layer: string
  } | null>(null)

  // Keyboard shortcuts for zoom
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === '+' || e.key === '=') {
        const mapCore = (window as any).mapCore
        if (mapCore && mapCore.zoomIn) {
          mapCore.zoomIn()
        }
      } else if (e.key === '-' || e.key === '_') {
        const mapCore = (window as any).mapCore
        if (mapCore && mapCore.zoomOut) {
          mapCore.zoomOut()
        }
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [])

  // Handle base map change
  const handleBaseMapChange = (mapName: string) => {
    setCurrentBaseMap(mapName)
  }

  // Handle drawing completion
  const handleDrawComplete = (bounds: any, layerType: 'polygon' | 'rectangle' | 'circle') => {
    setHasDrawnArea(true)
    setActiveDrawingTool(null) // Reset active tool after drawing
    console.log('Draw completed:', { bounds, layerType })
  }

  // Handle status updates
  const handleStatusUpdate = (status: string) => {
    setStatusText(status)
  }

  // Handle drawing tools
  const handleDrawPolygon = () => {
    const mapCore = (window as any).mapCore
    if (mapCore && mapCore.enablePolygonDrawing) {
      mapCore.enablePolygonDrawing()
    }
  }

  const handleDrawRectangle = () => {
    const mapCore = (window as any).mapCore
    if (mapCore && mapCore.enableRectangleDrawing) {
      mapCore.enableRectangleDrawing()
    }
  }

  const handleClearAll = () => {
    const mapCore = (window as any).mapCore
    if (mapCore && mapCore.clearAllDrawings) {
      mapCore.clearAllDrawings()
      setHasDrawnArea(false)
      setImageMetadata(null)
    }
  }

  // Handle download image
  const handleDownloadImage = () => {
    const mapCore = (window as any).mapCore
    if (mapCore && mapCore.downloadMapImage) {
      mapCore.downloadMapImage()
    }
  }

  // Handle download TIFF image
  const handleDownloadTiff = () => {
    const mapCore = (window as any).mapCore
    if (mapCore && mapCore.downloadTiffImage) {
      mapCore.downloadTiffImage()
    }
  }

  // Handle clear WMS layers
  const handleClearLayers = () => {
    const mapCore = (window as any).mapCore
    if (mapCore && mapCore.clearWmsLayers) {
      mapCore.clearWmsLayers()
      setImageMetadata(null)
      setHasDrawnArea(false)
    }
  }

  // Handle WMS layer loading
  const handleLoadWmsLayer = async (params: {
    layer: string
    startDate: Date
    endDate: Date
    cloudPercentage: number
  }) => {
    const mapCore = (window as any).mapCore
    if (!mapCore || !mapCore.getDrawnBounds) return

    const bounds = mapCore.getDrawnBounds()
    if (!bounds) {
      alert('Please draw a polygon first')
      return
    }
    
    const formattedStartTime = params.startDate.toISOString().split('.')[0] + 'Z'
    const formattedEndTime = params.endDate.toISOString().split('.')[0] + 'Z'
    const sw = bounds.getSouthWest()
    const ne = bounds.getNorthEast()
    const bbox = `${sw.lat},${sw.lng},${ne.lat},${ne.lng}`

    const imageUrl = `https://sh.dataspace.copernicus.eu/ogc/wms/2e44e6fc-1f1c-4258-bd09-8a15c317f604?` +
      `SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap&LAYERS=${params.layer}` +
      `&BBOX=${bbox}&CRS=EPSG:4326&WIDTH=2500&HEIGHT=2500&FORMAT=image/png` +
      `&TIME=${formattedStartTime}/${formattedEndTime}&MAXCC=${params.cloudPercentage}`

    // Add image overlay to map
    if (mapCore.addImageOverlay) {
      mapCore.addImageOverlay(imageUrl, bounds)
    }

    // Set metadata
    setImageMetadata({
      areaName: 'Selected Area',
      startDate: params.startDate.toLocaleDateString(),
      endDate: params.endDate.toLocaleDateString(),
      layer: params.layer.replace('-L2A', '').replace('_', ' '),
      isVisible: true
    })

    console.log('WMS Image URL:', imageUrl)
  }

  // Handle draw events
  const handleDrawCreated = () => {
    setHasDrawnArea(true)
  }

  const handleDrawCleared = () => {
    setHasDrawnArea(false)
    setImageMetadata(null)
    setStatisticsData(null)
  }

  // Geocoding function with caching
  const getLocationName = async (bounds: any): Promise<{ locationName: string; addressDetails: any }> => {
    const center = bounds.getCenter()
    const lat = center.lat
    const lng = center.lng
    const cacheKey = `${lat.toFixed(3)},${lng.toFixed(3)}`
    
    // Check cache first
    if (locationCache.has(cacheKey)) {
      return locationCache.get(cacheKey)
    }
    
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=geocodejson&lat=${lat}&lon=${lng}`,
        {
          headers: {
            'User-Agent': 'Misbar-Africa-Environmental-Analysis (educational-research@example.com)'
          }
        }
      )
      
      if (!response.ok) {
        throw new Error('Geocoding failed')
      }
      
      const data = await response.json()
      let locationName = "selected area"
      let addressDetails = {}
      
      if (data && data.features && data.features.length > 0) {
        const properties = data.features[0].properties
        addressDetails = properties.geocoding || {}
        
        // Build location name from address components
        const parts = []
        if (addressDetails.city) parts.push(addressDetails.city)
        else if (addressDetails.town) parts.push(addressDetails.town)
        else if (addressDetails.village) parts.push(addressDetails.village)
        else if (addressDetails.county) parts.push(addressDetails.county)
        
        if (addressDetails.state) parts.push(addressDetails.state)
        if (addressDetails.country) parts.push(addressDetails.country)
        
        if (parts.length > 0) {
          locationName = parts.join(', ')
        } else if (addressDetails.country) {
          locationName = addressDetails.country
        }
      }
      
      const result = { locationName, addressDetails }
      
      // Cache the result
      locationCache.set(cacheKey, result)
      
      return result
    } catch (error) {
      console.error('Geocoding error:', error)
      const fallback = { locationName: "selected area", addressDetails: {} }
      locationCache.set(cacheKey, fallback)
      return fallback
    }
  }

  // Handle AI analysis with streaming
// Handle AI analysis with streaming - now unified with chat
  const handleAnalyzeWithAI = async () => {
    const mapCore = (window as any).mapCore
    if (!mapCore) {
      alert("Map not initialized")
      return
    }

    setIsLoadingAI(true)
    setShowAIModal(true)
    setConversationHistory([]) // Clear conversation history for new analysis

    try {
      // Collect real data from the UI
      const layerSelect = document.getElementById("layer-select") as HTMLSelectElement
      const startDateInput = document.getElementById("start-date") as HTMLInputElement
      const endDateInput = document.getElementById("end-date") as HTMLInputElement
      const cloudPercentageInput = document.getElementById("cloud-percentage") as HTMLInputElement
      
      // Build focused context if satellite data is loaded
      if (imageMetadata) {
        const cloudValue = cloudPercentageInput?.value || "unknown"
        
        // Get the WMS URL that was used to load the satellite data
        const bounds = mapCore.getDrawnBounds ? mapCore.getDrawnBounds() : null
        if (!bounds) {
          // Add error message as first AI message
          setConversationHistory([{

            role: "assistant",

            content: "❌ Please draw an area on the map first."

          }])

          setIsLoadingAI(false)

          return

        }
        
        // Get location name using geocoding
        const { locationName, addressDetails } = await getLocationName(bounds)
        console.log("Geocoded location:", locationName, addressDetails)
        
        const sw = bounds.getSouthWest()
        const ne = bounds.getNorthEast()
        const bbox = `${sw.lat},${sw.lng},${ne.lat},${ne.lng}`
        
        const layer = layerSelect?.value || imageMetadata.layer
        const startDate = new Date(startDateInput?.value || imageMetadata.startDate)
        const endDate = new Date(endDateInput?.value || imageMetadata.endDate)
        
        const formattedStartTime = startDate.toISOString().split(".")[0] + "Z"
        const formattedEndTime = endDate.toISOString().split(".")[0] + "Z"
        
        // Recreate the WMS URL
        const wmsUrl = `https://sh.dataspace.copernicus.eu/ogc/wms/2e44e6fc-1f1c-4258-bd09-8a15c317f604?` +

          `SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap&LAYERS=${layer}` +

          `&BBOX=${bbox}&CRS=EPSG:4326&WIDTH=2500&HEIGHT=2500&FORMAT=image/png` +

          `&TIME=${formattedStartTime}/${formattedEndTime}&MAXCC=${cloudValue}`


        console.log("Sending satellite image to AI for streaming analysis:", wmsUrl)


        // Prepare the user message for API (but don't add to conversation history)
        const userMessage = `Analyze this satellite imagery with the following parameters:\n\n📍 **Area of Interest**: ${locationName}\n📊 **Data Layer**: ${layer}\n📅 **Date Range**: ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}\n☁️ **Cloud Coverage**: ${cloudValue}%\n\nPlease provide detailed interpretation of the satellite data, vegetation health, water bodies, geological features, and any environmental patterns visible in the imagery.`

        // Call the streaming endpoint
        const response = await fetch("http://chat.misbar.africa/api/vision/analyze_satellite_stream", {

          method: "POST",

          headers: {

            "Content-Type": "application/json",

          },

          body: JSON.stringify({

            wms_url: wmsUrl,

            layer: imageMetadata.layer,

            date_range: `${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`,

            cloud_coverage: `${cloudValue}%`,

            location_name: locationName,

            address_details: addressDetails,

            message: userMessage  // Send the message to API

          })

        })


        if (!response.ok) {

          throw new Error(`HTTP error! status: ${response.status}`)

        }


        const reader = response.body?.getReader()

        const decoder = new TextDecoder()


        if (!reader) {

          throw new Error("Response body is not readable")

        }


        let accumulatedResponse = ""


        // Add assistant message for streaming (this will be the first message)
        setConversationHistory([{
          role: "assistant",
          content: ""
        }])


        while (true) {

          const { done, value } = await reader.read()

          if (done) break


          const chunk = decoder.decode(value, { stream: true })

          const lines = chunk.split("\n")


          for (const line of lines) {

            if (line.startsWith("data: ")) {

              try {

                const data = JSON.parse(line.slice(6))

                

                if (data.type === "chunk") {

                  accumulatedResponse += data.content

                  // Update assistant message with accumulated content

                  setConversationHistory(prev => {

                    const updated = [...prev]

                    if (updated[0]) {

                      updated[0] = {

                        ...updated[0],

                        content: accumulatedResponse

                      }

                    }

                    return updated

                  })

                } else if (data.type === "error") {

                  accumulatedResponse += `\n\n❌ Error: ${data.message}`

                  setConversationHistory(prev => {

                    const updated = [...prev]

                    if (updated[0]) {

                      updated[0] = {

                        ...updated[0],

                        content: accumulatedResponse

                      }

                    }

                    return updated

                  })

                }

              } catch (e) {

                console.error("Error parsing SSE data:", e)

              }

            }

          }

        }

        

      } else if (hasDrawnArea) {

        setConversationHistory([{

          role: "assistant",

          content: "I can see you have drawn an area on the map, but no satellite data has been loaded yet. Please load satellite data first by:\n\n1. Going to the **Satellite Data** tab\n2. Selecting a data layer (NDVI, NDWI, etc.)\n3. Choosing a date range\n4. Setting cloud coverage percentage\n5. Clicking **Load WMS Layer**\n\nOnce you have satellite imagery loaded, I can provide detailed analysis of vegetation health, water bodies, geological features, and environmental patterns in your selected area."

        }])

      } else {

        setConversationHistory([{

          role: "assistant",

          content: "I am here to help you analyze satellite imagery and environmental data! Here is what I can do:\n\n🛰️ **Satellite Image Analysis**\n- Interpret vegetation health (NDVI)\n- Detect water bodies (NDWI)\n- Analyze geological features\n- Assess environmental changes\n\n📊 **Data Interpretation**\n- Explain spectral index patterns\n- Identify anomalies and trends\n- Provide environmental insights\n- Suggest further analysis\n\n🗺️ **Getting Started**\n1. Draw an area on the map\n2. Load satellite data using the controls\n3. Ask me specific questions about the imagery\n\nWhat would you like to explore today?"

        }])

      }

      

    } catch (error) {

      console.error("Error calling AI streaming API:", error)

      setConversationHistory(prev => [...prev, {

        role: "assistant",

        content: "❌ Failed to connect to AI service. Please make sure Flask API is running on chat.misbar.africa and API key is configured."

      }])

    } finally {

      setIsLoadingAI(false)

    }

  }

  // Handle saving chat to AI-Chat page
  const handleSaveChat = async () => {
    if (!user) {
      alert('Please log in to save chat conversations.')
      return
    }

    if (conversationHistory.length === 0) {
      alert('No conversation to save. Please start a conversation first.')
      return
    }

    setIsSavingChat(true)

    try {
      // Create new chat session
      const sessionResponse = await fetch('http://api.misbar.africa/api/chat/sessions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ 
          title: `Satellite Analysis - ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`
        })
      })

      if (!sessionResponse.ok) {
        throw new Error('Server unavailable')
      }

      const sessionData = await sessionResponse.json()
      const sessionId = sessionData.session.id

      // Save all messages to session
      for (const message of conversationHistory) {
        const messageResponse = await fetch(`http://api.misbar.africa/api/chat/sessions/${sessionId}/messages`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            role: message.role,
            content: message.content,
            image_data: null
          })
        })
        
        if (!messageResponse.ok) {
          throw new Error('Failed to save message')
        }
      }

      // Show success message
      alert('Chat saved successfully! You can view it in AI Chat page.')
      
      // Optionally close the modal after saving
      // setShowAIModal(false)
      
    } catch (error) {
      console.error('Error saving chat:', error)
      alert('Failed to save chat. Please ensure the authentication server is running on port 5001.')
    } finally {
      setIsSavingChat(false)
    }
  }

  // Handle sending follow-up messages with streaming
  const handleSendMessage = async () => {
    if (!currentMessage.trim() || isTyping) return

    const userMessage = currentMessage.trim()
    setCurrentMessage('')
    setIsTyping(true)

    // Add user message to history
    setConversationHistory(prev => [...prev, {
      role: 'user',
      content: userMessage
    }])

    try {
      // Call streaming chat endpoint for follow-up
      const response = await fetch('http://chat.misbar.africa/api/vision/chat_stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          // Include conversation history for context
          context: conversationHistory.slice(-3) // Last 3 messages for context
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) {
        throw new Error('Response body is not readable')
      }

      let accumulatedResponse = ''
      let tempMessageIndex = conversationHistory.length + 1

      // Add temporary assistant message for streaming
      setConversationHistory(prev => [...prev, {
        role: 'assistant',
        content: ''
      }])

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6))
              
              if (data.type === 'chunk') {
                accumulatedResponse += data.content
                // Update the last assistant message with accumulated content
                setConversationHistory(prev => {
                  const updated = [...prev]
                  if (updated[tempMessageIndex]) {
                    updated[tempMessageIndex] = {
                      ...updated[tempMessageIndex],
                      content: accumulatedResponse
                    }
                  }
                  return updated
                })
              } else if (data.type === 'error') {
                accumulatedResponse += `\n\n❌ Error: ${data.message}`
                setConversationHistory(prev => {
                  const updated = [...prev]
                  if (updated[tempMessageIndex]) {
                    updated[tempMessageIndex] = {
                      ...updated[tempMessageIndex],
                      content: accumulatedResponse
                    }
                  }
                  return updated
                })
              }
            } catch (e) {
              console.error('Error parsing SSE data:', e)
            }
          }
        }
      }
      
    } catch (error) {
      console.error('Error sending follow-up message:', error)
      setConversationHistory(prev => [...prev, {
        role: 'assistant',
        content: '❌ Failed to send message. Please try again.'
      }])
    } finally {
      setIsTyping(false)
    }
  }

  // Handle Enter key in chat input
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  // Handle statistics loading
  const handleLoadStatistics = async (params: {
    geometry: number[][]
    start_date: string
    end_date: string
    indices: string[]
  }) => {
    console.log('handleLoadStatistics received params:', params)
    console.log('Params type check:', {
      geometry: Array.isArray(params.geometry),
      start_date: typeof params.start_date,
      end_date: typeof params.end_date,
      indices: Array.isArray(params.indices)
    })

    setIsLoadingStatistics(true)
    setStatisticsData(null)

    try {
      const response = await fetch('http://chat.misbar.africa/api/time_series', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params)
      })

      const data = await response.json()
      
      if (data.success) {
        setStatisticsData(data)
        setShowStatisticsModal(true)
        console.log('Statistics data loaded:', data)
      } else {
        alert(`Error: ${data.error}`)
      }
    } catch (error) {
      console.error('Error loading statistics:', error)
      alert('Failed to load statistics data. Please make sure the Flask API is running on chat.misbar.africa')
    } finally {
      setIsLoadingStatistics(false)
    }
  }

  // Handle comparison loading
  const handleLoadComparison = async (params: {
    layer: string
    startDate1: Date
    endDate1: Date
    startDate2: Date
    endDate2: Date
    cloudPercentage: number
  }) => {
    const mapCore = (window as any).mapCore
    if (!mapCore || !mapCore.getDrawnBounds) return

    const bounds = mapCore.getDrawnBounds()
    if (!bounds) {
      alert('Please draw an area on the map first')
      return
    }

    setIsLoadingComparison(true)

    try {
      const sw = bounds.getSouthWest()
      const ne = bounds.getNorthEast()
      const bbox = `${sw.lat},${sw.lng},${ne.lat},${ne.lng}`

      // Format dates for API
      const formattedStartDate1 = params.startDate1.toISOString().split('.')[0] + 'Z'
      const formattedEndDate1 = params.endDate1.toISOString().split('.')[0] + 'Z'
      const formattedStartDate2 = params.startDate2.toISOString().split('.')[0] + 'Z'
      const formattedEndDate2 = params.endDate2.toISOString().split('.')[0] + 'Z'

      // Call the comparison API endpoint
      const response = await fetch('http://chat.misbar.africa/api/comparison/download', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          layer: params.layer,
          date1: formattedStartDate1,
          date2: formattedStartDate2,
          endDate1: formattedEndDate1,
          endDate2: formattedEndDate2,
          bbox: bbox,
          cloudPercentage: params.cloudPercentage
        })
      })

      const data = await response.json()
      
      if (data.success) {
        // Set comparison data and show modal
        setComparisonData({
          image1Url: data.image1_url,
          image2Url: data.image2_url,
          date1: `${params.startDate1.toLocaleDateString()} - ${params.endDate1.toLocaleDateString()}`,
          date2: `${params.startDate2.toLocaleDateString()} - ${params.endDate2.toLocaleDateString()}`,
          layer: params.layer
        })
        setShowComparisonModal(true)
      } else {
        alert(`Failed to load comparison: ${data.error}`)
      }
    } catch (error) {
      console.error('Error loading comparison:', error)
      alert('Failed to load comparison images. Please try again.')
    } finally {
      setIsLoadingComparison(false)
    }
  }

  return (
    <div className={`relative h-screen w-full overflow-hidden ${className}`}>
      {/* Map container */}
      <MapCore
        currentBaseMap={currentBaseMap}
        onBaseMapChange={handleBaseMapChange}
        onDrawComplete={handleDrawComplete}
        onStatusUpdate={handleStatusUpdate}
        onDrawCreated={handleDrawCreated}
        onDrawCleared={handleDrawCleared}
      />
      
      {/* Status text */}
      {statusText && (
        <div className="absolute bottom-4 left-4 bg-black/80 backdrop-blur-sm text-white px-4 py-2 rounded-lg text-sm font-medium shadow-lg">
          {statusText}
        </div>
      )}

      {/* Custom Drawing Toolbar */}
      <div className="absolute top-4 right-4 z-[1000] flex flex-col space-y-2">
        {/* Zoom Controls */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-1.5 border border-gray-200">
          <div className="flex flex-col space-y-1">
            {/* Zoom In */}
            <button
              onClick={() => {
                const mapCore = (window as any).mapCore
                if (mapCore && mapCore.zoomIn) {
                  mapCore.zoomIn()
                }
              }}
              className="p-2 rounded-lg text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200 group"
              title="Zoom In"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
              </svg>
            </button>
            
            {/* Zoom Out */}
            <button
              onClick={() => {
                const mapCore = (window as any).mapCore
                if (mapCore && mapCore.zoomOut) {
                  mapCore.zoomOut()
                }
              }}
              className="p-2 rounded-lg text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-all duration-200 group"
              title="Zoom Out"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* Drawing Tools */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-1.5 border border-gray-200">
          <div className="flex flex-col space-y-1">
            {/* Polygon Tool */}
            <button
              onClick={() => {
                handleDrawPolygon()
                setActiveDrawingTool('polygon')
              }}
              className={`p-2 rounded-lg transition-all duration-200 group ${
                activeDrawingTool === 'polygon' 
                  ? 'bg-blue-500 text-white shadow-lg' 
                  : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
              }`}
              title="Draw Polygon"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
            </button>
            
            {/* Rectangle Tool */}
            <button
              onClick={() => {
                handleDrawRectangle()
                setActiveDrawingTool('rectangle')
              }}
              className={`p-2 rounded-lg transition-all duration-200 group ${
                activeDrawingTool === 'rectangle' 
                  ? 'bg-blue-500 text-white shadow-lg' 
                  : 'text-gray-700 hover:bg-blue-50 hover:text-blue-600'
              }`}
              title="Draw Rectangle"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v14a1 1 0 01-1 1H5a1 1 0 01-1-1V5z" />
              </svg>
            </button>
            
            {/* Clear All */}
            <button
              onClick={() => {
                handleClearAll()
                setActiveDrawingTool(null)
              }}
              className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-all duration-200 group"
              title="Clear All Drawings"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* File Operations */}
        <div className="bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl p-1.5 border border-gray-200">
          <div className="flex flex-col space-y-1">
            {/* Shapefile Import */}
            <button
              onClick={() => {
                const mapCore = (window as any).mapCore
                if (mapCore && mapCore.importShapefile) {
                  mapCore.importShapefile()
                }
              }}
              className="p-2 rounded-lg text-gray-700 hover:bg-green-50 hover:text-green-600 transition-all duration-200 group"
              title="Import Shapefile (SHP, ZIP, GeoJSON)"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
            </button>
            
            {/* Download Map */}
            <button
              onClick={handleDownloadImage}
              className="p-2 rounded-lg text-gray-700 hover:bg-purple-50 hover:text-purple-600 transition-all duration-200 group"
              title="Download Map Image"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Satellite Legend - Only shows when satellite data tab is active and layer is loaded */}
      <SatelliteLegend 
        activeLayer={imageMetadata?.layer ? (() => {
          // Map the cleaned layer name back to the original layer value
          const layerMap: Record<string, string> = {
            'NDVI': 'NDVI-L2A',
            'GEOLOGY': 'GEOLOGY',
            'LAI SAVI': 'LAI_SAVI',
            'MOISTURE INDEX': 'MOISTURE_INDEX'
          }
          return layerMap[imageMetadata.layer] || imageMetadata.layer
        })() : undefined}
        isVisible={activeTab === 'wms' && imageMetadata?.isVisible === true}
      />

      {/* Modern Sidebar */}
        <div 
      className="absolute top-4 left-4 bg-white/95 backdrop-blur-sm rounded-2xl shadow-2xl z-[1000] w-96 overflow-hidden"
    >
      {/* Tab Headers */}
      <div className="flex border-b border-gray-200">
        <button
          onClick={() => setActiveTab('basemap')}
          className={`flex-1 px-4 py-3 text-sm font-semibold transition-all duration-200 ${
            activeTab === 'basemap' 
              ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' 
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          <div className="flex flex-col items-center justify-center space-y-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
            <span>Base Map</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('wms')}
          className={`flex-1 px-4 py-3 text-sm font-semibold transition-all duration-200 ${
            activeTab === 'wms' 
              ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' 
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          <div className="flex flex-col items-center justify-center space-y-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
            </svg>
            <span>Satellite Data</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('statistics')}
          className={`flex-1 px-4 py-3 text-sm font-semibold transition-all duration-200 ${
            activeTab === 'statistics' 
              ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' 
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          <div className="flex flex-col items-center justify-center space-y-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <span>Statistics</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('comparison')}
          className={`flex-1 px-4 py-3 text-sm font-semibold transition-all duration-200 ${
            activeTab === 'comparison' 
              ? 'bg-blue-50 text-blue-600 border-b-2 border-blue-600' 
              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
          }`}
        >
          <div className="flex flex-col items-center justify-center space-y-1">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
            <span>Compare</span>
          </div>
        </button>
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {activeTab === 'basemap' && (
          <BaseMapTab
            currentBaseMap={currentBaseMap}
            onBaseMapChange={handleBaseMapChange}
          />
        )}
        {activeTab === 'wms' && (
          <SatelliteDataTab
            onLoadWmsLayer={handleLoadWmsLayer}
            onDownloadImage={handleDownloadImage}
            onDownloadTiff={handleDownloadTiff}
            onClearLayers={handleClearLayers}
            hasDrawnArea={hasDrawnArea}
            hasLoadedData={!!imageMetadata}
            onAnalyzeWithAI={handleAnalyzeWithAI}
          />
        )}
        {activeTab === 'comparison' && (
          <ComparisonTab
            onLoadComparison={handleLoadComparison}
            isLoading={isLoadingComparison}
            hasDrawnArea={hasDrawnArea}
          />
        )}
        {activeTab === 'statistics' && (
          <StatisticsTab
            onLoadStatistics={handleLoadStatistics}
            hasDrawnArea={hasDrawnArea}
            isLoading={isLoadingStatistics}
            statisticsData={statisticsData}
          />
        )}
      </div>
    </div>

  

      {/* Time Series Chart Modal */}
      {showStatisticsModal && statisticsData && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[2000] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div>
                <h3 className="text-xl font-bold text-gray-800">Statistical Analysis Results</h3>
                <div className="flex items-center space-x-4 text-sm text-gray-600 mt-2">
                  <span>📊 {Object.keys(statisticsData.indices).length} index analyzed</span>
                  <span>📅 {statisticsData.date_range.start} to {statisticsData.date_range.end}</span>
                  <span>🛰️ {statisticsData.total_images} unique dates</span>
                  {statisticsData.aggregation_info && (
                    <span className="text-green-600 font-medium">✅ {statisticsData.aggregation_info}</span>
                  )}
                </div>
              </div>
              <button 
                onClick={() => setShowStatisticsModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
              >
                <svg className="w-6 h-6 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            {/* Modal Content */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="h-[500px]">
                <TimeSeriesChart data={statisticsData} isLoading={false} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Unified AI Chat Modal */}
      {showAIModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[2000] flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-800">AI Vision Analysis</h3>
                <div className="flex items-center space-x-4 text-sm text-gray-600 mt-2">
                  <span>🤖 Remote Sensing Analysis</span>
                  <span>🛰️ Environmental Intelligence</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {/* Save Chat Button */}
                <button 
                  onClick={handleSaveChat}
                  disabled={isSavingChat || conversationHistory.length === 0 || !user}
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-emerald-600 to-green-700 text-white rounded-lg font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  title={user ? "Save conversation to AI Chat page" : "Please log in to save conversations"}
                >
                  {isSavingChat ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span className="text-sm">Saving...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V2" />
                      </svg>
                      <span className="text-sm">Save Chat</span>
                    </>
                  )}
                </button>
                
                {/* Close Button */}
                <button 
                  onClick={() => setShowAIModal(false)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors duration-200"
                >
                  <svg className="w-6 h-6 text-gray-400 hover:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            
            {/* Unified Chat Interface */}
            <div className="flex-1 overflow-y-auto p-6">
              {isLoadingAI && conversationHistory.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
                    <p className="text-gray-600 font-medium">🤖 AI is initializing...</p>
                    <p className="text-sm text-gray-500 mt-2">Starting satellite analysis</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Chat Messages */}
                  <div className="space-y-4 max-h-96 overflow-y-auto p-4 bg-gray-50 rounded-xl">
                    {conversationHistory.map((message, index) => (
                      <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`flex items-start space-x-3 max-w-2xl ${
                          message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                        }`}>
                          <div className="flex-shrink-0">
                            <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                              message.role === 'user' 
                                ? 'bg-gradient-to-br from-green-600 to-emerald-700' 
                                : 'bg-gradient-to-br from-purple-600 to-pink-600'
                            }`}>
                              {message.role === 'user' ? (
                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                              ) : (
                                <span className="text-white text-sm font-bold">AI</span>
                              )}
                            </div>
                          </div>
                          <div className={`px-4 py-3 rounded-2xl ${
                            message.role === 'user' 
                              ? 'bg-gradient-to-r from-green-600 to-emerald-700 text-white' 
                              : 'bg-white text-gray-800 border border-gray-200 shadow-sm'
                          }`}>
                            {message.role === 'user' ? (
                              <p className="text-sm font-medium">{message.content}</p>
                            ) : (
                              <div className="text-sm">
                                <ReactMarkdown 
                                  remarkPlugins={[remarkGfm]}
                                  components={{
                                    strong: ({children}) => <strong className="font-bold text-gray-900">{children}</strong>,
                                    ul: ({children}) => <ul className="list-disc list-inside space-y-1 ml-4">{children}</ul>,
                                    ol: ({children}) => <ol className="list-decimal list-inside space-y-1 ml-4">{children}</ol>,
                                    li: ({children}) => <li className="text-gray-700">{children}</li>,
                                    p: ({children}) => <p className="mb-2 last:mb-0">{children}</p>,
                                    h1: ({children}) => <h1 className="text-lg font-bold text-gray-900 mb-2">{children}</h1>,
                                    h2: ({children}) => <h2 className="text-base font-bold text-gray-900 mb-2">{children}</h2>,
                                    h3: ({children}) => <h3 className="text-sm font-bold text-gray-900 mb-1">{children}</h3>,
                                    blockquote: ({children}) => (
                                      <blockquote className="border-l-4 border-blue-300 pl-3 italic text-gray-600 my-2">
                                        {children}
                                      </blockquote>
                                    ),
                                    code: ({inline, children}) => 
                                      inline ? 
                                        <code className="bg-gray-100 px-1 py-0.5 rounded text-xs font-mono text-gray-800">{children}</code> :
                                        <code className="block bg-gray-100 p-2 rounded text-xs font-mono text-gray-800 overflow-x-auto my-2">{children}</code>,
                                  }}
                                >
                                  {message.content}
                                </ReactMarkdown>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {/* Streaming indicator for current response */}
{isTyping && conversationHistory.length > 0 && conversationHistory[conversationHistory.length - 1].role !== 'assistant' && (
  <div className="flex justify-start">
    <div className="flex items-start space-x-3">
      <div className="flex-shrink-0">
        <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
          <div className="animate-spin rounded-full h-4 w-4 border-b border-white"></div>
        </div>
      </div>
      <div className="px-4 py-3 rounded-2xl bg-white text-gray-800 border border-gray-200 shadow-sm">
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <div className="animate-pulse">●</div>
          <span>AI is thinking...</span>
        </div>
      </div>
    </div>
  </div>
)}
                  </div>
                </div>
              )}
            </div>
            
            {/* Chat Input */}
            <div className="border-t border-gray-200 p-4 bg-gray-50">
              <div className="flex space-x-3">
                <input
                  type="text"
                  value={currentMessage}
                  onChange={(e) => setCurrentMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask a question about the satellite data..."
                  className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white text-gray-800 placeholder-gray-400"
                  disabled={isTyping || isLoadingAI}
                />
                <button
                  onClick={handleSendMessage}
                  disabled={!currentMessage.trim() || isTyping || isLoadingAI}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center space-x-2"
                >
                  {isTyping || isLoadingAI ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Sending...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9 18-9-18 9-2 0 0 9 2 9 20z" />
                      </svg>
                      <span>Send</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Comparison Modal */}
      {showComparisonModal && comparisonData && (
        <ComparisonModal
          isOpen={showComparisonModal}
          onClose={() => setShowComparisonModal(false)}
          image1Url={comparisonData.image1Url}
          image2Url={comparisonData.image2Url}
          date1={comparisonData.date1}
          date2={comparisonData.date2}
          layer={comparisonData.layer}
          locationName="Selected Area"
        />
      )}
    </div>
  )
}