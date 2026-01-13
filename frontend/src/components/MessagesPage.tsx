import { useState, useEffect } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { ConversationsList, Conversation } from './messaging/ConversationsList';
import { MessageThread, Message } from './messaging/MessageThread';
import { MessageSquare } from 'lucide-react';
import { connectWebSocket, WebSocketMessage } from '../lib/websocket';
import { conversationsApi, messagesApi } from '@/lib/api';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

export function MessagesPage() {
  const { user } = useAuth();
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Record<string, Message[]>>({});
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);

  useEffect(() => {
    fetchConversations();
  }, []);

  useEffect(() => {
    if (selectedConversationId) {
      fetchMessages(selectedConversationId);
      
      // Connect to WebSocket for real-time messages
      const cleanup = connectWebSocket(selectedConversationId, (wsMessage: any) => {
        // Handle new/edited/deleted messages
        setMessages(prev => {
          const conversationMessages = prev[selectedConversationId] || [];
          
          // Check if message already exists
          const existingIndex = conversationMessages.findIndex(m => Number(m.id) === Number(wsMessage.id));
          
          // Transform WebSocket message to UI format
          const transformedMessage: Message = {
            id: wsMessage.id,
            senderId: wsMessage.sender?.id.toString() || 'unknown',
            senderName: wsMessage.sender?.fullName || 'Unknown',
            senderAvatar: wsMessage.profilePictureUrl,
            content: wsMessage.content,
            timestamp: wsMessage.createdAt,
            isRead: true,
            isEdited: wsMessage.isEdited || false,
            isDeleted: wsMessage.isDeleted || false,
          };

          if (existingIndex >= 0) {
            // Update existing message (edit or delete)
            console.log('Updating message from WebSocket:', wsMessage.id);
            const updatedMessages = [...conversationMessages];
            updatedMessages[existingIndex] = transformedMessage;
            return {
              ...prev,
              [selectedConversationId]: updatedMessages,
            };
          } else {
            // Add new message
            console.log('Adding message from WebSocket:', wsMessage.id);
            return {
              ...prev,
              [selectedConversationId]: [...conversationMessages, transformedMessage],
            };
          }
        });

        // Update conversation last message
        if (wsMessage.content && !wsMessage.isDeleted) {
          setConversations(prev =>
            prev.map(conv =>
              conv.id === selectedConversationId
                ? {
                    ...conv,
                    lastMessage: {
                      content: wsMessage.content,
                      timestamp: wsMessage.createdAt,
                      isRead: true,
                    },
                  }
                : conv
            )
          );
        }
      });
      
      return cleanup;
    }
  }, [selectedConversationId]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      const data = await conversationsApi.list();
      
      // Transform API data to match Conversation interface
      const transformedConversations: Conversation[] = data.map((conv: any) => {
        const otherParticipant = conv.participants?.find((p: any) => p.id !== user?.id);
        
        return {
          id: conv.id.toString(),
          participant: {
            id: otherParticipant?.id,
            name: otherParticipant?.fullName || 'Unknown User',
            avatar: otherParticipant?.profilePictureUrl,
            role: otherParticipant?.userType || 'USER',
          },
          lastMessage: conv.lastMessage ? {
            content: conv.lastMessage.content,
            timestamp: conv.lastMessage.createdAt,
            isRead: conv.lastMessage.isRead,
          } : undefined,
          unreadCount: conv.unreadCount || 0,
          projectName: conv.project?.title,
          isPinned: conv.isPinned || false,
          status: 'offline', // Can be enhanced with real-time presence
        };
      });

      console.log('Fetched conversations:', transformedConversations.length);
      console.log('Sample conversation participant:', transformedConversations[0]?.participant);
      setConversations(transformedConversations);
      
      // Auto-select first conversation if available
      if (transformedConversations.length > 0 && !selectedConversationId) {
        console.log('Auto-selecting first conversation:', transformedConversations[0].id);
        setSelectedConversationId(transformedConversations[0].id);
      } else {
        console.log('Not auto-selecting. Already selected:', selectedConversationId);
      }
    } catch (error: any) {
      console.error('Error fetching conversations:', error);
      toast.error('Failed to load conversations');
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      console.log('Fetching messages for conversation:', conversationId);
      const data = await messagesApi.list(parseInt(conversationId));
      console.log('Raw messages data:', data);
      
      // Handle both paginated response (data.content) and direct array
      const messagesArray = Array.isArray(data) ? data : (data.content || []);
      console.log('Messages array length:', messagesArray.length);
      
      // Transform API data to match Message interface
      const transformedMessages: Message[] = messagesArray.map((msg: any) => {
        console.log('Raw message:', msg);
        console.log('Profile picture URL:', msg.profilePictureUrl);
        return {
          id: msg.id,
          senderId: msg.sender?.id.toString() || 'unknown',
          senderName: msg.sender?.fullName || 'Unknown',
          senderAvatar: msg.profilePictureUrl, // Profile picture URL is directly on message object
          content: msg.content || msg.richContent || '',
          timestamp: msg.createdAt,
          isRead: true, // Can be enhanced with read receipts
          isEdited: msg.isEdited || false,
          isDeleted: msg.isDeleted || false,
          attachments: msg.attachments?.map((att: any) => ({
            type: att.contentType?.startsWith('image/') ? 'image' : 'file',
            url: att.fileUrl,
            name: att.fileName,
            size: undefined,
          })),
        };
      });

      console.log('Transformed messages:', transformedMessages.length);
      console.log('First transformed message:', transformedMessages[0]);

      setMessages(prev => ({
        ...prev,
        [conversationId]: transformedMessages,
      }));
    } catch (error: any) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to load messages');
    }
  };

  const handleDeleteConversation = async (conversationId: string) => {
    try {
      await conversationsApi.delete(Number(conversationId));
      toast.success('Conversation deleted');
      
      // Remove from local state
      setConversations(prev => prev.filter(c => c.id !== conversationId));
      
      // If currently viewing this conversation, clear selection
      if (selectedConversationId === conversationId) {
        setSelectedConversationId(null);
        setMessages(prev => {
          const updated = { ...prev };
          delete updated[conversationId];
          return updated;
        });
      }
    } catch (error: any) {
      console.error('Error deleting conversation:', error);
      toast.error('Failed to delete conversation');
    }
  };

  const handleSendMessage = async (content: string, attachments?: File[]) => {
    if (!selectedConversationId || !content.trim()) return;

    try {
      setSendingMessage(true);

      // Send message via API
      const newMessage = await messagesApi.send(parseInt(selectedConversationId), {
        content: content.trim(),
        // Attachments can be handled separately if needed
      });

      // Transform and add to local state immediately (optimistic update)
      const transformedMessage: Message = {
        id: newMessage.id,
        senderId: user?.id.toString() || 'user-1',
        senderName: user?.fullName || 'You',
        senderAvatar: (newMessage as any).profilePictureUrl, // Get from API response
        content: newMessage.content,
        timestamp: newMessage.createdAt,
        isRead: true,
        attachments: attachments?.map(file => ({
          type: file.type.startsWith('image/') ? 'image' : 'file',
          url: URL.createObjectURL(file),
          name: file.name,
          size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
        })),
      };

      console.log('Adding sent message optimistically:', newMessage.id);

      // Add message to state with duplicate check
      setMessages(prev => {
        const conversationMessages = prev[selectedConversationId] || [];
        
        // Check if message already exists (in case WebSocket was faster)
        const exists = conversationMessages.some(m => Number(m.id) === Number(newMessage.id));
        if (exists) {
          console.log('Message already exists from WebSocket, skipping optimistic update:', newMessage.id);
          return prev;
        }

        return {
          ...prev,
          [selectedConversationId]: [...conversationMessages, transformedMessage],
        };
      });

      // Update conversation last message
      setConversations(prev =>
        prev.map(conv =>
          conv.id === selectedConversationId
            ? {
                ...conv,
                lastMessage: {
                  content,
                  timestamp: newMessage.createdAt,
                  isRead: true,
                },
              }
            : conv
        )
      );

      toast.success('Message sent');
    } catch (error: any) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    } finally {
      setSendingMessage(false);
    }
  };

  const handleEditMessage = async (messageId: number, newContent: string) => {
    if (!selectedConversationId) return;

    try {
      await messagesApi.edit(parseInt(selectedConversationId), messageId, newContent);
      
      // Update local state
      setMessages(prev => ({
        ...prev,
        [selectedConversationId]: prev[selectedConversationId].map(msg =>
          msg.id === messageId
            ? { ...msg, content: newContent, isEdited: true }
            : msg
        ),
      }));

      toast.success('Message edited');
    } catch (error: any) {
      console.error('Error editing message:', error);
      toast.error('Failed to edit message');
    }
  };

  const handleDeleteMessage = async (messageId: number) => {
    if (!selectedConversationId) return;

    try {
      await messagesApi.delete(parseInt(selectedConversationId), messageId);
      
      // Remove from local state
      setMessages(prev => ({
        ...prev,
        [selectedConversationId]: prev[selectedConversationId].filter(msg => msg.id !== messageId),
      }));

      toast.success('Message deleted');
    } catch (error: any) {
      console.error('Error deleting message:', error);
      toast.error('Failed to delete message');
    }
  };

  const selectedConversation = conversations.find(c => c.id === selectedConversationId);
  const currentMessages = selectedConversationId ? messages[selectedConversationId] || [] : [];

  return (
    <div className="min-h-screen bg-background">
      <Header />

      <main className="w-full px-4 md:px-8 lg:px-12 pt-24 pb-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-bold mb-2">Messages</h1>
          <p className="text-muted-foreground">
            Connect with clients and freelancers
          </p>
        </div>

        {/* Messages Layout */}
        {loading ? (
          <div className="flex items-center justify-center h-[calc(100vh-280px)] min-h-[600px]">
            <p className="text-gray-500">Loading conversations...</p>
          </div>
        ) : conversations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-[calc(100vh-280px)] min-h-[600px] bg-card rounded-xl border border-border">
            <MessageSquare className="h-16 w-16 text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold mb-2">No conversations yet</h3>
            <p className="text-muted-foreground text-center max-w-md">
              Start a conversation by applying to jobs or inviting freelancers to your projects
            </p>
          </div>
        ) : (
          <div className="grid lg:grid-cols-[380px_1fr] gap-6 h-[calc(100vh-280px)] min-h-[600px]">
            {/* Conversations List */}
            <div className="hidden lg:block">
              <ConversationsList
                conversations={conversations}
                selectedConversationId={selectedConversationId || ''}
                onSelectConversation={setSelectedConversationId}
                onDeleteConversation={handleDeleteConversation}
              />
            </div>

            {/* Message Thread */}
            {selectedConversation ? (
              <MessageThread
                recipientId={selectedConversation.participant.id}
                recipientName={selectedConversation.participant.name}
                recipientAvatar={selectedConversation.participant.avatar}
                recipientRole={selectedConversation.participant.role}
                recipientStatus={selectedConversation.status}
                messages={currentMessages}
                onSendMessage={handleSendMessage}
                onEditMessage={handleEditMessage}
                onDeleteMessage={handleDeleteMessage}
                currentUserId={user?.id.toString() || 'user-1'}
                projectName={selectedConversation.projectName}
                disabled={sendingMessage}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full bg-card rounded-xl border border-border">
                <MessageSquare className="h-16 w-16 text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">Select a conversation</h3>
                <p className="text-muted-foreground text-center max-w-md">
                  Choose a conversation from the list to start messaging
                </p>
              </div>
            )}

            {/* Mobile: Show conversation list */}
            <div className="lg:hidden">
              <ConversationsList
                conversations={conversations}
                selectedConversationId={selectedConversationId || ''}
                onSelectConversation={setSelectedConversationId}
                onDeleteConversation={handleDeleteConversation}
              />
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
