type MessageListener = (message: unknown) => void

let socket: WebSocket | null = null
let isConnected = false
const messageListeners: MessageListener[] = []
let retryInterval = 1000 // Initial retry interval in milliseconds
const maxRetryInterval = 60000 // Maximum retry interval

/**
 * Connect to the WebSocket server.
 * @param url - The WebSocket server URL.
 */
export const connectWebSocket = (url: string): void => {
  if (socket) return // Prevent multiple connections

  socket = new WebSocket(url)

  socket.onopen = (): void => {
    console.log('WebSocket connection established!')
    isConnected = true
    retryInterval = 1000 // Reset retry interval on successful connection
    // startKeepAlive(); // Start sending keep-alive pings
  }

  socket.onmessage = (event: MessageEvent): void => {
    const chunk = JSON.parse(event.data)
    // Notify all listeners of the new message
    messageListeners.forEach((listener) => listener(chunk))
  }

  socket.onclose = (): void => {
    console.log('WebSocket connection closed.')
    isConnected = false
    socket = null
    retryConnection(url) // Attempt reconnection
  }

  socket.onerror = (error: Event): void => {
    console.error('WebSocket error:', error)
    if (!isConnected) retryConnection(url) // Attempt reconnection on error
  }
}

/**
 * Reconnect to the WebSocket server with exponential backoff.
 * @param url - The WebSocket server URL.
 */
const retryConnection = (url: string): void => {
  console.log(`Retrying connection in ${retryInterval / 1000} seconds...`)
  setTimeout(() => {
    console.log('Attempting to reconnect to WebSocket...')
    connectWebSocket(url)
    retryInterval = Math.min(maxRetryInterval, retryInterval * 2) // Exponential backoff
  }, retryInterval)
}

/**
 * Send a message through the WebSocket connection.
 * @param message - The message to send.
 */
export const sendMessage = (message: object): void => {
  console.log('Message sent:', message)
  if (socket && isConnected) {
    socket.send(JSON.stringify(message))

  } else {
    console.error('WebSocket is not connected!')
  }
}

/**
 * Add a listener to handle incoming WebSocket messages.
 * @param listener - A function to handle messages.
 */
export const addMessageListener = (listener: MessageListener): void => {
  messageListeners.push(listener)
}

/**
 * Remove a listener for WebSocket messages.
 * @param listener - The listener function to remove.
 */
export const removeMessageListener = (listener: MessageListener): void => {
  const index = messageListeners.indexOf(listener)
  if (index > -1) {
    messageListeners.splice(index, 1)
  }
}

/**
 * Disconnect the WebSocket connection.
 */
export const disconnectWebSocket = (): void => {
  if (socket) {
    socket.close()
    socket = null
    isConnected = false
  }
}

/**
 * Periodically send a ping message to the server to keep the connection alive.
 */
// const startKeepAlive = (): void => {
//     if (!socket || !isConnected) return;

//     const intervalId = setInterval(() => {
//         if (socket && isConnected) {
//             socket.send(JSON.stringify({ type: "ping", timestamp: Date.now() }));
//         } else {
//             clearInterval(intervalId); // Stop keep-alive when disconnected
//         }
//     }, 30000); // Send ping every 30 seconds
// };

// Initialize WebSocket connection
connectWebSocket('ws://localhost:6970/ws/electron')
