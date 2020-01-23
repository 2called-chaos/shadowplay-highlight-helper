const {session, ipcMain} = require("electron")
const path = require("path")
const repl = require("repl")

module.exports = class ShhDevelopment {
  constructor(shh) {
    this.shh = shh
  }

  init() {
    if (!this.shh.isDev) return this
    require("electron-reload")(path.join(__dirname, ".."))
    return this
  }

  start() {
    if (!this.shh.isDev) return this
    // this.logWebRequests()
    this.ipcInvoke()
    return this
  }

  ipcInvoke() {
    ipcMain.on("app-invoke", (event, opt) => {
      if (opt.log) console.log(eval(opt.log))
      if (opt.repl) this.repl()
      //secondWindow.webContents.send("action-update-label", arg);
    })
  }

  repl(ctx = {}) {
    let prompt = "> "
    let message = "main"
    if(ctx.prompt) {
      prompt = ctx.prompt
      delete ctx.prompt
    }
    if(ctx.message) {
      message = ctx.message
      delete ctx.message
    }
    if(message !== "") { message = `(${message})` }
    if(this.repl_started) {
      console.error("Attempted to start REPL but is already active")
      return this
    }
    this.repl_started = true
    console.log(`===== REPL session started ${message}`)
    const ri = repl.start({ prompt })
    ri.context.shh = this.shh
    for (let key in ctx){
      if(ctx.hasOwnProperty(key)) ri.context[key] = ctx[key]
    }
    ri.on("exit", () => {
      console.log(`===== REPL session ended ${message}`)
      this.repl_started = false
    })
    return this
  }

  logWebRequests() {
    session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
      //console.log(details)
      console.log(`[${details.statusCode} ${details.method}] ${details.url}`)
      callback(details)
    })
    return this
  }
}
