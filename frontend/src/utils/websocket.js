import SockJS from 'sockjs-client'
import { Client } from '@stomp/stompjs'

let stompClient = null

export const connectWebSocket = (token, onMessage, onNotification) => {
  const socket = new SockJS('http://localhost:8080/ws')
  const client = new Client({
    webSocketFactory: () => socket,
    reconnectDelay: 5000,
    heartbeatIncoming: 4000,
    heartbeatOutgoing: 4000,
    onConnect: () => {
      console.log('WebSocket connected')
      
      // Subscribe to user-specific notification queue
      if (onNotification) {
        // We'll need to get user ID from token or profile
        // For now, using a generic subscription
        client.subscribe('/queue/notifications', (message) => {
          const notification = JSON.parse(message.body)
          onNotification(notification)
        })
      }
    },
    onStompError: (frame) => {
      console.error('STOMP error:', frame)
    },
    onWebSocketClose: () => {
      console.log('WebSocket closed')
    }
  })

  // Add authorization header if token is provided
  if (token) {
    client.configure({
      connectHeaders: {
        Authorization: `Bearer ${token}`
      }
    })
  }

  client.activate()
  stompClient = client
  return client
}

export const subscribeToConversation = (conversationId, onMessage) => {
  if (!stompClient || !stompClient.connected) {
    console.error('WebSocket not connected')
    return null
  }

  return stompClient.subscribe(`/topic/conversation/${conversationId}`, (message) => {
    const msg = JSON.parse(message.body)
    onMessage(msg)
  })
}

export const sendMessage = (conversationId, content, contentType = 'TEXT') => {
  if (!stompClient || !stompClient.connected) {
    console.error('WebSocket not connected')
    return false
  }

  stompClient.publish({
    destination: `/app/conversation/${conversationId}/send`,
    body: JSON.stringify({ content, contentType })
  })
  return true
}

export const disconnectWebSocket = () => {
  if (stompClient) {
    stompClient.deactivate()
    stompClient = null
  }
}

