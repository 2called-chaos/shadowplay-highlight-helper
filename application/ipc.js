const {ipcMain} = require("electron")

module.exports = class ShhIPC {
  constructor(shh) {
    this.shh = shh
  }

  hook() {
    ipcMain.on("app-ipc", (event, opt) => {
      if (opt.resetSettings) { this.shh.settings.purge(opt.restart) }
    })

    return this
  }
}
