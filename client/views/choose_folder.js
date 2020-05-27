const ShhView = require("../view")
const fs = require("fs")

module.exports = class ShhViewChooseFolder extends ShhView {
  init() {}

  selectDirectory() {
    const dir = this.remote.dialog.showOpenDialogSync(this.getWindow(), {
      properties: ['openDirectory', 'createDirectory', 'promptToCreate']
    })
    if(dir) {
      $("#spdir").val(dir[0])
      this.validate()
    }
  }

  isRW(path) {
    try {
      fs.accessSync(path, fs.constants.R_OK | fs.constants.W_OK);
      return true
    } catch (err) {
      return false
    }
  }

  validate() {
    const msg = this.errorMessage($("#spdir").val())
    $("#spdirError").toggleClass("d-none", !!!msg).html(msg ? msg : "")
    $("#spdirHelp").toggleClass("d-none", !!msg)
    $("#spdir").toggleClass("is-invalid", !!msg)
    $("#spdir").parent().find(".btn").toggleClass("btn-outline-danger", !!msg)
    return !!!msg
  }

  errorMessage(path) {
    if(!fs.existsSync(path)) {
      return "Path does not exist!"
    }

    if(!fs.statSync(path).isDirectory()) {
      return "Path is not a directory!"
    }

    if(!this.isRW(path)) {
      return "Path is not read and/or writable!"
    }
  }

  afterRender() {
    this.dom.find("[x-setting]").trigger("setting:init")
    this.dom.find("[x-click=select-directory]").click(ev => {
      $(ev.currentTarget).blur()
      this.selectDirectory()
    })
    $("#spdir").on("keyup change", ev => this.validate())
    if(this.settings.get("internal.last_directory")) {
      $("#spdir").val(this.settings.get("internal.last_directory")).change()
    } else {
      $("#spdir").val(this.remote.app.getPath("videos")).change()
    }
    this.dom.submit(ev => {
      if(this.validate()) {
        const path = $("#spdir").val()

        // remember directory
        if(this.settings.get("shh.remember_directory")) {
          this.settings.set("internal.last_directory", path)
        }

        // switch to game list view
        window.spdir = path
        //this.manager.destroy("game_list")
        this.manager.show("game_list")
      } else {
        $("#spdir").focus()
      }
      return false
    })
  }

  render() {
    this.dom.append($(`
      <div class="row h-100 justify-content-center">
        <div class="col-12 col-sm-12 col-md-10 col-lg-8 col-xl-7 align-self-center">
          <h2>Choose folder</h2>
          <form>
            <div class="form-group">
              <label for="spdir">ShadowPlay recordings folder</label>
              <div class="input-group">
                <input type="text" class="form-control" id="spdir" aria-describedby="spdirHelp" placeholder="C:/Users/chaos/videos">
                <div class="input-group-append">
                  <button class="btn btn-outline-secondary" type="button" x-click="select-directory">…</button>
                </div>
              </div>
              <small id="spdirHelp" class="form-text text-muted">You can change the folder later at any time.</small>
              <small id="spdirError" class="form-text text-danger d-none"></small>
            </div>


            <div class="form-group">
              <label class="form-check-label" x-setting="shh.remember_directory" x-mode="toggle">
                <i class="fa fa-lg fa-fw fa-toggle-on text-success fa-setting-toggle"></i> remember directory
              </label>
              <small class="form-text text-muted">remember last directory and automatically open it on launch</small>
            </div>

            <hr>
            <div class="form-group text-right">
              <input type="submit" name="commit" value="» Continue" class="btn btn-primary">
            </div>
          </form>
        </div>
      </div>
    `))
  }
}
