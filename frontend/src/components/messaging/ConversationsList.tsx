import { Search, Archive, Trash2, Star } from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';

export interface Conversation {
  id: string;
  participant: {
    id: number;
    name: string;
    avatar?: string;
    role?: string;
  };
  lastMessage?: {
    content: string;
    timestamp: string;
    isRead: boolean;
  };
  unreadCount: number;
  projectName?: string;
  isPinned?: boolean;
  status?: 'online' | 'offline' | 'away';
}

interface ConversationsListProps {
  conversations: Conversation[];
  selectedConversationId?: string;
  onSelectConversation: (id: string) => void;
  onDeleteConversation?: (id: string) => void;
}

export function ConversationsList({
  conversations,
  selectedConversationId,
  onSelectConversation,
  onDeleteConversation,
}: ConversationsListProps) {
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      const mins = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      return `${mins}m`;
    } else if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    } else if (diffInHours < 48) {
      return 'Yesterday';
    } else if (diffInHours < 168) {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  return (
    <div className="flex flex-col h-full bg-card rounded-xl border border-border overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border">
        <h2 className="text-xl font-bold mb-4">Messages</h2>
        
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search conversations..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary text-sm"
          />
        </div>
      </div>

      {/* Conversations */}
      <div className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="font-semibold mb-2">No conversations yet</h3>
            <p className="text-sm text-muted-foreground">
              Start a conversation to connect with clients or freelancers
            </p>
          </div>
        ) : (
          conversations.map((conversation) => (
            <button
              key={conversation.id}
              onClick={() => onSelectConversation(conversation.id)}
              className={`group w-full flex items-start gap-3 p-4 border-b border-border hover:bg-muted/50 transition-colors ${
                selectedConversationId === conversation.id ? 'bg-muted' : ''
              }`}
            >
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                {conversation.participant.avatar ? (
                  <img
                    src={conversation.participant.avatar}
                    alt={conversation.participant.name}
                    className="w-12 h-12 rounded-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                ) : null}
                <div className={`w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center ${conversation.participant.avatar ? 'hidden' : ''}`}>
                  <span className="text-white font-semibold">
                    {conversation.participant.name.charAt(0)}
                  </span>
                </div>
                {conversation.status && (
                  <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-background ${
                    conversation.status === 'online' ? 'bg-success' : 
                    conversation.status === 'away' ? 'bg-yellow-500' : 'bg-muted-foreground'
                  }`} />
                )}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0 text-left">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2 min-w-0 flex-1">
                    <span className={`font-semibold truncate ${
                      conversation.lastMessage && !conversation.lastMessage.isRead ? 'text-foreground' : 'text-muted-foreground'
                    }`}>
                      {conversation.participant.name}
                    </span>
                    {conversation.isPinned && (
                      <Star className="h-3 w-3 fill-yellow-400 text-yellow-400 flex-shrink-0" />
                    )}
                    {conversation.unreadCount > 0 && (
                      <span className="flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full bg-primary text-primary-foreground text-xs font-bold flex-shrink-0">
                        {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0">
                    {conversation.lastMessage && (
                      <span className="text-xs text-muted-foreground">
                        {formatTime(conversation.lastMessage.timestamp)}
                      </span>
                    )}
                    {onDeleteConversation && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 w-6 p-0 hover:bg-destructive/10 hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm('Delete this conversation? All messages will be permanently removed.')) {
                            onDeleteConversation(conversation.id);
                          }
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </div>

                {conversation.projectName && (
                  <p className="text-xs text-primary mb-1 truncate">
                    {conversation.projectName}
                  </p>
                )}

                <div className="flex items-center justify-between gap-2">
                  <p className={`text-sm truncate ${
                    conversation.lastMessage && !conversation.lastMessage.isRead ? 'font-medium text-foreground' : 'text-muted-foreground'
                  }`}>
                    {conversation.lastMessage?.content || 'No messages yet'}
                  </p>
                  {conversation.unreadCount > 0 && (
                    <Badge className="bg-primary text-white flex-shrink-0 min-w-[20px] h-5 flex items-center justify-center">
                      {conversation.unreadCount}
                    </Badge>
                  )}
                </div>
              </div>
            </button>
          ))
        )}
      </div>

      {/* Footer Actions */}
      <div className="p-4 border-t border-border bg-background">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{conversations.length} conversations</span>
          <div className="flex gap-2">
            <button className="p-2 hover:bg-muted rounded transition-colors">
              <Archive className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
