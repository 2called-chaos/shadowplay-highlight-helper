const {BrowserWindow} = require("electron")
const path = require("path")

module.exports = class ShhMainWindow {
  constructor(shh) {
    this.shh = shh
    this.window = null
  }

  create(optString = "") {
    this.window = new BrowserWindow({
      backgroundColor: "#191d21",
      show: false,
      width: 800,
      height: 600,
      title: "ShadowPlay Highlight Helper",
      webPreferences: {
        preload: path.join(__dirname, "..", "preload.js")
      }
    })
    this.window.loadFile("index.html", { hash: optString })
    //if(this.isDev) this.window.webContents.openDevTools()
    this.window.on("closed", () => { this.window = null })
    this.window.once("ready-to-show", () => { this.window.show() })
    this.window.webContents.on("did-finish-load", () => {
      this.window.webContents.send("ping", "whoooooooh!")
      //this.mainWindowLoop()
    })
    return this
  }

  activate() {
    if (this.window === null) this.create()
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
