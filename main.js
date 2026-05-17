const { app, BrowserWindow, ipcMain, screen } = require('electron')
const path = require('path')
const fs = require('fs')

const DATA_PATH = path.join(__dirname, 'data.json')

ipcMain.on('save-projects', (event, projects) => {
  fs.writeFileSync(DATA_PATH, JSON.stringify(projects, null, 2))
})

ipcMain.handle('load-projects', () => {
  try {
    const data = fs.readFileSync(DATA_PATH, 'utf8')
    const parsed = JSON.parse(data)
    return parsed.length ? parsed : []
  } catch {
    return []
  }
})

let petWindow
let dashboardWindow

function createPetWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize

  petWindow = new BrowserWindow({
    width: width,
    height: height,
    x: 0,
    y: 0,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    focusable: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  })

  petWindow.loadFile(path.join(__dirname, 'src/pet/index.html'))
  petWindow.setIgnoreMouseEvents(true, { forward: true })
}

function createDashboardWindow() {
  if (dashboardWindow) {
    dashboardWindow.focus()
    return
  }

  const { width, height } = screen.getPrimaryDisplay().workAreaSize

  dashboardWindow = new BrowserWindow({
    width: 960,
    height: 680,
    x: Math.floor((width - 960) / 2),
    y: Math.floor((height - 680) / 2),
    frame: false,
    transparent: false,
    resizable: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  })

  dashboardWindow.loadFile(path.join(__dirname, 'src/dashboard/index.html'))
  dashboardWindow.webContents.on('did-finish-load', () => {
  dashboardWindow.webContents.openDevTools()
})

  dashboardWindow.on('closed', () => {
    dashboardWindow = null
  })
}

app.whenReady().then(() => {
  createPetWindow()
})

ipcMain.on('open-dashboard', () => {
  createDashboardWindow()
})

ipcMain.on('close-dashboard', () => {
  if (dashboardWindow) dashboardWindow.close()
})

ipcMain.on('set-clickable', (event, clickable) => {
  if (petWindow) {
    petWindow.setIgnoreMouseEvents(!clickable, { forward: true })
  }
})

app.on('window-all-closed', (e) => {
  e.preventDefault()
})