const { fork } = require("child_process")

module.exports = class FsIndexerClient {
  constructor(view) {
    this.view = view
    this.alive = false
    this.listeners = {}
    this.errors = []
    this.validListeners = ["process:ready", "process:error", "glist:clearAll", "glist:sync:complete", "glist:game:new", "glist:game:update", "glist:game:size"]
  }

  spawn() {
    this.process = fork("./application/fs_indexer/process.js", { silent: true })
    this.alive = true
    this.errors.length = 0
    this.shutdownResolve = null

    this.process.stderr.on("data", e => this.errors.push(e))

    this.process.on("close", (code) => {
      this.alive = false
      if (code !== 0) {
        let msg = `
          indexer process exited with code ${this.process.exitCode}<br>
          <small>
          connected: ${this.process.connected}<br>
          killed: ${this.process.killed}<br>
          pid: ${this.process.pid}
          </small>
        `
        this.errors.forEach(m => { msg += `<hr class="thin">${m}` })
        this.throwError(msg, code)
        console.warn(`fsindexer process exited with code ${code}`, msg)
      }
      if(this.shutdownResolve) { this.shutdownResolve() }
    })

    this.process.on("message", (msg) => {
      try {
        let args = false
        try {
          args = JSON.parse(msg)
        } catch (err) {
          const errmsg = `JSON parse error (58) -- ${err}`
          this.throwError(errmsg, 58)
          console.error(errmsg, err)
          console.log(msg)
        }
        if (args) {
          const cmd = args.shift()
          if (this.validListeners.indexOf(cmd) > -1) {
            console.log(cmd, args)
            this.invokeListeners(cmd, ...args)
          } else {
            this.invokeListeners("process:error", `unknown command ${cmd}`, 8)
          }
        }
      } catch (err) {
        const errmsg = `Message handle error (9) -- ${err}`
        this.throwError(errmsg, 9)
        console.error(errmsg)
        console.log(err)
      }
    })

    return this
  }

  shutdown(callback) {
    const shutdownPromise = new Promise((r, f) => {
      this.shutdownResolve = _ => {
        r()
        callback()
      }
    })
    if (this.alive) {
      this.send("process:exit")
    } else {
      this.shutdownResolve()
    }
  }

  getListeners(key) {
    return this.listeners[key] || []
  }

  invokeListeners(key, ...args) {
    this.getListeners(key).forEach(l => { l(...args) })
  }

  throwError(message, code = -1) {
    this.invokeListeners("process:error", { code, message })
  }

  on(key, callback) {
    this.listeners[key] = this.listeners[key] || []
    this.listeners[key].push(callback)
    return this
  }

  send(...data) {
    this.process.send(JSON.stringify(data))
  }
}
