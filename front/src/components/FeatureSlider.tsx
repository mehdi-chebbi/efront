'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'

// ========================================
// START: FeatureSlider Component
// ========================================

interface FeatureCard {
  id: number
  title: string
  description: string
  longDescription: string
  icon: string
  bgImage: string
  linkUrl: string
  linkText: string
}

const features: FeatureCard[] = [
  {
    id: 1,
    title: 'Satellite Analysis',
    description: 'AI-powered satellite imagery analysis',
    longDescription: 'Access real-time Copernicus satellite data with AI-powered analysis for vegetation health, water bodies, and environmental monitoring across Africa.',
    icon: '',
    bgImage: 'https://c4.wallpaperflare.com/wallpaper/596/437/307/earth-from-space-wallpaper-preview.jpg',
    linkUrl: '/map',
    linkText: 'Start Analysis'
  },
  {
    id: 2,
    title: 'Interactive Mapping',
    description: 'Draw and analyze geographic regions',
    longDescription: 'Create custom polygons, rectangles, and circles on interactive maps to define areas of interest for detailed environmental analysis.',
    icon: '',
    bgImage: 'https://i.redd.it/0bauzio2o6o81.png',
    linkUrl: '/map',
    linkText: 'Explore Maps'
  },
  {
    id: 3,
    title: 'AI Chat Assistant',
    description: 'Conversational AI for environmental insights',
    longDescription: 'Chat with our AI assistant to interpret satellite data, get environmental insights, and receive personalized analysis recommendations.',
    icon: '',
    bgImage: 'https://www.lamy-liaisons.fr/wp-content/uploads/2024/10/GettyImages-1179633351.jpg',
    linkUrl: '/ai-chat',
    linkText: 'Chat with AI'
  },
  {
    id: 4,
    title: 'Regional Ecosystems',
    description: 'Explore Africa\'s diverse environments',
    longDescription: 'Deep dive into specific African ecosystems - from the Sahara Desert to Congo rainforests, with tailored environmental monitoring tools.',
    icon: '',
    bgImage: 'https://c4.wallpaperflare.com/wallpaper/96/1012/930/woodland-redwoods-national-park-forest-path-wallpaper-preview.jpg',
    linkUrl: '/ecosystems',
    linkText: 'View Ecosystems'
  },
  {
    id: 5,
    title: 'Community Forum',
    description: 'Connect with environmental researchers',
    longDescription: 'Join a community of researchers, share findings, ask questions, and collaborate on environmental monitoring projects across Africa.',
    icon: '',
    bgImage: 'https://c0.wallpaperflare.com/preview/263/921/102/business-communication-computer-concept.jpg',
    linkUrl: '/forum',
    linkText: 'Join Community'
  }
]

