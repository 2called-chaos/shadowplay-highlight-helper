// Modules to control application life and create native browser window
const {app, session} = require("electron")
const path = require("path")

const {version} = require("./package.json")
const ShhSettings = require("./application/settings")
const ShhMainWindow = require("./application/main_window")
const ShhAppMenu = require("./application/app_menu.js")
const ShhIPC = require("./application/ipc.js")
const ShhDevelopment = require("./application/development.js")

exports.ShadowplayHighlightHelper = class ShadowplayHighlightHelper {
  constructor() {
    this.version = version
    this.name = app.name = "ShadowPlay Highlight Helper"
    this.isDev = process.env.APP_DEV ? (process.env.APP_DEV.trim() == "true" || process.env.APP_DEV.trim() == "1") : false;
    this.isMac = process.platform === "darwin"
    this.mainWindow = null
    this.dev = new ShhDevelopment(this).init()
  }

  hook() {
    app.on("ready", () => { this.start() })
    app.on("window-all-closed", () => { this.lastWindowClosed() })
    app.on("activate", () => { this.activate() })
  }

  activate() {
    this.mainWindow.activate()
  }

  lastWindowClosed() {
    //app.quit()
    if (!this.isMac) app.quit()
  }

  start() {
    this.settings = new ShhSettings(this).loadDefaults().loadWatchers().loadIPC()
    this.dev.start()
    //this.setUserAgent()
    this.ipc = new ShhIPC(this).hook()
    this.appMenu = new ShhAppMenu(this).update(this.isMac, this.isDev)
    this.mainWindow = new ShhMainWindow(this).create()
  }

  setUserAgent() {
    session.defaultSession.webRequest.onBeforeSendHeaders(filter, (details, callback) => {
      details.requestHeaders["User-Agent"] = "MyAgent"
      callback({ requestHeaders: details.requestHeaders })
    })
  }
}

// Open directory, list games => list videos
// settings: tags, folder
// new video => cut(preview_encode&remove_original), name, desc, tags => open folder, encode(720p30/60, 1080p30/60)
