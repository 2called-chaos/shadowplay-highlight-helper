const electron = require("electron");
const {version} = require("./package.json");
const ShhClientSettings = require("./client/settings");
const ShhViewManager = require("./client/view_manager");

module.exports = class ViewClient {
  constructor(opts = {}) {
    this.version = version
    this.opts = opts
    this.electron = electron
    this.ipc = electron.ipcRenderer
    this.remote = electron.remote
    this.settings = new ShhClientSettings(this)
    this.viewman = new ShhViewManager(this)
    this.cleanup = []
  }

  hook() {
    window.$ = window.jquery = require("jquery")
    window.popper = require("popper.js")
    window.bootstrap = require("bootstrap")

    window.addEventListener('beforeunload', () => {
      while(this.cleanup.length) { this.cleanup.shift()() }
    })

    this.viewman.hideAll()
    this.viewman.viewInstance("settings_modal") // prerender/init settings modal

    $("[data-attr=shh-version]").text(this.version)
    $("body").removeClass("d-none")

    this.ipc.on("trigger", (e, m) => {
      console.log("trigger", m, `C_${m.call}`, this[`C_${m.call}`])
      this[`C_${m.call}`] && this[`C_${m.call}`].apply(this, m.args || [])
    });

    return this
  }

  start() {
    if(this.settings.get("shh.remember_directory") && this.settings.get("internal.last_directory")) {
      this.viewman.show("game_list")
    } else {
      this.viewman.show("choose_folder")
    }

    if(false) {
      $("#welcome").fadeOut(2000)
      setTimeout(() => { $("#app").hide().removeClass("d-none").fadeIn(500, () => { this.postLaunch() }) }, 1250)
    } else {
      $("#welcome").fadeOut(350)
      $("#app").hide().removeClass("d-none").fadeIn(500, () => { this.postLaunch() })
    }

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

  C_alert(msg) {
    alert(msg);
  }
}
