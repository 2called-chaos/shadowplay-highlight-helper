module.exports = class ShhViewManager {
  constructor(shh) {
    this.shh = shh
    this.views = {}
    this.currentView = null
  }

  viewInstance(view) {
    if(typeof view !== "string")
      return view

    if(!this.views[view]) {
      let domEl = this.ctn(`#view_${view}`)
      if(!domEl.length) {
        domEl = $("<div>")
          .attr("id", `view_${view}`)
          .addClass("view")
          .hide()
          .appendTo(this.ctn())
      }
      const klass = require(`./views/${view}`)
      this.views[view] = new klass(this, domEl)
    }

    return this.views[view]
  }

  eachInstance(func) {
    for (let view in this.views) {
      if(this.views.hasOwnProperty(view)) func(this.views[view], this)
    }
  }

  hideAll() {
    this.ctn("> div").hide()
    return this
  }

  ctn(selector) {
    return $(`#view_container ${selector ? selector : ""}`)
  }

  show(view, callback) {
    this.fadeTo(this.viewInstance(view)._render(), callback)
  }

  fadeTo(view, callback) {
    const instance = this.viewInstance(view)._render()
    const allVisibleDivs = this.ctn("> div:visible")

    if(allVisibleDivs.length)
      allVisibleDivs.fadeOut(250, () => { instance.fadeIn(callback) })
    else
      instance.fadeIn(callback)
  }
}
