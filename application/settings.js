module.exports = class ShhSettings {
  constructor(shh) {
    this.shh = shh
    this.store = require("electron-settings")
  }

  has(key) {
    return this.store.has(key)
  }

  get(key) {
    return this.store.get(key)
  }

  set(key, v) {
    return this.store.set(key, v)
  }

  fetch(key, v) {
    return (this.has(key) ? this.get(key) : v)
  }

  setDefault(key, v) {
    if(!this.has(key)) {
      console.debug("Defaulted setting", key, "to", v)
      this.set(key, v)
    }
  }

  loadDefaults() {
    console.log("Using config file", this.store.file())
    this.setDefault("internal.first_start", true)
    this.setDefault("shh.dark_mode", true)
    this.setDefault("shh.remember_directory", true)
    this.setDefault("shh.remember_size_and_position", true)
    this.setDefault("shh.tags", [])
    return this
  }
}
