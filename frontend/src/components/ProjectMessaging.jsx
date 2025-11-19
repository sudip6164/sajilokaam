import { useEffect, useState, useRef } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../hooks/useToast'
import api from '../utils/api'
import { connectWebSocket, subscribeToConversation, sendMessage } from '../utils/websocket'

export function ProjectMessaging({ projectId }) {
  const { token, profile } = useAuth()
  const { error: showError } = useToast()
  const [conversations, setConversations] = useState([])
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const messagesEndRef = useRef(null)
  const subscriptionRef = useRef(null)

  useEffect(() => {
    if (projectId && token) {
      loadConversations()
      connectWebSocket({ token })
    }
    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe()
        subscriptionRef.current = null
      }
    }
  }, [projectId, token])

  useEffect(() => {
    let isMounted = true
    if (selectedConversation) {
      loadMessages()
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe()
        subscriptionRef.current = null
      }
      subscribeToConversation(selectedConversation.id, (message) => {
        setMessages(prev => [...prev, message])
        scrollToBottom()
      }).then(subscription => {
        if (isMounted) {
          subscriptionRef.current = subscription
        } else {
          subscription.unsubscribe()
        }
      }).catch(err => {
        console.error('Failed to subscribe to conversation', err)
      })
    }
    return () => {
      isMounted = false
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe()
        subscriptionRef.current = null
      }
    }
  }, [selectedConversation])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const loadConversations = async () => {
    try {
      const data = await api.conversations.getByProject(projectId, token)
      setConversations(data || [])
      if (data && data.length > 0 && !selectedConversation) {
        setSelectedConversation(data[0])
      }
    } catch (err) {
      showError(err.message || 'Failed to load conversations')
    } finally {
      setLoading(false)
    }
  }

  const loadMessages = async () => {
    if (!selectedConversation) return
    try {
      const data = await api.messages.getAll(selectedConversation.id, 0, 50, token)
      setMessages(data || [])
    } catch (err) {
      showError(err.message || 'Failed to load messages')
    }
  }

  const handleSendMessage = async (e) => {
    e.preventDefault()
    if (!newMessage.trim() || !selectedConversation) return

    setSending(true)
    try {
      const message = await api.messages.send(selectedConversation.id, token, {
        content: newMessage,
        contentType: 'TEXT'
      })
      setMessages(prev => [...prev, message])
      setNewMessage('')
      scrollToBottom()
    } catch (err) {
      showError(err.message || 'Failed to send message')
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <div className="card">
        <div className="loading-skeleton h-8 w-3/4 mb-4"></div>
        <div className="loading-skeleton h-40 w-full"></div>
      </div>
    )
  }

  return (
    <div className="card">
      <h2 className="text-2xl font-bold text-white mb-6">Project Messages</h2>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
        {/* Conversations List */}
        <div className="lg:col-span-1 border-r border-white/10 pr-6 overflow-y-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-white">Conversations</h3>
            <button
              onClick={() => {
                // Create new conversation modal would go here
              }}
              className="btn btn-primary text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
            </button>
          </div>
          <div className="space-y-2">
            {conversations.map(conv => (
              <button
                key={conv.id}
                onClick={() => setSelectedConversation(conv)}
                className={`w-full text-left p-3 rounded-lg transition-colors ${
                  selectedConversation?.id === conv.id
                    ? 'bg-violet-500/20 border border-violet-500/50'
                    : 'bg-white/5 hover:bg-white/10'
                }`}
              >
                <p className="font-semibold text-white">{conv.title || 'Untitled Conversation'}</p>
                <p className="text-xs text-white/50 mt-1">
                  {conv.participants?.length || 0} participant(s)
                </p>
              </button>
            ))}
            {conversations.length === 0 && (
              <p className="text-white/50 text-sm text-center py-8">No conversations yet</p>
            )}
          </div>
        </div>

        {/* Messages */}
        <div className="lg:col-span-2 flex flex-col">
          {selectedConversation ? (
            <>
              <div className="mb-4 pb-4 border-b border-white/10">
                <h3 className="text-lg font-bold text-white">
                  {selectedConversation.title || 'Untitled Conversation'}
                </h3>
                <p className="text-sm text-white/50">
                  {selectedConversation.participants?.length || 0} participant(s)
                </p>
              </div>
              
              <div className="flex-1 overflow-y-auto mb-4 space-y-4">
                {messages.map(message => (
                  <div
                    key={message.id}
                    className={`flex ${message.sender?.id === profile?.id ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-[70%] p-3 rounded-lg ${
                        message.sender?.id === profile?.id
                          ? 'bg-violet-500/20 text-white'
                          : 'bg-white/10 text-white'
                      }`}
                    >
                      {message.sender?.id !== profile?.id && (
                        <p className="text-xs font-semibold text-white/70 mb-1">
                          {message.sender?.fullName || 'Unknown'}
                        </p>
                      )}
                      <p className="text-sm">{message.content}</p>
                      <p className="text-xs text-white/50 mt-1">
                        {new Date(message.createdAt).toLocaleTimeString()}
                        {message.isEdited && ' (edited)'}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <form onSubmit={handleSendMessage} className="flex gap-2">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  className="input-field flex-1"
                  disabled={sending}
                />
                <button
                  type="submit"
                  disabled={sending || !newMessage.trim()}
                  className="btn btn-primary"
                >
                  {sending ? 'Sending...' : 'Send'}
                </button>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-white/50">Select a conversation to start messaging</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

