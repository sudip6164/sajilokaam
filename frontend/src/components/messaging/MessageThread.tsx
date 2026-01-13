import { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Image, Smile, MoreVertical, Search, Info, X, Edit2, Trash2, Check } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Input } from '../ui/input';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import EmojiPicker, { EmojiClickData } from 'emoji-picker-react';
import { useRouter } from '../Router';

export interface Message {
  id: number;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  timestamp: string;
  attachments?: Array<{
    type: 'image' | 'file';
    url: string;
    name: string;
    size?: string;
  }>;
  isRead: boolean;
  isEdited?: boolean;
  isDeleted?: boolean;
}

interface MessageThreadProps {
  recipientId: number;
  recipientName: string;
  recipientAvatar?: string;
  recipientRole?: string;
  recipientStatus?: 'online' | 'offline' | 'away';
  messages: Message[];
  onSendMessage: (message: string, attachments?: File[]) => void;
  currentUserId: string;
  projectName?: string;
  disabled?: boolean;
  isTyping?: boolean;
  onTyping?: () => void;
  onEditMessage?: (messageId: number, newContent: string) => void;
  onDeleteMessage?: (messageId: number) => void;
}

export function MessageThread({
  recipientId,
  recipientName,
  recipientAvatar,
  recipientRole,
  recipientStatus = 'offline',
  messages,
  onSendMessage,
  currentUserId,
  projectName,
  disabled = false,
  isTyping = false,
  onTyping,
  onEditMessage,
  onDeleteMessage,
}: MessageThreadProps) {
  const { navigate } = useRouter();
  const [messageInput, setMessageInput] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [editingMessageId, setEditingMessageId] = useState<number | null>(null);
  const [editContent, setEditContent] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target as Node)) {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSend = () => {
    if (messageInput.trim() || attachments.length > 0) {
      onSendMessage(messageInput, attachments);
      setMessageInput('');
      setAttachments([]);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments([...attachments, ...Array.from(e.target.files)]);
    }
  };

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    setMessageInput(prev => prev + emojiData.emoji);
    setShowEmojiPicker(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessageInput(e.target.value);
    
    // Trigger typing indicator
    if (onTyping) {
      onTyping();
      
      // Clear existing timeout
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
      
      // Set new timeout to stop typing indicator after 2 seconds of inactivity
      typingTimeoutRef.current = setTimeout(() => {
        // In a real implementation, you would send a "stopped typing" event here
      }, 2000);
    }
  };

  const handleEditStart = (message: Message) => {
    setEditingMessageId(message.id);
    setEditContent(message.content);
  };

  const handleEditSave = () => {
    if (editingMessageId && onEditMessage && editContent.trim()) {
      onEditMessage(editingMessageId, editContent.trim());
      setEditingMessageId(null);
      setEditContent('');
    }
  };

  const handleEditCancel = () => {
    setEditingMessageId(null);
    setEditContent('');
  };

  const handleDelete = (messageId: number) => {
    if (onDeleteMessage && confirm('Are you sure you want to delete this message?')) {
      onDeleteMessage(messageId);
    }
  };

  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  // Filter messages based on search query
  const filteredMessages = searchQuery.trim()
    ? messages.filter(msg => 
        msg.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        msg.senderName.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : messages;

  return (
    <div className="flex flex-col h-full bg-card rounded-xl border border-border overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-background">
        <div className="flex items-center gap-3">
          <div className="relative">
            {recipientAvatar ? (
              <img
                src={recipientAvatar}
                alt={recipientName}
                className="w-10 h-10 rounded-full object-cover"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  e.currentTarget.nextElementSibling?.classList.remove('hidden');
                }}
              />
            ) : null}
            <div className={`w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center ${recipientAvatar ? 'hidden' : ''}`}>
              <span className="text-white font-semibold">
                {recipientName.charAt(0)}
              </span>
            </div>
            <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-background ${
              recipientStatus === 'online' ? 'bg-success' : 
              recipientStatus === 'away' ? 'bg-yellow-500' : 'bg-muted-foreground'
            }`} />
          </div>
          <div>
            <h3 className="font-semibold">{recipientName}</h3>
            {projectName && (
              <p className="text-xs text-muted-foreground">Project: {projectName}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => setShowSearch(!showSearch)}
          >
            <Search className="h-5 w-5" />
          </Button>
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => {
              // Navigate to recipient's profile based on their role
              const isFreelancer = recipientRole?.includes('FREELANCER');
              if (isFreelancer) {
                navigate('view-freelancer', { freelancerId: recipientId.toString() });
              } else {
                navigate('view-client', { clientId: recipientId.toString() });
              }
            }}
          >
            <Info className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Search Bar */}
      {showSearch && (
        <div className="px-4 py-2 border-b border-border bg-muted/30">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
              autoFocus
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSearchQuery('')}
              >
                <X className="h-4 w-4" />
              </Button>
            )}
            {filteredMessages.length !== messages.length && (
              <span className="text-xs text-muted-foreground whitespace-nowrap">
                {filteredMessages.length} of {messages.length}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {filteredMessages.length === 0 && searchQuery ? (
          <div className="flex flex-col items-center justify-center h-full text-center">
            <Search className="h-12 w-12 text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No messages found matching "{searchQuery}"</p>
          </div>
        ) : (
          filteredMessages.map((message, index) => {
            const isCurrentUser = message.senderId === currentUserId;
            const showAvatar = index === 0 || filteredMessages[index - 1].senderId !== message.senderId;
            
            // Highlight search matches
            const highlightText = (text: string) => {
              if (!searchQuery.trim()) return text;
              const parts = text.split(new RegExp(`(${searchQuery})`, 'gi'));
              return parts.map((part, i) => 
                part.toLowerCase() === searchQuery.toLowerCase() 
                  ? `<mark key=${i} class="bg-yellow-300 text-black">${part}</mark>`
                  : part
              ).join('');
            };

          return (
            <div
              key={message.id}
              className={`flex gap-3 ${isCurrentUser ? 'flex-row-reverse' : 'flex-row'}`}
            >
              {/* Avatar */}
              {showAvatar ? (
                message.senderAvatar ? (
                  <img
                    src={message.senderAvatar}
                    alt={message.senderName}
                    className="w-8 h-8 rounded-full object-cover flex-shrink-0"
                    onError={(e) => {
                      // Fallback to initials if image fails to load
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                ) : null
              ) : (
                <div className="w-8" />
              )}
              {showAvatar && (
                <div className={`w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0 ${message.senderAvatar ? 'hidden' : ''}`}>
                  <span className="text-white text-sm font-semibold">
                    {message.senderName.charAt(0)}
                  </span>
                </div>
              )}

              {/* Message Content */}
              <div className={`flex flex-col max-w-[70%] ${isCurrentUser ? 'items-end' : 'items-start'}`}>
                {showAvatar && (
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs font-medium">{message.senderName}</span>
                    <span className="text-xs text-muted-foreground">{formatTime(message.timestamp)}</span>
                  </div>
                )}

                <div className="relative group">
                  {editingMessageId === message.id ? (
                    <div className="flex items-center gap-2 bg-muted rounded-2xl p-2">
                      <Input
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="flex-1"
                        autoFocus
                      />
                      <Button size="sm" onClick={handleEditSave}>
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button size="sm" variant="ghost" onClick={handleEditCancel}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div 
                        className={`rounded-2xl px-4 py-2 ${
                          isCurrentUser
                            ? 'bg-gradient-to-r from-primary to-secondary text-white'
                            : 'bg-muted'
                        }`}
                        title={new Date(message.timestamp).toLocaleString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit'
                        })}
                      >
                        {message.isDeleted ? (
                          <p className="text-sm italic opacity-60">
                            This message was deleted
                          </p>
                        ) : searchQuery ? (
                          <p 
                            className="text-sm whitespace-pre-wrap break-words"
                            dangerouslySetInnerHTML={{ __html: highlightText(message.content) }}
                          />
                        ) : (
                          <p className="text-sm whitespace-pre-wrap break-words">
                            {message.content}
                          </p>
                        )}
                        {message.isEdited && !message.isDeleted && (
                          <span className="text-xs opacity-70 italic"> (edited)</span>
                        )}
                      </div>
                      
                      {isCurrentUser && !message.isDeleted && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="absolute -right-8 top-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditStart(message)}>
                              <Edit2 className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleDelete(message.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </>
                  )}
                </div>

                {/* Attachments */}
                {message.attachments && message.attachments.length > 0 && (
                  <div className="mt-2 space-y-2">
                    {message.attachments.map((attachment, idx) => (
                      <div
                        key={idx}
                        className={`rounded-lg overflow-hidden border ${
                          isCurrentUser ? 'border-primary/20' : 'border-border'
                        }`}
                      >
                        {attachment.type === 'image' ? (
                          <img
                            src={attachment.url}
                            alt={attachment.name}
                            className="max-w-xs rounded-lg"
                          />
                        ) : (
                          <div className="flex items-center gap-3 p-3 bg-background">
                            <Paperclip className="h-4 w-4 text-muted-foreground" />
                            <div className="flex-1">
                              <p className="text-sm font-medium">{attachment.name}</p>
                              {attachment.size && (
                                <p className="text-xs text-muted-foreground">{attachment.size}</p>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t border-border bg-background p-4">
        {/* Attachment Preview */}
        {attachments.length > 0 && (
          <div className="mb-3 flex flex-wrap gap-2">
            {attachments.map((file, idx) => (
              <div
                key={idx}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-muted text-sm"
              >
                <Paperclip className="h-4 w-4" />
                <span>{file.name}</span>
                <button
                  onClick={() => setAttachments(attachments.filter((_, i) => i !== idx))}
                  className="ml-2 text-muted-foreground hover:text-destructive"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="flex items-center gap-2">
          <div className="flex gap-2">
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={handleFileSelect}
              className="hidden"
            />
            <Button
              variant="ghost"
              size="icon"
              onClick={() => fileInputRef.current?.click()}
            >
              <Paperclip className="h-5 w-5" />
            </Button>
            
            <Button 
              variant="ghost" 
              size="icon"
              onClick={(e) => {
                e.stopPropagation();
                setShowEmojiPicker(!showEmojiPicker);
              }}
            >
              <Smile className="h-5 w-5" />
            </Button>
          </div>

          <div className="flex-1 relative">
            <textarea
              value={messageInput}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              rows={1}
              className="w-full px-4 py-3 rounded-lg border border-border bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary"
              style={{ minHeight: '48px', maxHeight: '120px' }}
            />
            {isTyping && (
              <div className="absolute -top-6 left-2 text-xs text-muted-foreground italic">
                {recipientName} is typing...
              </div>
            )}
          </div>

          <Button
            onClick={handleSend}
            disabled={disabled || (!messageInput.trim() && attachments.length === 0)}
            className="h-12 px-6"
          >
            <Send className="h-5 w-5" />
          </Button>
        </div>
      </div>
      
      {/* Emoji Picker - render at root level to avoid z-index issues */}
      {showEmojiPicker && (
        <div 
          ref={emojiPickerRef}
          className="fixed bottom-24 left-6 shadow-2xl border border-border rounded-lg overflow-hidden bg-background"
          style={{ zIndex: 99999 }}
        >
          <EmojiPicker 
            onEmojiClick={handleEmojiClick}
            searchDisabled={true}
            width={350}
            height={400}
          />
        </div>
      )}
    </div>
  );
}
