const {ipcMain} = require("electron")

module.exports = class ShhIPC {
  constructor(shh) {
    this.shh = shh
  }

  hook() {
    // ipcMain.on("app-invoke", (event, opt) => {
    //   if (opt.log) console.log(eval(opt.log))
    //   if (opt.repl) this.repl()
    //   //secondWindow.webContents.send("action-update-label", arg);
    // })

    return this
  }
}