export default function FeatureSlider() {
  const [current, setCurrent] = useState(0)
  const [isMobile, setIsMobile] = useState(false)
  const trackRef = useRef<HTMLDivElement>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)

  // Check if mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.matchMedia('(max-width: 767px)').matches)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Center the active card
  const centerCard = (index: number) => {
    if (!trackRef.current || !wrapperRef.current) return
    
    const track = trackRef.current
    const wrapper = wrapperRef.current
    const cards = Array.from(track.children)
    const card = cards[index] as HTMLElement
    
    const axis = isMobile ? 'top' : 'left'
    const size = isMobile ? 'clientHeight' : 'clientWidth'
    const start = isMobile ? card.offsetTop : card.offsetLeft
    
    wrapper.scrollTo({
      [axis]: start - (wrapper[size] / 2 - card[size] / 2),
      behavior: 'smooth'
    })
  }

  // Activate a card
  const activateCard = (index: number, shouldScroll = true) => {
    if (index === current) return
    
    setCurrent(index)
    if (shouldScroll) {
      setTimeout(() => centerCard(index), 0)
    }
  }

  // Navigate to previous/next card
  const navigate = (step: number) => {
    const newIndex = Math.min(Math.max(current + step, 0), features.length - 1)
    activateCard(newIndex, true)
  }

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowRight', 'ArrowDown'].includes(e.key)) navigate(1)
      if (['ArrowLeft', 'ArrowUp'].includes(e.key)) navigate(-1)
    }

    window.addEventListener('keydown', handleKeyDown, { passive: true })
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [current])

  // Handle touch/swipe gestures
  useEffect(() => {
    let startX = 0
    let startY = 0

    const handleTouchStart = (e: TouchEvent) => {
      startX = e.touches[0].clientX
      startY = e.touches[0].clientY
    }

    const handleTouchEnd = (e: TouchEvent) => {
      const deltaX = e.changedTouches[0].clientX - startX
      const deltaY = e.changedTouches[0].clientY - startY
      const threshold = 60

      if (isMobile ? Math.abs(deltaY) > threshold : Math.abs(deltaX) > threshold) {
        navigate((isMobile ? deltaY : deltaX) > 0 ? -1 : 1)
      }
    }

    const track = trackRef.current
    if (track) {
      track.addEventListener('touchstart', handleTouchStart, { passive: true })
      track.addEventListener('touchend', handleTouchEnd, { passive: true })
    }

    return () => {
      if (track) {
        track.removeEventListener('touchstart', handleTouchStart)
        track.removeEventListener('touchend', handleTouchEnd)
      }
    }
  }, [current, isMobile])

  // Center current card on resize
  useEffect(() => {
    centerCard(current)
  }, [current, isMobile])

  const isFirst = current === 0
  const isLast = current === features.length - 1

  return (
    <section className="py-20 bg-gradient-to-br from-gray-900 via-emerald-900 to-gray-900 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-12">
          <div>
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
              Explore Our <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">Environmental Tools</span>
            </h2>
            <p className="text-lg text-gray-300 max-w-2xl">
              Discover powerful features designed for comprehensive environmental monitoring and analysis across the African continent
            </p>
          </div>
          
          {/* Navigation Controls */}
          <div className="flex gap-2">
            <button
              onClick={() => navigate(-1)}
              disabled={isFirst}
              className="w-12 h-12 rounded-full bg-white/10 hover:bg-emerald-500 disabled:opacity-30 disabled:cursor-not-allowed text-white flex items-center justify-center transition-all duration-300"
              aria-label="Previous feature"
            >
              <span className="text-2xl">‹</span>
            </button>
            <button
              onClick={() => navigate(1)}
              disabled={isLast}
              className="w-12 h-12 rounded-full bg-white/10 hover:bg-emerald-500 disabled:opacity-30 disabled:cursor-not-allowed text-white flex items-center justify-center transition-all duration-300"
              aria-label="Next feature"
            >
              <span className="text-2xl">›</span>
            </button>
          </div>
        </div>

        {/* Slider Container */}
        <div ref={wrapperRef} className="overflow-hidden">
          <div 
            ref={trackRef}
            className="flex gap-4 sm:gap-6 items-start justify-center scroll-smooth"
            style={{
              scrollSnapType: isMobile ? 'y mandatory' : 'x mandatory',
              scrollBehavior: 'smooth'
            }}
          >
            {features.map((feature, index) => (
              <article
                key={feature.id}
                className={`relative flex-shrink-0 rounded-2xl overflow-hidden cursor-pointer transition-all duration-500 ${
                  index === current 
                    ? 'flex-grow sm:flex-grow-0 sm:w-[30rem] w-full h-[24rem] sm:h-[26rem] -translate-y-2 shadow-2xl' 
                    : 'flex-grow-0 sm:w-[5rem] w-full h-[16rem] sm:h-[26rem] hover:w-[6rem]'
                }`}
                onClick={() => activateCard(index, true)}
                style={{
                  scrollSnapAlign: isMobile ? 'start' : 'center'
                }}
              >
                {/* Background Image */}
                <img
                  src={feature.bgImage}
                  alt={feature.title}
                  className="absolute inset-0 w-full h-full object-cover"
                  style={{
                    filter: index === current ? 'brightness(0.9) saturate(100%)' : 'brightness(0.6) saturate(70%)',
                    transform: index === current ? 'scale(1.05)' : 'scale(1)',
                    transition: 'all 0.5s ease'
                  }}
                />

                {/* Content Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-10" />
                
                <div className="absolute inset-0 z-20 flex items-center justify-center p-4">
                  {index === current ? (
                    // Expanded content
                    <div className="flex items-center justify-center h-full">
                      <div className="text-center">
                        <div className="text-5xl sm:text-6xl mb-4">{feature.icon}</div>
                        <h3 className="text-2xl sm:text-3xl font-bold text-white mb-4">
                          {feature.title}
                        </h3>
                        <p className="text-gray-200 mb-6 leading-relaxed max-w-lg mx-auto">
                          {feature.longDescription}
                        </p>
                        <Link
                          href={feature.linkUrl}
                          className="inline-block px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-full transition-colors duration-300"
                        >
                          {feature.linkText}
                        </Link>
                      </div>
                    </div>
                  ) : (
                    // Collapsed content
                    <div className="text-center">
                      <div className="text-3xl sm:text-4xl mb-2">{feature.icon}</div>
                      <h3 className="text-white font-bold text-sm sm:text-base px-2">
                        {isMobile ? feature.title : feature.title.split(' ').map((word, i) => (
                          <span key={i} className="block">{word}</span>
                        ))}
                      </h3>
                    </div>
                  )}
                </div>
              </article>
            ))}
          </div>
        </div>

        {/* Dots Indicator - Hidden on mobile */}
        {!isMobile && (
          <div className="flex justify-center gap-2 mt-8">
            {features.map((_, index) => (
              <button
                key={index}
                onClick={() => activateCard(index, true)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === current 
                    ? 'bg-emerald-400 scale-125' 
                    : 'bg-white/30 hover:bg-white/50'
                }`}
                aria-label={`Go to feature ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Mobile Navigation Controls */}
      {isMobile && (
        <div className="flex justify-between items-center px-6 pb-6 relative z-20">
          <button
            onClick={() => navigate(-1)}
            disabled={isFirst}
            className="w-10 h-10 rounded-full bg-white/10 disabled:opacity-30 text-white flex items-center justify-center"
          >
            <span className="text-xl">‹</span>
          </button>
          <span className="text-white/60 text-sm">
            {current + 1} / {features.length}
          </span>
          <button
            onClick={() => navigate(1)}
            disabled={isLast}
            className="w-10 h-10 rounded-full bg-white/10 disabled:opacity-30 text-white flex items-center justify-center"
          >
            <span className="text-xl">›</span>
          </button>
        </div>
      )}
    </section>
  )
}

// ========================================
// END: FeatureSlider Component
// ========================================