ShhView = require("../view")

module.exports = class ShhViewGameList extends ShhView {
  init() {
    console.log("gamelist")
  }

  render() {
    this.dom.append($(`
      <div class="row">
        <h2>ShadowPlay Highlight Helper</h2>
      </div>
      <div class="row well well-sm">
        <a href="#" v-on:click="button" class="btn btn-primary">{{buttonText}}</a>
      </div>
    `))
  }
}
