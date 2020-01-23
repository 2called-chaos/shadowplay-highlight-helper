const {app, ipcMain, BrowserWindow} = require("electron")

module.exports = class ShhSettings {
  constructor(shh) {
    this.shh = shh
    this.store = require("electron-settings")
    this.debug = false
    this.watchers = {}
  }

  has(key) {
    if(this.debug) console.debug("has", key)
    return this.store.has(key)
  }

  get(key) {
    if(this.debug) console.debug("get", key)
    return this.store.get(key)
  }

  set(key, val) {
    if(this.debug) console.debug("set", key, val)
    return this.store.set(key, val)
  }

  toggle(key) {
    const was = this.get(key)
    if(this.debug) console.debug("toggle", key, "was", was)
    return this.set(key, !was)
  }

  fetch(key, val) {
    if(this.debug) console.debug("fetch", key, this.get(key), val)
    return (this.has(key) ? this.get(key) : val)
  }

  watch(key, handler) {
    if(this.debug) console.debug("watch", key)
    return this.store.watch(key, handler)
  }

  delete(key) {
    if(this.debug) console.debug("delete", key, this.get(key))
    return this.store.delete(key)
  }

  setDefault(key, val) {
    if(!this.has(key)) {
      console.debug("Defaulted setting", key, "to", val)
      this.set(key, val)
    }
  }

  purge(restartApplication = false) {
    console.warn("Purged configuration!", this.store.getAll())
    this.store.deleteAll()
    if(restartApplication) {
      app.relaunch()
      app.exit(0)
    }
    return this
  }

  loadDefaults() {
    console.info("Using config file", this.store.file())
    this.setDefault("internal.first_start", true)
    this.setDefault("shh.dark_mode", true)
    this.setDefault("shh.remember_directory", true)
    this.setDefault("shh.remember_size_and_position", true)
    this.setDefault("shh.check_for_updates", true)
    this.setDefault("shh.tags", [])
    return this
  }

  loadWatchers() {
    this.watch("shh.remember_directory", (v, ov) => {
      if(!v) { this.delete("internal.last_directory") }
    })
    this.watch("shh.remember_size_and_position", (v, ov) => {
      if(!v) { this.delete("windowState") }
    })
    return this
  }

  loadIPC() {
    ipcMain.on("setting-has", (ev, key) => ev.returnValue = this.has(key))
    ipcMain.on("setting-get", (ev, key) => ev.returnValue = this.get(key))
    ipcMain.on("setting-set", (ev, key, val) => ev.returnValue = this.set(key, val))
    ipcMain.on("setting-toggle", (ev, key) => ev.returnValue = this.toggle(key))
    ipcMain.on("setting-fetch", (ev, key, dval) => ev.returnValue = this.fetch(key, dval))
    ipcMain.on("setting-watch", (ev, key) => ev.returnValue = this.ipcWatch(key, ev))
    return this
  }

  ipcWatch(key, event) {
    const winID = event.sender.id
    if(this.watchers[key] && this.watchers[key].indexOf(winID) >= 0)
      return

    if(this.debug)
      console.debug(`Watching setting (IPC) ${key} for window ${winID}`)

    if(!this.watchers[key]) {
      this.watchers[key] = []
      this.watchers[key].__observer = this.watch(key, (nv, ov) => {
        if(this.debug)
          console.debug("setting changed", key, ov, nv, this.watchers[key].length)

        const staleWindows = []
        this.watchers[key].forEach(w => {
          const win = BrowserWindow.fromId(w)
          if(win) {
            win.send("setting-change", key, nv, ov)
          } else {
            staleWindows.push(w)
          }
          if(staleWindows.length) {
            console.info("clearing stale window listeners", key, staleWindows)
            this.watchers[key] = this.watchers[key].filter(w => staleWindows.indexOf(w) < 0 )
          }
        })
      })
    }
    this.watchers[key].push(winID)
    return winID
  }
}
