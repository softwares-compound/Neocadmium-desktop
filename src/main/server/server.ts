// src/server/server.ts
import express from 'express'
import cors from 'cors'
import http from 'http'
import os from 'os'
import pty from 'node-pty'
import corsOptions from './middlewares/cors-option'
import router from './routes/router'
// import log from './middlewares/logging'

import config from './config'
import { WebSocketServer } from 'ws'
import path from 'path'

const app = express()
const shell = os.platform() === 'win32' ? 'powershell.exe' : 'bash'

// Middleware
app.use(express.json())
app.use(cors(corsOptions))
// Routes
// app.use(router);
app.use('/api', router)
// Global log Handler
// app.use(log)

// Create an HTTP server
const server = http.createServer(app)

// Attach WebSocket server to the HTTP server
const wss = new WebSocketServer({ server, path: '/ws' })

// List of allowed commands (whitelist approach)
const allowedCommands = ['echo', 'git', 'ls', 'pwd', 'whoami'] // Add safe commands here

wss.on('connection', (ws) => {
  console.log('New WebSocket connection')

  let ptyProcess: pty.IPty | null = null
  let initialized = false

  ws.on('message', (message) => {
    try {
      const parsedData = JSON.parse(message.toString())
      const { projectId, type, command } = parsedData

      if (type === 'command' && command) {
        if (!ptyProcess) {
          if (!projectId) {
            ws.send(JSON.stringify({ error: 'Project ID is required to initialize the terminal.' }))
            return
          }

          // Get the parent directory of process.cwd()
          const parentDir = path.dirname(process.cwd())
          // Construct the project path
          const projectPath = path.join(parentDir, 'target-codebases', projectId)

          // Initialize the PTY process with the project directory
          ptyProcess = pty.spawn(shell, [], {
            name: 'xterm-color',
            cwd: projectPath,
            env: process.env
          })

          console.log(`PTY process initialized for project: ${projectPath}`)

          // Send shell output to WebSocket
          ptyProcess.onData((data) => {
            if (!initialized) {
              if (data.includes('bash-3.2$')) {
                initialized = true
                ws.send(data.trim())
              }
            } else {
              ws.send(data)
            }
          })

          ptyProcess.onExit(({ exitCode }) => {
            console.log(`PTY process exited with code ${exitCode}`)
          })
        }

        // Process the command
        const baseCommand = command.trim().split(' ')[0]
        console.log(`Project ID: ${projectId}, Command: ${baseCommand}`)

        if (allowedCommands.includes(baseCommand)) {
          ptyProcess.write(`${command}\n`)
        } else {
          ws.send(
            `"${command}" Command not allowed. Please use the terminal to connect Cadmium with your project codebase. \r\nYou can use the following commands: 'git clone <repository-url>'\r\nbash-3.2$ `
          )
        }
      } else {
        ws.send(JSON.stringify({ error: 'Invalid message format' }))
      }
    } catch (error) {
      console.error('Invalid JSON received:', message)
      ws.send(JSON.stringify({ error: 'Invalid JSON format' }))
    }
  })

  ws.on('close', () => {
    console.log('WebSocket connection closed')
    if (ptyProcess) {
      ptyProcess.kill()
      ptyProcess = null
    }
  })

  ws.on('error', (error) => {
    console.error('WebSocket error:', error)
  })
})

export function startServer() {
  server.listen(config.port, () => {
    console.log(`Server is running on port ${config.port}`)
  })
}
