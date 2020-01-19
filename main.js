const {ShadowplayHighlightHelper} = require("./application")

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let appInstance = new ShadowplayHighlightHelper()
appInstance.hook()
