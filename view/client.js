const electron = require("electron");
const ShhVersion = require("../application/version");
const ShhSettings = require("../application/settings");

module.exports = class ViewClient {
  constructor(opts = {}) {
    this.opts = opts
    this.ipc = electron.ipcRenderer
    this.remote = electron.remote
    this.settings = new ShhSettings(this)
  }

  hook() {
    window.$ = window.jquery = require("jquery")
    window.popper = require("popper.js")
    window.bootstrap = require("bootstrap")

    $("[data-attr=shh-version]").text(ShhVersion)
    $("body").removeClass("hidden")
    
    this.ipc.on("trigger", (e, m) => {
      console.log("trigger", m, `C_${m.call}`, this[`C_${m.call}`])
      this[`C_${m.call}`] && this[`C_${m.call}`].apply(this, m.args || [])
    });

    return this
  }

  start() {
    if (this.settings.get("shh.dark_mode")) $("body").addClass("bootstrap-dark")
    
    $("#welcome").fadeOut(2000)
    setTimeout(() => { $("#app").hide().removeClass("d-none").fadeIn(500, () => { this.postLaunch() }) }, 1250)
    
    return this
  }

  postLaunch() {
    if(this.opts.openSettings) {
      this.C_toggleSettings(true, false)
    }
    if(this.settings.get("internal.first_start")) {
      this.settings.set("internal.first_start", false)
      this.C_toggleSettings(true, false)
    }
  }

  focusWindow() {
    this.remote.getCurrentWindow().focus()
  }

  C_toggleSettings(toggle = null, focus = true) {
    $("#settingsModal").modal("toggle", toggle)
    if(focus) this.focusWindow()
  }
}
