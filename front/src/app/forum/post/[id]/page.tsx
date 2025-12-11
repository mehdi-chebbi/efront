'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { ArrowLeft, User, Calendar, Eye, Edit3, Trash2, Send, Loader2, MessageCircle, Leaf, Award, Users, TrendingUp } from 'lucide-react'

interface Reply {
  id: number
  content: string
  author_name: string
  author_last_name: string
  author_institution: string
  author_role: string
  created_at: string
  updated_at: string
}

interface Post {
  id: number
  title: string
  content: string
  author_name: string
  author_last_name: string
  author_institution: string
  author_role: string
  category_name: string
  category_color: string
  views: number
  reply_count: number
  created_at: string
  last_reply_at: string | null
}

export default function ForumPostPage() {
  const { user } = useAuth()
  const params = useParams()
  const router = useRouter()
  const postId = params.id as string

  const [post, setPost] = useState<Post | null>(null)
  const [replies, setReplies] = useState<Reply[]>([])
  const [loading, setLoading] = useState(true)
  const [replyContent, setReplyContent] = useState('')
  const [submittingReply, setSubmittingReply] = useState(false)
  const [editingPost, setEditingPost] = useState(false)
  const [editTitle, setEditTitle] = useState('')
  const [editContent, setEditContent] = useState('')
  const [submittingEdit, setSubmittingEdit] = useState(false)

  useEffect(() => {
    fetchPost()
  }, [postId])

  const fetchPost = async () => {
    try {
      setLoading(true)
      const response = await fetch(`http://localhost:5001/api/forum/posts/${postId}`)
      const data = await response.json()
      if (data.success) {
        setPost(data.post)
        setReplies(data.replies)
      } else {
        router.push('/forum')
      }
    } catch (error) {
      console.error('Failed to fetch post:', error)
      router.push('/forum')
    } finally {
      setLoading(false)
    }
  }

  const handleReply = async () => {
    if (!user || !replyContent.trim()) return

    setSubmittingReply(true)
    try {
      const response = await fetch(`http://localhost:5001/api/forum/posts/${postId}/replies`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          content: replyContent.trim()
        })
      })

      const data = await response.json()
      if (data.success) {
        setReplies([...replies, data.reply])
        setReplyContent('')
        if (post) {
          setPost({
            ...post,
            reply_count: post.reply_count + 1,
            last_reply_at: new Date().toISOString()
          })
        }
      }
    } catch (error) {
      console.error('Failed to submit reply:', error)
    } finally {
      setSubmittingReply(false)
    }
  }

  const handleEditPost = async () => {
    if (!user || !post) return

    setSubmittingEdit(true)
    try {
      const response = await fetch(`http://localhost:5001/api/forum/posts/${postId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          title: editTitle,
          content: editContent
        })
      })

      const data = await response.json()
      if (data.success) {
        setPost(data.post)
        setEditingPost(false)
      }
    } catch (error) {
      console.error('Failed to update post:', error)
    } finally {
      setSubmittingEdit(false)
    }
  }

  const handleDeletePost = async () => {
    if (!user || !post) return

    if (!confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      return
    }

    try {
      const response = await fetch(`http://localhost:5001/api/forum/posts/${postId}`, {
        method: 'DELETE',
        credentials: 'include'
      })

      const data = await response.json()
      if (data.success) {
        router.push('/forum')
      }
    } catch (error) {
      console.error('Failed to delete post:', error)
    }
  }

  const startEditing = () => {
    if (!post) return
    setEditTitle(post.title)
    setEditContent(post.content)
    setEditingPost(true)
  }

  const cancelEditing = () => {
    setEditingPost(false)
    setEditTitle('')
    setEditContent('')
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

  const getCategoryBadge = (color: string) => {
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

  const canEditPost = user && post && (user.email === post.author_name || user.role === 'admin')

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

  if (!post) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center bg-white rounded-3xl shadow-xl p-12"
        >
          <div className="bg-emerald-100 w-24 h-24 rounded-full flex items-center justify-center mx-auto mb-6">
            <MessageCircle className="w-12 h-12 text-emerald-600" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-3">Post Not Found</h2>
          <p className="text-gray-600 text-lg mb-6">This discussion doesn't exist or has been removed.</p>
          <Link href="/forum">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="bg-gradient-to-r from-emerald-600 to-green-600 text-white px-8 py-4 rounded-2xl font-bold shadow-lg"
            >
              Back to Forum
            </motion.button>
          </Link>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjEiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-30"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <Link href="/forum" className="inline-flex items-center text-white hover:text-emerald-100 transition-colors group">
              <ArrowLeft className="w-5 h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
              <span className="font-semibold">Back to Discussions</span>
            </Link>
            
            {canEditPost && !editingPost && (
              <div className="flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={startEditing}
                  className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white px-4 py-2 rounded-xl font-semibold flex items-center gap-2 border border-white/30"
                >
                  <Edit3 className="w-4 h-4" />
                  Edit
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handleDeletePost}
                  className="bg-red-500/90 backdrop-blur-sm hover:bg-red-600 text-white px-4 py-2 rounded-xl font-semibold flex items-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </motion.button>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content - Left Side */}
          <div className="lg:col-span-2 space-y-6">
            {/* Main Post */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-3xl shadow-xl p-8"
            >
              {/* Post Meta */}
              <div className="flex items-center gap-3 mb-6 flex-wrap">
                <span className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-bold ${getCategoryBadge(post.category_color)}`}>
                  {post.category_name}
                </span>
                <div className="flex items-center text-gray-500 text-sm gap-1.5">
                  <Calendar className="w-4 h-4" />
                  {formatDate(post.created_at)}
                </div>
              </div>

              {/* Post Title */}
              {editingPost ? (
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="text-3xl font-bold text-gray-900 w-full mb-6 px-5 py-4 border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              ) : (
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6 leading-tight">{post.title}</h1>
              )}

              {/* Post Content */}
              {editingPost ? (
                <textarea
                  value={editContent}
                  onChange={(e) => setEditContent(e.target.value)}
                  rows={12}
                  className="w-full px-5 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 mb-6 resize-vertical"
                />
              ) : (
                <div className="text-gray-700 text-lg leading-relaxed mb-8">
                  {post.content.split('\n').map((paragraph, index) => (
                    <p key={index} className="mb-4">{paragraph}</p>
                  ))}
                </div>
              )}

              {/* Edit Actions */}
              {editingPost && (
                <div className="flex gap-3 pt-6 border-t-2 border-gray-100">
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={handleEditPost}
                    disabled={submittingEdit}
                    className="bg-gradient-to-r from-emerald-600 to-green-600 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 disabled:opacity-50"
                  >
                    {submittingEdit ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    {submittingEdit ? 'Saving...' : 'Save Changes'}
                  </motion.button>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={cancelEditing}
                    className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-xl font-bold"
                  >
                    Cancel
                  </motion.button>
                </div>
              )}
            </motion.div>

            {/* Replies Section */}
            {replies.length > 0 && (
              <div>
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-gradient-to-r from-emerald-600 to-green-600 p-3 rounded-2xl">
                    <MessageCircle className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900">
                    {replies.length} {replies.length === 1 ? 'Reply' : 'Replies'}
                  </h3>
                </div>
                
                <div className="space-y-4">
                  {replies.map((reply, index) => (
                    <motion.div
                      key={reply.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-shadow p-6"
                    >
                                              <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="bg-gradient-to-br from-emerald-500 to-green-500 w-10 h-10 rounded-full flex items-center justify-center text-white font-bold">
                            {reply.author_name ? reply.author_name.charAt(0).toUpperCase() : 'U'}
                          </div>
                          <div>
                            <div className="font-bold text-gray-900">
                              {reply.author_name || 'User'} {reply.author_last_name || ''}
                            </div>
                            <div className="text-sm text-gray-600">
                              {reply.author_institution && `${reply.author_institution} • `}
                              {reply.author_role || 'Member'}
                            </div>
                          </div>
                        </div>
                        <div className="text-sm text-gray-500 flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" />
                          {formatDate(reply.created_at)}
                        </div>
                      </div>

                      <div className="text-gray-700 leading-relaxed">
                        {reply.content.split('\n').map((paragraph, index) => (
                          <p key={index} className="mb-3">{paragraph}</p>
                        ))}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sticky Sidebar - Right Side */}
          <div className="lg:col-span-1">
            <div className="sticky top-8 space-y-6">
              {/* Author Card */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-2xl shadow-lg p-6"
              >
                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <User className="w-5 h-5 text-emerald-600" />
                  Author
                </h3>
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-gradient-to-br from-emerald-500 to-green-500 w-14 h-14 rounded-full flex items-center justify-center text-white font-bold text-xl">
                    {post.author_name ? post.author_name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div>
                    <div className="font-bold text-gray-900">
                      {post.author_name || 'User'} {post.author_last_name || ''}
                    </div>
                    <div className="text-sm text-gray-600">{post.author_role || 'Member'}</div>
                  </div>
                </div>
                {post.author_institution && (
                  <div className="pt-4 border-t border-gray-100">
                    <div className="text-sm text-gray-600 mb-1">Institution</div>
                    <div className="font-semibold text-gray-900">{post.author_institution}</div>
                  </div>
                )}
              </motion.div>

              {/* Stats Card */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-gradient-to-br from-emerald-500 to-green-600 rounded-2xl shadow-lg p-6 text-white"
              >
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" />
                  Discussion Stats
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Eye className="w-5 h-5 text-emerald-100" />
                      <span className="text-emerald-100">Views</span>
                    </div>
                    <span className="text-2xl font-bold">{post.views}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <MessageCircle className="w-5 h-5 text-emerald-100" />
                      <span className="text-emerald-100">Replies</span>
                    </div>
                    <span className="text-2xl font-bold">{post.reply_count}</span>
                  </div>
                </div>
              </motion.div>

              {/* Quick Reply Card */}
              {user && !editingPost && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.2 }}
                  className="bg-white rounded-2xl shadow-lg p-6"
                >
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <Leaf className="w-5 h-5 text-emerald-600" />
                    Quick Reply
                  </h3>
                  <textarea
                    value={replyContent}
                    onChange={(e) => setReplyContent(e.target.value)}
                    placeholder="Share your thoughts..."
                    rows={4}
                    className="w-full px-4 py-3 text-sm border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 mb-3 resize-none"
                  />
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleReply}
                    disabled={submittingReply || !replyContent.trim()}
                    className="w-full bg-gradient-to-r from-emerald-600 to-green-600 hover:from-emerald-700 hover:to-green-700 text-white px-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {submittingReply ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
                    {submittingReply ? 'Posting...' : 'Post Reply'}
                  </motion.button>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}