'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import FeatureSlider from './FeatureSlider'

// Define the Leaf type
interface Leaf {
  id: string;
  emoji: string;
  left: number;
  top: number;
  size: number;
  duration: number;
  delay: number;
  rotation: number;
}

export default function LandingPage() {
  const [email, setEmail] = useState('')
  const [leaves, setLeaves] = useState<Leaf[]>([])
  const videoRef = useRef<HTMLVideoElement>(null)
  const [currentTheme, setCurrentTheme] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)
  
  const themes = [
    {
      emoji: '🌿',
      title: 'NATURE',
      subtitle: 'Vegetation Health & Forest Ecosystems',
      videoSrc: 'https://assets.mixkit.co/videos/2788/2788-720.mp4',
      speed: 1,
            bgColor: 'from-green-900/90 to-emerald-900/90',

      textColor: 'from-green-400 to-emerald-300',
      optionBg: '#fff5a0'
    },
    {
      emoji: '🌊',
      title: 'OCEAN',
      subtitle: 'Water Bodies & Marine Environments',
      videoSrc: 'https://assets.mixkit.co/videos/48525/48525-720.mp4',
      speed: 1,
      bgColor: 'from-blue-900/90 to-cyan-900/90',
      textColor: 'from-blue-400 to-cyan-300',
      optionBg: '#ffc8a2'
    },
{
  emoji: '🌾',
  title: 'CROPS',
  subtitle: 'Agriculture & Farming Landscapes',
  videoSrc: 'https://assets.mixkit.co/videos/33422/33422-720.mp4',
  speed: 1,
  bgColor: 'from-green-900/90 to-lime-900/90',
  textColor: 'from-green-400 to-lime-300',
  optionBg: '#d9ffb3'
}
,
    {
      emoji: '⛰️',
      title: 'EARTH',
      subtitle: 'Geological Features & Land Formation',
      videoSrc: 'https://assets.mixkit.co/videos/43129/43129-720.mp4',
      speed: 1,
      bgColor: 'from-amber-900/90 to-orange-900/90',
      textColor: 'from-amber-400 to-orange-300',
      optionBg: '#ffb3b3'
    },
   {
  emoji: '🏙️',
  title: 'URBAN',
  subtitle: 'Cityscapes & Human Infrastructure',
  videoSrc: 'https://assets.mixkit.co/videos/26920/26920-720.mp4',
  speed: 1,
  bgColor: 'from-blue-900/90 to-indigo-900/90',
  textColor: 'from-blue-400 to-indigo-300',
  optionBg: '#b3d9ff'
}
  ]

  // Generate leaves only on client side
  useEffect(() => {
    setLeaves(generateLeaves())
  }, [])

  // Video theme cycling
  useEffect(() => {
    const interval = setInterval(() => {
      setIsTransitioning(true)
      setTimeout(() => {
        setCurrentTheme((prev) => (prev + 1) % themes.length)
        setIsTransitioning(false)
      }, 800)
    }, 8000) // Change theme every 8 seconds (slower)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (videoRef.current) {
      const currentThemeData = themes[currentTheme]
      videoRef.current.src = currentThemeData.videoSrc
      videoRef.current.playbackRate = currentThemeData.speed
      videoRef.current.muted = true
      videoRef.current.play().catch(() => {})
      
      const handleLoadedMetadata = () => {
        videoRef.current!.playbackRate = currentThemeData.speed
        videoRef.current!.play().catch(() => {})
      }
      
      videoRef.current.addEventListener('loadedmetadata', handleLoadedMetadata)
      
      return () => {
        videoRef.current?.removeEventListener('loadedmetadata', handleLoadedMetadata)
      }
    }
  }, [currentTheme])

  const currentThemeData = themes[currentTheme]

  const metrics = [
    {
      icon: '🛰️',
      value: '7',
      label: 'Sentinel-2 Satellites',
      description: 'Continuous coverage',
      color: 'from-green-600 to-emerald-700'
    },
    {
      icon: '📊',
      value: '20+',
      label: 'Spectral Indices',
      description: 'Analytical depth',
      color: 'from-emerald-600 to-teal-700'
    },
    {
      icon: '📅',
      value: '10+',
      label: 'Years Historical Data',
      description: 'Research value',
      color: 'from-teal-600 to-cyan-700'
    },
    {
      icon: '⚡',
      value: '5-Day',
      label: 'Data Refresh',
      description: 'Fresh insights',
      color: 'from-green-700 to-emerald-800'
    },
    {
      icon: '📡',
      value: 'Real-Time',
      label: 'Latest Available',
      description: 'Current monitoring',
      color: 'from-emerald-700 to-green-800'
    },
    {
      icon: '🌍',
      value: '1.2B',
      label: 'Hectares Monitored',
      description: 'African scale',
      color: 'from-teal-700 to-cyan-800'
    },
    {
      icon: '📈',
      value: '50TB',
      label: 'Data Processed Monthly',
      description: 'Processing power',
      color: 'from-green-600 to-emerald-700'
    },
    {
      icon: '🌱',
      value: '15+',
      label: 'Nations for Drought Detection',
      description: 'Environmental impact',
      color: 'from-emerald-600 to-teal-700'
    }
  ]

  // Enhanced leaf generation with better distribution
  const generateLeaves = (): Leaf[] => {
    const emojis = ['🍃', '🌿', '🍂', '🌱', '🍀'];
    const leaves: Leaf[] = [];
    
    // Create exactly 15 leaves for this section
    for (let i = 0; i < 15; i++) {
      leaves.push({
        id: `leaf-${i}`,
        emoji: emojis[Math.floor(Math.random() * emojis.length)],
        left: Math.random() * 90 + 5, // 5% to 95% to avoid edges
        top: Math.random() * 90 + 5,  // 5% to 95% to avoid edges
        size: Math.random() * 1.2 + 0.8, // Size between 0.8 and 2rem
        duration: Math.random() * 8 + 12, // Duration between 12-20s
        delay: Math.random() * 5,
        rotation: Math.random() * 360,
      });
    }
    
    return leaves;
  };

  return (
    <div className="min-h-screen mist-gradient relative overflow-hidden">
      <div className="relative w-full h-[92vh] overflow-hidden">
        {/* Background Video */}
        <video
          ref={videoRef}
          className="absolute top-0 left-0 w-full h-full object-cover z-0"
          autoPlay
          muted
          loop
          playsInline
        />

        {/* Animated Overlay */}
        <motion.div
          className={`absolute inset-0 bg-gradient-to-br ${currentThemeData.bgColor} z-10`}
          initial={{ opacity: 0 }}
          animate={{ opacity: isTransitioning ? 0.3 : 0.7 }}
          transition={{ duration: 1.5 }}
        />

  


        {/* Main Title */}
        <motion.div
          className="absolute inset-0 flex items-center justify-center z-30 w-full h-full"
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ 
            scale: isTransitioning ? 1.2 : 1,
            opacity: isTransitioning ? 0 : 1
          }}
          transition={{ duration: 0.8 }}
        >
          <div className="text-center w-full max-w-7xl mx-auto px-4">
            <motion.h1
              className={`text-4xl sm:text-6xl md:text-8xl lg:text-9xl font-black mb-4 bg-gradient-to-br ${currentThemeData.textColor} bg-clip-text text-transparent text-center`}
              initial={{ y: -50, opacity: 0 }}
              animate={{ 
                y: isTransitioning ? -100 : 0,
                opacity: isTransitioning ? 0 : 1
              }}
              transition={{ duration: 0.8, delay: 0.2 }}
              style={{
                letterSpacing: '0.05em',
                textShadow: `
                  1px 1px 2px rgba(0, 0, 0, 0.3),
                  2px 2px 4px rgba(0, 0, 0, 0.2),
                  3px 3px 6px rgba(0, 0, 0, 0.1),
                  4px 4px 8px rgba(0, 0, 0, 0.05)
                `,
                WebkitTextStroke: '1px rgba(0, 0, 0, 0.3)'
              }}
            >
              {currentThemeData.title}
            </motion.h1>
            
            <motion.p
              className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-white/90 w-full mx-auto font-light text-center"
              initial={{ y: 50, opacity: 0 }}
              animate={{ 
                y: isTransitioning ? 100 : 0,
                opacity: isTransitioning ? 0 : 1
              }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              {currentThemeData.subtitle}
            </motion.p>
          </div>
        </motion.div>

        

    

        {/* Scroll Down Indicator */}
        <motion.div 
className="absolute bottom-8 left-1/2 transform -translate-x-1/2 -ml-14 flex flex-col items-center text-white z-30"          animate={{
            y: [0, 10, 0],
          }}
          transition={{
            duration: 2,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        >
          <span className="text-sm mb-2 text-white/80 font-medium">Explore Now</span>
          <div className="bg-white/20 backdrop-blur-sm rounded-full p-3 hover:bg-white/30 transition-colors cursor-pointer"
               onClick={() => {
                 const element = document.getElementById('metrics');
                 if (element) {
                   element.scrollIntoView({ 
                     behavior: 'smooth',
                     block: 'start'
                   });
                 }
               }}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
            </svg>
          </div>
        </motion.div>
      </div>

      {/* ========================================
        START: Feature Slider Section
        ======================================== */}
      <FeatureSlider />
      {/* ========================================
        END: Feature Slider Section  
        ======================================== */}

      {/* ========================================
        START: Metrics Dashboard Section
        ======================================== */}
      <section id="metrics" className="py-20 bg-gradient-to-br from-gray-900 via-emerald-900 to-gray-900 relative overflow-hidden">
        {/* Background decoration - matching FeatureSlider */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
              <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">African Environmental Intelligence</span> at Scale
            </h2>
            <p className="text-lg text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Real metrics powering environmental monitoring across the African continent
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {metrics.map((metric, index) => (
              <motion.div
                key={index}
                className="bg-white/10 backdrop-blur-md rounded-2xl p-6 hover:shadow-2xl hover:bg-white/15 transition-all duration-300 group text-center border border-white/20"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{
                  y: -5,
                  scale: 1.02,
                  transition: { duration: 0.2 }
                }}
              >
                <div className={`text-4xl mb-3 group-hover:scale-110 transition-transform duration-300`}>
                  {metric.icon}
                </div>
                <div className={`text-3xl sm:text-4xl font-black mb-2 bg-gradient-to-r ${metric.color} bg-clip-text text-transparent`}>
                  {metric.value}
                </div>
                <h3 className="text-lg font-bold text-white mb-1">
                  {metric.label}
                </h3>
                <p className="text-sm text-gray-300 leading-relaxed">
                  {metric.description}
                </p>
                <div className={`h-0.5 bg-gradient-to-r ${metric.color} rounded-full mt-4`}></div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      {/* ========================================
        END: Metrics Dashboard Section  
        ======================================== */}

      {/* ========================================
        START: Partners Section
        ======================================== */}
      <section className="py-20 bg-gradient-to-br from-gray-900 via-emerald-900 to-gray-900 relative overflow-hidden">
        {/* Background decoration - continuous from previous section */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div 
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
              Trusted by <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">Leading Partners</span>
            </h2>
            <p className="text-lg text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Collaborating with prestigious organizations to advance environmental monitoring across Africa
            </p>
          </motion.div>

          {/* Partners Container - White card in dark theme */}
          <motion.div 
            className="bg-white rounded-3xl p-12 shadow-2xl border border-white/20"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            viewport={{ once: true }}
          >
            {/* Top Row - Major Partners */}
            <div className="flex flex-wrap justify-center items-center gap-8 mb-12 pb-8 border-b border-gray-200">
              <div className="flex items-center justify-center min-w-[180px] h-16 grayscale hover:grayscale-0 transition-all duration-300 opacity-60 hover:opacity-100">
                <div className="text-2xl font-bold text-gray-700">ESA</div>
              </div>
              <div className="flex items-center justify-center min-w-[180px] h-16 grayscale hover:grayscale-0 transition-all duration-300 opacity-60 hover:opacity-100">
                <div className="text-xl font-bold text-gray-700">Copernicus</div>
              </div>
              <div className="flex items-center justify-center min-w-[180px] h-16 grayscale hover:grayscale-0 transition-all duration-300 opacity-60 hover:opacity-100">
                <div className="text-lg font-bold text-gray-700">NASA Earth</div>
              </div>
              <div className="flex items-center justify-center min-w-[180px] h-16 grayscale hover:grayscale-0 transition-all duration-300 opacity-60 hover:opacity-100">
                <div className="text-xl font-bold text-gray-700">Google Earth</div>
              </div>
            </div>

            {/* Middle Row - Research Partners */}
            <div className="flex flex-wrap justify-center items-center gap-8 mb-12 pb-8 border-b border-gray-200">
              <div className="flex items-center justify-center min-w-[160px] h-14 grayscale hover:grayscale-0 transition-all duration-300 opacity-60 hover:opacity-100">
                <div className="text-lg font-semibold text-gray-600">UNEP</div>
              </div>
              <div className="flex items-center justify-center min-w-[160px] h-14 grayscale hover:grayscale-0 transition-all duration-300 opacity-60 hover:opacity-100">
                <div className="text-lg font-semibold text-gray-600">WWF</div>
              </div>
              <div className="flex items-center justify-center min-w-[160px] h-14 grayscale hover:grayscale-0 transition-all duration-300 opacity-60 hover:opacity-100">
                <div className="text-lg font-semibold text-gray-600">Conservation Int.</div>
              </div>
              <div className="flex items-center justify-center min-w-[160px] h-14 grayscale hover:grayscale-0 transition-all duration-300 opacity-60 hover:opacity-100">
                <div className="text-lg font-semibold text-gray-600">WRI</div>
              </div>
              <div className="flex items-center justify-center min-w-[160px] h-14 grayscale hover:grayscale-0 transition-all duration-300 opacity-60 hover:opacity-100">
                <div className="text-lg font-semibold text-gray-600">IUCN</div>
              </div>
            </div>

            {/* Bottom Row - Regional Partners */}
            <div className="flex flex-wrap justify-center items-center gap-8">
              <div className="flex items-center justify-center min-w-[140px] h-12 grayscale hover:grayscale-0 transition-all duration-300 opacity-60 hover:opacity-100">
                <div className="text-base font-medium text-gray-600">African Union</div>
              </div>
              <div className="flex items-center justify-center min-w-[140px] h-12 grayscale hover:grayscale-0 transition-all duration-300 opacity-60 hover:opacity-100">
                <div className="text-base font-medium text-gray-600">SADC</div>
              </div>
              <div className="flex items-center justify-center min-w-[140px] h-12 grayscale hover:grayscale-0 transition-all duration-300 opacity-60 hover:opacity-100">
                <div className="text-base font-medium text-gray-600">ECOWAS</div>
              </div>
              <div className="flex items-center justify-center min-w-[140px] h-12 grayscale hover:grayscale-0 transition-all duration-300 opacity-60 hover:opacity-100">
                <div className="text-base font-medium text-gray-600">EAC</div>
              </div>
              <div className="flex items-center justify-center min-w-[140px] h-12 grayscale hover:grayscale-0 transition-all duration-300 opacity-60 hover:opacity-100">
                <div className="text-base font-medium text-gray-600">IGAD</div>
              </div>
              <div className="flex items-center justify-center min-w-[140px] h-12 grayscale hover:grayscale-0 transition-all duration-300 opacity-60 hover:opacity-100">
                <div className="text-base font-medium text-gray-600">COMESA</div>
              </div>
            </div>
          </motion.div>

          {/* Partner CTA */}
          <motion.div 
            className="text-center mt-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
          >
            <p className="text-gray-300 mb-6 text-lg">
              Join our network of partners advancing environmental intelligence across Africa
            </p>
            <button className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white font-semibold rounded-full transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
              Become a Partner
            </button>
          </motion.div>
        </div>
      </section>
      {/* ========================================
        END: Partners Section  
        ======================================== */}

      {/* Enhanced Footer */}
      <footer className="bg-gray-900 text-white py-16 relative">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%234a7c28' fill-opacity='0.4'%3E%3Cpath d='M20 20c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10zm10 0c0-5.5-4.5-10-10-10s-10 4.5-10 10 4.5 10 10 10 10-4.5 10-10z'/%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-12 h-12 nature-gradient rounded-2xl flex items-center justify-center shadow-lg">
                  <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
<Link href="/pricing" className="text-2xl font-bold">Misbar Africa</Link>              </div>
              <p className="text-gray-400 leading-relaxed">
                Advanced geospatial intelligence platform powered by Copernicus satellite data for environmental monitoring and conservation.
              </p>
            </div>
            
            <div>
              <h3 className="font-bold text-lg mb-6 text-green-400">Features</h3>
              <ul className="space-y-3 text-gray-400">
                <li className="hover:text-green-400 transition-colors cursor-pointer">Interactive Mapping</li>
                <li className="hover:text-green-400 transition-colors cursor-pointer">Satellite Data Analysis</li>
                <li className="hover:text-green-400 transition-colors cursor-pointer">Time-Series Comparison</li>
                <li className="hover:text-green-400 transition-colors cursor-pointer">Environmental Monitoring</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold text-lg mb-6 text-green-400">Resources</h3>
              <ul className="space-y-3 text-gray-400">
                <li className="hover:text-green-400 transition-colors cursor-pointer">Documentation</li>
                <li className="hover:text-green-400 transition-colors cursor-pointer">API Reference</li>
                <li className="hover:text-green-400 transition-colors cursor-pointer">Environmental Tutorials</li>
                <li className="hover:text-green-400 transition-colors cursor-pointer">Conservation Support</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-bold text-lg mb-6 text-green-400">Connect With Nature</h3>
              <div className="space-y-4">
                <p className="text-gray-400 leading-relaxed">
                  Stay updated with the latest environmental monitoring features and conservation insights.
                </p>
                <div className="flex space-x-4">
                  <a href="#" className="text-gray-400 hover:text-green-400 transition-all duration-300 hover:scale-110">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </a>
                  <a href="#" className="text-gray-400 hover:text-green-400 transition-all duration-300 hover:scale-110">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                    </svg>
                  </a>
                  <a href="#" className="text-gray-400 hover:text-green-400 transition-all duration-300 hover:scale-110">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-12 pt-8 text-center text-gray-400">
            <p className="flex items-center justify-center space-x-2">
              <span>© 2024 Misbar Africa. All rights reserved.</span>
              <span className="text-green-400">🌿</span>
              <span>Powered by Copernicus Data Space Ecosystem.</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}