import { useState } from 'react';
import { Header } from './Header';
import { Footer } from './Footer';
import { ConversationsList, Conversation } from './messaging/ConversationsList';
import { MessageThread, Message } from './messaging/MessageThread';
import { MessageSquare } from 'lucide-react';

const mockConversations: Conversation[] = [
  {
    id: '1',
    participant: { name: 'Sarah Johnson' },
    lastMessage: {
      content: 'Great! I can start working on the project next week.',
      timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 mins ago
      isRead: false,
    },
    unreadCount: 2,
    projectName: 'E-commerce Platform Development',
    isPinned: true,
    status: 'online',
  },
  {
    id: '2',
    participant: { name: 'Michael Chen' },
    lastMessage: {
      content: 'I\'ve sent you the updated designs. Please review and let me know.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
      isRead: true,
    },
    unreadCount: 0,
    projectName: 'Mobile App UI/UX Design',
    status: 'away',
  },
  {
    id: '3',
    participant: { name: 'Emily Rodriguez' },
    lastMessage: {
      content: 'Thank you for the opportunity! When can we schedule a call?',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), // 5 hours ago
      isRead: false,
    },
    unreadCount: 1,
    projectName: 'Content Writing for Tech Blog',
    status: 'offline',
  },
  {
    id: '4',
    participant: { name: 'David Kim' },
    lastMessage: {
      content: 'The milestone has been completed. Please review.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
      isRead: true,
    },
    unreadCount: 0,
    projectName: 'Python Data Analysis',
    status: 'offline',
  },
  {
    id: '5',
    participant: { name: 'Lisa Thompson' },
    lastMessage: {
      content: 'Hi! I saw your job posting and I\'m very interested.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
      isRead: true,
    },
    unreadCount: 0,
    status: 'online',
  },
];

const mockMessages: Record<string, Message[]> = {
  '1': [
    {
      id: 1,
      senderId: 'user-1',
      senderName: 'You',
      content: 'Hi Sarah! Thanks for applying to the project. I reviewed your portfolio and I\'m impressed with your work.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      isRead: true,
    },
    {
      id: 2,
      senderId: 'sarah',
      senderName: 'Sarah Johnson',
      content: 'Thank you! I\'m excited about this opportunity. I have experience building similar e-commerce platforms.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 23).toISOString(),
      isRead: true,
    },
    {
      id: 3,
      senderId: 'user-1',
      senderName: 'You',
      content: 'Perfect! Can you share some examples of your previous e-commerce work? Also, what\'s your availability?',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 22).toISOString(),
      isRead: true,
    },
    {
      id: 4,
      senderId: 'sarah',
      senderName: 'Sarah Johnson',
      content: 'Sure! Here are two recent projects I completed:',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 21).toISOString(),
      isRead: true,
    },
    {
      id: 5,
      senderId: 'sarah',
      senderName: 'Sarah Johnson',
      content: 'Both projects included payment gateway integration, inventory management, and admin dashboards.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 21).toISOString(),
      attachments: [
        {
          type: 'file',
          url: '#',
          name: 'Project-Portfolio.pdf',
          size: '2.4 MB',
        },
      ],
      isRead: true,
    },
    {
      id: 6,
      senderId: 'user-1',
      senderName: 'You',
      content: 'These look great! The tech stack aligns perfectly with what we need. When could you start?',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString(),
      isRead: true,
    },
    {
      id: 7,
      senderId: 'sarah',
      senderName: 'Sarah Johnson',
      content: 'Great! I can start working on the project next week.',
      timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      isRead: false,
    },
  ],
  '2': [
    {
      id: 1,
      senderId: 'user-1',
      senderName: 'You',
      content: 'Hi Michael! How are the designs coming along?',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
      isRead: true,
    },
    {
      id: 2,
      senderId: 'michael',
      senderName: 'Michael Chen',
      content: 'I\'ve sent you the updated designs. Please review and let me know.',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      isRead: true,
    },
  ],
  '3': [
    {
      id: 1,
      senderId: 'emily',
      senderName: 'Emily Rodriguez',
      content: 'Thank you for the opportunity! When can we schedule a call?',
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
      isRead: false,
    },
  ],
};

export function MessagesPage() {
  const [selectedConversationId, setSelectedConversationId] = useState<string>('1');
  const [conversations, setConversations] = useState(mockConversations);
  const [messages, setMessages] = useState(mockMessages);

  const selectedConversation = conversations.find(c => c.id === selectedConversationId);
  const currentMessages = messages[selectedConversationId] || [];

  const handleSendMessage = (content: string, attachments?: File[]) => {
    if (!selectedConversationId) return;

    const newMessage: Message = {
      id: currentMessages.length + 1,
      senderId: 'user-1',
      senderName: 'You',
      content,
      timestamp: new Date().toISOString(),
      isRead: true,
      attachments: attachments?.map(file => ({
        type: file.type.startsWith('image/') ? 'image' : 'file',
        url: URL.createObjectURL(file),
        name: file.name,
        size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
      })),
    };

    setMessages({
      ...messages,
      [selectedConversationId]: [...currentMessages, newMessage],
    });

    // Update conversation last message
    setConversations(conversations.map(conv => 
      conv.id === selectedConversationId
        ? {
            ...conv,
            lastMessage: {
              content,
              timestamp: new Date().toISOString(),
              isRead: true,
            },
          }
        : conv
    ));
  };

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
        <div className="grid lg:grid-cols-[380px_1fr] gap-6 h-[calc(100vh-280px)] min-h-[600px]">
          {/* Conversations List */}
          <div className="hidden lg:block">
            <ConversationsList
              conversations={conversations}
              selectedConversationId={selectedConversationId}
              onSelectConversation={setSelectedConversationId}
            />
          </div>

          {/* Message Thread */}
          {selectedConversation ? (
            <MessageThread
              recipientName={selectedConversation.participant.name}
              recipientStatus={selectedConversation.status}
              messages={currentMessages}
              onSendMessage={handleSendMessage}
              currentUserId="user-1"
              projectName={selectedConversation.projectName}
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
              selectedConversationId={selectedConversationId}
              onSelectConversation={setSelectedConversationId}
            />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}