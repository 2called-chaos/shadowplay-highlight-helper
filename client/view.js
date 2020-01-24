module.exports = class ShhView {
  constructor(manager, dom) {
    this.manager = manager
    this.dom = dom
    this.rendered = false
    if(this.init) this.init()
  }

  _render() {
    if(this.rendered) return this
    if(this.render) this.render()
    this.rendered = true
    return this
  }

  show(callback) {
    return this.manager.show(this, callback)
  }

  fadeIn(callback, ms = 250) {
    return this.dom.fadeIn(ms, callback)
  }
}
