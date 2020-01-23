const electron = require("electron");

module.exports = class ShhClientSettings {
  constructor(client) {
    this.client = client
    this.debug = false
    this.ipc = electron.ipcRenderer
    this.watching = {}
    this.ipc.on("setting-change", (ev, sname, nval, oval) => {
      this.watching[sname].forEach(f => f(sname, nval, oval))
    })
  }

  has(key) {
    if(this.debug) console.debug("has", key)
    return this.ipc.sendSync("setting-has", key)
  }

  get(key) {
    if(this.debug) console.debug("get", key)
    return this.ipc.sendSync("setting-get", key)
  }

  set(key, v) {
    if(this.debug) console.debug("set", key)
    return this.ipc.sendSync("setting-set", key, v)
  }

  toggle(key) {
    if(this.debug) console.debug("toggle", key, "was", this.get(key))
    return this.ipc.sendSync("setting-toggle", key)
  }

  fetch(key, v) {
    if(this.debug) console.debug("fetch", key, this.get(key), v)
    return this.ipc.sendSync("setting-fetch", key, v)
  }

  watch(key, handler) {
    if(this.debug) console.debug("watch", key)
    if(!this.watching[key]) {
      this.watching[key] = []
      this.ipc.sendSync("setting-watch", key)
    }
    this.watching[key].push(handler)
  }
}
