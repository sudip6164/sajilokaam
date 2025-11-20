import { useEffect, useRef, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useToast } from '../hooks/useToast'
import api from '../utils/api'
import { connectWebSocket, subscribeToConversation, subscribeToTyping } from '../utils/websocket'
import { RichTextComposer } from './RichTextComposer'

const ALLOWED_RICH_TAGS = new Set([
  'B',
  'I',
  'EM',
  'STRONG',
  'U',
  'P',
  'DIV',
  'SPAN',
  'UL',
  'OL',
  'LI',
  'BR',
  'A',
  'CODE',
  'PRE',
  'BLOCKQUOTE'
])

const sanitizeRichHtml = (html = '') => {
  if (!html || typeof window === 'undefined') {
    return html || ''
  }
  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')
  doc.querySelectorAll('script,style').forEach(node => node.remove())
  doc.body.querySelectorAll('*').forEach(node => {
    if (!ALLOWED_RICH_TAGS.has(node.tagName)) {
      const textNode = doc.createTextNode(node.textContent || '')
      node.replaceWith(textNode)
      return
    }
    Array.from(node.attributes).forEach(attr => {
      if (node.tagName === 'A' && attr.name === 'href') {
        return
      }
      node.removeAttribute(attr.name)
    })
    if (node.tagName === 'A') {
      node.setAttribute('target', '_blank')
      node.setAttribute('rel', 'noopener noreferrer')
    }
  })
  return doc.body.innerHTML
}

const formatBytes = (bytes = 0) => {
  if (!bytes || Number.isNaN(bytes)) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
  const value = bytes / Math.pow(1024, index)
  return `${value.toFixed(value > 100 || index === 0 ? 0 : 1)} ${units[index]}`
}

