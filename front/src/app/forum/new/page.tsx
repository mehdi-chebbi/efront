'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { ArrowLeft, Send, Loader2, Leaf, Sparkles, Check } from 'lucide-react'

interface Category {
  id: number
  name: string
  description: string
  icon: string
  color: string
}

export default function NewPostPage() {
  const { user } = useAuth()
  const router = useRouter()
  
  const [categories, setCategories] = useState<Category[]>([])
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      router.push('/auth')
      return
    }
    fetchCategories()
  }, [user, router])

  const fetchCategories = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/forum/categories')
      const data = await response.json()
      if (data.success) {
        setCategories(data.categories)
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim() || !categoryId) {
      alert('Please fill in all fields')
      return
    }

    setSubmitting(true)
    try {
      const response = await fetch('http://localhost:5001/api/forum/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          category_id: parseInt(categoryId)
        })
      })

      const data = await response.json()
      if (data.success) {
        router.push('/forum')
      } else {
        alert(data.message || 'Failed to create post')
      }
    } catch (error) {
      console.error('Failed to create post:', error)
      alert('Failed to create post. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const getCategoryGradient = (color: string) => {
    const gradientMap: { [key: string]: string } = {
      blue: 'from-blue-500 to-cyan-500',
      orange: 'from-orange-500 to-amber-500',
      green: 'from-green-500 to-emerald-500',
      purple: 'from-purple-500 to-fuchsia-500',
      indigo: 'from-indigo-500 to-blue-500',
      emerald: 'from-emerald-500 to-teal-500'
    }
    return gradientMap[color] || 'from-gray-500 to-slate-500'
  }

  const getCategoryBorder = (color: string) => {
    const borderMap: { [key: string]: string } = {
      blue: 'border-blue-300 bg-blue-50',
      orange: 'border-orange-300 bg-orange-50',
      green: 'border-green-300 bg-green-50',
      purple: 'border-purple-300 bg-purple-50',
      indigo: 'border-indigo-300 bg-indigo-50',
      emerald: 'border-emerald-300 bg-emerald-50'
    }
    return borderMap[color] || 'border-gray-300 bg-gray-50'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 flex items-center justify-center">
        <div className="relative">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-emerald-200"></div>
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-emerald-600 absolute top-0"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30"></div>
        
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <Link href="/forum" className="inline-flex items-center text-white hover:text-emerald-100 transition-colors mb-6 group">
            <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
            <span className="font-semibold">Back to Forum</span>
          </Link>
          
          <div className="flex items-center gap-3">
            <div className="bg-white/20 backdrop-blur-sm p-3 rounded-2xl">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white">Start a Discussion</h1>
              <p className="text-emerald-50 text-lg mt-1">Share your ideas with the community</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="lg:col-span-2"
          >
            <div className="bg-white rounded-3xl shadow-xl p-8">
              <div className="space-y-8">
                {/* Title */}
                <div>
                  <label htmlFor="title" className="block text-lg font-bold text-gray-900 mb-3">
                    Discussion Title
                  </label>
                  <input
                    type="text"
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="What would you like to discuss?"
                    className="w-full px-5 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all"
                    maxLength={255}
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    {title.length}/255 characters
                  </p>
                </div>

                {/* Category Selection */}
                <div>
                  <label htmlFor="category" className="block text-lg font-bold text-gray-900 mb-3">
                    Choose a Topic
                  </label>
                  <select
                    id="category"
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-5 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all bg-white"
                  >
                    <option value="">Select a category...</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.icon} {category.name}
                      </option>
                    ))}
                  </select>
                  {categoryId && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4 p-4 bg-emerald-50 border-2 border-emerald-200 rounded-2xl"
                    >
                      <p className="text-sm text-gray-700">
                        {categories.find(c => c.id.toString() === categoryId)?.description}
                      </p>
                    </motion.div>
                  )}
                </div>

                {/* Content */}
                <div>
                  <label htmlFor="content" className="block text-lg font-bold text-gray-900 mb-3">
                    Your Message
                  </label>
                  <textarea
                    id="content"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="Share your thoughts, questions, or insights about nature and the environment..."
                    rows={12}
                    className="w-full px-5 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all resize-vertical"
                  />
                  <p className="text-sm text-gray-500 mt-2">
                    Be descriptive and provide context to engage the community
                  </p>
                </div>

                {/* Submit Button */}
                <div className="flex justify-end">
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleSubmit}
                    disabled={submitting || !title.trim() || !content.trim() || !categoryId}
                    className="bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white px-10 py-4 rounded-2xl font-bold flex items-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Publishing...
                      </>
                    ) : (
                      <>
                        <Send className="w-5 h-5" />
                        Publish Discussion
                      </>
                    )}
                  </motion.button>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Sidebar */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="lg:col-span-1"
          >
            {/* Guidelines Card */}
            <div className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-3xl shadow-xl p-8 text-white sticky top-8">
              <div className="bg-white/20 backdrop-blur-sm p-3 rounded-2xl w-fit mb-6">
                <Leaf className="w-8 h-8" />
              </div>
              
              <h3 className="text-2xl font-bold mb-4">Community Guidelines</h3>
              
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="bg-white/30 p-1 rounded-lg mt-1">
                    <Check className="w-4 h-4" />
                  </div>
                  <p className="text-emerald-50">Be respectful and constructive in discussions</p>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="bg-white/30 p-1 rounded-lg mt-1">
                    <Check className="w-4 h-4" />
                  </div>
                  <p className="text-emerald-50">Choose the most relevant topic for your post</p>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="bg-white/30 p-1 rounded-lg mt-1">
                    <Check className="w-4 h-4" />
                  </div>
                  <p className="text-emerald-50">Share valuable insights and ask thoughtful questions</p>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="bg-white/30 p-1 rounded-lg mt-1">
                    <Check className="w-4 h-4" />
                  </div>
                  <p className="text-emerald-50">Help others learn and grow their knowledge</p>
                </div>
                
                <div className="flex items-start gap-3">
                  <div className="bg-white/30 p-1 rounded-lg mt-1">
                    <Check className="w-4 h-4" />
                  </div>
                  <p className="text-emerald-50">Keep content focused on nature and sustainability</p>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-white/30">
                <p className="text-sm text-emerald-100">
                  By posting, you agree to our community standards and help create a positive space for environmental discussion.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}