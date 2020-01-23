// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// No Node.js APIs are available in this process because
// `nodeIntegration` is turned off. Use `preload.js` to
// selectively enable features needed in the rendering
// process.
window.addEventListener("DOMContentLoaded", () => {
  getHashParams = () => {
    result = {}
    if(window.location.hash) {
      parts = window.location.hash.substr(1).split("&")
      for (var i = parts.length - 1; i >= 0; i--) {
        kvp = parts[i].split("=")
        key = kvp.shift()
        result[key] = kvp.join("=")
      }
    }
    return result
  }


  window.client = new ViewClient(getHashParams());
  window.client.hook().start();
})
