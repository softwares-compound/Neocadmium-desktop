import { app, shell, BrowserWindow, ipcMain, Notification } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import { startServer } from './server/server'
import { initializeDB } from './server/config/sqlite'
import { FromMainPayload, ToMainPayload } from './types/types'
import { spawn,exec } from 'child_process' // Import spawn to start the process
import fs from 'fs'
let aiServiceProcess: any = null
function checkAndStartOllama() {
  exec('ollama list', (error) => {
    if (error) {
      console.log('Ollama is not running. Attempting to start Ollama...')
      startOllama()
    } else {
      console.log('Ollama is already running.')
    }
  })
}

function startOllama() {
  try {
    const ollamaProcess = spawn('ollama', ['start'], {
      detached: true,
      stdio: 'ignore'
    })
    ollamaProcess.unref()
    console.log('Ollama started successfully.')
  } catch (error:any) {
    console.error(`Failed to start Ollama: ${error.message}`)
  }
}

async function startAIService() {
  let aiServicePath = ''

  if (process.platform === 'darwin') {
    aiServicePath = join(__dirname, '..', 'compiled-backend', 'ai-service') // macOS
  } else if (process.platform === 'win32') {
    aiServicePath = join(__dirname, '..', 'compiled-backend', 'ai-service.exe') // Windows
  } else if (process.platform === 'linux') {
    aiServicePath = join(__dirname, '..', 'compiled-backend', 'ai-service') // Linux
  }

  try {
    console.log('Starting AI service...')
    if (!fs.existsSync(aiServicePath)) {
      console.error(`AI service binary not found at: ${aiServicePath}`)
      return
    }

    aiServiceProcess = spawn(aiServicePath, [], {
      detached: true,
      stdio: ['ignore', 'pipe', 'pipe'] // Capture stdout and stderr
    })

    aiServiceProcess.unref() // Let the AI service run independently

    aiServiceProcess.stdout?.on('data', (data) => {
      console.log(`[AI Service]: ${data.toString().trim()}`)
    })

    aiServiceProcess.stderr?.on('data', (data) => {
      console.error(`[AI Service Error]: ${data.toString().trim()}`)
    })

    aiServiceProcess.on('error', (err) => {
      console.error(`AI Service failed to start: ${err.message}`)
    })

    aiServiceProcess.on('exit', (code) => {
      console.log(`AI Service exited with code: ${code}`)
    })
  } catch (error) {
    console.error(`Exception while starting AI Service: ${error}`)
  }
}

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: false,
    ...(process.platform === 'linux' ? { icon } : {}),
    icon: join(__dirname, '../resources/icon.png'),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

ipcMain.on('toMain', (event, args: ToMainPayload) => {
  console.log('Message received from renderer:', args)

  // Show a notification
  new Notification({
    title: 'Error occured in your application',
    body: args.message
  }).show()

  const response: FromMainPayload = {
    response: `Notification displayed for message: "${args.message}"`
  }

  event.sender.send('fromMain', response)
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  // Initialize the SQLite database
  initializeDB()

  startServer()

  checkAndStartOllama() // 🔹 Check & Start Ollama

  startAIService() // Start AI service before opening the window

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
