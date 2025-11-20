import SockJS from 'sockjs-client'
import { Client } from '@stomp/stompjs'

let stompClient = null
let connectPromise = null
let cachedToken = null

export const connectWebSocket = ({ token } = {}) => {
  if (stompClient && stompClient.connected) {
    return Promise.resolve(stompClient)
  }

  if (connectPromise) {
    return connectPromise
  }

  cachedToken = token || cachedToken

  connectPromise = new Promise((resolve, reject) => {
    const socket = new SockJS('http://localhost:8080/ws')
    const client = new Client({
      webSocketFactory: () => socket,
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      connectHeaders: cachedToken ? { Authorization: `Bearer ${cachedToken}` } : {},
      onConnect: () => {
        console.log('WebSocket connected')
        stompClient = client
        connectPromise = null
        resolve(client)
      },
      onStompError: (frame) => {
        console.error('STOMP error:', frame)
      },
      onWebSocketClose: () => {
        console.log('WebSocket closed')
        stompClient = null
      },
      onWebSocketError: (error) => {
        console.error('WebSocket error', error)
        connectPromise = null
        reject(error)
      }
    })

    client.activate()
  })

  return connectPromise
}

const ensureConnected = async () => {
  if (stompClient && stompClient.connected) {
    return stompClient
  }
  return connectWebSocket({})
}

export const subscribeToConversation = async (conversationId, onMessage) => {
  const client = await ensureConnected()
  return client.subscribe(`/topic/conversation/${conversationId}`, (message) => {
    const msg = JSON.parse(message.body)
    onMessage(msg)
  })
}

export const subscribeToTyping = async (conversationId, onTyping) => {
  const client = await ensureConnected()
  return client.subscribe(`/topic/conversation/${conversationId}/typing`, (message) => {
    const payload = JSON.parse(message.body)
    onTyping(payload)
  })
}

export const subscribeToNotifications = async (userId, onNotification) => {
  const client = await ensureConnected()
  return client.subscribe(`/queue/notifications/${userId}`, (message) => {
    const payload = JSON.parse(message.body)
    onNotification(payload)
  })
}

export const sendMessage = async (conversationId, content, contentType = 'TEXT') => {
  const client = await ensureConnected()
  client.publish({
    destination: `/app/conversation/${conversationId}/send`,
    body: JSON.stringify({ content, contentType })
  })
  return true
}

export const disconnectWebSocket = () => {
  if (stompClient) {
    stompClient.deactivate()
    stompClient = null
    connectPromise = null
  }
}

