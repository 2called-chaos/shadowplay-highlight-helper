module.exports = class ShhViewManager {
  constructor(shh) {
    this.shh = shh
    this.views = {}
    this.currentView = null
  }

  viewInstance(view, create = true) {
    if(typeof view !== "string")
      return view

    if(!this.views[view] && create) {
      let domEl = this.ctn(`#view_${view}`)
      if(!domEl.length) {
        domEl = $("<div>")
          .attr("id", `view_${view}`)
          .addClass("view")
          .hide()
          .appendTo(this.ctn())
      }
      const klass = require(`./views/${view}`)
      this.views[view] = new klass(view, this.shh, this, domEl)
      domEl.data("viewInstance", this.views[view])
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

  visible(asView = false) {
    const allVisibleDivs = this.ctn("> div:visible")
    if (asView) {
      const viewList = []
      allVisibleDivs.each((i, el) => {
        viewList.push($(el).data("viewInstance"))
      })
      return viewList
    } else {
      return allVisibleDivs
    }
  }

  ctn(selector) {
    return $(`#view_container ${selector ? selector : ""}`)
  }

  destroy(view) {
    if(this.views[view]) {
      this.views[view].destroy()
    }
  }

  show(view, callback) {
    this.fadeTo(this.viewInstance(view)._render(), callback)
  }

  fadeTo(view, callback) {
    const instance = this.viewInstance(view)._render()
    const allVisibleDivs = this.ctn("> div:visible")

    if(allVisibleDivs.length) {
      allVisibleDivs.each((i, el) => {
        if($(el).data("viewInstance")) $(el).data("viewInstance").beforeHide()
      })
      allVisibleDivs.fadeOut(250, () => {
        allVisibleDivs.each((i, el) => {
          if($(el).data("viewInstance")) $(el).data("viewInstance").hidden()
        })
        instance.beforeShow()
        instance.fadeIn(() => {
          instance.shown()
          if(typeof callback === "function") callback()
        })
      })
    } else {
      instance.beforeShow()
      instance.fadeIn(() => {
        instance.shown()
        if(typeof callback === "function") callback()
      })
    }
  }
}
