ShhView = require("../view")

module.exports = class ShhViewChooseFolder extends ShhView {
  init() {
    console.log("choose folder")
  }

  render() {
    this.dom.append($(`
      <div class="row">
        <h2>Ch</h2>
      </div>
      <div class="row well well-sm">
        <a href="#" v-on:click="button" class="btn btn-primary">{{buttonText}}</a>
      </div>
    `))
  }
}
