import { useState, useRef, useEffect } from 'react';
import { Send, Paperclip, Image, Smile, MoreVertical, Search, Phone, Video, Info } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

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
}

interface MessageThreadProps {
  recipientName: string;
  recipientAvatar?: string;
  recipientStatus?: 'online' | 'offline' | 'away';
  messages: Message[];
  onSendMessage: (message: string, attachments?: File[]) => void;
  currentUserId: string;
  projectName?: string;
  disabled?: boolean;
}

export function MessageThread({
  recipientName,
  recipientAvatar,
  recipientStatus = 'offline',
  messages,
  onSendMessage,
  currentUserId,
  projectName,
  disabled = false,
}: MessageThreadProps) {
  const [messageInput, setMessageInput] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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
          <Button variant="ghost" size="icon">
            <Search className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <Phone className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <Video className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon">
            <Info className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => {
          const isCurrentUser = message.senderId === currentUserId;
          const showAvatar = index === 0 || messages[index - 1].senderId !== message.senderId;

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

                <div className={`rounded-2xl px-4 py-2 ${
                  isCurrentUser
                    ? 'bg-gradient-to-r from-primary to-secondary text-white'
                    : 'bg-muted'
                }`}>
                  <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
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
        })}
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
        <div className="flex items-end gap-2">
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
            <Button variant="ghost" size="icon">
              <Image className="h-5 w-5" />
            </Button>
          </div>

          <div className="flex-1 relative">
            <textarea
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Type a message..."
              rows={1}
              className="w-full px-4 py-3 pr-12 rounded-lg border border-border bg-background resize-none focus:outline-none focus:ring-2 focus:ring-primary"
              style={{ minHeight: '48px', maxHeight: '120px' }}
            />
            <button
              className="absolute right-3 top-1/2 -translate-y-1/2"
            >
              <Smile className="h-5 w-5 text-muted-foreground hover:text-foreground transition-colors" />
            </button>
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
    </div>
  );
}
