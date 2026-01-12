import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

let stompClient: Client | null = null;

export interface WebSocketMessage {
  id: number;
  sender: {
    id: number;
    fullName: string;
  };
  content: string;
  createdAt: string;
  profilePictureUrl?: string;
}

export const connectWebSocket = (
  conversationId: string,
  onMessage: (message: WebSocketMessage) => void
): (() => void) => {
  // Create WebSocket connection
  const socket = new SockJS('http://localhost:8080/ws');
  
  const client = new Client({
    webSocketFactory: () => socket as any,
    reconnectDelay: 5000,
    heartbeatIncoming: 4000,
    heartbeatOutgoing: 4000,
    debug: (str) => {
      console.log('STOMP:', str);
    },
    onConnect: () => {
      console.log('Connected to WebSocket');
      
      // Subscribe to conversation topic
      client.subscribe(`/topic/conversation/${conversationId}`, (message) => {
        try {
          const parsedMessage = JSON.parse(message.body);
          onMessage(parsedMessage);
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
        }
      });
    },
    onStompError: (frame) => {
      console.error('STOMP error:', frame);
    },
  });

  client.activate();
  stompClient = client;

  // Return cleanup function
  return () => {
    if (client) {
      client.deactivate();
    }
  };
};

export const disconnectWebSocket = () => {
  if (stompClient) {
    stompClient.deactivate();
    stompClient = null;
  }
};
