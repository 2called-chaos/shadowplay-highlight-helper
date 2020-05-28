const ShhView = require("../view")

module.exports = class ShhModalSettings extends ShhView {
  init() {
    this.watchedSettings = {}

    // ipc control
    this.bindControl("toggleSettings", "toggle")

    // setting init event
    $(document).on("setting:init", ev => this.initSetting($(ev.target)))

    // render immediately
    this._render()
  }

  afterRender() {
    // init / watch dark mode
    $("body").toggleClass("bootstrap-dark", this.settings.get("shh.dark_mode"))
    this.settings.watch("shh.dark_mode", (_, v) => $("body").toggleClass("bootstrap-dark", v) )
    this.settings.watch("shh.calculate_sizes", (_, v) => {
      if(!v) { return }
      const activeView = this.manager.visible(true)[0]
      if (activeView && activeView.id == "game_list") {
        activeView.dom.find("#game_list_tbody tr").each((i, el) => {
          activeView.calculateSizeForGame($(el).data("game"))
        })
      }
    })

    this.initModal()
    this.initHandlers()
  }

  initSetting(el) {
    const sname = el.attr("x-setting")
    const setting = this.settings.get(sname)
    const mode = el.attr("x-mode") || "toggle"
    this.updateSetting(sname, setting)

    if(!this.watchedSettings[sname]) {
      this.watchedSettings[sname] = true
      this.settings.watch(sname, (s, v) => this.updateSetting(s, v))
    }
  }

  updateSetting(sname, svalue) {
    const el = $(`[x-setting="${sname}"]`)
    const mode = el.attr("x-mode") || "toggle"

    switch(mode) {
      case "toggle":
        this.UI_toggleSetting(sname, svalue)
        break;
      case "input-array":
        el.closest(".form-group").find("input").val(svalue.join(", "))
        break;
    }
  }

  initHandlers() {
    // toggles
    $(document).on("click", "[x-setting]", ev => {
      const el = $(ev.currentTarget)
      const sname = el.attr("x-setting")
      const mode = el.attr("x-mode") || "toggle"


      if(el.hasClass("readonly")) return
      if(mode !== "toggle") return
      this.settings.toggle(sname)
    })

    // input-arrays
    $(document).on("change", "[x-setting-bind]", ev => {
      const el = $(`[x-setting="${$(ev.currentTarget).attr("x-setting-bind")}"]`)
      const sname = el.attr("x-setting")
      const mode = el.attr("x-mode") || "toggle"

      if(el.hasClass("readonly")) return
      if(mode !== "input-array") return

      const input = el.closest(".form-group").find("input")
      const tags = this.stringToTags(input.val())
      this.settings.set(sname, tags)
    })

    // generic click handlers
    $("[x-click=prompt-reset-settings]").click(ev => {
      $(ev.target).blur()
      if(confirm("Do you really want to reset all settings and window states?\n\nThe application will restart if you proceed!")) {
        this.ipc.send("app-ipc", { resetSettings: true, restart: true })
      }
    })
  }

  initModal() {
    // load & watch initial attributes
    $("#settingsModal [x-setting]").each((i, el) => this.initSetting($(el)))

    // catch form submit
    $("#settingsForm").submit((ev) => {
      this.toggle(false)
      return false
    })
  }

  toggle(toggle = null, focus = true) {
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

  UI_toggleSetting(setting, toggleTo) {
    const el = $(`[x-setting="${setting}"]`)
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

  render() {
    $("body").append($(`
      <div class="modal fade" id="settingsModal" tabindex="-1" role="dialog" aria-labelledby="settingsModalLabel" aria-hidden="true">
        <div class="modal-dialog" role="document">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title" id="settingsModalLabel"><i class="fa fa-cogs"></i> Settings</h5>
              <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                <span aria-hidden="true">&times;</span>
              </button>
            </div>
            <div class="modal-body">
              <form id="settingsForm">
                <div class="form-group">
                  <label>General</label>
                  <div class="form-check">
                    <label class="form-check-label" x-setting="shh.dark_mode" x-mode="toggle">
                      <i class="fa fa-lg fa-fw fa-toggle-on text-success fa-setting-toggle"></i> dark mode
                    </label>
                    <small class="form-text text-muted">we only work with dark, light might be wonky</small>
                  </div>
                </div>

                <div class="form-group">
                  <div class="form-check">
                    <label class="form-check-label" x-setting="shh.remember_directory" x-mode="toggle">
                      <i class="fa fa-lg fa-fw fa-toggle-on text-success fa-setting-toggle"></i> remember directory
                    </label>
                    <small class="form-text text-muted">remember last directory and automatically open it on launch</small>
                  </div>
                </div>

                <div class="form-group">
                  <div class="form-check">
                    <label class="form-check-label" x-setting="shh.remember_size_and_position" x-mode="toggle">
                      <i class="fa fa-lg fa-fw fa-toggle-on text-success fa-setting-toggle"></i> remember window dimensions
                    </label>
                    <small class="form-text text-muted">remember size and position of main window and restore it on launch</small>
                  </div>
                </div>

                <div class="form-group">
                  <div class="form-check">
                    <label class="form-check-label" x-setting="shh.calculate_sizes" x-mode="toggle">
                      <i class="fa fa-lg fa-fw fa-toggle-on text-success fa-setting-toggle"></i> calculate folder sizes
                    </label>
                    <small class="form-text text-muted">calculate folder sizes by default (you can always selectively choose to)</small>
                  </div>
                </div>

                <div class="form-group">
                  <div class="form-check">
                    <label class="form-check-label" x-setting="shh.check_for_updates" x-mode="toggle">
                      <i class="fa fa-lg fa-fw fa-toggle-on text-success fa-setting-toggle"></i> check for updates
                    </label>
                    <small class="form-text text-muted">you will always be asked if you want to install an update</small>
                  </div>
                </div>

                <div class="form-group">
                  <div class="form-check">
                    <label class="form-check-label extra-label-margin-bottom" x-setting="shh.tags" x-mode="input-array" for="settingsModal_shh-tags">
                      <i class="fa fa-lg fa-fw fa-tags"></i> Favorite tags
                    </label>
                    <input type="text" x-setting-bind="shh.tags" class="form-control" placeholder="clutch, ace, funny moment, glitch" id="settingsModal_shh-tags">
                    <small class="form-text text-muted">list of tags you can easily select on entries</small>
                  </div>
                </div>
              </form>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-link text-muted text-smaller mr-auto" x-click="prompt-reset-settings">reset settings</button>
              <button type="button" class="btn btn-primary" data-dismiss="modal">Close</button>
            </div>
          </div>
        </div>
      </div>
    `))
  }
}
