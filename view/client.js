const electron = require("electron");
const {version} = require("../package.json");
const ShhClientSettings = require("./settings");

module.exports = class ViewClient {
  constructor(opts = {}) {
    this.version = version
    this.opts = opts
    this.electron = electron
    this.ipc = electron.ipcRenderer
    this.remote = electron.remote
    this.settings = new ShhClientSettings(this)
    this.cleanup = []
  }

  hook() {
    window.$ = window.jquery = require("jquery")
    window.popper = require("popper.js")
    window.bootstrap = require("bootstrap")

    window.addEventListener('beforeunload', () => {
      while(this.cleanup.length) { this.cleanup.shift()() }
    })

    this.initSettingsModal()

    $("[data-attr=shh-version]").text(this.version)
    $("body").removeClass("hidden")

    this.ipc.on("trigger", (e, m) => {
      console.log("trigger", m, `C_${m.call}`, this[`C_${m.call}`])
      this[`C_${m.call}`] && this[`C_${m.call}`].apply(this, m.args || [])
    });

    return this
  }

  start() {
    $(".view").hide()

    if(this.settings.get("shh.remember_directory") && this.settings.get("internal.last_directory")) {
      this.showView("game_list")
    } else {
      this.showView("choose_folder")
    }

    if(true) {
      $("#welcome").fadeOut(2000)
      setTimeout(() => { $("#app").hide().removeClass("d-none").fadeIn(500, () => { this.postLaunch() }) }, 1250)
    } else {
      $("#welcome").fadeOut(350)
      $("#app").hide().removeClass("d-none").fadeIn(500, () => { this.postLaunch() })
    }

    return this
  }

  showView(view, callback) {
    if($(".view:visible").length)
      $(".view:visible").fadeOut(250, () => { $(`#view_${view}`).fadeIn(250, () => { if(callback) callback() }) })
    else
      $(`#view_${view}`).fadeIn(250, () => { if(callback) callback() })
  }

  postLaunch() {
    this.C_toggleSettings(true, false)
    if(this.opts.openSettings) {
      this.C_toggleSettings(true, false)
    }
    if(this.settings.get("internal.first_start")) {
      this.settings.set("internal.first_start", false)
      this.C_toggleSettings(true, false)
    }
  }

  UI_toggleSetting(setting, toggleTo) {
    console.log("uiToggleSetting", setting, toggleTo)
    const el = $(`#settingsModal [x-setting="${setting}"]`)
    const i = $(el).find("i")
    if(toggleTo == undefined) toggleTo = !i.hasClass("text-success")
    i.toggleClass("text-danger fa-toggle-off", !toggleTo).toggleClass("text-success fa-toggle-on", toggleTo)
    return toggleTo
  }

  stringToTags(str) {
    return str
      .split(",")
      .map(e => e.trim())
      .filter(e => e !== "")
      .filter((v,i,s) => s.indexOf(v) === i )
  }

  initSettingsModal() {
    // init / watch dark mode
    $("body").toggleClass("bootstrap-dark", this.settings.get("shh.dark_mode"))
    this.settings.watch("shh.dark_mode", v => $("body").toggleClass("bootstrap-dark", v))

    // catch form submit
    $("#settingsForm").submit((ev) => {
      this.C_toggleSettings(false)
      return false
    })

    // load & watch initial attributes
    $("#settingsModal").find("[x-setting]").each((i, _el) => {
      const el = $(_el)
      const sname = el.attr("x-setting")
      const setting = this.settings.get(sname)
      const mode = el.attr("x-mode") || "toggle"
      this.ipc.send("setting-notify", { key: sname })
      switch(mode) {
        case "toggle":
          this.UI_toggleSetting(sname, setting)
          el.click(ev => { console.log(sname, ev); this.settings.toggle(sname) })
          this.settings.watch(sname, (s, v) => this.UI_toggleSetting(s, v))
          break;
        case "input-array":
          const input = el.closest(".form-group").find("input")
            .on("change", ev => {
              const tags = this.stringToTags($(ev.currentTarget).val())
              input.val(tags.join(", "))
              this.settings.set(sname, tags)
            })
            .val(setting.join(", "))
          this.settings.watch(sname, (s, v) => { input.val(v.join(", "))})
          break;
      }
    })

    // click handlers
    $("#settingsModal").find("[x-click]").click(ev => {
      $(ev.target).blur()
      switch ($(ev.target).attr("x-click")) {
        case "prompt-reset-settings":
          if(confirm("Do you really want to reset all settings and window states?\n\nThe application will restart if you proceed!")) {
            this.ipc.send("app-ipc", { resetSettings: true, restart: true })
          }
          break
        default: console.log(ev.target)
      }
    })
  }

  getWindow() {
    return this.remote.getCurrentWindow()
  }

  focusWindow() {
    this.getWindow().focus()
  }

  }

  C_toggleSettings(toggle = null, focus = true) {
    console.trace(toggle, focus, $("#settingsModal"))
    if(toggle === null || toggle == undefined) {
      toggle = !($("#settingsModal").data('bs.modal') || {})._isShown
    }
    if (toggle === true) {
      $("#settingsModal").modal("show")
    } else if (toggle === false) {
      $("#settingsModal").modal("hide")
    }

    if(focus) this.focusWindow()
  }
}
