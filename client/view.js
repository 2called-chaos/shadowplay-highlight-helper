module.exports = class ShhView {
  constructor(shh, manager, dom) {
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

  fadeIn(callback, ms = 250) {
    return this.dom.fadeIn(ms, callback)
  }
}
