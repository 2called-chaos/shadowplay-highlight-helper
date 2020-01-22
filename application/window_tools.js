module.exports = class ShhWindowTools {
  constructor(shh, windowClass) {
    this.shh = shh
    this.windowClass = windowClass
  }

  setBounds(defaultBounds = {}) {
    this.windowState = this.shh.settings.fetch(`windowState.${this.windowClass.winGroup}`, defaultBounds)
    return this.windowState
  }

  trackBounds() {
    ["resize", "move", "close"].forEach(event => {
      this.windowClass.window.on(event, () => { this.saveBounds() })
    });
    return this
  }

  saveBounds() {
    if(!this.shh.settings.get("shh.remember_size_and_position")) return
    if (!this.windowState.isMaximized) {
      this.windowState = this.windowClass.window.getBounds()
    }
    this.windowState.isMaximized = this.windowClass.window.isMaximized()
    this.shh.settings.set(`windowState.${this.windowClass.winGroup}`, this.windowState)
  }
}