export function ProjectMessaging({ projectId }) {
  const { token, profile } = useAuth()
  const { error: showError } = useToast()

  const [conversations, setConversations] = useState([])
  const [selectedConversation, setSelectedConversation] = useState(null)
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [richMessage, setRichMessage] = useState('')
  const [pendingAttachments, setPendingAttachments] = useState([])
  const [uploadingAttachment, setUploadingAttachment] = useState(false)
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [typingUsers, setTypingUsers] = useState({})
  const [attachmentPreviews, setAttachmentPreviews] = useState({})

  const messagesEndRef = useRef(null)
  const subscriptionRef = useRef(null)
  const typingSubscriptionRef = useRef(null)
  const typingStateRef = useRef({ timeoutId: null, isTyping: false })
  const attachmentPreviewsRef = useRef({})
  const fileInputRef = useRef(null)

  useEffect(() => {
    attachmentPreviewsRef.current = attachmentPreviews
  }, [attachmentPreviews])

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
      if (typingSubscriptionRef.current) {
        typingSubscriptionRef.current.unsubscribe()
        typingSubscriptionRef.current = null
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
        appendMessage(message)
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
    if (typingSubscriptionRef.current) {
      typingSubscriptionRef.current.unsubscribe()
      typingSubscriptionRef.current = null
    }

    if (!selectedConversation) {
      return undefined
    }

    subscribeToTyping(selectedConversation.id, payload => {
      if (!payload || payload.userId === profile?.id) return
      setTypingUsers(prev => {
        const next = { ...prev }
        if (!payload.typing) {
          delete next[payload.userId]
        } else {
          next[payload.userId] = {
            name: payload.userName || 'Teammate',
            expiresAt: Date.now() + 4000
          }
        }
        return next
      })
    }).then(subscription => {
      typingSubscriptionRef.current = subscription
    }).catch(err => {
      console.error('Failed to subscribe to typing channel', err)
    })

    return () => {
      if (typingSubscriptionRef.current) {
        typingSubscriptionRef.current.unsubscribe()
        typingSubscriptionRef.current = null
      }
    }
  }, [selectedConversation, profile?.id])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    const interval = setInterval(() => {
      setTypingUsers(prev => {
        const now = Date.now()
        const filteredEntries = Object.entries(prev).filter(([, value]) => value.expiresAt > now)
        if (filteredEntries.length === Object.keys(prev).length) {
          return prev
        }
        return filteredEntries.reduce((acc, [key, value]) => {
          acc[key] = value
          return acc
        }, {})
      })
    }, 2000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    setRichMessage('')
    setNewMessage('')
    setPendingAttachments([])
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }, [selectedConversation?.id])

  useEffect(() => {
    return () => {
      if (typingStateRef.current.timeoutId) {
        clearTimeout(typingStateRef.current.timeoutId)
      }
      if (typingStateRef.current.isTyping && selectedConversation && token) {
        api.conversations.typing(selectedConversation.id, token, false).catch(() => {})
      }
      Object.values(attachmentPreviewsRef.current).forEach(url => URL.revokeObjectURL(url))
    }
  }, [selectedConversation?.id, token])

  useEffect(() => {
    if (!selectedConversation || !token) return
    const pendingPreviews = []
    messages.forEach(message => {
      message.attachments?.forEach(attachment => {
        const eligible = attachment.contentType?.startsWith('image/')
        const belowLimit = !attachment.sizeBytes || attachment.sizeBytes <= 5 * 1024 * 1024
        if (eligible && belowLimit && !attachmentPreviewsRef.current[attachment.id]) {
          pendingPreviews.push(attachment)
        }
      })
    })
    pendingPreviews.forEach(loadAttachmentPreview)
  }, [messages, selectedConversation?.id, token])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  const appendMessage = (message) => {
    setMessages(prev => {
      const exists = prev.find(m => m.id === message.id)
      if (exists) {
        return prev.map(m => (m.id === message.id ? message : m))
      }
      return [...prev, message]
    })
    scrollToBottom()
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

  const handleComposerChange = (html, text) => {
    setRichMessage(html)
    setNewMessage(text)
    triggerTypingSignal()
  }

  const triggerTypingSignal = () => {
    if (!selectedConversation || !token) return
    if (!typingStateRef.current.isTyping) {
      api.conversations.typing(selectedConversation.id, token, true).catch(() => {})
      typingStateRef.current.isTyping = true
    }
    if (typingStateRef.current.timeoutId) {
      clearTimeout(typingStateRef.current.timeoutId)
    }
    typingStateRef.current.timeoutId = setTimeout(() => {
      api.conversations.typing(selectedConversation.id, token, false).catch(() => {})
      typingStateRef.current.isTyping = false
    }, 2500)
  }

  const sanitizeOutboundRichText = () => {
    const cleaned = sanitizeRichHtml(richMessage)
    if (!cleaned || cleaned === '<br>') {
      return ''
    }
    return cleaned
  }

  const handleSendMessage = async () => {
    if (!selectedConversation || sending || uploadingAttachment) return
    const trimmed = (newMessage || '').trim()
    const richPayload = sanitizeOutboundRichText()
    const hasAttachments = pendingAttachments.length > 0
    if (!trimmed && !richPayload && !hasAttachments) {
      return
    }

    setSending(true)
    try {
      const payload = {
        content: trimmed,
        richContent: richPayload,
        contentType: richPayload && richPayload !== trimmed ? 'RICH_TEXT' : 'TEXT',
        attachmentIds: pendingAttachments.map(att => att.id)
      }
      const message = await api.messages.send(selectedConversation.id, token, payload)
      appendMessage(message)
      setNewMessage('')
      setRichMessage('')
      setPendingAttachments([])
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      api.conversations.typing(selectedConversation.id, token, false).catch(() => {})
      typingStateRef.current.isTyping = false
    } catch (err) {
      showError(err.message || 'Failed to send message')
    } finally {
      setSending(false)
    }
  }

  const handleAttachmentSelect = async (event) => {
    const files = Array.from(event.target.files || [])
    if (!files.length || !selectedConversation) return
    setUploadingAttachment(true)
    try {
      for (const file of files) {
        const uploaded = await api.messages.uploadAttachment(selectedConversation.id, token, file)
        setPendingAttachments(prev => [...prev, uploaded])
      }
    } catch (err) {
      showError(err.message || 'Failed to upload attachment')
    } finally {
      setUploadingAttachment(false)
      if (event.target) {
        event.target.value = ''
      }
    }
  }

  const removePendingAttachment = (attachmentId) => {
    setPendingAttachments(prev => prev.filter(att => att.id !== attachmentId))
  }

  const loadAttachmentPreview = async (attachment) => {
    if (!selectedConversation || !token) return
    try {
      const { blob } = await api.messages.downloadAttachment(
        attachment.conversationId || selectedConversation.id,
        attachment.id,
        token
      )
      const objectUrl = URL.createObjectURL(blob)
      setAttachmentPreviews(prev => ({ ...prev, [attachment.id]: objectUrl }))
    } catch (err) {
      console.error('Failed to load attachment preview', err)
    }
  }

  const handleAttachmentDownload = async (attachment) => {
    if (!selectedConversation || !token) return
    try {
      const { blob, filename } = await api.messages.downloadAttachment(
        attachment.conversationId || selectedConversation.id,
        attachment.id,
        token
      )
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = filename || attachment.originalFilename || 'attachment'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    } catch (err) {
      showError(err.message || 'Failed to download attachment')
    }
  }

  const renderMessageContent = (message) => {
    const sanitized = message.richContent ? sanitizeRichHtml(message.richContent) : null
    if (sanitized) {
      return (
        <div
          className="text-sm text-white/90 leading-relaxed space-y-2 break-words"
          dangerouslySetInnerHTML={{ __html: sanitized }}
        />
      )
    }
    return (
      <p className="text-sm text-white/90 whitespace-pre-line break-words">
        {message.content}
      </p>
    )
  }

  const typingList = Object.values(typingUsers)
  const typingMessage =
    typingList.length === 1
      ? `${typingList[0].name.split(' ')[0]} is typing...`
      : typingList.length > 1
        ? `${typingList[0].name.split(' ')[0]} and ${typingList.length - 1} others are typing...`
        : ''

  const sanitizedDraftRich = sanitizeRichHtml(richMessage)
  const canSubmit = Boolean((newMessage || '').trim() || sanitizedDraftRich || pendingAttachments.length > 0)
  const composerDisabled = sending || uploadingAttachment

  if (loading) {
    return (
      <div className="card">
        <div className="loading-skeleton h-8 w-56 mb-6" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
          <div className="loading-skeleton h-full rounded-2xl" />
          <div className="lg:col-span-2 loading-skeleton h-full rounded-2xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="card flex flex-col">
      <h2 className="text-2xl font-bold text-white mb-6">Project Messages</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[620px]">
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
                {conv.lastMessage && (
                  <p className="text-[11px] text-white/40 mt-1 truncate">
                    {conv.lastMessage?.sender?.fullName
                      ? `${conv.lastMessage.sender.fullName.split(' ')[0]}: ${conv.lastMessage.content?.slice(0, 40) || 'Attachment'}`
                      : 'No activity yet'}
                  </p>
                )}
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
              
              <div className="flex-1 overflow-y-auto pr-2 space-y-4 mb-4">
                {messages.length === 0 ? (
                  <div className="flex h-full items-center justify-center text-white/40 text-sm">
                    No messages yet. Break the silence!
                  </div>
                ) : (
                  messages.map(message => {
                    const isOwn = message.sender?.id === profile?.id
                    return (
                      <div
                        key={message.id}
                        className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-2xl px-4 py-3 border overflow-hidden shadow-lg transition-all ${
                            isOwn
                              ? 'bg-gradient-to-br from-violet-600/40 to-purple-500/30 text-white border-violet-500/30'
                              : 'bg-white/10 text-white/90 border-white/10'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-3 mb-2">
                            <div>
                              {!isOwn && (
                                <p className="text-xs font-semibold text-white">
                                  {message.sender?.fullName || 'Unknown'}
                                </p>
                              )}
                              <p className="text-[11px] text-white/60">
                                {new Date(message.createdAt).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                                {message.isEdited && ' · edited'}
                              </p>
                            </div>
                          </div>

                          {renderMessageContent(message)}

                          {message.attachments && message.attachments.length > 0 && (
                            <div className="mt-3 space-y-2">
                              {message.attachments.map(attachment => {
                                const isImage = attachment.contentType?.startsWith('image/')
                                const previewUrl = attachmentPreviews[attachment.id]
                                return (
                                  <div
                                    key={attachment.id}
                                    className="rounded-2xl border border-white/15 bg-black/20 px-3 py-2"
                                  >
                                    <div className="flex items-center justify-between gap-3">
                                      <div className="text-sm">
                                        <p className="font-semibold text-white/90">
                                          {attachment.originalFilename || 'Attachment'}
                                        </p>
                                        <p className="text-xs text-white/50">
                                          {(attachment.contentType || 'file')} · {formatBytes(attachment.sizeBytes)}
                                        </p>
                                      </div>
                                      <button
                                        type="button"
                                        onClick={() => handleAttachmentDownload(attachment)}
                                        className="text-xs text-violet-200 hover:text-white font-semibold"
                                      >
                                        Download
                                      </button>
                                    </div>
                                    {isImage && previewUrl && (
                                      <img
                                        src={previewUrl}
                                        alt={attachment.originalFilename || 'Attachment'}
                                        className="mt-3 rounded-xl border border-white/10 max-h-48 object-cover w-full"
                                      />
                                    )}
                                  </div>
                                )
                              })}
                            </div>
                          )}
                        </div>
                      </div>
                    )
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              <div className="border-t border-white/10 pt-4 space-y-3">
                {pendingAttachments.length > 0 && (
                  <div className="flex flex-wrap gap-3">
                    {pendingAttachments.map(attachment => (
                      <div
                        key={attachment.id}
                        className="flex items-center gap-3 bg-white/10 border border-white/15 rounded-2xl px-3 py-2 text-sm text-white"
                      >
                        <div>
                          <p className="font-semibold">{attachment.originalFilename}</p>
                          <p className="text-xs text-white/60">{formatBytes(attachment.sizeBytes)}</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => removePendingAttachment(attachment.id)}
                          className="text-white/60 hover:text-white"
                          aria-label="Remove attachment"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <RichTextComposer
                  value={richMessage}
                  onChange={handleComposerChange}
                  disabled={composerDisabled}
                  placeholder="Share updates, plans, blockers..."
                />

                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex items-center gap-4 text-sm text-white/60">
                    <button
                      type="button"
                      className="btn btn-ghost text-sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={composerDisabled}
                    >
                      <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828L18 9.828M5 13l4 4" />
                      </svg>
                      Attach
                    </button>
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      multiple
                      onChange={handleAttachmentSelect}
                    />
                    {uploadingAttachment && <span className="text-xs text-white/70">Uploading...</span>}
                    {typingMessage && (
                      <span className="text-xs text-violet-200 animate-pulse">{typingMessage}</span>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={handleSendMessage}
                    disabled={!canSubmit || composerDisabled}
                    className="btn btn-primary w-full sm:w-auto"
                  >
                    {sending ? 'Sending…' : 'Send'}
                  </button>
                </div>
              </div>
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

