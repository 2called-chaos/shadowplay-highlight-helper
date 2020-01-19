// Modules to control application life and create native browser window
const {app, BrowserWindow, ipcMain} = require('electron')
const path = require('path')
const settings = require('electron-settings')

exports.ShadowplayHighlightHelper = class ShadowplayHighlightHelper {
  constructor() {
    this.mainWindow = null
  }

  hook() {
    app.on('ready', () => { this.start() })
    app.on('window-all-closed', () => { this.lastWindowClosed() })
    app.on('activate', () => { this.activate() })
  }

  start() {
    this.loadSettings()
    this.createWindow()
  }

  loadSettings() {
    console.log("Using config file", settings.file())
    if (!settings.has('app.dark_mode'))
      settings.set('app.dark_mode', true)
    if (!settings.has('app.remember_directory'))
      settings.set('app.remember_directory', true)
    if (!settings.has('app.remember_size_and_position'))
      settings.set('app.remember_size_and_position', true)
    if (!settings.has('app.tags'))
      settings.set('app.tags', [])
  }  

  activate() {
    if (this.mainWindow === null) this.createWindow()
  }

  lastWindowClosed() {
    app.quit()
    //if (process.platform !== 'darwin') app.quit()
  }

  createWindow () {
    // Create the browser window.
    this.mainWindow = new BrowserWindow({
      show: false,
      width: 800,
      height: 600,
      webPreferences: {
        preload: path.join(__dirname, 'preload.js')
      }
    })
    this.mainWindow.loadFile('index.html')
    this.mainWindow.webContents.openDevTools()
    ipcMain.on('app-invoke', (event, opt) => {
      if (opt.log) console.log(eval(opt.log))
      //secondWindow.webContents.send('action-update-label', arg);
    })
    this.mainWindow.on('closed', () => { this.mainWindow = null })
    this.mainWindow.once('ready-to-show', () => { this.mainWindow.show() })
  }
}

// Open directory, list games => list videos
// settings: tags, folder
// new video => cut(preview_encode&remove_original), name, desc, tags => open folder, encode(720p30/60, 1080p30/60)
