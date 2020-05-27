const {ipcMain} = require("electron")

module.exports = class ShhIPC {
  constructor(shh) {
    this.shh = shh
    this.ipc = ipcMain
  }

  hook() {
    this.on("app-ipc", (event, dir) => {
      if (opt.resetSettings) { this.shh.settings.purge(opt.restart) }
    })

    return this
  }

  on(...a) { return this.ipc.on(...a) }
}
