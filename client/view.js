module.exports = class ShhView {
  constructor(id, shh, manager, dom) {
    this.id = id
    this.shh = shh
    this.settings = shh.settings
    this.ipc = shh.ipc
    this.remote = shh.remote
    this.manager = manager
    this.dom = dom
    this.rendered = false
    if(this.init) this.init()
  }

  bindControl(ctl, ctlTo = null) {
    if(ctlTo === null) { ctlTo = ctl }
    this.shh[`C_${ctl}`] = this[ctlTo].bind(this)
  }

  getWindow() {
    return this.shh.remote.getCurrentWindow()
  }

  focusWindow() {
    this.getWindow().focus()
  }

  visible() {
    return this.dom.is(":visible")
  }

  _render() {
    if(this.rendered) return this
    if(this.beforeRender) this.beforeRender()
    if(this.render) this.render()
    this.rendered = true
    if(this.afterRender) this.afterRender()
    return this
  }

  show(callback) {
    return this.manager.show(this, callback)
  }

  beforeShow() {}
  shown() {}
  beforeHide() {}
  hidden() {}

  fadeIn(callback, ms = 250) {
    return this.dom.fadeIn(ms, callback)
  }

  destroy() {
    this.dom.remove()
    delete this.manager.views[this.id]
  }

  // ===========
  // = helpers =
  // ===========
  showErrorModal(opts = {}) {
    opts = Object.assign({}, {

    }, opts)
    const refresh_btn = `
      <button type="button" class="btn btn-warning" data-dismiss="modal" x-view="${this.id}">retry</button>
    `
    const div = $(`
      <div class="modal fade modal-error" tabindex="-1" role="dialog" data-backdrop="static">
        <div class="modal-dialog modal-dialog-centerxed" role="document">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title w-100 text-danger text-center position-relative">
                <i class="fa fa-times-circle-o"></i>
                <br>${opts.title}
                <div class="text-white text-center subtitle">${opts.subtitle}</div>
                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                  <span aria-hidden="true">&times;</span>
                </button>
              </h5>
            </div>
            <div class="modal-body">
              ${opts.message}
            </div>
            <div class="modal-footer">
              ${opts.refresh_btn ? refresh_btn : ""}
              <button type="button" class="btn ${opts.btn_class || "btn-secondary"}" data-dismiss="modal">${opts.btn_text || "Dismiss"}</button>
            </div>
          </div>
        </div>
      </div>
    `)
    $("body").prepend(div)
    div.on("hidden.bs.modal", ev => {
      div.modal("dispose").remove()
    })
    div.modal("show")
  }
}
