'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Check, X, Leaf, Sparkles, ArrowRight, Globe, Satellite, Trees, Droplets } from 'lucide-react'

export default function PricingPage() {
  const [hoveredPlan, setHoveredPlan] = useState<string | null>(null)

  const plans = [
    {
      id: 'presenter',
      name: 'Presenter',
      description: 'Perfect for demonstrations and presentations',
      icon: Satellite,
      price: {
        daily: 19,
        weekly: 79
      },
      gradient: 'from-cyan-400 via-blue-400 to-indigo-400',
      accentColor: 'cyan',
      features: [
        { name: '24-hour access', included: true },
        { name: 'Basic drawing tools', included: true },
        { name: 'Standard base maps', included: true },
        { name: '10 AI requests per day', included: true },
        { name: 'Basic exports (with watermark)', included: true },
        { name: 'Advanced spectral indices', included: false },
        { name: 'Time-series analysis', included: false },
        { name: 'Real-time satellite data', included: false },
        { name: 'Priority support', included: false }
      ],
      cta: 'Start Demo',
      popular: false
    },
    {
      id: 'premium',
      name: 'Premium',
      description: 'Complete access for professionals and researchers',
      icon: Trees,
      price: {
        monthly: 99,
        yearly: 990
      },
      gradient: 'from-emerald-400 via-green-400 to-teal-400',
      accentColor: 'emerald',
      features: [
        { name: 'Unlimited 24/7 access', included: true },
        { name: 'Advanced drawing tools', included: true },
        { name: 'All base maps & layers', included: true },
        { name: 'Unlimited AI analysis', included: true },
        { name: 'Premium exports (no watermark)', included: true },
        { name: 'All 7 spectral indices', included: true },
        { name: 'Time-series analysis', included: true },
        { name: 'Real-time satellite data', included: true },
        { name: '24/7 priority support', included: true }
      ],
      cta: 'Get Started',
      popular: true
    }
  ]

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Gradient mesh background */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-100 via-teal-50 to-emerald-100" />
      
      {/* Animated organic blobs */}
      <div className="absolute inset-0">
        <motion.div
          animate={{
            scale: [1, 1.3, 1],
            x: [0, 100, 0],
            y: [0, 50, 0],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-br from-emerald-300/40 to-teal-300/40 rounded-full blur-3xl"
          style={{ clipPath: 'polygon(50% 0%, 80% 10%, 100% 35%, 100% 70%, 80% 90%, 50% 100%, 20% 90%, 0% 70%, 0% 35%, 20% 10%)' }}
        />
        <motion.div
          animate={{
            scale: [1, 1.4, 1],
            x: [0, -80, 0],
            y: [0, 80, 0],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute bottom-32 right-32 w-80 h-80 bg-gradient-to-br from-cyan-300/40 to-blue-300/40 rounded-full blur-3xl"
          style={{ clipPath: 'polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%)' }}
        />
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 30,
            repeat: Infinity,
            ease: "linear"
          }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-green-300/30 to-emerald-300/30 rounded-full blur-3xl"
        />
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-20">
        <div className="w-full max-w-7xl">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-20"
          >
            <motion.div
              initial={{ scale: 0, rotate: 180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.8, type: "spring", bounce: 0.4 }}
              className="inline-flex items-center gap-2 mb-6 bg-white/80 backdrop-blur-xl px-6 py-3 rounded-full shadow-lg border border-white/40"
            >
              <Globe className="w-5 h-5 text-emerald-600" />
              <span className="text-emerald-700 font-bold text-sm tracking-wider">
                EARTH OBSERVATION PLATFORM
              </span>
            </motion.div>
            
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-extrabold mb-6 leading-none tracking-tight">
              <motion.span
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="block text-gray-800"
              >
                Monitor Our
              </motion.span>
              <motion.span
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="block bg-gradient-to-r from-emerald-600 via-green-500 to-teal-500 text-transparent bg-clip-text"
              >
                Living Planet
              </motion.span>
            </h1>
            
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-xl md:text-2xl text-gray-700 max-w-3xl mx-auto leading-relaxed font-medium"
            >
              Real-time satellite intelligence for environmental research and conservation
            </motion.p>
          </motion.div>

          {/* Pricing Cards - Organic Layout */}
          <div className="flex flex-col lg:flex-row items-center justify-center gap-8 lg:gap-12 mb-20">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, scale: 0.9, y: 50 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ 
                  duration: 0.8, 
                  delay: 0.3 + index * 0.2,
                  type: "spring",
                  bounce: 0.3
                }}
                onMouseEnter={() => setHoveredPlan(plan.id)}
                onMouseLeave={() => setHoveredPlan(null)}
                className={`relative w-full lg:max-w-md ${
                  plan.popular ? 'lg:scale-110 lg:z-20' : 'lg:z-10'
                }`}
              >
                {plan.popular && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0, rotate: -12 }}
                    animate={{ opacity: 1, scale: 1, rotate: -6 }}
                    transition={{ delay: 1, type: "spring", bounce: 0.5 }}
                    className="absolute -top-4 -right-4 z-30"
                  >
                    <div className="bg-gradient-to-r from-amber-400 via-orange-400 to-red-400 text-white px-6 py-3 rounded-full text-sm font-black shadow-2xl flex items-center gap-2 rotate-6 border-4 border-white">
                      <Sparkles className="w-5 h-5 fill-current" />
                      MOST POPULAR
                    </div>
                  </motion.div>
                )}
                
                <motion.div
                  animate={{
                    y: hoveredPlan === plan.id ? -12 : 0,
                  }}
                  transition={{ type: "spring", stiffness: 300, damping: 20 }}
                  className="relative"
                >
                  {/* Glass card with organic shape */}
                  <div 
                    className={`relative bg-white/90 backdrop-blur-2xl shadow-2xl overflow-hidden transition-all duration-500 border-2 ${
                      plan.popular 
                        ? 'border-emerald-300 shadow-emerald-200/50' 
                        : 'border-white/50 shadow-gray-200/50'
                    }`}
                    style={{ 
                      borderRadius: '60px 60px 60px 60px',
                    }}
                  >
                    {/* Flowing gradient accent */}
                    <motion.div
                      animate={{
                        backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                      }}
                      transition={{
                        duration: 5,
                        repeat: Infinity,
                        ease: "linear"
                      }}
                      className={`h-3 bg-gradient-to-r ${plan.gradient} bg-[length:200%_100%]`}
                    />

                    <div className="p-10 md:p-12">
                      {/* Floating icon */}
                      <motion.div
                        whileHover={{ 
                          rotate: [0, -10, 10, -10, 0],
                          scale: 1.1 
                        }}
                        transition={{ duration: 0.5 }}
                        className="mb-6"
                      >
                        <div 
                          className={`inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br ${plan.gradient} shadow-2xl`}
                          style={{ borderRadius: '24px' }}
                        >
                          <plan.icon className="w-10 h-10 text-white" strokeWidth={2.5} />
                        </div>
                      </motion.div>

                      <h3 className="text-4xl font-black text-gray-900 mb-3">{plan.name}</h3>
                      <p className="text-gray-600 text-lg mb-8 leading-relaxed">{plan.description}</p>

                      {/* Pricing with organic accent */}
                      <div className="mb-10">
                        <div className="flex items-baseline gap-3 mb-4">
                          <span className={`text-7xl font-black bg-gradient-to-r ${plan.gradient} text-transparent bg-clip-text`}>
                            ${plan.id === 'presenter' ? plan.price.daily : plan.price.monthly}
                          </span>
                          <span className="text-3xl text-gray-500 font-medium">
                            /{plan.id === 'presenter' ? 'day' : 'mo'}
                          </span>
                        </div>
                        <div 
                          className={`inline-flex items-center gap-2 px-5 py-2.5 ${
                            plan.id === 'presenter' ? 'bg-cyan-50' : 'bg-emerald-50'
                          } backdrop-blur-sm border-2 ${
                            plan.id === 'presenter' ? 'border-cyan-200' : 'border-emerald-200'
                          }`}
                          style={{ borderRadius: '20px' }}
                        >
                          <Droplets className={`w-4 h-4 ${
                            plan.id === 'presenter' ? 'text-cyan-600' : 'text-emerald-600'
                          }`} />
                          <span className={`text-sm font-bold ${
                            plan.id === 'presenter' ? 'text-cyan-700' : 'text-emerald-700'
                          }`}>
                            {plan.id === 'presenter' ? '$79/week • Save 40%' : '$990/year • Save 17%'}
                          </span>
                        </div>
                      </div>

                      {/* Features with organic bullets */}
                      <div className="space-y-4 mb-10">
                        {plan.features.map((feature, idx) => (
                          <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.8 + idx * 0.05 }}
                            className="flex items-start gap-3"
                          >
                            <div className={`flex-shrink-0 w-7 h-7 flex items-center justify-center mt-0.5 ${
                              feature.included 
                                ? `bg-gradient-to-br ${plan.gradient} shadow-lg` 
                                : 'bg-gray-200'
                            }`}
                            style={{ borderRadius: '10px' }}>
                              {feature.included ? (
                                <Check className="w-4 h-4 text-white stroke-[3]" />
                              ) : (
                                <X className="w-4 h-4 text-gray-400" />
                              )}
                            </div>
                            <span className={`text-base leading-relaxed ${
                              feature.included ? 'text-gray-900 font-semibold' : 'text-gray-400'
                            }`}>
                              {feature.name}
                            </span>
                          </motion.div>
                        ))}
                      </div>

                      {/* Organic CTA button */}
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        className={`w-full py-5 px-8 font-black text-lg text-white transition-all duration-300 flex items-center justify-center gap-3 relative overflow-hidden group bg-gradient-to-r ${plan.gradient} shadow-2xl hover:shadow-3xl`}
                        style={{ borderRadius: '24px' }}
                      >
                        <motion.div
                          className="absolute inset-0 bg-white/20"
                          initial={{ x: '-100%', skewX: -12 }}
                          whileHover={{ x: '100%' }}
                          transition={{ duration: 0.6 }}
                        />
                        <span className="relative text-lg">{plan.cta}</span>
                        <ArrowRight className="w-6 h-6 relative group-hover:translate-x-2 transition-transform" strokeWidth={3} />
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              </motion.div>
            ))}
          </div>

          {/* Trust badges - organic style */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1.2 }}
            className="text-center"
          >
            <div 
              className="inline-flex flex-wrap items-center justify-center gap-6 md:gap-10 bg-white/80 backdrop-blur-2xl px-10 py-6 shadow-xl border-2 border-white/50"
              style={{ borderRadius: '40px' }}
            >
              {[
                { icon: Check, text: 'No credit card required', color: 'from-emerald-400 to-teal-400' },
                { icon: Sparkles, text: 'Cancel anytime', color: 'from-blue-400 to-cyan-400' },
                { icon: Leaf, text: '30-day money back', color: 'from-green-400 to-emerald-400' }
              ].map((badge, idx) => (
                <motion.div
                  key={idx}
                  whileHover={{ scale: 1.05, y: -4 }}
                  className="flex items-center gap-3"
                >
                  <div 
                    className={`w-12 h-12 bg-gradient-to-br ${badge.color} flex items-center justify-center shadow-lg`}
                    style={{ borderRadius: '16px' }}
                  >
                    <badge.icon className="w-6 h-6 text-white" strokeWidth={2.5} />
                  </div>
                  <span className="text-gray-800 font-bold text-base">{badge.text}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}