'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { MessageSquare, Search, Plus, Eye, MessageCircle, Calendar, User, Filter, Leaf, TreeDeciduous, Sprout } from 'lucide-react'

interface Category {
  id: number
  name: string
  description: string
  icon: string
  color: string
  post_count: number
}

interface Post {
  id: number
  title: string
  content: string
  author_name: string
  author_last_name: string
  author_institution: string
  category_name: string
  category_color: string
  category_icon: string
  views: number
  reply_count: number
  created_at: string
  last_reply_at: string | null
}

export default function ForumPage() {
  const { user } = useAuth()
  const [categories, setCategories] = useState<Category[]>([])
  const [posts, setPosts] = useState<Post[]>([])
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [activeTab, setActiveTab] = useState<'categories' | 'posts'>('categories')

  useEffect(() => {
    fetchCategories()
    fetchPosts()
  }, [selectedCategory, searchTerm, currentPage])

  const fetchCategories = async () => {
    try {
      const response = await fetch('http://localhost:5001/api/forum/categories')
      const data = await response.json()
      if (data.success) {
        setCategories(data.categories)
      }
    } catch (error) {
      console.error('Failed to fetch categories:', error)
    }
  }

  const fetchPosts = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10'
      })
      
      if (selectedCategory) {
        params.append('category_id', selectedCategory.toString())
      }
      
      if (searchTerm) {
        params.append('search', searchTerm)
      }

      const response = await fetch(`http://localhost:5001/api/forum/posts?${params}`)
      const data = await response.json()
      if (data.success) {
        setPosts(data.posts)
        setTotalPages(data.pagination.totalPages)
      }
    } catch (error) {
      console.error('Failed to fetch posts:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const truncateContent = (content: string, maxLength: number = 150) => {
    if (content.length <= maxLength) return content
    return content.substring(0, maxLength) + '...'
  }

  const getCategoryColor = (color: string) => {
    const colorMap: { [key: string]: string } = {
      blue: 'from-blue-500 to-cyan-500',
      orange: 'from-orange-500 to-amber-500',
      green: 'from-green-500 to-emerald-500',
      purple: 'from-purple-500 to-fuchsia-500',
      indigo: 'from-indigo-500 to-blue-500',
      emerald: 'from-emerald-500 to-teal-500'
    }
    return colorMap[color] || 'from-gray-500 to-slate-500'
  }

  const getCategoryBadgeColor = (color: string) => {
    const colorMap: { [key: string]: string } = {
      blue: 'bg-blue-50 text-blue-700 border border-blue-200',
      orange: 'bg-orange-50 text-orange-700 border border-orange-200',
      green: 'bg-green-50 text-green-700 border border-green-200',
      purple: 'bg-purple-50 text-purple-700 border border-purple-200',
      indigo: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
      emerald: 'bg-emerald-50 text-emerald-700 border border-emerald-200'
    }
    return colorMap[color] || 'bg-gray-50 text-gray-700 border border-gray-200'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-white">
              <div className="flex items-center gap-3 mb-3">
                <div className="bg-white/20 backdrop-blur-sm p-3 rounded-2xl">
                  <Leaf className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-4xl md:text-5xl font-bold">Community Forum</h1>
              </div>
              <p className="text-emerald-50 text-lg max-w-2xl">
                Join the conversation on environmental conservation, sustainability, and climate action
              </p>
            </div>
            
            {user && (
              <Link href="/forum/new">
                <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-white text-emerald-700 px-8 py-4 rounded-2xl font-bold flex items-center gap-2 shadow-2xl hover:shadow-emerald-500/50 transition-all"
                >
                  <Plus className="w-5 h-5" />
                  Start Discussion
                </motion.button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Search Bar - Floating */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-10">
        <div className="bg-white rounded-2xl shadow-2xl p-6 backdrop-blur-lg">
          <div className="flex items-center gap-4">
            <Search className="w-6 h-6 text-gray-400" />
            <input
              type="text"
              placeholder="Search discussions about climate, wildlife, conservation..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value)
                setCurrentPage(1)
              }}
              className="flex-1 text-lg outline-none text-gray-700 placeholder-gray-400"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="text-gray-400 hover:text-gray-600 text-sm font-medium"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Categories Chips */}
        <div className="mb-8">
          <div className="flex items-center gap-3 flex-wrap">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setSelectedCategory(null)
                setActiveTab('posts')
              }}
              className={`px-6 py-3 rounded-full font-semibold transition-all ${
                selectedCategory === null
                  ? 'bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-lg'
                  : 'bg-white text-gray-700 hover:shadow-md border border-gray-200'
              }`}
            >
              All Topics
            </motion.button>
            
            {categories.map((category) => (
              <motion.button
                key={category.id}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setSelectedCategory(category.id)
                  setActiveTab('posts')
                }}
                className={`px-6 py-3 rounded-full font-semibold transition-all flex items-center gap-2 ${
                  selectedCategory === category.id
                    ? `bg-gradient-to-r ${getCategoryColor(category.color)} text-white shadow-lg`
                    : 'bg-white text-gray-700 hover:shadow-md border border-gray-200'
                }`}
              >
                <span className="text-lg">{category.icon}</span>
                {category.name}
                <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                  selectedCategory === category.id ? 'bg-white/30' : 'bg-gray-100'
                }`}>
                  {category.post_count}
                </span>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Posts */}
        {loading ? (
          <div className="flex flex-col justify-center items-center py-20">
            <div className="relative">
              <div className="animate-spin rounded-full h-16 w-16 border-4 border-emerald-200"></div>
              <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-emerald-600 absolute top-0"></div>
            </div>
            <p className="text-gray-600 mt-4 font-medium">Loading discussions...</p>
          </div>
        ) : posts.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl shadow-lg p-16 text-center"
          >
            <div className="bg-emerald-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
              <Sprout className="w-12 h-12 text-emerald-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">No discussions found</h3>
            <p className="text-gray-600 text-lg mb-6">
              {searchTerm
                ? 'Try adjusting your search terms'
                : selectedCategory
                ? 'Be the first to start a discussion in this category'
                : 'Start a conversation about nature and sustainability'}
            </p>
            {user && !searchTerm && !selectedCategory && (
              <Link href="/forum/new">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-gradient-to-r from-emerald-600 to-green-600 text-white px-8 py-4 rounded-2xl font-bold shadow-lg"
                >
                  Create First Post
                </motion.button>
              </Link>
            )}
          </motion.div>
        ) : (
          <div className="space-y-6">
            {posts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden group"
              >
                <div className="p-8">
                  <div className="flex items-start justify-between mb-5">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold ${getCategoryBadgeColor(post.category_color)}`}>
                        <span className="text-base">{post.category_icon}</span>
                        {post.category_name}
                      </span>
                      <div className="flex items-center text-gray-500 text-sm gap-1.5">
                        <Calendar className="w-4 h-4" />
                        {formatDate(post.created_at)}
                      </div>
                    </div>
                  </div>

                  <Link href={`/forum/post/${post.id}`}>
                    <h2 className="text-2xl font-bold text-gray-900 mb-4 group-hover:text-emerald-600 transition-colors cursor-pointer leading-tight">
                      {post.title}
                    </h2>
                  </Link>

                  <p className="text-gray-600 mb-6 leading-relaxed text-lg">
                    {truncateContent(post.content)}
                  </p>

                  <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                    <div className="flex items-center gap-2">
                      <div className="bg-gradient-to-br from-emerald-500 to-green-500 w-10 h-10 rounded-full flex items-center justify-center text-white font-bold">
                        {post.author_name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">
                          {post.author_name} {post.author_last_name}
                        </div>
                        {post.author_institution && (
                          <div className="text-sm text-gray-500">{post.author_institution}</div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2 text-gray-600">
                        <div className="bg-gray-100 p-2 rounded-lg">
                          <Eye className="w-4 h-4" />
                        </div>
                        <span className="font-semibold">{post.views}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <div className="bg-gray-100 p-2 rounded-lg">
                          <MessageCircle className="w-4 h-4" />
                        </div>
                        <span className="font-semibold">{post.reply_count}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center gap-3 mt-12">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="px-6 py-3 bg-white border-2 border-gray-200 rounded-xl hover:border-emerald-500 hover:text-emerald-600 font-semibold disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-gray-200 disabled:hover:text-gray-700 transition-all"
                >
                  Previous
                </motion.button>
                
                <div className="flex items-center gap-2">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    return (
                      <motion.button
                        key={pageNum}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setCurrentPage(pageNum)}
                        className={`w-12 h-12 rounded-xl font-bold transition-all ${
                          currentPage === pageNum
                            ? 'bg-gradient-to-r from-emerald-600 to-green-600 text-white shadow-lg'
                            : 'bg-white text-gray-700 hover:bg-gray-50 border-2 border-gray-200'
                        }`}
                      >
                        {pageNum}
                      </motion.button>
                    );
                  })}
                </div>
                
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="px-6 py-3 bg-white border-2 border-gray-200 rounded-xl hover:border-emerald-500 hover:text-emerald-600 font-semibold disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-gray-200 disabled:hover:text-gray-700 transition-all"
                >
                  Next
                </motion.button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}