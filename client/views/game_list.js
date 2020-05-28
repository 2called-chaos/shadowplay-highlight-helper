const ShhView = require("../view")
const ShhFsIndexerClient = require("../../application/fs_indexer/client")

module.exports = class ShhViewGameList extends ShhView {
  init() {
    this.doms = {}
  }

  beforeShow() {
  }

  shown() {
    if(this.indexer) {
      this.indexer.shutdown(_ => this.spawnIndexer())
    } else {
      this.spawnIndexer()
    }
  }

  afterRender() {
    $(document).on("click", "[x-click=glist-refresh]", ev => {
      $(ev.currentTarget).blur()
      this.buildTableAsync()
      return false
    })
    $(document).on("click", "[x-click=glist-calculateSizes]", ev => {
      $(ev.currentTarget).blur()
      this.forEachDomInPath(window.spdir, (dom, key, doms) => {
        this.calculateSizeForGame(key)
      })
      return false
    })
    $(document).on("click", "[x-click=glist-calculateSize]", ev => {
      $(ev.currentTarget).closest(".click-hide-dropdown").find(".dropdown-toggle").dropdown("toggle")
      this.calculateSizeForGame($(ev.currentTarget).closest("tr").data("game"))
      return false
    })
  }

  spawnIndexer() {
    this.indexer = new ShhFsIndexerClient(this)
      .on("glist:clearAll",      (data) => { this.glistClearAll(data) })
      .on("glist:game:new",      (data) => { this.glistGameNew(data) })
      .on("glist:game:update",   (data) => { this.glistGameUpdate(data) })
      .on("glist:game:size",     (data) => { this.glistGameSize(data) })
      .on("glist:sync:complete", (data) => { this.glistSyncComplete(data) })
      .on("process:error",       (data) => { this.processError(data) })
      .on("process:ready",       (data) => { this.buildTableAsync() })
      .spawn()
  }

  processError(data) {
    if(typeof data == "string") {
      data = { code: -1, message: data }
    }
    this.showErrorModal({
      title: "FS Indexer Failure",
      subtitle: "something went wrong while indexing your highlights folder",
      message: `<div class="text-danger">${data.message}</div>`,
      refresh_btn: !this.indexer.alive,
    })
  }

  domsInPath(dir, callback) {
    this.doms[dir] = this.doms[dir] || {}
    callback(this.doms[dir])
  }

  forEachDomInPath(dir, callback) {
    this.domsInPath(dir, doms => {
      for (let key in doms){
        if(doms.hasOwnProperty(key)) {
          callback(doms[key], key, doms)
        }
      }
    })
  }

  calculateSizeForGame(game) {
    this.domsInPath(window.spdir, doms => {
      if(doms[game]) {
        doms[game].find(".fsize-value").hide()
        doms[game].find(".fsize-pending").show()
        this.indexer.send("glist:game:calculateSize", window.spdir, doms[game].data("game"))
      }
    })
  }

  colorizeSize(sizeStr) {
    const x = sizeStr.substr(-2)
    if(["TB", "PB", "EB", "ZB", "YB"].indexOf(x) > -1) {
      return "text-danger"
    } else if(["GB"].indexOf(x) > -1) {
      return "text-warning"
    } else if(["MB"].indexOf(x) > -1) {
      return "text-info"
    } else {
      return "text-muted"
    }
  }

  async buildTableAsync() {
    const cfv = this.manager.viewInstance("choose_folder")
    if(window.spdir && !cfv.errorMessage(window.spdir)) {
      this.indexer.send("glist:sync", window.spdir)
    } else {
      cfv.show()
    }
  }

  async glistSyncComplete(payload) {
  }

  async glistClearAll(payload) {
    this.forEachDomInPath(window.spdir, (dom, key, doms) => {
      dom.remove()
      delete doms[key]
    })
  }

  async glistGameNew(payload) {
    this.domsInPath(window.spdir, doms => {
      if(doms[payload.name]) {
        doms[payload.name].remove()
        delete doms[payload.name]
      }

      const ico = `<i class="fa fa-circle-o-notch fa-spin"></i>`
      const tr = doms[payload.name] = $("<tr></tr>")
        .data("game", payload.name)
        .appendTo("#game_list_tbody")

      $("<td>").appendTo(tr).append($("<span>").addClass("overflow-elli").attr("x-attr", "name").text(payload.name).append(
        $("<span>").addClass("float-right text-smaller text-muted fsize-ctn").append(
          $("<span>").addClass("fsize-value").attr("x-attr", "size").hide(),
          $("<span>").addClass("fsize-pending").hide().append($("<i>").addClass("fa fa-circle-o-notch fa-spin")),
        )
      ))
      $("<td>").addClass("secondary-col").attr("x-attr", "managed").addClass("text-muted").html(ico).appendTo(tr)
      $("<td>").addClass("secondary-col").attr("x-attr", "unmanaged").addClass("text-muted").html(ico).appendTo(tr)
      $("<td>").addClass("actions-col").html(`
        <div class="btn-group btn-group-xs click-hide-dropdown">
          <div class="btn-group btn-group-xs dropleft" role="group">
            <button type="button" class="btn btn-secondary dropdown-toggle dropdown-toggle-split" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
              <span class="sr-only">Toggle Dropleft</span>
            </button>
            <div class="dropdown-menu">
              <a class="dropdown-item" href="#" x-click="" title="view your edited highlights"><i class="fa fa-fw fa-list"></i> highlights</a>
              <a class="dropdown-item" href="#" x-click="" title="highlights grouped by tags basically"><i class="fa fa-fw fa-tags"></i> tag cloud</a>
              <div class="dropdown-divider"></div>
              <a class="dropdown-item" href="#" x-click="glist-calculateSize" title="calculate folder size"><i class="fa fa-fw fa-hdd-o"></i> calculate size</a>
              <a class="dropdown-item" href="#" x-click="glist-hideGame" title="hide this game"><i class="fa fa-fw fa-eye-slash"></i> hide game</a>
              <a class="dropdown-item" href="#" x-click="glist-unhideGame" title="unhide this game"><i class="fa fa-fw fa-eye"></i> unhide game</a>
            </div>
          </div>
          <button type="button" class="btn btn-primary nbsp" title="edit new highlights">
            <i class="fa fa-edit"></i> new
          </button>
        </div>
      `).appendTo(tr)

      if(this.settings.get("shh.calculate_sizes")) {
        this.calculateSizeForGame(tr.data("game"))
      }
    })
  }

  async glistGameUpdate(payload) {
    this.domsInPath(window.spdir, doms => {
      if(payload.managed) {
        doms[payload.name].find("[x-attr=managed]").removeClass("text-muted").text(payload.managed.length.toString())
      }
      if(payload.unmanaged) {
        doms[payload.name].find("[x-attr=unmanaged]").removeClass("text-muted").text(payload.unmanaged.length.toString())
      }
    })
  }

  async glistGameSize(payload) {
    this.domsInPath(window.spdir, doms => {
      doms[payload.name].find(".fsize-pending").hide()
      doms[payload.name].find(".fsize-value")
        .text(payload.readable)
        .attr("title", `${payload.bytes} Bytes`)
        .removeClass("text-muted text-danger text-warning text-info")
        .addClass(this.colorizeSize(payload.readable))
        .show()
    })
  }

  render() {
    this.dom.append($(`
      <div class="row d-none">
        <h2>ShadowPlay Highlight Helper</h2>
      </div>
      <div class="row">
        <div class="btn-toolbar" role="toolbar">
          <div class="btn-group btn-group-sm mr-2" role="group">
            <button type="button" class="btn btn-secondary" title="change folder" x-view="choose_folder">
              <i class="fa fa-folder-open"></i>
            </button>
            <button type="button" class="btn btn-secondary" title="refresh index" x-click="glist-refresh">
              <i class="fa fa-refresh"></i>
            </button>
            <button type="button" class="btn btn-secondary" title="calculate all folder sizes" x-click="glist-calculateSizes">
              <i class="fa fa-hdd-o"></i>
            </button>
            <button type="button" class="btn btn-secondary" title="toggle hidden (will refresh)" x-click="glist-toggleHidden">
              <i class="fa fa-eye-slash"></i>
            </button>
          </div>
          <div class="btn-group btn-group-sm mr-2" role="group">
            <button type="button" class="btn btn-secondary" title="tag cloud">
              <i class="fa fa-tags"></i>
            </button>
          </div>
        </div>
      </div>
      <div class="row mt-3">
        <table class="table table-hover table-striped table-sm table-shh-game-list">
          <thead class="thead-dark">
            <tr>
              <th scope="col">game</th>
              <th scope="col">reviewed</th>
              <th scope="col">new</th>
              <th scope="col"></th>
            </tr>
          </thead>
          <tbody id="game_list_tbody"></tbody>
        </table>
      </div>
    `))
  }
}
