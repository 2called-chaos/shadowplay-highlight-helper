const {BrowserWindow} = require("electron")
const path = require("path")
const ShhWindowTools = require("./window_tools")

module.exports = class ShhMainWindow {
  constructor(shh) {
    this.winGroup = "mainWindow"
    this.defaultBounds = { width: 777, height: 666 }

    this.shh = shh
    this.window = null
    this.tools = new ShhWindowTools(this.shh, this)
  }

  create(optString = "") {
    const wstate = this.tools.setBounds(this.defaultBounds)
    this.window = new BrowserWindow({
      backgroundColor: "#191d21",
      show: false,
      x: wstate.x,
      y: wstate.y,
      width: wstate.width,
      height: wstate.height,
      //center: true,
      minWidth: 200,
      minHeight: 100,
      title: "ShadowPlay Highlight Helper",
      webPreferences: {
        preload: path.join(__dirname, "..", "client", "preload.js")
      }
    })
    if(wstate.isMaximized) { this.window.maximize() }
    this.tools.trackBounds()
    this.window.loadFile("client/index.html", { hash: optString })
    //if(this.isDev) this.window.webContents.openDevTools()
    this.window.on("closed", () => { this.window = null })
    this.window.once("ready-to-show", () => { this.window.show() })
    return this
  }

  activate() {
    if (this.window === null)
      this.create()
    else
      this.window.show()
    return this
  }

  send(channel, message) {
    if (this.window) {
      return this.window.webContents.send(channel, message)
    } else {
      this.create()
      this.window.webContents.on("did-finish-load", () => {
        this.send(channel, message)
      })
    }
  }

  trigger(call, args = []) {
    return this.send("trigger", { call: call, args: args })
  }
}
